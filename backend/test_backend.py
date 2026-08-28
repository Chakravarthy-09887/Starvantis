import asyncio
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.services.seed_service import init_db


def test_all():
    # Ensure seed data is initialized
    db = SessionLocal()
    init_db(db)
    db.close()

    with TestClient(app) as client:
        print("1. Testing Root and Healthcheck...")
        resp = client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "OPERATIONAL"
        assert data["websocket_endpoint"] == "/ws/mission"

        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["status"] == "healthy"

        print("2. Testing Auth Login...")
        resp = client.post("/api/v1/auth/login", json={
            "username": "commander.vance",
            "password": "starvantis2026"
        })
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["role"] == "Mission Director"
        assert data["username"] == "commander.vance"

        print("3. Testing Telemetry Ingestion & Query...")
        telemetry_payload = {
            "satellite_id": "SENTINEL-6A",
            "battery_voltage": 28.4,
            "solar_power_kw": 1.82,
            "temp_celsius": 22.6,
            "bus_voltage": 28.0,
            "lat": 12.456,
            "lng": 77.123,
            "altitude_km": 542.0,
            "velocity_kms": 7.59,
            "roll_deg": 1.2,
            "pitch_deg": -0.6,
            "yaw_deg": 89.3,
            "signal_dbm": -65.0,
            "tracked_objects": 128,
            "active_alerts": 2
        }
        ingest_resp = client.post("/api/v1/telemetry", json=telemetry_payload)
        assert ingest_resp.status_code == 201
        result = ingest_resp.json()
        assert result["status"] == "SUCCESS"
        assert result["telemetry_id"] > 0
        assert result["anomaly_score"] < 0.50

        # Query satellite telemetry
        query_resp = client.get("/api/v1/satellites/SENTINEL-6A/telemetry?limit=10")
        assert query_resp.status_code == 200
        records = query_resp.json()
        assert len(records) > 0
        assert records[0]["satellite_id"] == "SENTINEL-6A"

        # Ingest anomalous telemetry and verify AI detection
        anomaly_payload = {
            "satellite_id": "SENTINEL-6A",
            "battery_voltage": 24.1,
            "solar_power_kw": 0.85,
            "temp_celsius": 42.5,
            "bus_voltage": 26.2,
            "lat": 12.456,
            "lng": 77.123
        }
        ano_resp = client.post("/api/v1/telemetry", json=anomaly_payload)
        assert ano_resp.status_code == 201
        ano_result = ano_resp.json()
        assert ano_result["is_anomalous"] is True
        assert ano_result["anomaly_score"] >= 0.75
        assert ano_result["alert_triggered"] is not None

        print("4. Testing AI Anomalies Query...")
        resp = client.get("/api/v1/anomalies")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) > 0
        assert "confidence" in data[0]
        assert "radar_angle_deg" in data[0]

        print("5. Testing Orbital Objects & NASA API...")
        resp = client.get("/api/v1/objects?limit=10&fetch_live_nasa=false")
        assert resp.status_code == 200
        objects = resp.json()
        assert len(objects) > 0

        apod_resp = client.get("/api/v1/objects/nasa-apod")
        assert apod_resp.status_code == 200
        assert "title" in apod_resp.json()

        print("6. Testing Conjunctions & Analysis...")
        list_resp = client.get("/api/v1/conjunctions")
        assert list_resp.status_code == 200
        conjs = list_resp.json()
        assert len(conjs) > 0
        assert conjs[0]["primary_satellite_id"] == "STAR-07"

        analysis_payload = {
            "primary_satellite_id": "STAR-07",
            "target_object_id": "DEB-3842",
            "initial_miss_distance_km": 1.2
        }
        analyze_resp = client.post("/api/v1/conjunctions/analyze", json=analysis_payload)
        assert analyze_resp.status_code == 200
        analysis = analyze_resp.json()
        assert analysis["primary_satellite_id"] == "STAR-07"
        assert "collision_probability_pc" in analysis
        assert analysis["recommended_maneuver"]["delta_v_ms"] == 0.42
        assert analysis["recommended_maneuver"]["post_burn_miss_km"] == 18.6

        print("7. Testing Risk Incidents...")
        resp = client.get("/api/v1/risk-incidents")
        assert resp.status_code == 200
        risks = resp.json()
        assert len(risks) > 0
        assert risks[0]["overall_risk_score"] > 80.0
        assert "telemetry_health_score" in risks[0]

        print("8. Testing Alerts & Acknowledgment...")
        resp = client.get("/api/v1/alerts")
        assert resp.status_code == 200
        alerts = resp.json()
        assert len(alerts) > 0
        
        unack_alert = next((a for a in alerts if not a["acknowledged"]), alerts[0])
        alert_id = unack_alert["id"]

        ack_resp = client.post(f"/api/v1/alerts/{alert_id}/ack", json={
            "operator_name": "Commander Vance",
            "comment": "Load switched to secondary battery bay."
        })
        assert ack_resp.status_code == 200
        ack_data = ack_resp.json()
        assert ack_data["acknowledged"] is True
        assert ack_data["acknowledged_by"] == "Commander Vance"

        print("9. Testing Real-time WebSocket Mission Stream...")
        with client.websocket_connect("/ws/mission") as websocket:
            ws_welcome = websocket.receive_json()
            assert ws_welcome["type"] == "CONNECTION_ESTABLISHED"
            assert "active_satellites" in ws_welcome

            websocket.send_json({"action": "PING"})
            pong = websocket.receive_json()
            assert pong["type"] == "PONG"

        print("--> ALL 9 TEST SUITES COMPLETED AND PASSED WITH 100% SUCCESS! <--")


if __name__ == "__main__":
    test_all()
