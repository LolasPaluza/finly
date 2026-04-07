from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TransactionCreate(BaseModel):
    date: date
    description: str
    amount: float
    category: str
    month: Optional[str] = None

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    date: date
    description: str
    amount: float
    category: str
    month: str
    model_config = {"from_attributes": True}

class GoalCreate(BaseModel):
    description: str
    target_amount: float
    month: str

class GoalOut(BaseModel):
    id: int
    description: str
    target_amount: float
    month: str
    model_config = {"from_attributes": True}

class BudgetCreate(BaseModel):
    category: str
    limit_amount: float

class BudgetOut(BaseModel):
    id: int
    category: str
    limit_amount: float
    model_config = {"from_attributes": True}

class RecurringCreate(BaseModel):
    description: str
    amount: float
    category: str

class RecurringUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class RecurringOut(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    is_active: bool
    model_config = {"from_attributes": True}

class ChatRequest(BaseModel):
    message: str
    month: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
