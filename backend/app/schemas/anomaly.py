from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class ContributingSignal(BaseModel):
    signal: str
    weight: float
    residual_drift: Optional[float] = None


class AnomalyEventResponse(BaseModel):
    id: str
    satellite_id: str
    subsystem: str
    title: str
    description: str
    confidence: float
    severity: str
    status: str
    radar_angle_deg: float
    radar_distance_ratio: float
    contributing_signals: Optional[List[Dict[str, Any]]] = None
    suggested_mitigation: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
