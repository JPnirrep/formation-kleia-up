import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="learner")
    auth_provider: Mapped[str] = mapped_column(
        String(20), nullable=False, default="email"
    )
    auth_sub: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True
    )
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    courses = relationship("Course", back_populates="creator", lazy="selectin")
    enrollments = relationship("Enrollment", back_populates="user", lazy="selectin")
    lesson_progress = relationship(
        "LessonProgress", back_populates="user", lazy="selectin"
    )
    video_progress = relationship(
        "VideoProgress", back_populates="user", lazy="selectin"
    )
    video_events = relationship("VideoEvent", back_populates="user", lazy="selectin")
    attempts = relationship("Attempt", back_populates="user", lazy="selectin")
    certificates = relationship("Certificate", back_populates="user", lazy="selectin")
