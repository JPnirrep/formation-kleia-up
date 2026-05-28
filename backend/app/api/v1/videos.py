"""Public video endpoints for learners."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.course import Lesson
from app.models.user import User
from app.models.video import VideoAsset, VideoEvent
from app.schemas.video import VideoAssetRead, VideoEventCreate
from app.services.storage import get_playback_url

router = APIRouter(dependencies=[Depends(get_current_user)])


from app.services.progress_service import check_lesson_unlocked

@router.get(
    "/lessons/{lesson_id}/videos",
    response_model=list[VideoAssetRead],
)
async def list_lesson_videos(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List published videos for a lesson."""
    # Guard conditionnel
    lesson_stmt = select(Lesson).options(selectinload(Lesson.module)).where(Lesson.id == lesson_id)
    lesson = (await db.execute(lesson_stmt)).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable.")
    await check_lesson_unlocked(db, current_user.id, lesson)

    stmt = (
        select(VideoAsset)
        .where(
            VideoAsset.lesson_id == lesson_id,
            VideoAsset.visibility == "published",
        )
        .order_by(VideoAsset.order)
        .options(selectinload(VideoAsset.tracks))
    )
    result = await db.execute(stmt)
    assets = result.scalars().all()

    items = []
    for a in assets:
        data = VideoAssetRead.model_validate(a)
        data.playback_url = get_playback_url(a.source_storage_key)
        items.append(data)

    return items


@router.post("/videos/{video_id}/events", status_code=status.HTTP_201_CREATED)
async def record_video_event(
    video_id: uuid.UUID,
    data: VideoEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a video playback event (play, pause, seek, heartbeat, ended)."""
    stmt = select(VideoAsset).where(VideoAsset.id == video_id)
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vidéo non trouvée.",
        )

    if data.event_type == "heartbeat":
        from app.models.video import VideoProgress
        prog_stmt = select(VideoProgress).where(
            VideoProgress.user_id == current_user.id,
            VideoProgress.video_asset_id == video_id,
        )
        prog_res = await db.execute(prog_stmt)
        video_progress = prog_res.scalar_one_or_none()
        
        if video_progress is None:
            video_progress = VideoProgress(
                user_id=current_user.id,
                video_asset_id=video_id,
                last_position_seconds=data.position_seconds,
                max_position_seconds=data.position_seconds,
                percent_watched=0.0,
                completed=False,
            )
            db.add(video_progress)
        else:
            video_progress.last_position_seconds = data.position_seconds
            if data.position_seconds > (video_progress.max_position_seconds or 0):
                video_progress.max_position_seconds = data.position_seconds
                
        await db.commit()
        return {"status": "ok", "event_type": data.event_type, "note": "heartbeat saved to progress"}

    event = VideoEvent(
        user_id=current_user.id,
        video_asset_id=video_id,
        session_id=data.session_id,
        event_type=data.event_type,
        position_seconds=data.position_seconds,
        payload_json=data.payload_json,
    )
    db.add(event)
    await db.commit()

    return {"status": "ok", "event_type": data.event_type}
