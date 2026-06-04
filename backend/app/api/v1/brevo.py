from pydantic import BaseModel, EmailStr

from fastapi import APIRouter, HTTPException, status

from app.services.brevo import sync_contact

router = APIRouter()


class ContactCreate(BaseModel):
    email: EmailStr
    prenom: str = ""
    source: str = "labo_immersif_30_juin_2026"


class ContactResponse(BaseModel):
    status: str
    detail: str = ""


@router.post("/contact", response_model=ContactResponse)
async def create_or_update_contact(data: ContactCreate):
    """
    Ajoute ou met à jour un contact dans Brevo (inscription Labo Immersif).

    La clé API Brevo est lue depuis le fichier .env du serveur,
    jamais exposée côté client.
    """
    result = await sync_contact(
        email=data.email,
        prenom=data.prenom,
        source=data.source,
    )

    if not result.ok:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.detail,
        )

    return ContactResponse(status="ok", detail="Contact synchronisé")
