from pydantic import BaseModel, Field
from typing import Optional


class AIGenerateRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Description du thème de la formation",
    )
    model: str = Field(
        default="mistral-small-latest", description="Modèle Mistral à utiliser"
    )


class AILesson(BaseModel):
    title: str
    description: str
    lesson_type: str = "video"
    order: int
    duration_seconds: int


class AIModule(BaseModel):
    title: str
    description: str
    order: int
    lessons: list[AILesson]


class AIGenerateResponse(BaseModel):
    title: str
    slug: str
    short_description: str
    description: str
    level: str
    category: str
    modules: list[AIModule]


class QuizOption(BaseModel):
    label: str
    text: str
    is_correct: bool


class AIQuestion(BaseModel):
    text: str
    order: int
    question_type: str = "single"
    explanation: str = ""
    points: int = 10
    options: list[QuizOption]


class AIGenerateQuizResponse(BaseModel):
    title: str
    passing_score_percent: int = 70
    questions: list[AIQuestion]
