import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import ws_manager
from app.core.database import SessionLocal
from app.models.alert import Alert
from app.models.user import AuditLog
from app.schemas.telemetry import TelemetryIngest
from app.schemas.conjunction import ConjunctionAnalyzeRequest
from app.services.telemetry_service import telemetry_service
from app.services.conjunction_service import conjunction_service

logger = logging.getLogger("starvantis.ws")

router = APIRouter(tags=["Real-time Mission WebSocket"])


@router.websocket("/ws/mission")
async def mission_websocket_endpoint(websocket: WebSocket):
    """
    Real-time bidirectional WebSocket stream for live constellation telemetry,
    instant alert acknowledgment, AI anomalies, conjunction analysis, and two-way sync.
    """
    await ws_manager.connect(websocket)
    
    # Send initial welcome packet
    try:
        await ws_manager.send_personal_message({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to STARVANTIS Real-Time Mission Telemetry Stream (PostgreSQL + TimescaleDB)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "active_satellites": ["SENTINEL-6A", "CHANDRAYAAN-3", "ADITYA-L1", "EOS-04", "CARTOSAT-3", "STARLINK-4012", "LANDSAT-9"],
            "stream_frequency_hz": 1,
            "database_engine": "TimescaleDB / PostgreSQL 16"
        }, websocket)
        
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                
                if action == "PING":
                    await ws_manager.send_personal_message({
                        "type": "PONG",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }, websocket)

                elif action == "ACK_ALERT":
                    alert_id = msg.get("alert_id")
                    operator = msg.get("operator", "Commander Vance")
                    comment = msg.get("comment", "Acknowledged via real-time Mission Control deck")
                    
                    if alert_id:
                        db = SessionLocal()
                        try:
                            alert = db.query(Alert).filter(Alert.id == alert_id).first()
                            if alert:
                                now = datetime.now(timezone.utc)
                                alert.acknowledged = True
                                alert.acknowledged_by = operator
                                alert.acknowledged_at = now
                                
                                # Log audit trail
                                audit = AuditLog(
                                    timestamp=now,
                                    user=operator,
                                    action=f"Acknowledged Alert {alert_id} (WS Stream)",
                                    target=alert.asset,
                                    result="ACKNOWLEDGED",
                                    details=comment
                                )
                                db.add(audit)
                                db.commit()
                                
                                # Broadcast acknowledgment event
                                await ws_manager.broadcast({
                                    "type": "ALERT_ACKNOWLEDGED",
                                    "alert_id": alert_id,
                                    "operator": operator,
                                    "timestamp": now.isoformat()
                                })
                        finally:
                            db.close()

                elif action == "INGEST_TELEMETRY":
                    tel_data = msg.get("telemetry", {})
                    payload = TelemetryIngest(**tel_data)
                    db = SessionLocal()
                    try:
                        result = await telemetry_service.ingest_telemetry(db, payload)
                        await ws_manager.broadcast({
                            "type": "TELEMETRY_UPDATE",
                            "telemetry": payload.model_dump(),
                            "result": result.model_dump()
                        })
                    finally:
                        db.close()

                elif action == "ANALYZE_CONJUNCTION":
                    conj_data = msg.get("conjunction", {})
                    req = ConjunctionAnalyzeRequest(
                        primary_satellite_id=conj_data.get("primary_satellite_id", "SENTINEL-6A"),
                        target_object_id=conj_data.get("target_object_id", "DEB-3842"),
                        initial_miss_distance_km=conj_data.get("initial_miss_distance_km", 1.2)
                    )
                    analysis = conjunction_service.analyze_conjunction(req)
                    
                    # Broadcast analysis result to all clients
                    await ws_manager.broadcast({
                        "type": "CONJUNCTION_ANALYSIS_RESULT",
                        "analysis": analysis.model_dump(mode="json")
                    })

                elif action == "SUBSCRIBE_SATELLITE":
                    sat_id = msg.get("satellite_id", "SENTINEL-6A")
                    await ws_manager.send_personal_message({
                        "type": "SUBSCRIPTION_CONFIRMED",
                        "satellite_id": sat_id,
                        "status": "STREAMING"
                    }, websocket)

            except Exception as parse_err:
                if data == "ping":
                    await websocket.send_text("pong")
                else:
                    logger.warning(f"Error handling WS message: {parse_err}")

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)
