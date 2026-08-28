from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=True)
    role = Column(String(64), default="Telemetry Operator", nullable=False) # e.g. Mission Director, Systems Engineer, Orbital Analyst
    access_level = Column(String(32), default="LEVEL 3 (OPS)", nullable=False)
    assigned_satellites = Column(String(128), default="ALL ASSETS", nullable=False)
    status = Column(String(32), default="ACTIVE", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_login = Column(DateTime, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    user = Column(String(128), nullable=False)
    action = Column(String(256), nullable=False)
    target = Column(String(128), nullable=False)
    result = Column(String(32), default="SUCCESS", nullable=False)
    details = Column(Text, nullable=True)
