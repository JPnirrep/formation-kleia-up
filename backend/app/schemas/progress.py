from datetime import datetime

from pydantic import BaseModel
import uuid


class LessonProgressUpdate(BaseModel):
    status: str = "in_progress"
    completed_at: datetime | None = None


class LessonProgressRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    lesson_id: uuid.UUID
    status: str
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
