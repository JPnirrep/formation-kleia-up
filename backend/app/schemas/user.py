from datetime import datetime

from pydantic import BaseModel, EmailStr
import uuid


class UserCreate(BaseModel):
    email: EmailStr
    display_name: str
    password: str
    auth_provider: str = "email"
    auth_sub: str | None = None
    avatar_url: str | None = None


class UserUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None
    role: str | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str
    avatar_url: str | None = None
    role: str
    auth_provider: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
