from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.quiz import Attempt, Question, Quiz
from app.models.user import User
from app.schemas.quiz import AttemptCreate

router = APIRouter()


from app.services.progress_service import check_lesson_unlocked

@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère un quiz avec ses questions.
    Les réponses correctes (is_correct) sont masquées pour les apprenants.
    """
    stmt = select(Quiz).where(Quiz.id == quiz_id).options(
        selectinload(Quiz.questions),
        selectinload(Quiz.lesson)
    )
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz non trouvé.",
        )
        
    # Guard conditionnel
    if quiz.lesson:
        await check_lesson_unlocked(db, current_user.id, quiz.lesson)

    quiz_data = {
        "id": quiz.id,
        "title": quiz.title,
        "passing_score_percent": quiz.passing_score_percent,
        "max_attempts": quiz.max_attempts,
        "questions": [
            {
                "id": q.id,
                "text": q.text,
                "order": q.order,
                "question_type": q.question_type,
                "options": [
                    {k: v for k, v in opt.items() if k != "is_correct"}
                    for opt in q.options
                ],
                "points": q.points,
            }
            for q in quiz.questions
        ],
    }
    return quiz_data


@router.post("/{quiz_id}/attempt")
async def submit_attempt(
    quiz_id: UUID,
    data: AttemptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Soumet une tentative de quiz et retourne le score.
    """
    quiz_stmt = (
        select(Quiz).where(Quiz.id == quiz_id).options(selectinload(Quiz.questions))
    )
    quiz_result = await db.execute(quiz_stmt)
    quiz = quiz_result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz non trouvé.",
        )

    questions_map = {str(q.id): q for q in quiz.questions}
    total_points = sum(q.points for q in quiz.questions)
    earned_points = 0
    graded_answers = []

    for answer in data.answers:
        question = questions_map.get(str(answer.question_id))
        if question is None:
            continue
        correct_options = [opt for opt in question.options if opt.get("is_correct")]
        correct_labels = {opt["label"] for opt in correct_options}
        selected_labels = set(answer.selected_option or [])
        is_correct = selected_labels == correct_labels

        if is_correct:
            earned_points += question.points

        graded_answers.append(
            {
                "question_id": answer.question_id,
                "selected_option": answer.selected_option,
                "is_correct": is_correct,
            }
        )

    score_percent = (earned_points / total_points * 100) if total_points > 0 else 0

    attempt = Attempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score_percent=score_percent,
        answers=graded_answers,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "score_percent": score_percent,
        "passed": score_percent >= quiz.passing_score_percent,
        "total_points": total_points,
        "earned_points": earned_points,
    }


@router.get("/{quiz_id}/attempts")
async def get_attempts(
    quiz_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère toutes les tentatives de l'utilisateur pour un quiz.
    """
    stmt = (
        select(Attempt)
        .where(
            Attempt.quiz_id == quiz_id,
            Attempt.user_id == current_user.id,
        )
        .order_by(Attempt.started_at.desc())
    )
    result = await db.execute(stmt)
    attempts = result.scalars().all()

    return [
        {
            "id": a.id,
            "score_percent": a.score_percent,
            "answers": a.answers,
            "started_at": a.started_at,
            "completed_at": a.completed_at,
        }
        for a in attempts
    ]
