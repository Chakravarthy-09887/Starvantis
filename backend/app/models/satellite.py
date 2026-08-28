from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Satellite(Base):
    __tablename__ = "satellites"

    id = Column(String(32), primary_key=True, index=True) # e.g. SAT-07, STAR-11, STAR-03
    name = Column(String(128), nullable=False)
    type = Column(String(128), nullable=False)
    orbit_type = Column(String(64), default="LEO (Low Earth Orbit)", nullable=False)
    altitude = Column(String(32), default="542 km", nullable=False)
    altitude_km = Column(Float, default=542.0, nullable=False)
    inclination = Column(String(32), default="15.75°", nullable=False)
    velocity = Column(String(32), default="7.59 km/s", nullable=False)
    launch_date = Column(String(32), default="2024-03-18", nullable=False)
    health = Column(Integer, default=98, nullable=False)
    status = Column(String(32), default="OPERATIONAL", nullable=False)
    ground_station = Column(String(64), default="GS-01 (Bangalore)", nullable=False)
    wave_color = Column(String(32), default="#63c7ff", nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    telemetry_records = relationship("Telemetry", back_populates="satellite", cascade="all, delete-orphan")
