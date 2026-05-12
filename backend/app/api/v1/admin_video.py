"""Admin routes for video management (upload, CRUD, publish)."""

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.course import Lesson
from app.models.user import User
from app.models.video import VideoAsset, VideoTrack
from app.schemas.video import (
    VideoAssetCreate,
    VideoAssetRead,
    VideoAssetUpdate,
)
from app.services.storage import (
    delete_file,
    get_playback_url,
    store_file,
)

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.post(
    "/lessons/{lesson_id}/videos",
    response_model=VideoAssetRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_video(
    lesson_id: uuid.UUID,
    file: UploadFile = File(...),
    title: str = "",
    description: str | None = None,
    order: int = 0,
    language: str = "fr",
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload a video file and attach it to a lesson."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon non trouvée.",
        )

    content = await file.read()
    storage_key = await store_file(content, file.filename or "video.mp4")
    duration = 0  # would be extracted via ffprobe in production

    asset = VideoAsset(
        lesson_id=lesson_id,
        title=title or file.filename or "Vidéo",
        description=description,
        order=order,
        source_storage_key=storage_key,
        duration_seconds=duration,
        status="published",
        language=language,
        visibility="published",
        created_by=current_user.id,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    result = VideoAssetRead.model_validate(asset)
    result.playback_url = get_playback_url(asset.source_storage_key)
    return result


@router.get("/videos/{video_id}", response_model=VideoAssetRead)
async def get_video(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single video asset by ID."""
    stmt = (
        select(VideoAsset)
        .where(VideoAsset.id == video_id)
        .options(selectinload(VideoAsset.tracks))
    )
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vidéo non trouvée.",
        )
    data = VideoAssetRead.model_validate(asset)
    data.playback_url = get_playback_url(asset.source_storage_key)
    return data


@router.put("/videos/{video_id}", response_model=VideoAssetRead)
async def update_video(
    video_id: uuid.UUID,
    data: VideoAssetUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update video metadata."""
    stmt = select(VideoAsset).where(VideoAsset.id == video_id)
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vidéo non trouvée.",
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)
    await db.commit()
    await db.refresh(asset)
    data = VideoAssetRead.model_validate(asset)
    data.playback_url = get_playback_url(asset.source_storage_key)
    return data


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a video asset and its stored file."""
    stmt = select(VideoAsset).where(VideoAsset.id == video_id)
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vidéo non trouvée.",
        )
    if asset.source_storage_key:
        await delete_file(asset.source_storage_key)
    await db.delete(asset)
    await db.commit()


@router.post("/videos/{video_id}/publish", response_model=VideoAssetRead)
async def publish_video(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Publish a video (set status to published)."""
    stmt = select(VideoAsset).where(VideoAsset.id == video_id)
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vidéo non trouvée.",
        )
    asset.status = "published"
    asset.visibility = "published"
    await db.commit()
    await db.refresh(asset)
    data = VideoAssetRead.model_validate(asset)
    data.playback_url = get_playback_url(asset.source_storage_key)
    return data
