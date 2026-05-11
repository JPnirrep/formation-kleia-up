from datetime import datetime

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
    id: str
    course_id: str
    title: str
    description: str | None = None
    order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LessonCreate(BaseModel):
    module_id: str
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
    id: str
    module_id: str
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


class CourseUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    short_description: str | None = None
    thumbnail_url: str | None = None
    level: str | None = None
    status: str | None = None
    category: str | None = None


class CourseRead(BaseModel):
    id: str
    title: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int
    level: str
    status: str
    category: str | None = None
    created_by: str
    modules: list[ModuleRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseList(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int
    level: str
    status: str
    category: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
