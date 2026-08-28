import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.anomaly import AnomalyEvent
from app.schemas.anomaly import AnomalyEventResponse

router = APIRouter(tags=["AI Anomalies"])


@router.get("/anomalies", response_model=List[AnomalyEventResponse])
def query_anomalies(
    satellite_id: Optional[str] = Query(None, description="Filter by satellite ID"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Query AI-detected anomaly events and contributing telemetry signal residual drifts.
    """
    query = db.query(AnomalyEvent)
    if satellite_id:
        query = query.filter(AnomalyEvent.satellite_id == satellite_id)
    if severity:
        query = query.filter(AnomalyEvent.severity == severity.upper())

    anomalies = query.order_by(AnomalyEvent.created_at.desc()).limit(limit).all()

    # Parse contributing signals JSON
    results = []
    for a in anomalies:
        signals = None
        if a.contributing_signals:
            try:
                signals = json.loads(a.contributing_signals)
            except Exception:
                signals = None

        results.append(
            AnomalyEventResponse(
                id=a.id,
                satellite_id=a.satellite_id,
                subsystem=a.subsystem,
                title=a.title,
                description=a.description,
                confidence=a.confidence,
                severity=a.severity,
                status=a.status,
                radar_angle_deg=a.radar_angle_deg,
                radar_distance_ratio=a.radar_distance_ratio,
                contributing_signals=signals,
                suggested_mitigation=a.suggested_mitigation,
                created_at=a.created_at,
                resolved_at=a.resolved_at,
            )
        )
    return results
