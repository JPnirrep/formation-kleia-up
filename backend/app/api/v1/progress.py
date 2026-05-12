from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.course import Course, Lesson, Module
from app.models.progress import LessonProgress
from app.models.user import User
from app.models.video import VideoProgress
from app.schemas.video import VideoProgressUpdate

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/courses/{course_id}")
async def get_course_progress(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère la progression de l'utilisateur pour une formation, module par module.
    """
    course_stmt = select(Course).where(Course.id == course_id)
    course_result = await db.execute(course_stmt)
    course = course_result.scalar_one_or_none()
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )

    progress_stmt = (
        select(LessonProgress)
        .where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(
                select(Lesson.id).where(
                    Lesson.module_id.in_(
                        select(Module.id).where(Module.course_id == course_id)
                    )
                )
            ),
        )
        .order_by(LessonProgress.updated_at.desc())
    )
    progress_result = await db.execute(progress_stmt)
    lessons_progress = progress_result.scalars().all()

    return {
        "course_id": course_id,
        "course_title": course.title,
        "lessons_progress": [
            {
                "lesson_id": lp.lesson_id,
                "status": lp.status,
                "completed_at": lp.completed_at,
            }
            for lp in lessons_progress
        ],
    }


@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Marque une leçon comme terminée pour l'utilisateur connecté.
    """
    stmt = select(LessonProgress).where(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id,
    )
    result = await db.execute(stmt)
    progress = result.scalar_one_or_none()

    if progress is None:
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            status="completed",
        )
        db.add(progress)
    else:
        progress.status = "completed"

    await db.commit()
    await db.refresh(progress)
    return {
        "lesson_id": lesson_id,
        "status": "completed",
    }


@router.post("/videos/{video_id}/progress")
async def update_video_progress(
    video_id: UUID,
    data: VideoProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Met à jour la progression de lecture d'une vidéo.
    """
    stmt = select(VideoProgress).where(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_asset_id == video_id,
    )
    result = await db.execute(stmt)
    video_progress = result.scalar_one_or_none()

    if video_progress is None:
        video_progress = VideoProgress(
            user_id=current_user.id,
            video_asset_id=video_id,
            last_position_seconds=data.last_position_seconds,
            max_position_seconds=data.max_position_seconds,
            percent_watched=data.percent_watched,
            completed=data.completed,
        )
        db.add(video_progress)
    else:
        video_progress.last_position_seconds = data.last_position_seconds
        if data.last_position_seconds > (video_progress.max_position_seconds or 0):
            video_progress.max_position_seconds = data.last_position_seconds
        video_progress.percent_watched = data.percent_watched
        video_progress.completed = data.completed
        if data.completed:
            video_progress.completed_at = data.completed_at

    await db.commit()
    await db.refresh(video_progress)
    return {
        "video_id": video_id,
        "last_position_seconds": video_progress.last_position_seconds,
        "percent_watched": video_progress.percent_watched,
        "completed": video_progress.completed,
    }
