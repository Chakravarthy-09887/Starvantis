from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.core.database import Base


class OrbitalObject(Base):
    __tablename__ = "orbital_objects"

    id = Column(String(64), primary_key=True, index=True) # e.g. DEB-3842, NASA-3542519
    name = Column(String(128), nullable=False)
    object_type = Column(String(64), default="DEBRIS", nullable=False) # DEBRIS, SATELLITE, ASTEROID, ROCKET_BODY
    source = Column(String(32), default="LOCAL_CATALOG", nullable=False) # NASA_NEOWS, LOCAL_CATALOG
    
    # Orbital Keplerian Elements & State
    altitude_km = Column(Float, nullable=True)
    inclination_deg = Column(Float, nullable=True)
    velocity_kms = Column(Float, nullable=True)
    eccentricity = Column(Float, nullable=True)
    semi_major_axis_km = Column(Float, nullable=True)
    
    # NASA NEO specific fields
    estimated_diameter_min_m = Column(Float, nullable=True)
    estimated_diameter_max_m = Column(Float, nullable=True)
    is_potentially_hazardous = Column(Boolean, default=False, nullable=False)
    miss_distance_km = Column(Float, nullable=True)
    close_approach_date = Column(String(64), nullable=True)
    orbiting_body = Column(String(32), default="Earth", nullable=False)
    
    # Coordinates in 3D radar space
    pos_x = Column(Float, default=0.0, nullable=False)
    pos_y = Column(Float, default=0.0, nullable=False)
    pos_z = Column(Float, default=0.0, nullable=False)
    
    extra_details = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
