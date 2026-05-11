from datetime import datetime

from pydantic import BaseModel


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
    id: str
    quiz_id: str
    text: str
    order: int
    question_type: str
    options: list
    explanation: str | None = None
    points: int

    model_config = {"from_attributes": True}


class QuizRead(BaseModel):
    id: str
    lesson_id: str
    title: str
    passing_score_percent: int
    max_attempts: int | None = None
    questions: list[QuestionRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AttemptCreate(BaseModel):
    quiz_id: str
    answers: list


class AttemptRead(BaseModel):
    id: str
    user_id: str
    quiz_id: str
    score_percent: float
    answers: list
    started_at: datetime
    completed_at: datetime | None = None
    passed: bool = False

    model_config = {"from_attributes": True}
