import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class VideoAsset(Base, TimestampMixin):
    __tablename__ = "video_assets"

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    source_storage_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    playback_manifest_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    thumbnail_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="uploaded")
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="fr")
    visibility: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    completion_threshold_percent: Mapped[int] = mapped_column(
        Integer, nullable=False, default=85
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    lesson = relationship("Lesson", back_populates="video_assets", lazy="selectin")
    tracks = relationship(
        "VideoTrack",
        back_populates="video_asset",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    progress = relationship(
        "VideoProgress", back_populates="video_asset", lazy="selectin"
    )
    events = relationship("VideoEvent", back_populates="video_asset", lazy="selectin")


class VideoTrack(Base, TimestampMixin):
    __tablename__ = "video_tracks"

    video_asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("video_assets.id"),
        nullable=False,
        index=True,
    )
    kind: Mapped[str] = mapped_column(String(20), nullable=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(512), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ready")

    video_asset = relationship("VideoAsset", back_populates="tracks", lazy="selectin")


class VideoProgress(Base, TimestampMixin):
    __tablename__ = "video_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "video_asset_id", name="uq_video_progress_user_asset"
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    video_asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("video_assets.id"),
        nullable=False,
        index=True,
    )
    last_position_seconds: Mapped[float] = mapped_column(
        Float, nullable=False, default=0
    )
    max_position_seconds: Mapped[float] = mapped_column(
        Float, nullable=False, default=0
    )
    percent_watched: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_played_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user = relationship("User", back_populates="video_progress", lazy="selectin")
    video_asset = relationship("VideoAsset", back_populates="progress", lazy="selectin")


class VideoEvent(Base, TimestampMixin):
    __tablename__ = "video_events"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    video_asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("video_assets.id"),
        nullable=False,
        index=True,
    )
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    position_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    payload_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="video_events", lazy="selectin")
    video_asset = relationship("VideoAsset", back_populates="events", lazy="selectin")
