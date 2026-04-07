import json
import re
from sqlalchemy.orm import Session
from app import models
from app.services.gemini import chat_with_context, generate_suggestions

def build_transaction_summary(txs: list) -> list[dict]:
    return [
        {"date": str(t.date), "description": t.description,
         "amount": t.amount, "category": t.category, "month": t.month}
        for t in txs
    ]

def get_prev_month(month: str) -> str:
    from datetime import date
    year, m = int(month[:4]), int(month[5:7])
    m -= 1
    if m == 0:
        m, year = 12, year - 1
    return f"{year}-{m:02d}"

def get_chat_reply(db: Session, user_id: int, message: str, month: str = None) -> str:
    from datetime import datetime
    if not month:
        month = datetime.now().strftime("%Y-%m")

    prev = get_prev_month(month)
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.month.in_([month, prev])
    ).order_by(models.Transaction.date.desc()).limit(200).all()

    if not txs:
        return "Ainda não há transações importadas. Faça upload do seu extrato primeiro!"

    summary = build_transaction_summary(txs)
    return chat_with_context(message, summary)

def get_ai_suggestions(db: Session, user_id: int, month: str, available: float) -> list[str]:
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.month == month
    ).all()

    if not txs:
        return []

    tx_count = len(txs)

    # Check cache first
    cached = db.query(models.SuggestionsCache).filter(
        models.SuggestionsCache.user_id == user_id,
        models.SuggestionsCache.month == month,
        models.SuggestionsCache.transaction_count == tx_count,
    ).first()

    if cached:
        try:
            return json.loads(cached.suggestions_json)
        except Exception:
            pass

    # Call Gemini
    try:
        summary = build_transaction_summary(txs)
        raw = generate_suggestions(summary, available)

        match = re.search(r'\[.*\]', raw, re.DOTALL)
        suggestions = json.loads(match.group()) if match else []

        # Save to cache
        if cached:
            cached.suggestions_json = json.dumps(suggestions)
            cached.transaction_count = tx_count
        else:
            db.add(models.SuggestionsCache(
                user_id=user_id,
                month=month,
                suggestions_json=json.dumps(suggestions),
                transaction_count=tx_count,
            ))
        db.commit()
        return suggestions

    except Exception as e:
        print(f"[suggestions] Gemini error: {e}")
        # Return cached even if stale rather than nothing
        if cached:
            try:
                return json.loads(cached.suggestions_json)
            except Exception:
                pass
        return []
