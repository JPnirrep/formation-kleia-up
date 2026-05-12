from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_user
from app.database import get_db
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead

router = APIRouter()


@router.get("/my", response_model=list[EnrollmentRead])
async def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère les inscriptions de l'utilisateur connecté."""
    stmt = (
        select(Enrollment)
        .where(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.granted_at.desc())
    )
    result = await db.execute(stmt)
    enrollments = result.scalars().all()
    return [EnrollmentRead.model_validate(e) for e in enrollments]


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=EnrollmentRead)
async def create_enrollment(
    data: EnrollmentCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Crée une inscription manuelle (admin uniquement en V1).
    L'admin attribue l'accès à une formation pour un utilisateur.
    """
    enrollment = Enrollment(
        user_id=data.user_id,
        course_id=data.course_id,
        granted_by=current_user.id,
        status="active",
        expires_at=data.expires_at,
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return EnrollmentRead.model_validate(enrollment)
