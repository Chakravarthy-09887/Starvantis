from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.risk_incident import RiskIncident
from app.schemas.risk import RiskIncidentResponse

router = APIRouter(tags=["Mission Risk Fusion"])


@router.get("/risk-incidents", response_model=List[RiskIncidentResponse])
def list_risk_incidents(
    satellite_id: Optional[str] = Query(None, description="Filter by satellite ID"),
    db: Session = Depends(get_db)
):
    """
    List multi-stream fused risk incidents combining spacecraft health degradation, conjunction threats, and space weather.
    """
    query = db.query(RiskIncident)
    if satellite_id:
        query = query.filter(RiskIncident.satellite_id == satellite_id)

    return query.order_by(RiskIncident.overall_risk_score.desc()).all()
