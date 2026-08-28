from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class OrbitalObjectResponse(BaseModel):
    id: str
    name: str
    object_type: str
    source: str
    altitude_km: Optional[float] = None
    inclination_deg: Optional[float] = None
    velocity_kms: Optional[float] = None
    eccentricity: Optional[float] = None
    semi_major_axis_km: Optional[float] = None
    estimated_diameter_min_m: Optional[float] = None
    estimated_diameter_max_m: Optional[float] = None
    is_potentially_hazardous: bool = False
    miss_distance_km: Optional[float] = None
    close_approach_date: Optional[str] = None
    orbiting_body: str = "Earth"
    pos_x: float = 0.0
    pos_y: float = 0.0
    pos_z: float = 0.0
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
