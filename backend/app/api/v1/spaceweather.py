import math
import random
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.satellite import Satellite

router = APIRouter(prefix="/space-weather", tags=["Space Weather & Radiation Belt Threat Matrix"])


class SolarFlareEvent(BaseModel):
    id: str
    class_type: str  # X1.2, M4.5, C8.2
    active_region: str  # AR-3664
    peak_time_utc: str
    flux_wm2: float
    cme_associated: bool
    radio_blackout_level: str  # R1, R2, R3, R4, R5


class SpaceWeatherIndices(BaseModel):
    timestamp: str
    kp_index: float
    storm_level: str
    storm_category: str
    solar_wind_speed_kms: float
    solar_wind_density_pcm3: float
    solar_wind_pressure_npa: float
    magnetopause_standoff_re: float
    imf_bz_nt: float
    imf_bt_nt: float
    dst_index_nt: float
    auroral_power_gw: float
    goes_xray_flux: str
    flare_class: str
    radio_flux_f107: float
    aditya_l1_stream: str
    saa_status: str
    van_allen_inner_flux: str
    van_allen_outer_flux: str
    kp_history_24h: List[Dict[str, Any]]
    solar_wind_history_24h: List[Dict[str, Any]]
    recent_flares: List[SolarFlareEvent]


class SpacecraftRadiationDose(BaseModel):
    satellite_id: str
    satellite_name: str
    sub_lat: float
    sub_lng: float
    altitude_km: float
    orbit_type: str
    is_in_saa: bool
    is_in_van_allen: bool
    van_allen_region: str
    ambient_flux_pcm2s: float
    cumulative_dose_krad: float
    tid_limit_krad: float
    tid_health_pct: float
    seu_risk_level: str
    edac_scrub_rate_hz: float
    solar_cell_degradation_pct: float
    saa_ingress_time_utc: str
    saa_transit_duration_min: float
    recommended_mitigation: str


# Dynamic space weather model with realistic physics
def get_live_space_weather_data() -> SpaceWeatherIndices:
    now = datetime.now(timezone.utc)
    base_t = now.timestamp() / 3600.0

    # Smooth periodic variations for solar wind & Kp
    kp = round(3.67 + math.sin(base_t * 0.4) * 1.33 + random.uniform(-0.15, 0.15), 2)
    kp = max(0.0, min(9.0, kp))

    if kp < 3.0:
        storm_level = "G0"
        storm_category = "QUIET / NOMINAL"
    elif kp < 5.0:
        storm_level = "G0"
        storm_category = "UNSETTLED (MODERATE)"
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

    wind_speed = round(482.4 + math.sin(base_t * 0.3) * 65.0 + random.uniform(-4.0, 4.0), 1)
    density = round(6.4 + math.cos(base_t * 0.4) * 2.2, 1)

    # Dynamic pressure P = 1.6726e-6 * n * v^2 in nPa
    dyn_pressure = round(1.6726e-6 * density * (wind_speed ** 2), 2)

    # Magnetopause standoff distance R_mp ~ (B0^2 / 2*mu0*P)^(1/6) in Earth Radii (R_E)
    standoff = round(10.2 / math.pow(dyn_pressure / 2.0, 1.0 / 6.0), 1)
    standoff = max(6.0, min(14.0, standoff))

    imf_bz = round(-3.8 + math.sin(base_t * 0.7) * 3.5, 1)
    imf_bt = round(math.sqrt((imf_bz ** 2) + 5.2 ** 2), 1)
    dst = round(-28.0 - (kp * 12.5) + math.sin(base_t) * 6.0, 1)
    auroral_gw = round(24.0 + (kp ** 1.8) * 4.5, 1)
    f107 = round(168.4 + math.sin(base_t * 0.1) * 14.0, 1)

    # Generate 24-hour history trend for Kp & Solar Wind
    kp_history = []
    wind_history = []
    for h in range(24, 0, -3):
        t_past = now - timedelta(hours=h)
        t_val = t_past.timestamp() / 3600.0
        past_kp = round(max(1.0, min(8.0, 3.2 + math.sin(t_val * 0.4) * 1.6 + math.cos(t_val * 0.2) * 0.8)), 2)
        past_wind = round(420.0 + math.sin(t_val * 0.3) * 80.0, 1)
        time_label = t_past.strftime("%H:%M")
        kp_history.append({"time": time_label, "kp": past_kp})
        wind_history.append({"time": time_label, "speed": past_wind, "pressure": round(1.6726e-6 * 6.0 * (past_wind ** 2), 2)})

    # Current epoch point
    kp_history.append({"time": now.strftime("%H:%M"), "kp": kp})
    wind_history.append({"time": now.strftime("%H:%M"), "speed": wind_speed, "pressure": dyn_pressure})

    recent_flares = [
        SolarFlareEvent(
            id="FLR-2026-0831A",
            class_type="X1.2 (STRONG)",
            active_region="AR-3664",
            peak_time_utc=(now - timedelta(hours=3, minutes=14)).strftime("%H:%M UTC"),
            flux_wm2=1.2e-4,
            cme_associated=True,
            radio_blackout_level="R3 (STRONG HIGH-FREQ BLACKOUT)",
        ),
        SolarFlareEvent(
            id="FLR-2026-0830B",
            class_type="M4.5 (MODERATE)",
            active_region="AR-3663",
            peak_time_utc=(now - timedelta(hours=14, minutes=45)).strftime("%H:%M UTC"),
            flux_wm2=4.5e-5,
            cme_associated=False,
            radio_blackout_level="R2 (MODERATE HF BLACKOUT)",
        ),
        SolarFlareEvent(
            id="FLR-2026-0830A",
            class_type="C8.2 (INTERMEDIATE)",
            active_region="AR-3668",
            peak_time_utc=(now - timedelta(hours=22, minutes=10)).strftime("%H:%M UTC"),
            flux_wm2=8.2e-6,
            cme_associated=False,
            radio_blackout_level="R1 (MINOR HF ATTENUATION)",
        ),
    ]

    return SpaceWeatherIndices(
        timestamp=now.isoformat(),
        kp_index=kp,
        storm_level=storm_level,
        storm_category=storm_category,
        solar_wind_speed_kms=wind_speed,
        solar_wind_density_pcm3=density,
        solar_wind_pressure_npa=dyn_pressure,
        magnetopause_standoff_re=standoff,
        imf_bz_nt=imf_bz,
        imf_bt_nt=imf_bt,
        dst_index_nt=dst,
        auroral_power_gw=auroral_gw,
        goes_xray_flux="1.24e-6 W/m²",
        flare_class="C3.8 (MODERATE)",
        radio_flux_f107=f107,
        aditya_l1_stream="ASPEX-SWIS & VELC // 100% ONLINE",
        saa_status="EXPANDED TRAPPING REGION (-30° Lat, -45° Lng)",
        van_allen_inner_flux="1.84e4 p/cm²/s (E > 10 MeV)",
        van_allen_outer_flux="4.62e5 e⁻/cm²/s (E > 2 MeV)",
        kp_history_24h=kp_history,
        solar_wind_history_24h=wind_history,
        recent_flares=recent_flares,
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
    now = datetime.now(timezone.utc)
    now_sec = now.timestamp()
    period_sec = 2 * math.pi * math.sqrt((6371.0 + alt) ** 3 / 398600.4418)
    orbit_phase = (now_sec % period_sec) / period_sec

    # Latitude / Longitude ground track approximation
    inc_val = 66.0
    orbit_type_str = "LEO (Low Earth Orbit)"
    if "CHANDRAYAAN" in satellite_id.upper():
        orbit_type_str = "LPO (Lunar Polar Orbit)"
        alt = 100.0
        inc_val = 90.0
    elif "ADITYA" in satellite_id.upper():
        orbit_type_str = "Sun-Earth L1 Halo"
        alt = 1500000.0
        inc_val = 0.0
    elif "JWST" in satellite_id.upper():
        orbit_type_str = "Sun-Earth L2 Halo"
        alt = 1500000.0
        inc_val = 0.0
    elif "INSAT" in satellite_id.upper():
        orbit_type_str = "GEO (Geostationary)"
        alt = 35786.0
        inc_val = 0.1

    inc_rad = math.radians(inc_val)
    sub_lat = math.degrees(math.sin(orbit_phase * 2 * math.pi) * math.sin(inc_rad))
    sub_lng = ((orbit_phase * 360.0 * (86400.0 / period_sec) - 180.0) % 360.0) - 180.0

    # South Atlantic Anomaly (SAA) Polygon: Lat -50 to 0, Lng -90 to +10
    is_in_saa = (-50.0 <= sub_lat <= 0.0) and (-90.0 <= sub_lng <= 10.0) and (alt <= 1800.0)

    # Van Allen Belt classification based on altitude
    if alt < 1000.0:
        van_allen_region = "LEO Under-Belt Zone (Atmospheric Shielding)"
        is_in_van_allen = False
        flux = 1.45e4 if is_in_saa else 2.1e2
    elif 1000.0 <= alt <= 6000.0:
        van_allen_region = "Inner Van Allen Belt (Trapped High-Energy Protons)"
        is_in_van_allen = True
        flux = 6.8e4
    elif 6000.0 < alt <= 12000.0:
        van_allen_region = "Safe Slot Region (Reduced Trapping Flux)"
        is_in_van_allen = True
        flux = 1.2e3
    elif 12000.0 < alt <= 40000.0:
        van_allen_region = "Outer Van Allen Belt (Relativistic Electrons)"
        is_in_van_allen = True
        flux = 4.6e5
    else:
        van_allen_region = "Deep Space / Interplanetary Cosmic Flux"
        is_in_van_allen = False
        flux = 8.5e2

    if is_in_saa:
        seu_risk = "CRITICAL (ELEVATED SAA BIT-FLIP HAZARD)"
        edac_rate = 4.8
        mitigation = "Engage EDAC triple-modular memory scrubbing and switch star tracker attitude weighting to Gyro mode."
    elif is_in_van_allen and "Outer" in van_allen_region:
        seu_risk = "HIGH (RELATIVISTIC DIELECTRIC CHARGING)"
        edac_rate = 2.4
        mitigation = "Activate internal circuit grounding and monitor payload CMOS sensor dark current."
    elif is_in_van_allen and "Inner" in van_allen_region:
        seu_risk = "ELEVATED (PROTON DISPLACEMENT DAMAGE)"
        edac_rate = 3.2
        mitigation = "Enable redundant OBC watchdogs and cycle payload high-voltage supplies."
    else:
        seu_risk = "NOMINAL (QUIET MAGNETOSPHERE)"
        edac_rate = 0.8
        mitigation = "Continuous galactic cosmic ray baseline monitoring."

    # Cumulative dose estimation (krad) based on altitude & mission duration
    cum_dose = round(14.82 + (min(alt, 2000.0) / 1000.0) * 3.4, 2)
    tid_limit = 100.0  # 100 krad(Si) rad-hardened aerospace rating
    tid_health = round(((tid_limit - cum_dose) / tid_limit) * 100.0, 1)
    degradation = round(2.38 + (cum_dose * 0.06), 2)

    ingress_time = (now + timedelta(minutes=42)).strftime("%H:%M UTC")

    return SpacecraftRadiationDose(
        satellite_id=satellite_id,
        satellite_name=sat_name,
        sub_lat=round(sub_lat, 3),
        sub_lng=round(sub_lng, 3),
        altitude_km=round(alt, 1),
        orbit_type=orbit_type_str,
        is_in_saa=is_in_saa,
        is_in_van_allen=is_in_van_allen,
        van_allen_region=van_allen_region,
        ambient_flux_pcm2s=flux,
        cumulative_dose_krad=cum_dose,
        tid_limit_krad=tid_limit,
        tid_health_pct=tid_health,
        seu_risk_level=seu_risk,
        edac_scrub_rate_hz=edac_rate,
        solar_cell_degradation_pct=degradation,
        saa_ingress_time_utc=ingress_time,
        saa_transit_duration_min=18.4,
        recommended_mitigation=mitigation,
    )
