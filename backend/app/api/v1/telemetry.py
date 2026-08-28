from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.satellite import Satellite
from app.models.telemetry import Telemetry
from app.schemas.telemetry import (
    TelemetryIngest,
    TelemetryResponse,
    TelemetryIngestResult,
)
from app.services.telemetry_service import telemetry_service

router = APIRouter(tags=["Telemetry"])


@router.post("/telemetry", response_model=TelemetryIngestResult, status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(payload: TelemetryIngest, db: Session = Depends(get_db)):
    """
    Ingest multi-variate telemetry point from satellite subsystem.
    Automatically evaluates AI anomaly residual drift and triggers real-time alerts.
    """
    result = await telemetry_service.ingest_telemetry(db=db, payload=payload)
    return result


@router.get("/satellites/{id}/telemetry", response_model=List[TelemetryResponse])
def query_satellite_telemetry(
    id: str,
    limit: int = Query(50, ge=1, le=500, description="Max telemetry records to return"),
    anomalous_only: bool = Query(False, description="Filter for anomalous telemetry records only"),
    db: Session = Depends(get_db)
):
    """
    Query historical and progressive time-series telemetry records for a specific satellite asset.
    """
    sat = db.query(Satellite).filter(Satellite.id == id).first()
    if not sat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Satellite with ID '{id}' not found")

    query = db.query(Telemetry).filter(Telemetry.satellite_id == id)
    if anomalous_only:
        query = query.filter(Telemetry.is_anomalous == 1)

    records = query.order_by(Telemetry.timestamp.desc()).limit(limit).all()
    return records


@router.get("/satellites")
def list_satellites(db: Session = Depends(get_db)):
    """List all constellation fleet satellite assets and health telemetry."""
    sats = db.query(Satellite).all()
    return sats
