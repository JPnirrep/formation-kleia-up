"""Admin routes for lesson resources (PDF, documents, etc.)."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, ForeignKey

from app.api.deps import get_current_admin
from app.database import Base, get_db
from app.models.course import Lesson
from app.models.user import User
from app.services.storage import delete_file, store_file

router = APIRouter(dependencies=[Depends(get_current_admin)])


class LessonResource(Base):
    __tablename__ = "lesson_resources"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lessons.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc))


@router.post(
    "/lessons/{lesson_id}/resources",
    status_code=status.HTTP_201_CREATED,
)
async def upload_lesson_resource(
    lesson_id: uuid.UUID,
    file: UploadFile = File(...),
    title: str = "",
    db: AsyncSession = Depends(get_db),
):
    """Upload a file (PDF, document) attached to a lesson."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Leçon non trouvée.")

    content = await file.read()
    storage_key = await store_file(content, file.filename or "file")
    ext = file.filename.split(".")[-1].lower() if file.filename else "bin"

    resource = LessonResource(
        lesson_id=lesson_id,
        title=title or file.filename or "Fichier",
        file_url=f"/api/v1/uploads/{storage_key}",
        file_type=ext,
        file_size=len(content),
        storage_key=storage_key,
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


@router.get("/lessons/{lesson_id}/resources")
async def list_resources(lesson_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(LessonResource)
        .where(LessonResource.lesson_id == lesson_id)
        .order_by(LessonResource.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/resources/{resource_id}", status_code=204)
async def delete_resource(resource_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(LessonResource).where(LessonResource.id == resource_id)
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Ressource non trouvée.")
    if resource.storage_key:
        await delete_file(resource.storage_key)
    await db.delete(resource)
    await db.commit()
