from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
try:
    from pydantic import EmailStr
except ImportError:
    EmailStr = str  # type: ignore


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "Telemetry Operator"
    access_level: str = "LEVEL 3 (OPS)"
    assigned_satellites: str = "ALL ASSETS"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    status: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user: str
    action: str
    target: str
    result: str
    details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
