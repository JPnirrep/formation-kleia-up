from datetime import datetime

from pydantic import BaseModel


class LessonProgressUpdate(BaseModel):
    status: str = "in_progress"
    completed_at: datetime | None = None


class LessonProgressRead(BaseModel):
    id: str
    user_id: str
    lesson_id: str
    status: str
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
