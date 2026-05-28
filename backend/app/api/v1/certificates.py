import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_admin, get_current_user
from app.database import get_db
from app.models.certificate import Certificate
from app.models.user import User
from app.schemas.certificate import CertificateWithDetails
from app.services.certificate_service import (
    generate_certificate,
    get_certificate,
    get_certificate_pdf_bytes,
    get_user_certificates,
)

router = APIRouter(dependencies=[Depends(get_current_user)])


def _build_detail(cert: Certificate) -> CertificateWithDetails:
    return CertificateWithDetails(
        id=cert.id,
        user_id=cert.user_id,
        course_id=cert.course_id,
        certificate_number=cert.certificate_number,
        issued_at=cert.issued_at,
        metadata_json=cert.metadata_json,
        created_at=cert.created_at,
        updated_at=cert.updated_at,
        user_name=cert.user.display_name if cert.user else "",
        course_title=cert.course.title if cert.course else "",
        course_slug=cert.course.slug if cert.course else "",
    )


@router.get("/my", response_model=list[CertificateWithDetails])
async def list_my_certificates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Liste les certificats de l'utilisateur connecté."""
    certs = await get_user_certificates(db, current_user.id)
    return [_build_detail(c) for c in certs]


@router.get("/{cert_id}", response_model=CertificateWithDetails)
async def get_certificate_detail(
    cert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère le détail d'un certificat."""
    stmt = (
        select(Certificate)
        .where(Certificate.id == cert_id)
        .options(selectinload(Certificate.user), selectinload(Certificate.course))
    )
    result = await db.execute(stmt)
    cert = result.scalar_one_or_none()
    if cert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificat non trouvé.",
        )
    if cert.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé à ce certificat.",
        )
    return _build_detail(cert)


@router.post(
    "/{course_id}/generate",
    response_model=CertificateWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_certificate(
    course_id: uuid.UUID,
    user_id: uuid.UUID | None = None,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Génère un certificat pour un utilisateur. Par défaut pour l'admin connecté."""
    target_user_id = user_id or current_user.id
    cert = await generate_certificate(db, target_user_id, course_id)
    stmt = (
        select(Certificate)
        .where(Certificate.id == cert.id)
        .options(selectinload(Certificate.user), selectinload(Certificate.course))
    )
    result = await db.execute(stmt)
    cert = result.scalar_one_or_none()
    return _build_detail(cert)


@router.get("/{cert_id}/download")
async def download_certificate(
    cert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Télécharge un certificat au format PDF."""
    stmt = (
        select(Certificate)
        .where(Certificate.id == cert_id)
        .options(selectinload(Certificate.user), selectinload(Certificate.course))
    )
    result = await db.execute(stmt)
    cert = result.scalar_one_or_none()
    if cert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificat non trouvé.",
        )
    if cert.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé.",
        )
    pdf_bytes = await get_certificate_pdf_bytes(db, cert)
    filename = f"certificat-{cert.certificate_number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )
