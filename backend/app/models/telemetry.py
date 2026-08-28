from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Telemetry(Base):
    __tablename__ = "telemetry_records"

    # Composite primary key (id, timestamp) for TimescaleDB Hypertable compatibility
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    timestamp = Column(DateTime, primary_key=True, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    satellite_id = Column(String(32), ForeignKey("satellites.id"), index=True, nullable=False)
    
    # Power & Thermal
    battery_voltage = Column(Float, nullable=False) # e.g. 28.4
    solar_power_kw = Column(Float, nullable=False) # e.g. 1.82
    temp_celsius = Column(Float, nullable=False) # e.g. 22.6
    bus_voltage = Column(Float, default=28.0, nullable=False)
    
    # Position & Attitude
    lat = Column(Float, nullable=False) # e.g. 12.456
    lng = Column(Float, nullable=False) # e.g. 77.123
    altitude_km = Column(Float, nullable=False) # e.g. 542.0
    velocity_kms = Column(Float, default=7.59, nullable=False)
    roll_deg = Column(Float, default=1.2, nullable=False)
    pitch_deg = Column(Float, default=-0.6, nullable=False)
    yaw_deg = Column(Float, default=89.3, nullable=False)
    
    # Comms & Tracking
    signal_dbm = Column(Float, default=-65.0, nullable=False)
    tracked_objects = Column(Integer, default=128, nullable=False)
    active_alerts = Column(Integer, default=0, nullable=False)
    
    # Subsystem Health Scores (0-100)
    eps_health = Column(Integer, default=98, nullable=False)
    adcs_health = Column(Integer, default=99, nullable=False)
    ttc_health = Column(Integer, default=100, nullable=False)
    payload_health = Column(Integer, default=97, nullable=False)
    
    # Anomaly evaluation score for this point
    anomaly_score = Column(Float, default=0.04, nullable=False) # 0.0 to 1.0
    is_anomalous = Column(Integer, default=0, nullable=False)
    
    raw_data = Column(Text, nullable=True) # JSON representation of full packet

    # Relationship
    satellite = relationship("Satellite", back_populates="telemetry_records")
