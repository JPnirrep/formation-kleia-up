"""Storage abstraction — local disk (dev) or S3 (production)."""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException

from app.config import settings


UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Extensions autorisées (sécurité : empêcher l'upload de fichiers exécutables)
ALLOWED_EXTENSIONS = {
    ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv",  # Vidéos
    ".mp3", ".wav", ".aac", ".flac", ".m4a",           # Audio
    ".pdf", ".doc", ".docx", ".ppt", ".pptx",           # Documents
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",   # Images
    ".zip", ".gz", ".tar",                               # Archives
    ".srt", ".vtt",                                      # Sous-titres
}


async def store_file(file_bytes: bytes, filename: str) -> str:
    """Store a file and return a storage key (relative path)."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Extension '{ext}' non autorisée.")
    key = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / key

    with open(dest, "wb") as f:
        f.write(file_bytes)

    return key


async def delete_file(storage_key: str) -> None:
    """Delete a stored file by its storage key."""
    path = UPLOAD_DIR / storage_key
    if path.exists():
        path.unlink()


async def get_file_path(storage_key: str) -> Path | None:
    """Get the local path for a storage key."""
    path = UPLOAD_DIR / storage_key
    return path if path.exists() else None


def get_playback_url(storage_key: str | None) -> str | None:
    """Return the public URL for a stored file."""
    if not storage_key:
        return None
    return f"/api/v1/uploads/{storage_key}"


def get_file_size(storage_key: str) -> int:
    """Return file size in bytes."""
    path = UPLOAD_DIR / storage_key
    return path.stat().st_size if path.exists() else 0
