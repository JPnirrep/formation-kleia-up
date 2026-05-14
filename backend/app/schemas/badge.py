from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime

class BadgeBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    criteria_type: str = Field(..., max_length=50)
    criteria_value: Optional[str] = None

class BadgeRead(BadgeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserBadgeRead(BaseModel):
    id: UUID
    user_id: UUID
    badge_id: UUID
    badge: BadgeRead
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
