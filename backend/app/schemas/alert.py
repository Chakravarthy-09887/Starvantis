from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AlertResponse(BaseModel):
    id: str
    severity: str # critical, high, medium, low
    title: str
    subsystem: str
    asset: str
    timestamp: str = Field(validation_alias="timestamp_str")
    description: str
    mitigation: str
    confidence: int
    acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AlertAckRequest(BaseModel):
    operator_name: Optional[str] = Field("Mission Operator", description="Name of operator acknowledging alert")
    comment: Optional[str] = Field(None, description="Operational notes for acknowledgment audit trail")


class AlertAckResponse(BaseModel):
    id: str
    status: str
    acknowledged: bool
    acknowledged_by: str
    acknowledged_at: datetime
    message: str
