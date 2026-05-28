import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class Quiz(Base, TimestampMixin):
    __tablename__ = "quizzes"

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    passing_score_percent: Mapped[int] = mapped_column(
        Integer, nullable=False, default=70
    )
    max_attempts: Mapped[int | None] = mapped_column(Integer, nullable=True)

    lesson = relationship("Lesson", back_populates="quiz", lazy="selectin")
    questions = relationship(
        "Question",
        back_populates="quiz",
        lazy="selectin",
        order_by="Question.order",
        cascade="all, delete-orphan",
    )
    attempts = relationship("Attempt", back_populates="quiz", lazy="selectin")


class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=False, index=True
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    question_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="mcq"
    )
    options: Mapped[list] = mapped_column(JSON, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    quiz = relationship("Quiz", back_populates="questions", lazy="selectin")


class Attempt(Base, TimestampMixin):
    __tablename__ = "attempts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=False, index=True
    )
    score_percent: Mapped[float] = mapped_column(Float, nullable=False)
    answers: Mapped[list] = mapped_column(JSON, nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user = relationship("User", back_populates="attempts", lazy="selectin")
    quiz = relationship("Quiz", back_populates="attempts", lazy="selectin")
