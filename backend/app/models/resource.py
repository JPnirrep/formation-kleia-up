import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class LessonResource(Base, TimestampMixin):
    __tablename__ = "lesson_resources"

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, default="file") # "file" or "markdown"

    # Pour resource_type = "markdown"
    content: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Pour resource_type = "file" (Stocké sur Hostinger, donc on stocke l'URL)
    url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    lesson = relationship("Lesson", backref="resources", lazy="selectin")


class AudioAsset(Base, TimestampMixin):
    __tablename__ = "audio_assets"

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    file_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    transcript_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    transcript_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="none"
    )
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="fr")

    lesson = relationship("Lesson", back_populates="audio_assets", lazy="selectin")


class ResourceAsset(Base, TimestampMixin):
    __tablename__ = "resource_assets"

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    file_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    resource_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pdf"
    )
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    lesson = relationship("Lesson", back_populates="resource_assets", lazy="selectin")
