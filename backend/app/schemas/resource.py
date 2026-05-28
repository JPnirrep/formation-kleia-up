from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime

class LessonResourceBase(BaseModel):
    title: str = Field(..., max_length=255)
    resource_type: str = Field(..., max_length=50) # "file" or "markdown"
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
