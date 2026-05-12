from uuid import UUID
import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
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
    query = select(Course).where(Course.status == "published")
    count_query = select(func.count(Course.id)).where(Course.status == "published")

    if level:
        query = query.where(Course.level == level)
        count_query = count_query.where(Course.level == level)
    if category:
        query = query.where(Course.category == category)
        count_query = count_query.where(Course.category == category)

    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    result = await db.execute(
        query.offset(skip).limit(limit).order_by(Course.created_at.desc())
    )
    courses = result.scalars().all()

    page = (skip // limit) + 1
    total_pages = math.ceil(total / limit) if limit > 0 else 1

    return PaginatedResponse(
        items=[CourseRead.model_validate(c) for c in courses],
        total=total,
        page=page,
        page_size=limit,
        total_pages=total_pages,
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
