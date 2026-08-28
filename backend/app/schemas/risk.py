from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RiskIncidentResponse(BaseModel):
    id: str
    satellite_id: str
    title: str
    summary: str
    overall_risk_score: float
    telemetry_health_score: float
    conjunction_threat_score: float
    space_weather_score: float
    status: str
    recommended_action: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
