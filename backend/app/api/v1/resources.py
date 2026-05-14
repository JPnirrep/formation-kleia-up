from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.course import Lesson
from app.models.user import User
from app.models.resource import LessonResource
from app.schemas.resource import LessonResourceRead
from app.services.progress_service import check_lesson_unlocked

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/lessons/{lesson_id}/resources", response_model=list[LessonResourceRead])
async def list_lesson_resources(
    lesson_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List resources for a lesson (PDFs, Markdown, etc.)."""
    lesson_stmt = select(Lesson).options(selectinload(Lesson.module)).where(Lesson.id == lesson_id)
    lesson = (await db.execute(lesson_stmt)).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable.")
    
    # Guard conditionnel
    await check_lesson_unlocked(db, current_user.id, lesson)

    stmt = select(LessonResource).where(LessonResource.lesson_id == lesson_id).order_by(LessonResource.created_at)
    resources = (await db.execute(stmt)).scalars().all()
    return resources
