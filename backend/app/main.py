from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models  # registers all ORM models with Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finly API")

import os

_base_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://finly-rouge-two.vercel.app",
]
_extra = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = _base_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

from app.routers import auth
app.include_router(auth.router)

from app.routers import transactions
app.include_router(transactions.router)

from app.routers import dashboard, chat, goals
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(goals.router)

from app.routers import budgets, recurring
app.include_router(budgets.router)
app.include_router(recurring.router)
