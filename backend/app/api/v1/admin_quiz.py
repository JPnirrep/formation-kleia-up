"""Admin routes for quiz management (CRUD + questions)."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.course import Lesson
from app.models.quiz import Quiz, Question
from app.schemas.quiz import (
    QuestionCreate,
    QuestionRead,
    QuizCreate,
    QuizRead,
    QuizUpdate,
)

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/lessons/{lesson_id}/quiz", response_model=QuizRead)
async def admin_get_lesson_quiz(
    lesson_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Récupère le quiz d'une leçon (admin, avec questions)."""
    stmt = (
        select(Quiz)
        .where(Quiz.lesson_id == lesson_id)
        .options(selectinload(Quiz.questions))
    )
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun quiz pour cette leçon.",
        )
    return QuizRead.model_validate(quiz)


@router.post(
    "/lessons/{lesson_id}/quiz",
    response_model=QuizRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_quiz(
    lesson_id: uuid.UUID,
    data: QuizCreate,
    db: AsyncSession = Depends(get_db),
):
    """Crée un quiz pour une leçon."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon non trouvée.",
        )
    existing = await db.execute(select(Quiz).where(Quiz.lesson_id == lesson_id))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un quiz existe déjà pour cette leçon.",
        )
    quiz = Quiz(**data.model_dump(exclude={"lesson_id"}), lesson_id=lesson_id)
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return QuizRead.model_validate(quiz)


@router.put("/quizzes/{quiz_id}", response_model=QuizRead)
async def admin_update_quiz(
    quiz_id: uuid.UUID,
    data: QuizUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Modifie un quiz."""
    stmt = select(Quiz).where(Quiz.id == quiz_id).options(selectinload(Quiz.questions))
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz non trouvé."
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(quiz, key, value)
    await db.commit()
    await db.refresh(quiz)
    return QuizRead.model_validate(quiz)


@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_quiz(
    quiz_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Supprime un quiz."""
    stmt = select(Quiz).where(Quiz.id == quiz_id)
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz non trouvé."
        )
    await db.delete(quiz)
    await db.commit()


@router.post(
    "/quizzes/{quiz_id}/questions",
    response_model=QuestionRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_add_question(
    quiz_id: uuid.UUID,
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ajoute une question à un quiz."""
    stmt = select(Quiz).where(Quiz.id == quiz_id)
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz non trouvé."
        )
    question = Question(
        quiz_id=quiz_id,
        text=data.text,
        order=data.order,
        question_type=data.question_type,
        options=data.options,
        explanation=data.explanation,
        points=data.points,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return QuestionRead.model_validate(question)


@router.put("/questions/{question_id}", response_model=QuestionRead)
async def admin_update_question(
    question_id: uuid.UUID,
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Modifie une question."""
    stmt = select(Question).where(Question.id == question_id)
    result = await db.execute(stmt)
    q = result.scalar_one_or_none()
    if q is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question non trouvée."
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(q, key, value)
    await db.commit()
    await db.refresh(q)
    return QuestionRead.model_validate(q)


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_question(
    question_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Supprime une question."""
    stmt = select(Question).where(Question.id == question_id)
    result = await db.execute(stmt)
    q = result.scalar_one_or_none()
    if q is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question non trouvée."
        )
    await db.delete(q)
    await db.commit()
