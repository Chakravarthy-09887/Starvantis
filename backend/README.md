# STARVANTIS Aerospace Intelligence Backend

Production-grade FastAPI backend for the **STARVANTIS Aerospace Intelligence Platform**, powered by **FastAPI**, **Pydantic v2**, **SQLAlchemy 2.0**, **Alembic**, and **NASA Open APIs**.

---

## Features

- 🛰️ **Constellation Telemetry Ingestion & Query**: High-throughput telemetry ingestion with multi-variate residual drift AI anomaly detection.
- 💥 **Orbital Conjunction & Collision Avoidance (CAM)**: High-precision SGP4/TCA orbital trajectory intersection calculations with delta-V evasion maneuver solver.
- 🚀 **NASA Open API Integration**: Real-time integration with NASA NeoWs (Near-Earth Objects), Space Weather (DONKI), and Astronomy Picture of the Day (APOD).
- 🚨 **Mission Alerts & Operator RBAC**: Severity-ranked alerts with Web Audio threat siren integration and immutable cryptographic audit logging.
- 📡 **Real-time WebSockets**: Bidirectional 1Hz live telemetry streaming and instant alert dispatch on `/ws/mission`.
- 🗄️ **SQLAlchemy 2.0 & Alembic Migrations**: Fully typed database models with automated schema migrations.

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` (or copy `.env.example`):

```ini
PROJECT_NAME="STARVANTIS Aerospace Intelligence API"
VERSION="1.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="starvantis-super-secret-quantum-encryption-key-for-jwt-signing"
DATABASE_URL="sqlite:///./starvantis.db"
NASA_API_KEY="wxu9OqadiasUMrH5fC2NaF33AsXfLiQ7FCRsN2yH"
NASA_BASE_URL="https://api.nasa.gov"
```

### 3. Run Database Migrations

```bash
alembic upgrade head
```

### 4. Start Development Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **WebSocket Stream**: `ws://localhost:8000/ws/mission`

---

## API Specification Reference

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Operator login (returns JWT token) |
| `POST` | `/api/v1/telemetry` | Ingest multi-variate telemetry point |
| `GET` | `/api/v1/satellites/{id}/telemetry` | Query progressive time-series telemetry |
| `GET` | `/api/v1/anomalies` | Query flagged AI anomaly events & radar coordinates |
| `GET` | `/api/v1/objects` | List orbital objects (satellites + debris + NASA NEOs) |
| `GET` | `/api/v1/conjunctions` | List active conjunction collision candidates |
| `POST` | `/api/v1/conjunctions/analyze` | Run trajectory intersection analysis & CAM delta-V solver |
| `GET` | `/api/v1/risk-incidents` | List fused risk incidents (spacecraft + orbital + weather) |
| `GET` | `/api/v1/alerts` | Get mission alerts with severity filters |
| `POST` | `/api/v1/alerts/{id}/ack` | Acknowledge alert & record operator audit entry |
| `WS` | `/ws/mission` | Bidirectional real-time telemetry / alerts WebSocket stream |

---

## Example Usage

### 1. Ingest Telemetry (`POST /api/v1/telemetry`)
```bash
curl -X POST "http://localhost:8000/api/v1/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "satellite_id": "SAT-07",
    "battery_voltage": 28.4,
    "solar_power_kw": 1.82,
    "temp_celsius": 22.6,
    "bus_voltage": 28.0,
    "lat": 12.456,
    "lng": 77.123,
    "altitude_km": 542.0,
    "velocity_kms": 7.59
  }'
```

### 2. Analyze Conjunction Trajectory (`POST /api/v1/conjunctions/analyze`)
```bash
curl -X POST "http://localhost:8000/api/v1/conjunctions/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "primary_satellite_id": "STAR-07",
    "target_object_id": "DEB-3842",
    "initial_miss_distance_km": 1.2
  }'
```

### 3. Acknowledge Alert (`POST /api/v1/alerts/{id}/ack`)
```bash
curl -X POST "http://localhost:8000/api/v1/alerts/ALT-904/ack" \
  -H "Content-Type: application/json" \
  -d '{
    "operator_name": "Commander Vance",
    "comment": "Autonomous load cross-switched to Battery Bay 1."
  }'
```

---

## Automated Tests

Run the complete backend test suite:

```bash
python test_backend.py
```
