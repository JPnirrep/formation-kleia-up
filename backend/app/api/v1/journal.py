from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.journal import JournalEntry
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate, JournalEntryInDB

router = APIRouter()


@router.get("/", response_model=List[JournalEntryInDB])
async def get_my_journal_entries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère toutes les entrées de journal de l'utilisateur courant.
    """
    stmt = select(JournalEntry).where(JournalEntry.user_id == current_user.id).order_by(JournalEntry.created_at.desc())
    result = await db.execute(stmt)
    entries = result.scalars().all()
    return entries


@router.post("/", response_model=JournalEntryInDB, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry_in: JournalEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crée une nouvelle entrée dans le journal de l'utilisateur courant.
    """
    db_entry = JournalEntry(
        **entry_in.model_dump(),
        user_id=current_user.id
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return db_entry


@router.put("/{entry_id}", response_model=JournalEntryInDB)
async def update_journal_entry(
    entry_id: UUID,
    entry_in: JournalEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Modifie une entrée du journal existante.
    """
    stmt = select(JournalEntry).where(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    db_entry = result.scalar_one_or_none()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entrée de journal non trouvée.")

    update_data = entry_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_entry, field, value)

    await db.commit()
    await db.refresh(db_entry)
    return db_entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal_entry(
    entry_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Supprime une entrée du journal existante.
    """
    stmt = select(JournalEntry).where(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    db_entry = result.scalar_one_or_none()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entrée de journal non trouvée.")

    await db.delete(db_entry)
    await db.commit()
    return None
