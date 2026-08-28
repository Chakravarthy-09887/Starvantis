from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.orbital_object import OrbitalObject
from app.schemas.orbital_object import OrbitalObjectResponse
from app.services.nasa_service import nasa_service

router = APIRouter(tags=["Orbital Objects & NASA Space Intelligence"])


@router.get("/objects", response_model=List[OrbitalObjectResponse])
async def list_orbital_objects(
    limit: int = Query(30, ge=1, le=100),
    hazardous_only: bool = Query(False, description="Filter for potentially hazardous objects only"),
    fetch_live_nasa: bool = Query(True, description="Enrich with live NASA NeoWs API objects"),
    db: Session = Depends(get_db)
):
    """
    List tracked orbital objects, debris fragments, and live Near-Earth Objects from NASA NeoWs API.
    """
    # 1. Fetch from local catalog
    query = db.query(OrbitalObject)
    if hazardous_only:
        query = query.filter(OrbitalObject.is_potentially_hazardous == True)
    local_objects = query.limit(limit).all()

    # 2. Enrich with live NASA NeoWs if requested
    if fetch_live_nasa:
        try:
            live_neos = await nasa_service.get_near_earth_objects(limit=10)
            existing_ids = {o.id for o in local_objects}
            for neo in live_neos:
                if neo["id"] not in existing_ids:
                    # Append dynamically or persist to DB
                    from datetime import datetime, timezone
                    local_objects.append(
                        OrbitalObject(
                            id=neo["id"],
                            name=neo["name"],
                            object_type=neo["object_type"],
                            source=neo["source"],
                            altitude_km=neo["altitude_km"],
                            inclination_deg=neo["inclination_deg"],
                            velocity_kms=neo["velocity_kms"],
                            eccentricity=neo["eccentricity"],
                            semi_major_axis_km=neo["semi_major_axis_km"],
                            estimated_diameter_min_m=neo["estimated_diameter_min_m"],
                            estimated_diameter_max_m=neo["estimated_diameter_max_m"],
                            is_potentially_hazardous=neo["is_potentially_hazardous"],
                            miss_distance_km=neo["miss_distance_km"],
                            close_approach_date=neo["close_approach_date"],
                            orbiting_body=neo["orbiting_body"],
                            pos_x=neo["pos_x"],
                            pos_y=neo["pos_y"],
                            pos_z=neo["pos_z"],
                            updated_at=datetime.now(timezone.utc)
                        )
                    )
        except Exception:
            pass

    return local_objects[:limit]


@router.get("/objects/nasa-apod")
async def get_nasa_apod():
    """Fetch live NASA Astronomy Picture of the Day for aerospace visual display."""
    return await nasa_service.get_apod()
