from datetime import datetime

from pydantic import BaseModel
import uuid


class QuizCreate(BaseModel):
    lesson_id: str
    title: str
    passing_score_percent: int = 70
    max_attempts: int | None = None


class QuizUpdate(BaseModel):
    title: str | None = None
    passing_score_percent: int | None = None
    max_attempts: int | None = None


class QuestionCreate(BaseModel):
    text: str
    order: int
    question_type: str = "mcq"
    options: list
    explanation: str | None = None
    points: int = 1


class QuestionRead(BaseModel):
    id: uuid.UUID
    quiz_id: uuid.UUID
    text: str
    order: int
    question_type: str
    options: list
    explanation: str | None = None
    points: int

    model_config = {"from_attributes": True}


class QuizRead(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID
    title: str
    passing_score_percent: int
    max_attempts: int | None = None
    questions: list[QuestionRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AnswerSubmit(BaseModel):
    question_id: uuid.UUID
    selected_option: str | None = None


class AttemptCreate(BaseModel):
    quiz_id: str
    answers: list[AnswerSubmit]


class AttemptRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    quiz_id: uuid.UUID
    score_percent: float
    answers: list
    started_at: datetime
    completed_at: datetime | None = None
    passed: bool = False

    model_config = {"from_attributes": True}
