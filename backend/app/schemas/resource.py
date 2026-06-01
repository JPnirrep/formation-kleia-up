from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime


class LessonResourceBase(BaseModel):
    title: str = Field(..., max_length=255)
    resource_type: str = Field(..., max_length=50)  # "file" or "markdown"
    content: Optional[str] = None
    url: Optional[str] = None


class LessonResourceCreate(LessonResourceBase):
    pass


class LessonResourceRead(LessonResourceBase):
    id: UUID
    lesson_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── ResourceAsset (Drive links: PDF, audio) ──


class ResourceAssetCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    file_url: str = Field(..., max_length=1024)
    resource_type: str = Field(
        default="pdf", max_length=20
    )  # "pdf", "audio", "drive_link"
    order: int = 0


class ResourceAssetRead(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str
    description: str | None = None
    order: int
    file_url: str
    resource_type: str
    file_size_bytes: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
