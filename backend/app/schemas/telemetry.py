from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field


class TelemetryIngest(BaseModel):
    satellite_id: str = Field(..., description="ID of satellite, e.g. SAT-07, STAR-11")
    battery_voltage: float = Field(..., description="Battery voltage in Volts (e.g. 28.4)")
    solar_power_kw: float = Field(..., description="Solar generation in kW (e.g. 1.82)")
    temp_celsius: float = Field(..., description="Payload / Bus core temperature in °C (e.g. 22.6)")
    bus_voltage: Optional[float] = Field(28.0, description="Main regulated bus voltage")
    lat: Optional[float] = Field(0.0, description="Geographic latitude")
    lng: Optional[float] = Field(0.0, description="Geographic longitude")
    altitude_km: Optional[float] = Field(542.0, description="Orbital altitude in km")
    velocity_kms: Optional[float] = Field(7.59, description="Orbital velocity in km/s")
    roll_deg: Optional[float] = Field(1.2, description="Attitude roll in degrees")
    pitch_deg: Optional[float] = Field(-0.6, description="Attitude pitch in degrees")
    yaw_deg: Optional[float] = Field(89.3, description="Attitude yaw in degrees")
    signal_dbm: Optional[float] = Field(-65.0, description="Ground link signal strength in dBm")
    tracked_objects: Optional[int] = Field(128, description="Count of tracked local debris objects")
    active_alerts: Optional[int] = Field(0, description="Number of active unacknowledged alerts")
    eps_health: Optional[int] = Field(98, description="Electrical Power Subsystem health (0-100)")
    adcs_health: Optional[int] = Field(99, description="Attitude Determination & Control health (0-100)")
    ttc_health: Optional[int] = Field(100, description="Telemetry, Tracking & Command health (0-100)")
    payload_health: Optional[int] = Field(97, description="Scientific payload health (0-100)")
    extra_sensors: Optional[Dict[str, Any]] = None


class TelemetryResponse(BaseModel):
    id: int
    satellite_id: str
    timestamp: datetime
    battery_voltage: float
    solar_power_kw: float
    temp_celsius: float
    bus_voltage: float
    lat: float
    lng: float
    altitude_km: float
    velocity_kms: float
    roll_deg: float
    pitch_deg: float
    yaw_deg: float
    signal_dbm: float
    tracked_objects: int
    active_alerts: int
    eps_health: int
    adcs_health: int
    ttc_health: int
    payload_health: int
    anomaly_score: float
    is_anomalous: int

    model_config = ConfigDict(from_attributes=True)


class TelemetryIngestResult(BaseModel):
    status: str
    telemetry_id: int
    anomaly_score: float
    is_anomalous: bool
    alert_triggered: Optional[str] = None
    processed_at: datetime
