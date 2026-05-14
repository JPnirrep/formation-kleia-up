from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Lesson, Module, Course
from app.models.progress import LessonProgress

async def check_lesson_unlocked(db: AsyncSession, user_id: UUID, lesson: Lesson) -> bool:
    """
    Vérifie si une leçon est débloquée pour un utilisateur en fonction de la progression linéaire.
    """
    # 1. Obtenir le module et le cours
    course = lesson.module.course if hasattr(lesson.module, 'course') else None
    if not course:
        # Load course if not loaded
        module_stmt = select(Module).options(selectinload(Module.course)).where(Module.id == lesson.module_id)
        module = (await db.execute(module_stmt)).scalar_one_or_none()
        if not module:
            return False
        course = module.course

    # Si la progression linéaire n'est pas forcée, c'est débloqué.
    if not getattr(course, 'is_linear_progression_enforced', False):
        return True

    # 2. Trouver toutes les leçons du cours, ordonnées par module.order puis lesson.order
    lessons_stmt = (
        select(Lesson)
        .join(Module)
        .where(Module.course_id == course.id)
        .order_by(Module.order.asc(), Lesson.order.asc())
    )
    all_lessons = (await db.execute(lessons_stmt)).scalars().all()

    # Trouver l'index de la leçon actuelle
    lesson_index = -1
    for i, l in enumerate(all_lessons):
        if l.id == lesson.id:
            lesson_index = i
            break
            
    if lesson_index <= 0:
        return True # Première leçon toujours débloquée
        
    # 3. Vérifier si la leçon précédente est terminée
    previous_lesson = all_lessons[lesson_index - 1]
    progress_stmt = select(LessonProgress).where(
        LessonProgress.user_id == user_id,
        LessonProgress.lesson_id == previous_lesson.id
    )
    progress = (await db.execute(progress_stmt)).scalar_one_or_none()
    
    if not progress or progress.status != "completed":
        raise HTTPException(
            status_code=403, 
            detail="Contenu verrouillé. Vous devez terminer l'étape précédente."
        )
        
    return True
