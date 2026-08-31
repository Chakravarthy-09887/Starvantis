import sys
from fastapi.testclient import TestClient
from app.main import app

def test_copilot():
    client = TestClient(app)
    
    test_queries = [
        ("Simulate evasive collision avoidance burn for Sentinel-6A", "SENTINEL-6A", "CONJUNCTION_COLLISION_AVOIDANCE"),
        ("Calculate Chandrayaan-3 lunar landing rough braking parameters", "CHANDRAYAAN-3", "LUNAR_EDL_DESCENT_GUIDANCE"),
        ("Inspect solar wind particle stream and CME on Aditya-L1", "ADITYA-L1", "L1_HALO_SPACE_WEATHER_DIAGNOSTICS"),
        ("Check JWST MIRI 6.7K cryocooler loop and wavefront error", "JWST", "L2_CRYOGENIC_OBSERVATORY_DIAGNOSTICS"),
        ("Diagnose Gaganyaan-G1 cabin ECLSS life support pressure", "GAGANYAAN-G1", "CREWED_FLIGHT_ECLSS_DIAGNOSTICS"),
        ("Rotate CCSDS SDLS AES-256 telecommand encryption keys", "SENTINEL-6A", "CYBER_DEFENSE_TELECOMMAND_INTEGRITY"),
        ("Diagnose battery cell thermal elevation alert", "SENTINEL-6A", "POWER_THERMAL_DIAGNOSTICS"),
        ("Calculate Keplerian orbital pass and ground station AOS", "SENTINEL-6A", "ORBITAL_EPHEMERIS_ANALYSIS"),
        ("Run full fleet health check and anomalous telemetry scan", "SENTINEL-6A", "FLEET_HEALTH_OVERVIEW"),
    ]

    print("========================================")
    print("TESTING ENHANCED JARVIS COPILOT QUERIES")
    print("========================================")

    for prompt, sat_id, expected_intent in test_queries:
        print(f"\n[QUERY] '{prompt}' (Target: {sat_id})")
        res = client.post("/api/v1/copilot/query", json={
            "prompt": prompt,
            "satellite_id": sat_id,
            "operator": "Commander Vance"
        })
        assert res.status_code == 200, f"Failed for {prompt}: {res.text}"
        data = res.json()
        print(f" -> INTENT: {data['intent']}")
        print(f" -> SUMMARY: {data['summary'][:75]}...")
        assert data["intent"] == expected_intent, f"Expected {expected_intent}, got {data['intent']}"
        assert data["summary"]
        assert data["detailed_analysis"]
        assert len(data["suggested_followups"]) > 0

    # Test Telecommand Execution
    print("\n[TELECOMMAND EXECUTION TEST]")
    tc_res = client.post("/api/v1/copilot/query", json={
        "prompt": "Initiate Chandrayaan-3 terminal descent braking guidance",
        "satellite_id": "CHANDRAYAAN-3",
        "operator": "Commander Vance"
    })
    tc_data = tc_res.json()
    assert tc_data["suggested_telecommand"] is not None
    tc = tc_data["suggested_telecommand"]
    print(f" -> Generated Telecommand: {tc['command_id']} ({tc['action_type']})")
    print(f" -> Verification Hash: {tc['verification_hash']}")

    exec_res = client.post("/api/v1/copilot/execute-telecommand", json={
        "command_id": tc["command_id"],
        "satellite_id": "CHANDRAYAAN-3",
        "operator": "Commander Vance",
        "telecommand": tc
    })
    assert exec_res.status_code == 200, f"Telecommand execution failed: {exec_res.text}"
    exec_data = exec_res.json()
    assert exec_data["status"] == "SUCCESS"
    print(f" -> Execution Result: {exec_data['status']} - {exec_data['message']}")

    print("\n========================================================")
    print("ALL JARVIS COPILOT TESTS PASSED WITH 100% SUCCESS!")
    print("========================================================")

if __name__ == "__main__":
    test_copilot()
