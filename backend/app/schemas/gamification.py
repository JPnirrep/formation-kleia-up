import uuid
from datetime import datetime
from pydantic import BaseModel


class GamificationPointsRead(BaseModel):
    points: int
    level: str
    level_number: int
    streak_days: int
    last_activity_date: datetime | None = None
    total_points_earned: int

    model_config = {"from_attributes": True}


class LeaderboardEntryRead(BaseModel):
    user_id: uuid.UUID
    display_name: str | None = None
    avatar_url: str | None = None
    points: int
    level: str
    level_number: int
    streak_days: int

    model_config = {"from_attributes": True}
