from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models
from app.services.dashboard_service import get_dashboard_data, get_trends
from app.services.chat_service import get_ai_suggestions
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/trends")
def dashboard_trends(
    n: int = Query(default=6),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return get_trends(db, current_user.id, n)

@router.get("/suggestions")
def dashboard_suggestions(
    month: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not month:
        month = datetime.now().strftime("%Y-%m")
    data = get_dashboard_data(db, current_user.id, month)
    suggestions = get_ai_suggestions(db, current_user.id, month, data["available"])
    return {"suggestions": suggestions}

@router.get("")
def dashboard(
    month: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not month:
        month = datetime.now().strftime("%Y-%m")

    data = get_dashboard_data(db, current_user.id, month)

    alerts = []
    delivery_spend = data["by_category"].get("Alimentação", 0)
    if delivery_spend > data["income"] * 0.25:
        alerts.append(f"Atenção: você gastou R${delivery_spend:.0f} em alimentação — mais de 25% da sua receita.")

    for cat, spent in data["by_category"].items():
        limit = data["budgets"].get(cat)
        if limit and spent > limit:
            alerts.append(f"Orçamento de {cat} excedido: R${spent:.0f} de R${limit:.0f}.")

    return {**data, "alerts": alerts, "suggestions": []}
