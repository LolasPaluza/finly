from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from datetime import date

router = APIRouter(prefix="/recurring", tags=["recurring"])

@router.get("", response_model=list[schemas.RecurringOut])
def list_recurring(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.user_id == current_user.id
    ).all()

@router.post("", response_model=schemas.RecurringOut)
def create_recurring(
    body: schemas.RecurringCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rec = models.RecurringTransaction(
        user_id=current_user.id,
        description=body.description,
        amount=body.amount,
        category=body.category,
        is_active=True,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.patch("/{rec_id}", response_model=schemas.RecurringOut)
def update_recurring(
    rec_id: int,
    body: schemas.RecurringUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rec = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.id == rec_id,
        models.RecurringTransaction.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recorrência não encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(rec, field, value)
    db.commit()
    db.refresh(rec)
    return rec

@router.delete("/{rec_id}")
def delete_recurring(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rec = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.id == rec_id,
        models.RecurringTransaction.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recorrência não encontrada")
    db.delete(rec)
    db.commit()
    return {"deleted": rec_id}

@router.post("/apply/{month}")
def apply_recurring(
    month: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    recs = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.user_id == current_user.id,
        models.RecurringTransaction.is_active == True
    ).all()

    year, m = int(month[:4]), int(month[5:7])
    tx_date = date(year, m, 1)

    created = 0
    for rec in recs:
        exists = db.query(models.Transaction).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.month == month,
            models.Transaction.description == rec.description,
            models.Transaction.amount == rec.amount,
        ).first()
        if not exists:
            tx = models.Transaction(
                user_id=current_user.id,
                date=tx_date,
                description=rec.description,
                amount=rec.amount,
                category=rec.category,
                month=month,
            )
            db.add(tx)
            created += 1

    db.commit()
    return {"applied": created}
