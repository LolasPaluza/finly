from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.services.chat_service import get_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=schemas.ChatResponse)
def chat(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reply = get_chat_reply(db, current_user.id, payload.message, payload.month)
    return {"reply": reply}
