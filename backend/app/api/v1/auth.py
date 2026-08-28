from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.user import User, AuditLog
from app.schemas.auth import (
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
    AuditLogResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Administration"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = payload["sub"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate mission operator and return JWT bearer token."""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(subject=user.username, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        username=user.username
    )


@router.post("/token", response_model=Token)
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token endpoint for Swagger UI."""
    return login(UserLogin(username=form_data.username, password=form_data.password), db=db)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new mission operator or engineer."""
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        access_level=user_in.access_level,
        assigned_satellites=user_in.assigned_satellites,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current authenticated operator profile (or default active session)."""
    if current_user:
        return current_user
    # Fallback to primary Commander Vance if unauthenticated in dev
    default_user = db.query(User).filter(User.username == "commander.vance").first()
    if default_user:
        return default_user
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


@router.get("/operators", response_model=List[UserResponse])
def list_operators(db: Session = Depends(get_db)):
    """List all mission control operators and access roles."""
    return db.query(User).all()


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Query cryptographic mission administration audit logs."""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
