from datetime import date, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gamification import GamificationPoints


async def update_streak(db: AsyncSession, gamification: GamificationPoints) -> int:
    today = date.today()

    if gamification.last_activity_date is None:
        # First activity
        gamification.streak_days = 1
    else:
        last_activity = gamification.last_activity_date.date()
        diff = (today - last_activity).days

        if diff == 0:
            # Same day — streak unchanged
            pass
        elif diff == 1:
            # Consecutive day — increment streak
            gamification.streak_days += 1
        else:
            # Break — reset streak
            gamification.streak_days = 1

    gamification.last_activity_date = datetime.now(timezone.utc)
    await db.commit()
    return gamification.streak_days
