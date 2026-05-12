import uuid
from datetime import datetime, timezone

from fpdf import FPDF
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.certificate import Certificate


KLEIA_FONT_DIR = None  # fallback built-in


async def _next_certificate_number(db: AsyncSession) -> str:
    """Generate next certificate number: KLEIA-YYYY-NNNN (sequential per year)."""
    year = datetime.now(timezone.utc).year
    prefix = f"KLEIA-{year}-"

    stmt = (
        select(func.count())
        .select_from(Certificate)
        .where(Certificate.certificate_number.like(f"{prefix}%"))
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0

    return f"{prefix}{count + 1:04d}"


async def generate_certificate(
    db: AsyncSession, user_id: uuid.UUID, course_id: uuid.UUID
) -> Certificate:
    """Generate a completion certificate for a user/course pair."""
    stmt = select(Certificate).where(
        Certificate.user_id == user_id, Certificate.course_id == course_id
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    number = await _next_certificate_number(db)
    cert = Certificate(
        user_id=user_id,
        course_id=course_id,
        certificate_number=number,
        metadata_json={},
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


async def get_user_certificates(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Certificate]:
    """List all certificates for a user, ordered by most recent."""
    stmt = (
        select(Certificate)
        .where(Certificate.user_id == user_id)
        .order_by(Certificate.issued_at.desc())
        .options(selectinload(Certificate.user), selectinload(Certificate.course))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_certificate(db: AsyncSession, cert_id: uuid.UUID) -> Certificate | None:
    """Get a single certificate by ID."""
    stmt = select(Certificate).where(Certificate.id == cert_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_certificate_pdf_bytes(db: AsyncSession, cert: Certificate) -> bytes:
    """Generate a PDF certificate as bytes."""
    user_name = cert.user.display_name if cert.user else "Utilisateur"
    course_title = cert.course.title if cert.course else "Formation"
    issued_str = cert.issued_at.strftime("%d %B %Y") if cert.issued_at else ""

    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.add_page()

    # --- Background border ---
    pdf.set_draw_color(139, 29, 61)  # kleia-burgundy
    pdf.set_line_width(2)
    pdf.rect(10, 10, pdf.w - 20, pdf.h - 20)
    pdf.set_draw_color(212, 175, 55)  # kleia-gold
    pdf.set_line_width(0.5)
    pdf.rect(13, 13, pdf.w - 26, pdf.h - 26)

    # --- Title ---
    pdf.set_y(50)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(139, 29, 61)
    pdf.cell(
        0, 15, "CERTIFICAT DE COMPLETION", align="C", new_x="LMARGIN", new_y="NEXT"
    )

    # --- Decorative line ---
    pdf.set_draw_color(212, 175, 55)
    pdf.set_line_width(0.8)
    pdf.line(70, pdf.get_y() + 2, pdf.w - 70, pdf.get_y() + 2)

    # --- Body ---
    pdf.ln(20)
    pdf.set_font("Helvetica", "", 16)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(
        0, 10, "Ce certificat est delivre a", align="C", new_x="LMARGIN", new_y="NEXT"
    )

    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 15, user_name, align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(5)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(
        0,
        10,
        "pour avoir complete avec succes la formation",
        align="C",
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(139, 29, 61)
    pdf.cell(0, 15, course_title, align="C", new_x="LMARGIN", new_y="NEXT")

    # --- Date & number ---
    pdf.ln(15)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f"Delivre le {issued_str}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(
        0, 8, f"N° {cert.certificate_number}", align="C", new_x="LMARGIN", new_y="NEXT"
    )

    # --- Footer ---
    pdf.ln(20)
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(
        0,
        8,
        "Kleia-up - Leadership Organique",
        align="C",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.cell(0, 8, "https://formation.kleia-up.fr", align="C")

    return bytes(pdf.output())
