from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gamification import GamificationPoints

# Seuils de niveaux
LEVEL_THRESHOLDS = [
    (1, "apprenti", 0),
    (2, "praticien", 100),
    (3, "incarne", 300),
    (4, "maitre", 600),
]

LEVEL_MAX = 4


def get_level_for_points(points: int) -> tuple[int, str]:
    for i in range(len(LEVEL_THRESHOLDS) - 1, -1, -1):
        level_num, level_name, threshold = LEVEL_THRESHOLDS[i]
        if points >= threshold:
            return level_num, level_name
    return 1, "apprenti"


async def award_points(
    db: AsyncSession,
    user_id: UUID,
    points_to_add: int,
    gamification: GamificationPoints | None = None,
) -> GamificationPoints:
    if gamification is None:
        stmt = select(GamificationPoints).where(
            GamificationPoints.user_id == user_id
        )
        result = await db.execute(stmt)
        gamification = result.scalar_one_or_none()
        if gamification is None:
            gamification = GamificationPoints(user_id=user_id)
            db.add(gamification)

    gamification.points += points_to_add
    gamification.total_points_earned += points_to_add

    # Recalcule du niveau
    new_level_num, new_level = get_level_for_points(gamification.points)
    gamification.level_number = new_level_num
    gamification.level = new_level

    await db.commit()
    await db.refresh(gamification)
    return gamification
