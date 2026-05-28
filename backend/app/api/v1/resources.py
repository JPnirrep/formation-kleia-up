"""Learner endpoints for lessons and resources."""

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.course import Lesson
from app.models.resource import AudioAsset, LessonResource, ResourceAsset
from app.models.user import User
from app.models.video import VideoAsset
from app.schemas.resource import LessonResourceRead
from app.schemas.video import VideoAssetRead
from app.services.progress_service import check_lesson_unlocked
from app.services.storage import get_file_path, get_playback_url, store_file

# ── Routers ──────────────────────────────────────────────────────────────────

lessons_router = APIRouter(dependencies=[Depends(get_current_user)])
router = APIRouter(dependencies=[Depends(get_current_user)])


# ── Helpers ──────────────────────────────────────────────────────────────────

def _guess_media_category(url: str | None) -> str:
    """Guess media category from a URL's file extension."""
    if not url:
        return "other"
    ext = url.rsplit(".", 1)[-1].lower().split("?")[0] if "." in url else ""
    if ext in {"mp3", "wav", "ogg", "flac", "aac", "m4a"}:
        return "audio"
    if ext in {"jpg", "jpeg", "png", "gif", "webp", "svg"}:
        return "image"
    if ext == "pdf":
        return "pdf"
    return "other"


# ── Lesson detail endpoint (GET /api/v1/lessons/{lesson_id}) ─────────────────

@lessons_router.get("/{lesson_id}")
async def get_lesson_detail(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get lesson detail with its videos, audio, and resources."""
    lesson_stmt = (
        select(Lesson)
        .options(
            selectinload(Lesson.module),
            selectinload(Lesson.video_assets).selectinload(VideoAsset.tracks),
            selectinload(Lesson.audio_assets),
            selectinload(Lesson.resource_assets),
        )
        .where(Lesson.id == lesson_id)
    )
    lesson = (await db.execute(lesson_stmt)).scalar_one_or_none()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon introuvable.",
        )

    await check_lesson_unlocked(db, current_user.id, lesson)

    videos = []
    for va in lesson.video_assets:
        if va.visibility == "published":
            v = VideoAssetRead.model_validate(va)
            v.playback_url = get_playback_url(va.source_storage_key)
            videos.append(v.model_dump())

    audio = [
        {
            "id": str(a.id),
            "title": a.title,
            "description": a.description,
            "order": a.order,
            "file_url": a.file_url,
            "duration_seconds": a.duration_seconds,
            "language": a.language,
            "transcript_text": a.transcript_text,
            "transcript_status": a.transcript_status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in lesson.audio_assets
    ]

    resource_files = [
        {
            "id": str(ra.id),
            "title": ra.title,
            "description": ra.description,
            "order": ra.order,
            "file_url": ra.file_url,
            "resource_type": ra.resource_type,
            "file_size_bytes": ra.file_size_bytes,
            "category": _guess_media_category(ra.file_url),
            "created_at": ra.created_at.isoformat() if ra.created_at else None,
        }
        for ra in lesson.resource_assets
    ]

    # Also include legacy LessonResource records
    legacy_stmt = (
        select(LessonResource)
        .where(LessonResource.lesson_id == lesson_id)
        .order_by(LessonResource.created_at)
    )
    legacy_resources = (await db.execute(legacy_stmt)).scalars().all()
    legacy = [LessonResourceRead.model_validate(r).model_dump() for r in legacy_resources]

    # Build module context for navigation (prev/next lesson)
    module_lessons = sorted(lesson.module.lessons, key=lambda l: l.order)
    module_data = {
        "id": str(lesson.module.id),
        "title": lesson.module.title,
        "course_id": str(lesson.module.course_id),
        "lessons": [
            {"id": str(l.id), "title": l.title, "order": l.order}
            for l in module_lessons
        ],
    }

    return {
        "id": str(lesson.id),
        "module_id": str(lesson.module_id),
        "title": lesson.title,
        "description": lesson.description,
        "order": lesson.order,
        "lesson_type": lesson.lesson_type,
        "duration_seconds": lesson.duration_seconds,
        "created_at": lesson.created_at.isoformat(),
        "updated_at": lesson.updated_at.isoformat(),
        "module": module_data,
        "videos": videos,
        "audio": audio,
        "resources": resource_files,
        "legacy_resources": legacy,
    }


# ── Combined content endpoint (GET /api/v1/lessons/{lesson_id}/content) ──────

@lessons_router.get("/{lesson_id}/content")
async def get_lesson_content(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get combined content for a lesson: video playlist + audio files + PDFs + images."""
    lesson_stmt = (
        select(Lesson)
        .options(
            selectinload(Lesson.module),
            selectinload(Lesson.video_assets).selectinload(VideoAsset.tracks),
            selectinload(Lesson.audio_assets),
            selectinload(Lesson.resource_assets),
        )
        .where(Lesson.id == lesson_id)
    )
    lesson = (await db.execute(lesson_stmt)).scalar_one_or_none()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon introuvable.",
        )

    await check_lesson_unlocked(db, current_user.id, lesson)

    # Video playlist (published only)
    video_playlist = []
    for va in lesson.video_assets:
        if va.visibility == "published":
            v = VideoAssetRead.model_validate(va)
            v.playback_url = get_playback_url(va.source_storage_key)
            video_playlist.append(v.model_dump())

    # Audio files
    audio_files = [
        {
            "id": str(a.id),
            "title": a.title,
            "description": a.description,
            "order": a.order,
            "file_url": a.file_url,
            "duration_seconds": a.duration_seconds,
            "language": a.language,
            "transcript_text": a.transcript_text,
            "transcript_status": a.transcript_status,
        }
        for a in lesson.audio_assets
    ]

    # Separate ResourceAssets by type
    pdfs = []
    images = []
    other = []
    for ra in lesson.resource_assets:
        item = {
            "id": str(ra.id),
            "title": ra.title,
            "description": ra.description,
            "order": ra.order,
            "file_url": ra.file_url,
            "resource_type": ra.resource_type,
            "file_size_bytes": ra.file_size_bytes,
        }
        cat = _guess_media_category(ra.file_url)
        if cat == "pdf":
            pdfs.append(item)
        elif cat == "image":
            images.append(item)
        else:
            other.append(item)

    # Legacy LessonResource records
    legacy_stmt = (
        select(LessonResource)
        .where(LessonResource.lesson_id == lesson_id)
        .order_by(LessonResource.created_at)
    )
    legacy_resources = (await db.execute(legacy_stmt)).scalars().all()
    for r in legacy_resources:
        item = LessonResourceRead.model_validate(r).model_dump()
        cat = _guess_media_category(r.url)
        if cat == "pdf":
            pdfs.append(item)
        elif cat == "image":
            images.append(item)
        else:
            other.append(item)

    return {
        "lesson_id": str(lesson.id),
        "lesson_title": lesson.title,
        "lesson_type": lesson.lesson_type,
        "video_playlist": video_playlist,
        "audio_files": audio_files,
        "pdfs": pdfs,
        "images": images,
        "other": other,
    }


# ── Upload resource (POST /api/v1/resources/{lesson_id}) ─────────────────────

@router.post(
    "/{lesson_id}",
    response_model=LessonResourceRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resource(
    lesson_id: uuid.UUID,
    file: UploadFile = File(...),
    title: str = "",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a resource file (PDF, image, audio, etc.) for a lesson."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon non trouvée.",
        )

    content = await file.read()
    storage_key = await store_file(content, file.filename or "file")

    resource = LessonResource(
        lesson_id=lesson_id,
        title=title or file.filename or "Fichier",
        url=f"/api/v1/uploads/{storage_key}",
        resource_type="file",
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


# ── Download resource (GET /api/v1/resources/{resource_id}/download) ─────────

@router.get("/{resource_id}/download")
async def download_resource(
    resource_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a resource file by its ID."""
    stmt = select(LessonResource).where(LessonResource.id == resource_id)
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ressource non trouvée.",
        )

    if not resource.url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun fichier associé à cette ressource.",
        )

    # Extract storage key from URL (/api/v1/uploads/{key})
    storage_key = resource.url.rsplit("/", 1)[-1]
    path = await get_file_path(storage_key)
    if path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier non trouvé sur le disque.",
        )

    return FileResponse(
        path=path,
        filename=resource.title,
        media_type="application/octet-stream",
    )


# ── Keep existing learner endpoint ───────────────────────────────────────────

@router.get(
    "/lessons/{lesson_id}/resources",
    response_model=list[LessonResourceRead],
)
async def list_lesson_resources(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List resources for a lesson (PDFs, Markdown, etc.)."""
    lesson_stmt = (
        select(Lesson)
        .options(selectinload(Lesson.module))
        .where(Lesson.id == lesson_id)
    )
    lesson = (await db.execute(lesson_stmt)).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable.")

    await check_lesson_unlocked(db, current_user.id, lesson)

    stmt = (
        select(LessonResource)
        .where(LessonResource.lesson_id == lesson_id)
        .order_by(LessonResource.created_at)
    )
    resources = (await db.execute(stmt)).scalars().all()
    return resources
