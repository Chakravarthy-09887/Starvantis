from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(32), primary_key=True, index=True) # e.g. ALT-904
    severity = Column(String(32), default="medium", index=True, nullable=False) # critical, high, medium, low
    title = Column(String(256), nullable=False)
    subsystem = Column(String(128), nullable=False) # e.g. EPS / Power Subsystem
    asset = Column(String(128), index=True, nullable=False) # e.g. STAR-07
    timestamp_str = Column(String(64), nullable=False) # e.g. 14:38:12 UTC
    description = Column(Text, nullable=False)
    mitigation = Column(Text, nullable=False)
    confidence = Column(Integer, default=90, nullable=False) # 0 to 100
    
    acknowledged = Column(Boolean, default=False, index=True, nullable=False)
    acknowledged_by = Column(String(128), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
