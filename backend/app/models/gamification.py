import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class GamificationPoints(Base, TimestampMixin):
    __tablename__ = "gamification_points"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[str] = mapped_column(
        String(50), default="apprenti", nullable=False
    )
    level_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_activity_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    total_points_earned: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="gamification", lazy="selectin")
