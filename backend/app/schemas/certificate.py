from datetime import datetime

from pydantic import BaseModel


class CertificateRead(BaseModel):
    id: str
    user_id: str
    course_id: str
    certificate_number: str
    issued_at: datetime
    metadata_json: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
