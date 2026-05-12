"""Serve uploaded files (dev mode only — in production, use S3/CloudFront)."""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.services.storage import get_file_path

router = APIRouter()


@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Serve an uploaded file by its storage key."""
    path = await get_file_path(filename)
    if path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier non trouvé.",
        )
    return FileResponse(path=path)
