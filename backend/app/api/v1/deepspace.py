import math
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/deep-space", tags=["Deep-Space & Lagrange Point Specialized Displays"])


class AdityaL1DeepSpaceTelemetry(BaseModel):
    spacecraft_id: str
    orbit_regime: str
    distance_from_earth_km: float
    distance_to_sun_km: float
    light_time_delay_sec: float
    coronagraph_velc_status: str
    cme_event_detected: bool
    solar_uv_suit_flux_wm2: float
    aspex_proton_alpha_ratio_pct: float
    plasma_speed_kms: float
    triaxial_mag_field_nt: Dict[str, float]
    halo_orbit_phase_deg: float
    station_keeping_delta_v_ms_yr: float


class Chandrayaan3DeepSpaceTelemetry(BaseModel):
    spacecraft_id: str
    landing_site: str
    latitude_deg: float
    longitude_deg: float
    distance_from_earth_km: float
    light_time_delay_sec: float
    chaste_surface_temp_c: float
    chaste_subsurface_10cm_temp_c: float
    ilsa_seismic_events_24h: int
    apxs_elemental_abundances: Dict[str, float]
    rambha_plasma_density_cm3: float
    rover_pragyan_distance_traversed_m: float
    battery_charge_pct: float


class JWSTDeepSpaceTelemetry(BaseModel):
    spacecraft_id: str
    orbit_regime: str
    distance_from_earth_km: float
    light_time_delay_sec: float
    sunshield_hot_side_temp_c: float
    sunshield_cold_side_temp_k: float
    miri_cryocooler_temp_k: float
    fgs_pointing_jitter_mas: float
    active_instrument: str
    exposure_target: str
    station_keeping_fuel_margin_years: float


@router.get("/aditya-l1", response_model=AdityaL1DeepSpaceTelemetry)
def get_aditya_l1_telemetry():
    """Retrieve specialized Sun-Earth L1 Lagrange Halo Orbit coronagraph, solar wind, and magnetometer telemetry."""
    now = datetime.now(timezone.utc)
    t = now.timestamp() / 3600.0

    return AdityaL1DeepSpaceTelemetry(
        spacecraft_id="ADITYA-L1",
        orbit_regime="Sun-Earth L1 Halo Orbit (Lissajous)",
        distance_from_earth_km=1492000.0 + math.sin(t * 0.05) * 45000.0,
        distance_to_sun_km=148108000.0,
        light_time_delay_sec=4.98,
        coronagraph_velc_status="ACTIVE // Fe XIV 530.3 nm Coronal Emission Line Monitored",
        cme_event_detected=False,
        solar_uv_suit_flux_wm2=1361.2 + math.sin(t * 0.2) * 1.8,
        aspex_proton_alpha_ratio_pct=4.25 + math.cos(t * 0.3) * 0.4,
        plasma_speed_kms=482.4 + math.sin(t * 0.1) * 24.0,
        triaxial_mag_field_nt={
            "Bx": round(3.42 + math.sin(t * 0.4) * 0.8, 2),
            "By": round(-1.85 + math.cos(t * 0.3) * 0.6, 2),
            "Bz": round(-3.80 + math.sin(t * 0.2) * 1.2, 2),
        },
        halo_orbit_phase_deg=round((t * 2.5) % 360.0, 1),
        station_keeping_delta_v_ms_yr=2.45,
    )


@router.get("/chandrayaan-3", response_model=Chandrayaan3DeepSpaceTelemetry)
def get_chandrayaan3_telemetry():
    """Retrieve Lunar South Pole surface science, ChaSTE thermal gradient probe, and APXS spectrometer telemetry."""
    now = datetime.now(timezone.utc)
    t = now.timestamp() / 3600.0

    return Chandrayaan3DeepSpaceTelemetry(
        spacecraft_id="CHANDRAYAAN-3",
        landing_site="SHIV SHAKTI POINT [69.373° S, 32.319° E]",
        latitude_deg=-69.373,
        longitude_deg=32.319,
        distance_from_earth_km=384400.0 + math.sin(t * 0.08) * 18000.0,
        light_time_delay_sec=1.28,
        chaste_surface_temp_c=round(50.4 + math.sin(t * 0.05) * 8.2, 1),
        chaste_subsurface_10cm_temp_c=-10.2,
        ilsa_seismic_events_24h=3,
        apxs_elemental_abundances={
            "Silicon (Si)": 21.4,
            "Aluminum (Al)": 14.8,
            "Calcium (Ca)": 9.6,
            "Iron (Fe)": 8.2,
            "Magnesium (Mg)": 6.8,
            "Titanium (Ti)": 2.1,
            "Sulfur (S)": 0.34,
        },
        rambha_plasma_density_cm3=1.05e4,
        rover_pragyan_distance_traversed_m=101.4,
        battery_charge_pct=98.5,
    )


@router.get("/jwst", response_model=JWSTDeepSpaceTelemetry)
def get_jwst_telemetry():
    """Retrieve Sun-Earth L2 Lagrange observatory, 5-layer Kapton sunshield thermal gradient, and MIRI cryogenic telemetry."""
    now = datetime.now(timezone.utc)
    t = now.timestamp() / 3600.0

    return JWSTDeepSpaceTelemetry(
        spacecraft_id="JWST",
        orbit_regime="Sun-Earth L2 Halo Orbit (Anti-Sunward)",
        distance_from_earth_km=1502000.0 + math.cos(t * 0.04) * 38000.0,
        light_time_delay_sec=5.02,
        sunshield_hot_side_temp_c=85.2 + math.sin(t * 0.1) * 2.1,
        sunshield_cold_side_temp_k=39.8,
        miri_cryocooler_temp_k=6.4,
        fgs_pointing_jitter_mas=0.0012,
        active_instrument="NIRSpec (Near-Infrared Spectrograph) Multi-Object Slit Mask",
        exposure_target="COSMOS-Web Ultra-Deep Field (z = 11.4)",
        station_keeping_fuel_margin_years=24.5,
    )
