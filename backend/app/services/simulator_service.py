import asyncio
import logging
import math
import random
from datetime import datetime, timezone
from app.core.websocket_manager import ws_manager

logger = logging.getLogger("starvantis.simulator")


FLEET_CONFIG = {
  "SENTINEL-6A": {"alt": "1,336 km", "vel": "7.20 km/s", "lat_bias": 12.0, "batt": 28.4, "solar": 1.82, "temp": 22.6, "health": 98, "tracked": 128, "alerts": 2},
  "CHANDRAYAAN-3": {"alt": "100 km (Moon)", "vel": "1.63 km/s", "lat_bias": -89.2, "batt": 28.9, "solar": 0.74, "temp": -14.2, "health": 99, "tracked": 18, "alerts": 0},
  "ADITYA-L1": {"alt": "1.5M km (L1)", "vel": "0.28 km/s", "lat_bias": 0.0, "batt": 28.8, "solar": 1.85, "temp": 21.4, "health": 98, "tracked": 6, "alerts": 0},
  "EOS-04": {"alt": "529 km", "vel": "7.60 km/s", "lat_bias": 21.0, "batt": 28.2, "solar": 2.40, "temp": 23.8, "health": 96, "tracked": 142, "alerts": 1},
  "CARTOSAT-3": {"alt": "505 km", "vel": "7.62 km/s", "lat_bias": 28.6, "batt": 28.5, "solar": 2.10, "temp": 22.1, "health": 95, "tracked": 188, "alerts": 1},
  "GAGANYAAN-G1": {"alt": "400 km", "vel": "7.67 km/s", "lat_bias": 13.7, "batt": 28.9, "solar": 3.20, "temp": 21.0, "health": 99, "tracked": 224, "alerts": 1},
  "INSAT-3DR": {"alt": "35,786 km", "vel": "3.07 km/s", "lat_bias": 0.0, "batt": 28.1, "solar": 1.70, "temp": 18.6, "health": 94, "tracked": 42, "alerts": 0},
  "OCEANSAT-3": {"alt": "720 km", "vel": "7.49 km/s", "lat_bias": 15.3, "batt": 28.7, "solar": 2.35, "temp": 20.2, "health": 98, "tracked": 110, "alerts": 0},
  "STARLINK-4012": {"alt": "550 km", "vel": "7.59 km/s", "lat_bias": 34.0, "batt": 28.8, "solar": 2.14, "temp": 19.4, "health": 99, "tracked": 94, "alerts": 0},
  "NOAA-20": {"alt": "824 km", "vel": "7.44 km/s", "lat_bias": 51.0, "batt": 26.4, "solar": 1.42, "temp": 38.6, "health": 91, "tracked": 210, "alerts": 3},
  "JWST": {"alt": "1.5M km (L2)", "vel": "0.22 km/s", "lat_bias": 0.0, "batt": 29.2, "solar": 3.45, "temp": 16.8, "health": 97, "tracked": 38, "alerts": 1},
  "LANDSAT-9": {"alt": "705 km", "vel": "7.50 km/s", "lat_bias": -33.0, "batt": 28.1, "solar": 1.95, "temp": 21.0, "health": 96, "tracked": 142, "alerts": 1},
}


class TelemetrySimulator:
    """Background simulator generating live 1Hz telemetry updates for active satellites."""
    def __init__(self):
        self._running = False
        self._task: asyncio.Task | None = None
        self._step = 0

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._run_loop())
            logger.info("Live Multi-Satellite Telemetry Simulator started.")

    def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            logger.info("Live Multi-Satellite Telemetry Simulator stopped.")

    async def _run_loop(self):
        while self._running:
            try:
                await asyncio.sleep(1.0)
                self._step += 1
                now = datetime.now(timezone.utc)
                t = self._step * 0.05

                for sat_id, cfg in FLEET_CONFIG.items():
                    # Generate dynamic orbital and electrical parameters
                    lat = round(cfg["lat_bias"] + 15.0 * math.sin(t * 0.4 + hash(sat_id) % 5), 4)
                    lng = round(((self._step * 0.8 + hash(sat_id) * 30) % 360) - 180, 4)
                    batt_v = round(cfg["batt"] + 0.25 * math.sin(t * 0.8) + random.uniform(-0.04, 0.04), 2)
                    solar_kw = round(max(0.0, cfg["solar"] + 0.3 * math.cos(t * 0.3) + random.uniform(-0.02, 0.02)), 2)
                    temp = round(cfg["temp"] + 1.0 * math.sin(t * 0.2) + random.uniform(-0.1, 0.1), 1)

                    pulse = {
                        "type": "LIVE_TELEMETRY_PULSE",
                        "satellite_id": sat_id,
                        "timestamp": now.isoformat(),
                        "telemetry": {
                            "battery_voltage": f"{batt_v} V",
                            "solar_power": f"{solar_kw} kW",
                            "temp": f"{temp} °C",
                            "lat": f"{abs(lat):.3f}° {'N' if lat >= 0 else 'S'}",
                            "lng": f"{abs(lng):.3f}° {'E' if lng >= 0 else 'W'}",
                            "altitude": cfg["alt"],
                            "velocity": cfg["vel"],
                            "roll": f"{round(1.2 + 0.1 * math.sin(t), 2)}°",
                            "pitch": f"{round(-0.6 + 0.1 * math.cos(t), 2)}°",
                            "yaw": f"{round((89.3 + t * 0.5) % 360, 1)}°",
                            "signal": "-65 dBm",
                            "health": cfg["health"],
                            "tracked_objects": cfg["tracked"],
                            "active_alerts": cfg["alerts"],
                        }
                    }

                    if ws_manager.active_connections:
                        await ws_manager.broadcast(pulse)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry simulator loop: {e}")
                await asyncio.sleep(2.0)


simulator_service = TelemetrySimulator()
