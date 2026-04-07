from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("", response_model=list[schemas.BudgetOut])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()

@router.post("", response_model=schemas.BudgetOut)
def upsert_budget(
    body: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.category == body.category
    ).first()
    if existing:
        existing.limit_amount = body.limit_amount
        db.commit()
        db.refresh(existing)
        return existing
    budget = models.Budget(user_id=current_user.id, category=body.category, limit_amount=body.limit_amount)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    db.delete(budget)
    db.commit()
    return {"deleted": budget_id}
