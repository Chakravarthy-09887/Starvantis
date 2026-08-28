from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.conjunction import ConjunctionEvent
from app.schemas.conjunction import (
    ConjunctionResponse,
    ConjunctionAnalyzeRequest,
    ConjunctionAnalyzeResponse,
)
from app.services.conjunction_service import conjunction_service

router = APIRouter(tags=["Conjunctions & Collision Avoidance"])


@router.get("/conjunctions", response_model=List[ConjunctionResponse])
def list_conjunctions(
    satellite_id: Optional[str] = Query(None, description="Filter by primary satellite ID"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level: CRITICAL, HIGH, MEDIUM, LOW"),
    db: Session = Depends(get_db)
):
    """
    List active orbital conjunction encounter candidates, closest approach times (TCA), and collision probabilities.
    """
    query = db.query(ConjunctionEvent)
    if satellite_id:
        query = query.filter(ConjunctionEvent.primary_satellite_id == satellite_id)
    if risk_level:
        query = query.filter(ConjunctionEvent.risk_level == risk_level.upper())

    return query.order_by(ConjunctionEvent.tca_time.asc()).all()


@router.post("/conjunctions/analyze", response_model=ConjunctionAnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze_conjunction(payload: ConjunctionAnalyzeRequest):
    """
    Execute high-precision orbital trajectory intersection prediction and compute optimal Collision Avoidance Maneuvers (CAM).
    """
    result = conjunction_service.analyze_conjunction(payload)
    return result
