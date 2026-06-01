import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=True)
    short_description: Mapped[str] = mapped_column(String(512), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[str] = mapped_column(String(20), nullable=False, default="débutant")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Nouveaux champs financiers
    is_premium: Mapped[bool] = mapped_column(default=False)
    price_ht: Mapped[float] = mapped_column(default=0.0)
    tva_rate: Mapped[float] = mapped_column(default=20.0)
    stripe_product_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Paramètres pédagogiques
    is_linear_progression_enforced: Mapped[bool] = mapped_column(default=True)

    created_by: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    creator = relationship("User", back_populates="courses", lazy="selectin")
    modules = relationship(
        "Module",
        back_populates="course",
        lazy="selectin",
        order_by="Module.order",
        cascade="all, delete-orphan",
    )
    enrollments = relationship("Enrollment", back_populates="course", lazy="selectin")
    certificates = relationship("Certificate", back_populates="course", lazy="selectin")


class Module(Base, TimestampMixin):
    __tablename__ = "modules"
    __table_args__ = (
        UniqueConstraint("course_id", "order", name="uq_module_course_order"),
    )

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    course = relationship("Course", back_populates="modules", lazy="selectin")
    lessons = relationship(
        "Lesson",
        back_populates="module",
        lazy="selectin",
        order_by="Lesson.order",
        cascade="all, delete-orphan",
    )


class Lesson(Base, TimestampMixin):
    __tablename__ = "lessons"
    __table_args__ = (
        UniqueConstraint("module_id", "order", name="uq_lesson_module_order"),
    )

    module_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("modules.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    lesson_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="video"
    )
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)

    module = relationship("Module", back_populates="lessons", lazy="selectin")
    video_assets = relationship(
        "VideoAsset",
        back_populates="lesson",
        lazy="selectin",
        order_by="VideoAsset.order",
        cascade="all, delete-orphan",
    )
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, lazy="selectin")
    lesson_progress = relationship(
        "LessonProgress", back_populates="lesson", lazy="selectin"
    )
    audio_assets = relationship(
        "AudioAsset",
        back_populates="lesson",
        lazy="selectin",
        order_by="AudioAsset.order",
        cascade="all, delete-orphan",
    )
    resource_assets = relationship(
        "ResourceAsset",
        back_populates="lesson",
        lazy="selectin",
        order_by="ResourceAsset.order",
        cascade="all, delete-orphan",
    )
