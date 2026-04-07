from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.services.parser import parse_and_categorize
from datetime import datetime

router = APIRouter(prefix="/transactions", tags=["transactions"])

MIME_TYPES = {
    "csv": "text/csv",
    "pdf": "application/pdf",
}

@router.post("/upload")
async def upload_extrato(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1].lower()
    mime_type = MIME_TYPES.get(ext, "text/plain")
    content = await file.read()
    month = datetime.now().strftime("%Y-%m")

    transactions = parse_and_categorize(content, mime_type, month)

    saved = []
    for t in transactions:
        tx = models.Transaction(
            user_id=current_user.id,
            date=t["date"],
            description=t["description"],
            amount=float(t["amount"]),
            category=t.get("category", "Outros"),
            month=t.get("month", month)
        )
        db.add(tx)
        saved.append(tx)

    db.commit()
    return {"imported": len(saved)}

@router.post("", response_model=schemas.TransactionOut)
def create_transaction(
    body: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    month = body.month or body.date.strftime("%Y-%m")
    tx = models.Transaction(
        user_id=current_user.id,
        date=body.date,
        description=body.description,
        amount=body.amount,
        category=body.category,
        month=month,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.get("/months")
def list_months(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rows = db.query(models.Transaction.month).filter(
        models.Transaction.user_id == current_user.id
    ).distinct().order_by(models.Transaction.month.desc()).all()
    return [r[0] for r in rows]

@router.get("", response_model=list[schemas.TransactionOut])
def list_transactions(
    month: str = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if month:
        query = query.filter(models.Transaction.month == month)
    return query.order_by(models.Transaction.date.desc()).all()

@router.patch("/{tx_id}", response_model=schemas.TransactionOut)
def update_transaction(
    tx_id: int,
    body: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(tx)
    db.commit()
    return {"deleted": tx_id}
