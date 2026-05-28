from datetime import datetime

from pydantic import BaseModel
import uuid


class VideoAssetCreate(BaseModel):
    lesson_id: uuid.UUID
    title: str
    description: str | None = None
    order: int = 0
    language: str = "fr"
    visibility: str = "draft"
    playback_url: str | None = None  # URL externe (YouTube/Vimeo) à la place du fichier
    status: str = "published"
    completion_threshold_percent: int = 85


class VideoAssetUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None
    language: str | None = None
    visibility: str | None = None
    status: str | None = None
    completion_threshold_percent: int | None = None


class VideoAssetRead(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID
    title: str
    description: str | None = None
    order: int
    source_storage_key: str | None = None
    playback_manifest_url: str | None = None
    playback_url: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int
    status: str
    language: str
    visibility: str
    completion_threshold_percent: int
    tracks: list["VideoTrackRead"] | None = None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VideoTrackCreate(BaseModel):
    video_asset_id: uuid.UUID
    kind: str
    language: str
    label: str
    file_url: str
    is_default: bool = False


class VideoTrackRead(BaseModel):
    id: uuid.UUID
    video_asset_id: uuid.UUID
    kind: str
    language: str
    label: str
    file_url: str
    is_default: bool
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class VideoProgressUpdate(BaseModel):
    last_position_seconds: float
    max_position_seconds: float
    percent_watched: float
    completed: bool = False
    completed_at: datetime | None = None
    last_played_at: datetime | None = None


class VideoProgressRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    video_asset_id: uuid.UUID
    last_position_seconds: float
    max_position_seconds: float
    percent_watched: float
    completed: bool
    completed_at: datetime | None = None
    last_played_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VideoEventCreate(BaseModel):
    video_asset_id: uuid.UUID | None = None  # optionnel : ignoré si l'ID vient du path
    session_id: str
    event_type: str
    position_seconds: float
    payload_json: dict | None = None
