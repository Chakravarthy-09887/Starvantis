from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from app.core.database import Base


class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    id = Column(String(32), primary_key=True, index=True) # e.g. ANO-904
    satellite_id = Column(String(32), index=True, nullable=False)
    subsystem = Column(String(64), nullable=False) # e.g. EPS, ADCS, TT&C, Thermal
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False) # 0.0 to 1.0 (e.g. 0.94)
    severity = Column(String(32), default="CRITICAL", nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(32), default="ACTIVE", nullable=False) # ACTIVE, MITIGATED, RESOLVED
    
    # Radar visualization coordinates
    radar_angle_deg = Column(Float, default=45.0, nullable=False)
    radar_distance_ratio = Column(Float, default=0.72, nullable=False)
    
    # JSON encoded list of contributing signal weights
    contributing_signals = Column(Text, nullable=True)
    suggested_mitigation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
