from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field


class ConjunctionResponse(BaseModel):
    id: str
    primary_satellite_id: str
    target_object_id: str
    target_name: str
    tca_time: datetime
    tca_formatted: str
    miss_distance_km: float
    relative_velocity_kms: float
    collision_probability: float
    risk_level: str
    recommended_delta_v_ms: float
    burn_direction: str
    burn_execution_epoch: Optional[str] = None
    projected_post_burn_miss_km: float
    status: str
    maneuver_approved: bool
    approved_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConjunctionAnalyzeRequest(BaseModel):
    primary_satellite_id: str = Field("STAR-07", description="Asset ID to protect")
    target_object_id: str = Field("DEB-3842", description="Debris or target ID")
    initial_miss_distance_km: Optional[float] = Field(None, description="Initial detected miss distance")
    hard_body_radius_m: Optional[float] = Field(5.0, description="Combined spacecraft radius in meters")
    position_uncertainty_1sigma_m: Optional[float] = Field(150.0, description="1-sigma positional uncertainty")


class ManeuverOption(BaseModel):
    burn_type: str
    delta_v_ms: float
    burn_direction: str
    fuel_cost_kg: float
    post_burn_miss_km: float
    post_burn_pc: float
    risk_reduction_percentage: float


class ConjunctionAnalyzeResponse(BaseModel):
    analysis_id: str
    primary_satellite_id: str
    target_object_id: str
    evaluated_at: datetime
    tca_iso: str
    time_to_tca_hours: float
    miss_distance_km: float
    collision_probability_pc: float
    risk_assessment: str # CRITICAL, HIGH, MEDIUM, LOW
    recommended_maneuver: ManeuverOption
    alternative_maneuvers: List[ManeuverOption]
    mitigation_notes: str
