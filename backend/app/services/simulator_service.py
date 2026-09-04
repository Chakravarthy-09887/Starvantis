import asyncio
import logging
import math
import random
from datetime import datetime, timezone
from typing import Optional
from app.core.websocket_manager import ws_manager

logger = logging.getLogger("starvantis.simulator")

# Gravitational parameters
EARTH_RADIUS_KM = 6371.0
EARTH_MU = 398600.4418  # km^3 / s^2

FLEET_CONFIG = {
    "SENTINEL-6A": {
        "name": "SENTINEL-6A [MICHAEL-FREILICH]",
        "alt_km": 1336.0,
        "inc_deg": 66.04,
        "base_batt": 28.6,
        "max_solar_kw": 2.20,
        "nominal_temp": 24.2,
        "health": 98,
        "tracked": 128,
        "alerts": 2,
    },
    "CHANDRAYAAN-3": {
        "name": "CHANDRAYAAN-3 ORBITER [PRASHAST]",
        "alt_km": 100.0,
        "inc_deg": 89.2,
        "base_batt": 29.1,
        "max_solar_kw": 0.85,
        "nominal_temp": -14.5,
        "health": 99,
        "tracked": 18,
        "alerts": 0,
        "is_lunar": True,
    },
    "ADITYA-L1": {
        "name": "ADITYA-L1 [SURYA-VEDH]",
        "alt_km": 1500000.0,
        "inc_deg": 0.0,
        "base_batt": 29.4,
        "max_solar_kw": 2.10,
        "nominal_temp": 22.0,
        "health": 98,
        "tracked": 6,
        "alerts": 0,
        "is_lagrange": True,
    },
    "EOS-04": {
        "name": "EOS-04 / RISAT-1A [SAR-BHARAT]",
        "alt_km": 529.0,
        "inc_deg": 97.5,
        "base_batt": 28.3,
        "max_solar_kw": 2.80,
        "nominal_temp": 25.4,
        "health": 96,
        "tracked": 142,
        "alerts": 1,
    },
    "CARTOSAT-3": {
        "name": "CARTOSAT-3 [NAVDARSHAK-3]",
        "alt_km": 505.0,
        "inc_deg": 97.4,
        "base_batt": 28.5,
        "max_solar_kw": 2.45,
        "nominal_temp": 23.1,
        "health": 95,
        "tracked": 188,
        "alerts": 1,
    },
    "GAGANYAAN-G1": {
        "name": "GAGANYAAN-G1 [VYOM-ORBITER]",
        "alt_km": 400.0,
        "inc_deg": 51.6,
        "base_batt": 29.0,
        "max_solar_kw": 3.60,
        "nominal_temp": 21.8,
        "health": 99,
        "tracked": 224,
        "alerts": 1,
    },
    "INSAT-3DR": {
        "name": "INSAT-3DR [MEGHDOOT-MET]",
        "alt_km": 35786.0,
        "inc_deg": 0.1,
        "base_batt": 28.2,
        "max_solar_kw": 1.95,
        "nominal_temp": 19.5,
        "health": 94,
        "tracked": 42,
        "alerts": 0,
    },
    "OCEANSAT-3": {
        "name": "OCEANSAT-3 / EOS-06 [SAMUDRA-NETRA]",
        "alt_km": 720.0,
        "inc_deg": 98.3,
        "base_batt": 28.8,
        "max_solar_kw": 2.50,
        "nominal_temp": 21.0,
        "health": 98,
        "tracked": 110,
        "alerts": 0,
    },
    "STARLINK-4012": {
        "name": "STARLINK-4012 [LASER-CROSSLINK]",
        "alt_km": 550.0,
        "inc_deg": 53.0,
        "base_batt": 28.9,
        "max_solar_kw": 2.30,
        "nominal_temp": 20.2,
        "health": 99,
        "tracked": 94,
        "alerts": 0,
    },
    "NOAA-20": {
        "name": "NOAA-20 / JPSS-1 [MET-SENTINEL]",
        "alt_km": 824.0,
        "inc_deg": 98.7,
        "base_batt": 26.5,
        "max_solar_kw": 1.60,
        "nominal_temp": 39.4,
        "health": 91,
        "tracked": 210,
        "alerts": 3,
    },
    "JWST": {
        "name": "JWST [JAMES-WEBB-DEEP-SPACE]",
        "alt_km": 1500000.0,
        "inc_deg": 0.0,
        "base_batt": 29.5,
        "max_solar_kw": 3.80,
        "nominal_temp": 17.2,
        "health": 97,
        "tracked": 38,
        "alerts": 1,
        "is_lagrange": True,
    },
    "LANDSAT-9": {
        "name": "LANDSAT-9 [THERMAL-SENTINEL]",
        "alt_km": 705.0,
        "inc_deg": 98.2,
        "base_batt": 28.2,
        "max_solar_kw": 2.15,
        "nominal_temp": 22.4,
        "health": 96,
        "tracked": 142,
        "alerts": 1,
    },
}


class TelemetrySimulator:
    """High-fidelity background simulator generating accurate 1Hz physical telemetry updates."""

    def __init__(self):
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._step = 0

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._run_loop())
            logger.info("High-Fidelity Multi-Satellite Telemetry Simulator started.")

    def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            logger.info("High-Fidelity Multi-Satellite Telemetry Simulator stopped.")

    async def _run_loop(self):
        while self._running:
            try:
                await asyncio.sleep(1.0)
                now = datetime.now(timezone.utc)
                t_sec = now.timestamp()
                self._step += 1

                for sat_id, cfg in FLEET_CONFIG.items():
                    alt_km = cfg["alt_km"]
                    inc_deg = cfg["inc_deg"]
                    r_km = EARTH_RADIUS_KM + alt_km

                    # 1. True Keplerian Orbital Velocity v = sqrt(mu / r)
                    if cfg.get("is_lagrange"):
                        vel_kms = 0.28 + 0.02 * math.sin(t_sec * 0.01)
                        alt_str = "1.5M km (Sun-Earth L1/L2)"
                    elif cfg.get("is_lunar"):
                        vel_kms = 1.63 + 0.01 * math.sin(t_sec * 0.05)
                        alt_str = "100.0 km (Polar Lunar Orbit)"
                    else:
                        vel_kms = math.sqrt(EARTH_MU / r_km)
                        alt_str = f"{alt_km:.2f} km"

                    # 2. Orbital Ground Track Kinematics (Epoch-Second Continuous Phase)
                    mean_motion = math.sqrt(EARTH_MU / (r_km ** 3)) if not cfg.get("is_lagrange") else 0.0001
                    omega = (t_sec * mean_motion * 180.0 / math.pi) % 360.0
                    omega_rad = math.radians(omega)
                    inc_rad = math.radians(inc_deg)

                    # Spherical sub-satellite latitude & longitude
                    lat_val = math.degrees(math.asin(math.sin(inc_rad) * math.sin(omega_rad)))
                    earth_rot_deg = (t_sec * 0.004178 * 180.0 / math.pi) % 360.0  # Earth 360° in 24h
                    sat_hash_offset = (abs(hash(sat_id)) % 360)
                    lng_val = ((math.degrees(math.atan2(math.cos(inc_rad) * math.sin(omega_rad), math.cos(omega_rad))) - earth_rot_deg + sat_hash_offset) % 360.0) - 180.0

                    # 3. Solar Eclipse & Day/Night Thermal-Electrical Cycle (Smooth Continuous Sigmoid Blending)
                    sun_elevation = math.sin(omega_rad)
                    is_deep_space = cfg.get("is_lagrange", False)

                    if is_deep_space:
                        sunlight_factor = 1.0
                        in_sunlight = True
                    else:
                        # Soft continuous sigmoid curve across penumbra transition
                        sunlight_factor = 1.0 / (1.0 + math.exp(-8.0 * (sun_elevation + 0.05)))
                        in_sunlight = sunlight_factor > 0.35

                    # Continuous solar power generation
                    solar_power_kw = round(cfg["max_solar_kw"] * sunlight_factor * (0.95 + 0.05 * math.sin(t_sec * 0.05)), 2)

                    # Continuous thermodynamic thermal balance (smooth physical dissipation / solar heating)
                    thermal_delta = 3.5 * (sunlight_factor - 0.5) + 0.4 * math.sin(t_sec * 0.04)
                    temp_c = round(cfg["nominal_temp"] + thermal_delta, 1)

                    # Stable 28V regulated battery bus with gentle charge/discharge curve
                    batt_v = round(cfg["base_batt"] + (0.25 * sunlight_factor - 0.12) + 0.01 * math.sin(t_sec * 0.02), 2)

                    # 4. AOCS Attitude Gyro Stabilization (< 0.0038°/s RMS fine pointing jitter)
                    roll_jitter = round(0.035 * math.sin(t_sec * 0.08) + 0.01 * math.cos(t_sec * 0.15), 3)
                    pitch_jitter = round(-0.028 * math.cos(t_sec * 0.07) + 0.01 * math.sin(t_sec * 0.12), 3)
                    yaw_angle = round((omega + 0.05 * math.sin(t_sec * 0.05)) % 360.0, 2)
                    rssi_dbm = -64 - int(abs(math.sin(t_sec * 0.03)) * 6)

                    pulse = {
                        "type": "LIVE_TELEMETRY_PULSE",
                        "satellite_id": sat_id,
                        "timestamp": now.isoformat(),
                        "telemetry": {
                            "battery_voltage": f"{batt_v:.2f} V",
                            "solar_power": f"{solar_power_kw:.2f} kW",
                            "temp": f"{temp_c:.1f} °C",
                            "lat": f"{abs(lat_val):.3f}° {'N' if lat_val >= 0 else 'S'}",
                            "lng": f"{abs(lng_val):.3f}° {'E' if lng_val >= 0 else 'W'}",
                            "altitude": alt_str,
                            "velocity": f"{vel_kms:.2f} km/s",
                            "roll": f"{roll_jitter:+.3f}°",
                            "pitch": f"{pitch_jitter:+.3f}°",
                            "yaw": f"{yaw_angle:.2f}°",
                            "signal": f"{rssi_dbm} dBm",
                            "health": cfg["health"],
                            "tracked_objects": cfg["tracked"],
                            "active_alerts": cfg["alerts"],
                            "eclipse_status": "SUNLIT" if in_sunlight else "PENUMBRA_ECLIPSE",
                            "pointing_jitter": "< 0.0038° / s RMS",
                        },
                    }

                    if ws_manager.active_connections:
                        await ws_manager.broadcast(pulse)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry simulator loop: {e}")
                await asyncio.sleep(2.0)


simulator_service = TelemetrySimulator()
