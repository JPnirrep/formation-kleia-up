import uuid
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin

class Badge(Base, TimestampMixin):
    __tablename__ = "badges"

    title: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    criteria_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "perfect_quiz", "first_completion", "course_completion"
    criteria_value: Mapped[str | None] = mapped_column(String(255), nullable=True)

class UserBadge(Base, TimestampMixin):
    __tablename__ = "user_badges"
    __table_args__ = (
        UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    badge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False, index=True
    )

    user = relationship("User", backref="badges", lazy="selectin")
    badge = relationship("Badge", lazy="selectin")
