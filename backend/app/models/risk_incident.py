from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.core.database import Base


class RiskIncident(Base):
    __tablename__ = "risk_incidents"

    id = Column(String(32), primary_key=True, index=True) # e.g. RSK-401
    satellite_id = Column(String(32), index=True, nullable=False) # e.g. STAR-07
    title = Column(String(256), nullable=False)
    summary = Column(Text, nullable=False)
    
    # Fused Risk Dimensions (0-100)
    overall_risk_score = Column(Float, nullable=False)
    telemetry_health_score = Column(Float, nullable=False)
    conjunction_threat_score = Column(Float, nullable=False)
    space_weather_score = Column(Float, default=45.0, nullable=False)
    
    status = Column(String(32), default="CRITICAL_ACTION_REQUIRED", nullable=False)
    recommended_action = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
