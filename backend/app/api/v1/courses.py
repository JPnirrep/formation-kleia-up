from uuid import UUID
import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.course import CourseRead, LessonRead, ModuleRead
from app.services.course_service import (
    get_course_by_slug,
    get_courses,
    get_lessons,
    get_modules,
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def list_courses(
    skip: int = 0,
    limit: int = 20,
    level: str | None = None,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Liste les formations publiées (catalogue).
    Accessible sans authentification pour le catalogue public.
    """
    courses, total = await get_courses(db, skip=skip, limit=limit, status="published")

    if level:
        courses = [c for c in courses if c.level == level]
    if category:
        courses = [c for c in courses if c.category == category]

    return PaginatedResponse(
        items=[CourseRead.model_validate(c) for c in courses],
        total=total,
        page=1,
        page_size=limit,
        total_pages=1,
    )


@router.get("/{slug}", response_model=CourseRead)
async def get_course(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Récupère le détail d'une formation par son slug."""
    course = await get_course_by_slug(db, slug)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )
    return CourseRead.model_validate(course)


@router.get("/{slug}/modules", response_model=list[ModuleRead])
async def get_course_modules(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Récupère tous les modules d'une formation."""
    course = await get_course_by_slug(db, slug)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )
    modules = await get_modules(db, course.id)
    return [ModuleRead.model_validate(m) for m in modules]


@router.get("/{slug}/modules/{module_id}/lessons", response_model=list[LessonRead])
async def get_module_lessons(
    slug: str,
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Récupère toutes les leçons d'un module."""
    course = await get_course_by_slug(db, slug)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )
    lessons = await get_lessons(db, module_id)
    return [LessonRead.model_validate(l) for l in lessons]
