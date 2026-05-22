import math
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.course import Course, Lesson, Module
from app.models.enrollment import Enrollment
from app.models.quiz import Quiz
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.course import (
    CourseCreate,
    CourseRead,
    CourseUpdate,
    LessonCreate,
    LessonRead,
    LessonUpdate,
    ModuleCreate,
    ModuleRead,
    ModuleUpdate,
)
from app.schemas.enrollment import EnrollmentRead
from app.schemas.quiz import QuizCreate, QuizRead
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.course_service import (
    create_course,
    create_lesson,
    create_module,
    delete_course,
    get_course_by_id,
    get_lessons,
    get_modules,
    update_course,
)

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.post("/courses", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def admin_create_course(
    data: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Crée une nouvelle formation."""
    course = await create_course(db, data, current_user.id)
    return CourseRead.model_validate(course)


@router.put("/courses/{course_id}", response_model=CourseRead)
async def admin_update_course(
    course_id: UUID,
    data: CourseUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Modifie une formation existante."""
    course = await update_course(db, course_id, data)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )
    return CourseRead.model_validate(course)


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Supprime une formation."""
    deleted = await delete_course(db, course_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )


@router.post(
    "/courses/{course_id}/modules",
    response_model=ModuleRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_module(
    course_id: UUID,
    data: ModuleCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ajoute un module à une formation."""
    course = await get_course_by_id(db, course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation non trouvée.",
        )
    module = await create_module(db, course_id, data)
    return ModuleRead.model_validate(module)


@router.put("/modules/{module_id}", response_model=ModuleRead)
async def admin_update_module(
    module_id: UUID,
    data: ModuleUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Modifie un module."""
    stmt = select(Module).where(Module.id == module_id)
    result = await db.execute(stmt)
    module = result.scalar_one_or_none()
    if module is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module non trouvé.",
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(module, key, value)
    await db.commit()
    await db.refresh(module)
    return ModuleRead.model_validate(module)


@router.delete("/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_module(
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Supprime un module."""
    stmt = select(Module).where(Module.id == module_id)
    result = await db.execute(stmt)
    module = result.scalar_one_or_none()
    if module is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module non trouvé.",
        )
    await db.delete(module)
    await db.commit()


@router.post(
    "/modules/{module_id}/lessons",
    response_model=LessonRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_lesson(
    module_id: UUID,
    data: LessonCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ajoute une leçon à un module."""
    stmt = select(Module).where(Module.id == module_id)
    result = await db.execute(stmt)
    module = result.scalar_one_or_none()
    if module is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module non trouvé.",
        )
    lesson = await create_lesson(db, module_id, data)
    return LessonRead.model_validate(lesson)


@router.put("/lessons/{lesson_id}", response_model=LessonRead)
async def admin_update_lesson(
    lesson_id: UUID,
    data: LessonUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Modifie une leçon."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon non trouvée.",
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(lesson, key, value)
    await db.commit()
    await db.refresh(lesson)
    return LessonRead.model_validate(lesson)


@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Supprime une leçon."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon non trouvée.",
        )
    await db.delete(lesson)
    await db.commit()


@router.post(
    "/lessons/{lesson_id}/quiz",
    response_model=QuizRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_quiz(
    lesson_id: UUID,
    data: QuizCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ajoute un quiz à une leçon."""
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    result = await db.execute(stmt)
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leçon non trouvée.",
        )
    quiz = Quiz(**data.model_dump(exclude={"lesson_id"}), lesson_id=lesson_id)
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return QuizRead.model_validate(quiz)


@router.get("/enrollments", response_model=PaginatedResponse)
async def admin_list_enrollments(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Liste toutes les inscriptions (administration)."""
    count_stmt = select(func.count()).select_from(Enrollment)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    stmt = (
        select(Enrollment)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .order_by(Enrollment.granted_at.desc())
    )
    result = await db.execute(stmt)
    enrollments = result.scalars().all()

    total_pages = math.ceil(total / page_size) if page_size else 0
    return PaginatedResponse(
        items=[EnrollmentRead.model_validate(e) for e in enrollments],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/users", response_model=PaginatedResponse)
async def admin_list_users(
    page: int = 1,
    page_size: int = 20,
    role: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Liste tous les utilisateurs (admin, avec filtres optionnels)."""
    conditions = [User.is_active == True]
    if role:
        conditions.append(User.role == role)
    if search:
        conditions.append(
            (User.first_name.ilike(f"%{search}%"))
            | (User.last_name.ilike(f"%{search}%"))
            | (User.email.ilike(f"%{search}%"))
        )

    count_stmt = select(func.count()).select_from(User).where(*conditions)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    stmt = (
        select(User)
        .where(*conditions)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .order_by(User.created_at.desc())
    )
    result = await db.execute(stmt)
    users = result.scalars().all()

    total_pages = math.ceil(total / page_size) if page_size else 0
    return PaginatedResponse(
        items=[UserRead.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.delete("/enrollments/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_enrollment(
    enrollment_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Révoque une inscription (admin)."""
    stmt = select(Enrollment).where(Enrollment.id == enrollment_id)
    result = await db.execute(stmt)
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée.",
        )
    await db.delete(enrollment)
    await db.commit()


@router.patch("/enrollments/{enrollment_id}", response_model=EnrollmentRead)
async def admin_update_enrollment_status(
    enrollment_id: UUID,
    status_field: str = "active",
    db: AsyncSession = Depends(get_db),
):
    """Modifie le statut d'une inscription (admin)."""
    if status_field not in ("active", "completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Statut invalide. Valeurs : active, completed, cancelled.",
        )
    stmt = select(Enrollment).where(Enrollment.id == enrollment_id)
    result = await db.execute(stmt)
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée.",
        )
    enrollment.status = status_field
    await db.commit()
    await db.refresh(enrollment)
    return EnrollmentRead.model_validate(enrollment)


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Crée un utilisateur (admin)."""
    from app.services.auth import get_password_hash

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un utilisateur avec cet email existe déjà.",
        )
    user = User(
        email=data.email,
        display_name=data.display_name,
        password_hash=get_password_hash(data.password),
        auth_provider="email",
        role="learner",
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserRead)
async def admin_update_user(
    user_id: UUID,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Modifie un utilisateur (admin)."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé.",
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)
