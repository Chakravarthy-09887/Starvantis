from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from app.core.database import Base


class ConjunctionEvent(Base):
    __tablename__ = "conjunction_events"

    id = Column(String(32), primary_key=True, index=True) # e.g. CONJ-8821
    primary_satellite_id = Column(String(32), index=True, nullable=False) # e.g. STAR-07
    target_object_id = Column(String(64), index=True, nullable=False) # e.g. DEB-3842
    target_name = Column(String(128), nullable=False)
    
    # TCA & Trajectory Geometry
    tca_time = Column(DateTime, nullable=False)
    tca_formatted = Column(String(64), nullable=False) # e.g. 2026-08-28 18:53:21 UTC
    miss_distance_km = Column(Float, nullable=False) # e.g. 1.2 km
    relative_velocity_kms = Column(Float, default=14.8, nullable=False)
    collision_probability = Column(Float, default=1.84e-4, nullable=False) # Pc
    risk_level = Column(String(32), default="CRITICAL", nullable=False)
    
    # Recommended Collision Avoidance Maneuver (CAM)
    recommended_delta_v_ms = Column(Float, default=0.42, nullable=False)
    burn_direction = Column(String(32), default="RETROGRADE", nullable=False)
    burn_execution_epoch = Column(String(64), nullable=True)
    projected_post_burn_miss_km = Column(Float, default=18.6, nullable=False)
    
    # Status
    status = Column(String(32), default="EVASION_RECOMMENDED", nullable=False)
    maneuver_approved = Column(Boolean, default=False, nullable=False)
    approved_by = Column(String(128), nullable=True)
    
    analysis_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
