import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.gamification import GamificationPoints
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.gamification import GamificationPointsRead, LeaderboardEntryRead

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/me", response_model=GamificationPointsRead)
async def get_my_gamification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère les points, niveau, streak de l'utilisateur connecté."""
    stmt = select(GamificationPoints).where(
        GamificationPoints.user_id == current_user.id
    )
    result = await db.execute(stmt)
    gamification = result.scalar_one_or_none()

    if gamification is None:
        # Créer un enregistrement par défaut
        gamification = GamificationPoints(user_id=current_user.id)
        db.add(gamification)
        await db.commit()
        await db.refresh(gamification)

    return gamification


@router.get("/leaderboard", response_model=PaginatedResponse)
async def get_leaderboard(
    period: str = Query("all_time", description="Période : weekly, monthly, all_time"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Classement des utilisateurs par points de gamification."""
    # Compter le total d'utilisateurs ayant des points
    count_stmt = select(func.count(GamificationPoints.user_id))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Récupérer la page demandée
    offset = (page - 1) * page_size
    stmt = (
        select(GamificationPoints)
        .options(selectinload(GamificationPoints.user))
        .order_by(GamificationPoints.total_points_earned.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    items = [
        LeaderboardEntryRead(
            user_id=gp.user_id,
            display_name=gp.user.display_name if gp.user else None,
            avatar_url=gp.user.avatar_url if gp.user else None,
            points=gp.points,
            level=gp.level,
            level_number=gp.level_number,
            streak_days=gp.streak_days,
        )
        for gp in rows
    ]

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
