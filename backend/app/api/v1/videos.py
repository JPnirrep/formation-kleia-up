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


@router.get(
    "/lessons/{lesson_id}/videos",
    response_model=list[VideoAssetRead],
)
async def list_lesson_videos(
    lesson_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List published videos for a lesson."""
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
