from datetime import datetime

from pydantic import BaseModel
import uuid


class CertificateRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    certificate_number: str
    issued_at: datetime
    metadata_json: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CertificateWithDetails(CertificateRead):
    user_name: str = ""
    course_title: str = ""
    course_slug: str = ""
