import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.course import Lesson, Module
from app.models.user import User
from app.schemas.ai import (
    AIGenerateQuizResponse,
    AIGenerateRequest,
    AIGenerateResponse,
)
from app.services.ai_service import generate_course, generate_quiz

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.post("/generate-course", response_model=AIGenerateResponse)
async def ai_generate_course(data: AIGenerateRequest):
    """Génère une structure de formation complète via IA (Mistral)."""
    try:
        result = await generate_course(data.prompt)
        return AIGenerateResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de génération: {str(e)}")


@router.post("/generate-quiz/{lesson_id}", response_model=AIGenerateQuizResponse)
async def ai_generate_quiz(
    lesson_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Génère un quiz QCM automatiquement pour une leçon."""
    stmt = (
        select(Lesson)
        .options(selectinload(Lesson.module).selectinload(Module.course))
        .where(Lesson.id == lesson_id)
    )
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable.")

    course_context = (
        lesson.module.course.title if lesson.module and lesson.module.course else ""
    )

    try:
        quiz_data = await generate_quiz(
            lesson.title,
            lesson.description or "",
            course_context,
        )
        return AIGenerateQuizResponse(**quiz_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de génération: {str(e)}")
