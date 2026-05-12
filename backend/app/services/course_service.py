from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course, Module, Lesson
from app.schemas.course import CourseCreate, CourseUpdate, ModuleCreate, LessonCreate


async def get_courses(
    db: AsyncSession, skip: int = 0, limit: int = 20, status: str = "published"
) -> tuple[list[Course], int]:
    stmt = (
        select(Course)
        .where(Course.status == status)
        .offset(skip)
        .limit(limit)
        .order_by(Course.created_at.desc())
    )
    result = await db.execute(stmt)
    courses = result.scalars().all()

    count_stmt = select(func.count(Course.id)).where(Course.status == status)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()
    return list(courses), total


async def get_course_by_slug(db: AsyncSession, slug: str) -> Course | None:
    stmt = select(Course).where(Course.slug == slug)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_course_by_id(db: AsyncSession, course_id: UUID) -> Course | None:
    stmt = select(Course).where(Course.id == course_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_course(db: AsyncSession, data: CourseCreate, user_id: UUID) -> Course:
    course = Course(**data.model_dump(), created_by=user_id)
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


async def update_course(
    db: AsyncSession, course_id: UUID, data: CourseUpdate
) -> Course | None:
    course = await get_course_by_id(db, course_id)
    if not course:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    await db.commit()
    await db.refresh(course)
    return course


async def delete_course(db: AsyncSession, course_id: UUID) -> bool:
    course = await get_course_by_id(db, course_id)
    if not course:
        return False
    await db.delete(course)
    await db.commit()
    return True


async def get_modules(db: AsyncSession, course_id: UUID) -> list[Module]:
    stmt = (
        select(Module)
        .where(Module.course_id == course_id)
        .order_by(Module.order)
        .options(selectinload(Module.lessons))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_module(
    db: AsyncSession, course_id: UUID, data: ModuleCreate
) -> Module:
    module = Module(**data.model_dump(), course_id=course_id)
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


async def get_lessons(db: AsyncSession, module_id: UUID) -> list[Lesson]:
    stmt = select(Lesson).where(Lesson.module_id == module_id).order_by(Lesson.order)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_lesson(
    db: AsyncSession, module_id: UUID, data: LessonCreate
) -> Lesson:
    lesson = Lesson(**data.model_dump(exclude={"module_id"}), module_id=module_id)
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson
