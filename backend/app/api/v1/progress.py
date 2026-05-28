from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.course import Course, Lesson, Module
from app.models.gamification import GamificationPoints
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


from sqlalchemy.orm import selectinload
from app.models.video import VideoAsset
from app.models.quiz import Quiz, Attempt

@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Marque une leçon comme terminée pour l'utilisateur connecté avec validation stricte.
    """
    # 1. Vérifier l'existence et le type de la leçon
    lesson_stmt = select(Lesson).options(
        selectinload(Lesson.module).selectinload(Module.course)
    ).where(Lesson.id == lesson_id)
    lesson_result = await db.execute(lesson_stmt)
    lesson = lesson_result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable.")

    # 2. Validation stricte selon le type de leçon
    if lesson.lesson_type == "video":
        vp_stmt = select(VideoProgress).join(VideoAsset).where(
            VideoAsset.lesson_id == lesson.id,
            VideoProgress.user_id == current_user.id
        )
        vps = (await db.execute(vp_stmt)).scalars().all()
        # On tolère 95% pour éviter les bugs de fin de vidéo
        if not any(vp.percent_watched >= 95 or vp.completed for vp in vps):
            raise HTTPException(
                status_code=403, 
                detail="Vous devez visionner la vidéo jusqu'à la fin pour valider cette étape."
            )
            
    elif lesson.lesson_type == "quiz":
        quiz_stmt = select(Quiz).where(Quiz.lesson_id == lesson.id)
        quiz = (await db.execute(quiz_stmt)).scalar_one_or_none()
        if quiz:
            attempt_stmt = select(Attempt).where(
                Attempt.quiz_id == quiz.id,
                Attempt.user_id == current_user.id
            ).order_by(Attempt.score_percent.desc())
            best_attempt = (await db.execute(attempt_stmt)).scalars().first()
            if not best_attempt or best_attempt.score_percent < quiz.passing_score_percent:
                raise HTTPException(
                    status_code=403, 
                    detail=f"Vous devez obtenir au moins {quiz.passing_score_percent}% au quiz pour valider cette étape."
                )

    # 3. Enregistrer la complétion
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

    # 4. Évaluer les badges (Gamification)
    from app.services.gamification_service import evaluate_lesson_completion
    awarded_badges = await evaluate_lesson_completion(db, current_user.id, lesson)

    # 5. Attribuer des points de gamification
    from app.services.points_service import award_points
    from app.services.streak_service import update_streak

    gam_points = (
        await db.execute(
            select(GamificationPoints).where(
                GamificationPoints.user_id == current_user.id
            )
        )
    ).scalar_one_or_none()

    if lesson.lesson_type == "video":
        points_earned = 15
    elif lesson.lesson_type == "quiz":
        points_earned = 25
    else:
        points_earned = 10

    gam_points = await award_points(
        db, current_user.id, points_earned, gam_points
    )
    streak_days = await update_streak(db, gam_points)

    await db.commit()
    await db.refresh(progress)
    return {
        "lesson_id": lesson_id,
        "status": "completed",
        "new_badges": [
            {"id": b.id, "title": b.title, "image_url": b.image_url} 
            for b in awarded_badges
        ]
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
