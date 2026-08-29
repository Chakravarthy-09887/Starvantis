import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import SessionLocal
from app.api.router import api_router
from app.websockets.mission_stream import router as ws_router
from app.services.seed_service import init_db
from app.services.simulator_service import simulator_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("starvantis")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Start Live Telemetry Simulator
    logger.info("Initializing STARVANTIS Aerospace Intelligence Backend...")
    try:
        db = SessionLocal()
        try:
            init_db(db)
        finally:
            db.close()
    except Exception as db_err:
        logger.warning(f"Database initialization notice: {db_err}")

    try:
        simulator_service.start()
    except Exception as sim_err:
        logger.warning(f"Simulator startup notice: {sim_err}")

    yield

    # Shutdown
    logger.info("Shutting down STARVANTIS backend services...")
    try:
        simulator_service.stop()
    except Exception as stop_err:
        logger.warning(f"Simulator shutdown notice: {stop_err}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade FastAPI backend for the STARVANTIS Aerospace Intelligence Platform. "
        "Provides real-time multi-satellite telemetry ingestion, AI anomaly residual drift analysis, "
        "conjunction collision avoidance maneuver computation, NASA Near-Earth Object tracking, and live WebSockets."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS (Supports Localhost, Vercel, Netlify, Railway, Render, and custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.netlify\.app|https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router and WebSockets
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)


@app.get("/", tags=["Health & System Status"])
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "api_v1_root": settings.API_V1_STR,
        "websocket_endpoint": "/ws/mission",
        "nasa_api_integration": "ACTIVE",
    }


@app.get("/health", tags=["Health & System Status"])
def health_check():
    return {
        "status": "healthy",
        "system": "STARVANTIS Mission Control Backend",
        "telemetry_engine": "ONLINE",
        "anomaly_detector": "ACTIVE",
        "conjunction_evaluator": "ACTIVE"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
