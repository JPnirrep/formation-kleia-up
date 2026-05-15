from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class JournalEntryBase(BaseModel):
    lesson_id: Optional[UUID] = None
    content: str
    is_shared: bool = False

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    content: Optional[str] = None
    is_shared: Optional[bool] = None

class JournalEntryInDB(JournalEntryBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
