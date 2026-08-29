from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.anomalies import router as anomalies_router
from app.api.v1.objects import router as objects_router
from app.api.v1.conjunctions import router as conjunctions_router
from app.api.v1.risk import router as risk_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.copilot import router as copilot_router
from app.api.v1.spaceweather import router as spaceweather_router
from app.api.v1.deepspace import router as deepspace_router
from app.api.v1.groundstations import router as groundstations_router
from app.api.v1.cyberdefense import router as cyberdefense_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(telemetry_router)
api_router.include_router(anomalies_router)
api_router.include_router(objects_router)
api_router.include_router(conjunctions_router)
api_router.include_router(risk_router)
api_router.include_router(alerts_router)
api_router.include_router(copilot_router)
api_router.include_router(spaceweather_router)
api_router.include_router(deepspace_router)
api_router.include_router(groundstations_router)
api_router.include_router(cyberdefense_router)
