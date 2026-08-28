from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.alert import Alert
from app.models.user import AuditLog
from app.schemas.alert import (
    AlertResponse,
    AlertAckRequest,
    AlertAckResponse,
)
from app.core.websocket_manager import ws_manager

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: critical, high, medium, low, all"),
    acknowledged: Optional[bool] = Query(None, description="Filter by acknowledgment state"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get active mission alerts with severity and acknowledgment filters.
    """
    query = db.query(Alert)
    if severity and severity.lower() != "all":
        query = query.filter(Alert.severity == severity.lower())
    if acknowledged is not None:
        query = query.filter(Alert.acknowledged == acknowledged)

    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.post("/alerts/{id}/ack", response_model=AlertAckResponse, status_code=status.HTTP_200_OK)
async def acknowledge_alert(
    id: str,
    payload: AlertAckRequest = AlertAckRequest(),
    db: Session = Depends(get_db)
):
    """
    Acknowledge an active mission alert, silences audio sirens, and logs cryptographic audit trail.
    """
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert '{id}' not found")

    now = datetime.now(timezone.utc)
    operator = payload.operator_name or "Mission Operator"

    alert.acknowledged = True
    alert.acknowledged_by = operator
    alert.acknowledged_at = now

    # Record Audit Log
    audit = AuditLog(
        timestamp=now,
        user=operator,
        action=f"Acknowledged Alert {id}",
        target=f"{alert.asset} ({alert.subsystem})",
        result="ACKNOWLEDGED",
        details=payload.comment or f"Alert acknowledged by {operator}"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    # Broadcast Acknowledgment to all connected WebSocket clients
    await ws_manager.broadcast({
        "type": "ALERT_ACKNOWLEDGED",
        "alert_id": id,
        "operator": operator,
        "timestamp": now.isoformat()
    })

    return AlertAckResponse(
        id=alert.id,
        status="SUCCESS",
        acknowledged=True,
        acknowledged_by=operator,
        acknowledged_at=now,
        message=f"Alert {id} acknowledged successfully."
    )
