import uuid
from sqlalchemy import ForeignKey, String, Text
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
