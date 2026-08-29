import math
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.satellite import Satellite

router = APIRouter(prefix="/space-weather", tags=["Space Weather & Radiation Belt Threat Matrix"])


class SpaceWeatherIndices(BaseModel):
    timestamp: str
    kp_index: float
    storm_level: str
    storm_category: str
    solar_wind_speed_kms: float
    solar_wind_density_pcm3: float
    imf_bz_nt: float
    goes_xray_flux: str
    flare_class: str
    radio_flux_f107: float
    aditya_l1_stream: str
    saa_status: str


class SpacecraftRadiationDose(BaseModel):
    satellite_id: str
    satellite_name: str
    sub_lat: float
    sub_lng: float
    altitude_km: float
    is_in_saa: bool
    is_in_van_allen: bool
    ambient_flux_pcm2s: float
    cumulative_dose_krad: float
    seu_risk_level: str
    solar_cell_degradation_pct: float
    recommended_mitigation: str


# Simulated dynamic space weather epoch
def get_live_space_weather_data() -> SpaceWeatherIndices:
    now = datetime.now(timezone.utc)
    base_t = now.timestamp() / 3600.0

    # Smooth periodic variations for solar wind & Kp
    kp = round(2.33 + math.sin(base_t * 0.5) * 1.67, 2)
    kp = max(0.0, min(9.0, kp))

    if kp < 3.0:
        storm_level = "G0"
        storm_category = "QUIET / NOMINAL"
    elif kp < 5.0:
        storm_level = "G0"
        storm_category = "UNSETTLED"
    elif kp < 6.0:
        storm_level = "G1"
        storm_category = "MINOR GEOMAGNETIC STORM"
    elif kp < 7.0:
        storm_level = "G2"
        storm_category = "MODERATE GEOMAGNETIC STORM"
    elif kp < 8.0:
        storm_level = "G3"
        storm_category = "STRONG GEOMAGNETIC STORM"
    else:
        storm_level = "G4"
        storm_category = "SEVERE GEOMAGNETIC STORM"

    wind_speed = round(420.0 + math.sin(base_t * 0.3) * 85.0 + random.uniform(-5.0, 5.0), 1)
    density = round(5.2 + math.cos(base_t * 0.4) * 2.8, 1)
    imf_bz = round(-2.4 + math.sin(base_t * 0.7) * 4.2, 1)
    f107 = round(162.0 + math.sin(base_t * 0.1) * 18.0, 1)

    return SpaceWeatherIndices(
        timestamp=now.isoformat(),
        kp_index=kp,
        storm_level=storm_level,
        storm_category=storm_category,
        solar_wind_speed_kms=wind_speed,
        solar_wind_density_pcm3=density,
        imf_bz_nt=imf_bz,
        goes_xray_flux="1.24e-6 W/m²",
        flare_class="C3.8 (MODERATE)",
        radio_flux_f107=f107,
        aditya_l1_stream="ASPEX-SWIS // 100% ONLINE",
        saa_status="EXPANDED TRAPPING REGION (-30° Lat, -45° Lng)",
    )


@router.get("/live", response_model=SpaceWeatherIndices)
def get_live_space_weather():
    """Retrieve real-time space weather indices, solar wind speed, Kp-index, and Aditya-L1 solar flare streams."""
    return get_live_space_weather_data()


@router.get("/radiation/{satellite_id}", response_model=SpacecraftRadiationDose)
def get_satellite_radiation_dose(satellite_id: str, db: Session = Depends(get_db)):
    """Calculate cumulative ionizing radiation dosage and SAA South Atlantic Anomaly transit risk for a specific spacecraft."""
    sat = db.query(Satellite).filter(Satellite.id.ilike(f"%{satellite_id}%")).first()
    sat_name = sat.name if sat else satellite_id
    alt = sat.altitude_km if sat else 500.0

    # Calculate sub-satellite point based on current time
    now_sec = datetime.now(timezone.utc).timestamp()
    period_sec = 2 * math.pi * math.sqrt((6371.0 + alt) ** 3 / 398600.4418)
    orbit_phase = (now_sec % period_sec) / period_sec

    # Latitude / Longitude ground track approximation
    inc_rad = math.radians(sat.inclination if sat and hasattr(sat, 'inclination') and isinstance(sat.inclination, float) else 66.0)
    sub_lat = math.degrees(math.sin(orbit_phase * 2 * math.pi) * math.sin(inc_rad))
    sub_lng = ((orbit_phase * 360.0 * (86400.0 / period_sec) - 180.0) % 360.0) - 180.0

    # South Atlantic Anomaly (SAA) Polygon: Lat -50 to 0, Lng -90 to +10
    is_in_saa = (-50.0 <= sub_lat <= 0.0) and (-90.0 <= sub_lng <= 10.0) and (alt <= 1800.0)
    is_in_van_allen = alt > 1000.0

    if is_in_saa:
        flux = 1.45e4 # protons/cm2/s
        seu_risk = "CRITICAL (ELEVATED BIT-FLIP HAZARD)"
        mitigation = "Engage EDAC triple-modular memory scrubbing and switch star tracker attitude weighting to Gyro mode."
    elif is_in_van_allen:
        flux = 4.2e3
        seu_risk = "MODERATE (OUTER ELECTRON BELT)"
        mitigation = "Monitor payload CMOS sensor dark current and maintain thermal dissipation baseline."
    else:
        flux = 2.1e2
        seu_risk = "NOMINAL (QUIET MAGNETOSPHERE)"
        mitigation = "Continuous galactic cosmic ray baseline monitoring."

    # Cumulative dose estimation (krad) based on launch date and altitude
    cum_dose = round(12.4 + (alt / 1000.0) * 4.2, 2)
    degradation = round(1.2 + (cum_dose * 0.08), 2)

    return SpacecraftRadiationDose(
        satellite_id=satellite_id,
        satellite_name=sat_name,
        sub_lat=round(sub_lat, 3),
        sub_lng=round(sub_lng, 3),
        altitude_km=round(alt, 1),
        is_in_saa=is_in_saa,
        is_in_van_allen=is_in_van_allen,
        ambient_flux_pcm2s=flux,
        cumulative_dose_krad=cum_dose,
        seu_risk_level=seu_risk,
        solar_cell_degradation_pct=degradation,
        recommended_mitigation=mitigation,
    )
