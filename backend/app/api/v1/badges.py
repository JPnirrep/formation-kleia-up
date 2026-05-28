from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.database import get_db
from app.models.badge import UserBadge
from app.models.user import User
from app.schemas.badge import UserBadgeRead

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/me", response_model=list[UserBadgeRead])
async def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère les badges obtenus par l'utilisateur connecté."""
    stmt = select(UserBadge).where(UserBadge.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()
