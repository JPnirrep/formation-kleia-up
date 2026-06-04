from dataclasses import dataclass

import httpx

from app.config import settings


BREVO_API_URL = "https://api.brevo.com/v3/contacts"

# Liste Brevo cible pour les inscrits au Labo Immersif
LABO_LIST_ID = 14


@dataclass
class BrevoResult:
    ok: bool
    detail: str = ""


async def sync_contact(
    email: str,
    prenom: str = "",
    source: str = "labo_immersif_30_juin_2026",
) -> BrevoResult:
    """Crée ou met à jour un contact dans Brevo (updateEnabled)."""
    api_key = settings.BREVO_API_KEY
    if not api_key:
        return BrevoResult(ok=False, detail="BREVO_API_KEY non configurée")

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    payload = {
        "email": email,
        "attributes": {
            "PRENOM": prenom,
            "SOURCE": source,
        },
        "listIds": [LABO_LIST_ID],
        "updateEnabled": True,
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                BREVO_API_URL, json=payload, headers=headers, timeout=15
            )
    except httpx.RequestError as exc:
        return BrevoResult(
            ok=False,
            detail=f"Erreur réseau: {exc}",
        )

    if resp.status_code in (200, 201, 204):
        return BrevoResult(ok=True)

    body = resp.json() if resp.text else {}
    return BrevoResult(
        ok=False,
        detail=body.get("message", f"Brevo status {resp.status_code}"),
    )
