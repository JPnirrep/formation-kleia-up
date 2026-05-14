from datetime import datetime
import uuid

from pydantic import BaseModel


class ModuleCreate(BaseModel):
    title: str
    description: str | None = None
    order: int


class ModuleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None


class ModuleRead(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: str | None = None
    order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LessonCreate(BaseModel):
    module_id: uuid.UUID
    title: str
    description: str | None = None
    order: int
    lesson_type: str = "video"
    duration_seconds: int = 0


class LessonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None
    lesson_type: str | None = None
    duration_seconds: int | None = None


class LessonRead(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    description: str | None = None
    order: int
    lesson_type: str
    duration_seconds: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    thumbnail_url: str | None = None
    level: str = "débutant"
    category: str | None = None
    is_premium: bool = False
    price_ht: float = 0.0
    tva_rate: float = 20.0
    stripe_product_id: str | None = None
    is_linear_progression_enforced: bool = True


class CourseUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    short_description: str | None = None
    thumbnail_url: str | None = None
    level: str | None = None
    status: str | None = None
    category: str | None = None
    is_premium: bool | None = None
    price_ht: float | None = None
    tva_rate: float | None = None
    stripe_product_id: str | None = None
    is_linear_progression_enforced: bool | None = None


class CourseRead(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int
    level: str
    status: str
    category: str | None = None
    is_premium: bool
    price_ht: float
    tva_rate: float
    stripe_product_id: str | None = None
    is_linear_progression_enforced: bool
    created_by: uuid.UUID
    modules: list[ModuleRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseList(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    short_description: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int
    level: str
    status: str
    category: str | None = None
    is_premium: bool
    price_ht: float
    tva_rate: float
    is_linear_progression_enforced: bool
    created_at: datetime

    model_config = {"from_attributes": True}
