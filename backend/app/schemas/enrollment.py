from datetime import datetime

from pydantic import BaseModel


class EnrollmentCreate(BaseModel):
    user_id: str
    course_id: str
    granted_by: str | None = None
    expires_at: datetime | None = None


class EnrollmentRead(BaseModel):
    id: str
    user_id: str
    course_id: str
    status: str
    granted_by: str | None = None
    granted_at: datetime
    completed_at: datetime | None = None
    expires_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
