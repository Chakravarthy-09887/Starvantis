from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
import hashlib
import os
from app.core.config import settings

# Robust SHA256 + Salt hashing that is 100% compatible with Python 3.13 without passlib/bcrypt C-extension version warnings
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if ":" in hashed_password:
            salt, key = hashed_password.split(":", 1)
            calculated = hashlib.sha256((salt + plain_password).encode("utf-8")).hexdigest()
            return calculated == key
        return False
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = os.urandom(16).hex()
    key = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}:{key}"


def create_access_token(subject: Any, role: str = "Operator", expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
