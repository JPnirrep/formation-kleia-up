from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.journal import JournalEntry
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate, JournalEntryInDB

router = APIRouter()

@router.get("/", response_model=List[JournalEntryInDB])
def get_my_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère toutes les entrées de journal de l'utilisateur courant.
    """
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).all()
    return entries

@router.post("/", response_model=JournalEntryInDB, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_in: JournalEntryCreate,
    db: Session = Depends(get_db),
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
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.put("/{entry_id}", response_model=JournalEntryInDB)
def update_journal_entry(
    entry_id: UUID,
    entry_in: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Modifie une entrée du journal existante.
    """
    db_entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entrée de journal non trouvée.")
    
    update_data = entry_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_entry, field, value)
        
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Supprime une entrée du journal existante.
    """
    db_entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entrée de journal non trouvée.")
    
    db.delete(db_entry)
    db.commit()
    return None
