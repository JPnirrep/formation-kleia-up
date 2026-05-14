import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.badge import Badge, UserBadge
from app.models.course import Lesson, Module, Course
from app.models.progress import LessonProgress
from app.models.quiz import Attempt, Quiz

async def award_badge(db: AsyncSession, user_id: uuid.UUID, criteria_type: str, criteria_value: str = None):
    """Vérifie et attribue un badge si les critères sont remplis."""
    # Trouver le badge correspondant aux critères
    stmt = select(Badge).where(Badge.criteria_type == criteria_type)
    if criteria_value:
        stmt = stmt.where(Badge.criteria_value == criteria_value)
    
    badge = (await db.execute(stmt)).scalar_one_or_none()
    if not badge:
        return None

    # Vérifier si l'utilisateur possède déjà ce badge
    existing_stmt = select(UserBadge).where(
        UserBadge.user_id == user_id,
        UserBadge.badge_id == badge.id
    )
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    
    if not existing:
        user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
        db.add(user_badge)
        return badge
    
    return None

async def evaluate_lesson_completion(db: AsyncSession, user_id: uuid.UUID, lesson: Lesson):
    """Évalue les badges à attribuer lors de la complétion d'une leçon."""
    badges_awarded = []

    # 1. Badge "Premier Pas" (Première leçon terminée au total)
    total_completed_stmt = select(func.count(LessonProgress.id)).where(
        LessonProgress.user_id == user_id,
        LessonProgress.status == "completed"
    )
    total_completed = (await db.execute(total_completed_stmt)).scalar() or 0
    if total_completed == 1:
        badge = await award_badge(db, user_id, "first_lesson")
        if badge:
            badges_awarded.append(badge)

    # 2. Badge "Expert Quiz" (Si la leçon est un quiz et réussi à 100%)
    if lesson.lesson_type == "quiz":
        quiz_stmt = select(Quiz).where(Quiz.lesson_id == lesson.id)
        quiz = (await db.execute(quiz_stmt)).scalar_one_or_none()
        if quiz:
            attempt_stmt = select(Attempt).where(
                Attempt.quiz_id == quiz.id,
                Attempt.user_id == user_id,
                Attempt.score == 100
            )
            perfect_attempt = (await db.execute(attempt_stmt)).scalars().first()
            if perfect_attempt:
                badge = await award_badge(db, user_id, "perfect_quiz")
                if badge:
                    badges_awarded.append(badge)

    # 3. Badge "Diplômé" (Formation terminée)
    module = lesson.module
    course = module.course
    
    # Compter toutes les leçons de la formation
    total_lessons_stmt = select(func.count(Lesson.id)).join(Module).where(Module.course_id == course.id)
    total_lessons = (await db.execute(total_lessons_stmt)).scalar() or 0
    
    # Compter les leçons terminées par l'utilisateur pour cette formation
    completed_lessons_stmt = select(func.count(LessonProgress.id)).join(Lesson).join(Module).where(
        LessonProgress.user_id == user_id,
        LessonProgress.status == "completed",
        Module.course_id == course.id
    )
    completed_lessons = (await db.execute(completed_lessons_stmt)).scalar() or 0
    
    if total_lessons > 0 and completed_lessons == total_lessons:
        badge = await award_badge(db, user_id, "course_completion", str(course.id))
        # Si pas de badge spécifique à la formation, on essaie le badge générique de complétion
        if not badge:
             badge = await award_badge(db, user_id, "course_completion")
             
        if badge:
            badges_awarded.append(badge)

    return badges_awarded
