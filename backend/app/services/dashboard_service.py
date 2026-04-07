from sqlalchemy.orm import Session
from app import models

def get_dashboard_data(db: Session, user_id: int, month: str) -> dict:
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.month == month
    ).all()

    income = sum(t.amount for t in txs if t.amount > 0)
    expenses = abs(sum(t.amount for t in txs if t.amount < 0))
    available = income - expenses
    saved = max(0, available)

    by_category = {}
    for t in txs:
        if t.amount < 0:
            by_category[t.category] = by_category.get(t.category, 0) + abs(t.amount)

    budgets_rows = db.query(models.Budget).filter(models.Budget.user_id == user_id).all()
    budgets = {b.category: b.limit_amount for b in budgets_rows}

    return {
        "income": income,
        "expenses": expenses,
        "available": available,
        "saved": saved,
        "by_category": by_category,
        "budgets": budgets,
        "transaction_count": len(txs),
    }

def get_trends(db: Session, user_id: int, n: int = 6) -> dict:
    months = db.query(models.Transaction.month).filter(
        models.Transaction.user_id == user_id
    ).distinct().order_by(models.Transaction.month.desc()).limit(n).all()
    months = sorted([r[0] for r in months])

    result = {"months": [], "income": [], "expenses": []}
    for month in months:
        txs = db.query(models.Transaction).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.month == month
        ).all()
        result["months"].append(month)
        result["income"].append(sum(t.amount for t in txs if t.amount > 0))
        result["expenses"].append(abs(sum(t.amount for t in txs if t.amount < 0)))

    return result
