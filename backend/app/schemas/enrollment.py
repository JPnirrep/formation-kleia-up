from datetime import datetime
from enum import Enum

from pydantic import BaseModel
import uuid


class EnrollmentStatus(str, Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class EnrollmentStatusUpdate(BaseModel):
    status: EnrollmentStatus


class EnrollmentCreate(BaseModel):
    user_id: uuid.UUID
    course_id: uuid.UUID
    expires_at: datetime | None = None


class EnrollmentRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    status: str
    granted_by: uuid.UUID | None = None
    granted_at: datetime
    completed_at: datetime | None = None
    expires_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
