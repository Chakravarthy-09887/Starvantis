import json
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import Base, engine
from app.core.security import get_password_hash
from app.models.user import User, AuditLog
from app.models.satellite import Satellite
from app.models.telemetry import Telemetry
from app.models.anomaly import AnomalyEvent
from app.models.orbital_object import OrbitalObject
from app.models.conjunction import ConjunctionEvent
from app.models.alert import Alert
from app.models.risk_incident import RiskIncident

logger = logging.getLogger("starvantis.seed")


def init_db(db: Session):
    """Create all database tables, initialize TimescaleDB hypertable, and seed initial mission state."""
    Base.metadata.create_all(bind=engine)

    # Enable TimescaleDB extension and create hypertable if using PostgreSQL
    if "postgres" in settings.DATABASE_URL.lower():
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
                conn.commit()
                # Create hypertable on telemetry_records
                conn.execute(text("SELECT create_hypertable('telemetry_records', 'timestamp', if_not_exists => TRUE, migrate_data => TRUE);"))
                conn.commit()
                logger.info("TimescaleDB extension enabled and 'telemetry_records' hypertable created successfully.")
        except Exception as e:
            logger.warning(f"Note on TimescaleDB initialization: {e}")

    # 1. Seed Operators & Users
    if db.query(User).count() == 0:
        logger.info("Seeding initial operators...")
        operators_data = [
            {
                "username": "commander.vance",
                "email": "vance@starvantis.space",
                "full_name": "Commander Vance",
                "role": "Mission Director",
                "access_level": "LEVEL 5 (EXEC)",
                "assigned_satellites": "ALL ASSETS",
                "status": "ACTIVE",
                "is_superuser": True
            },
            {
                "username": "elena.rostova",
                "email": "rostova@starvantis.space",
                "full_name": "Dr. Elena Rostova",
                "role": "Systems Engineer",
                "access_level": "LEVEL 4 (SYS)",
                "assigned_satellites": "SENTINEL-6A",
                "status": "ACTIVE",
                "is_superuser": False
            },
            {
                "username": "k.chen",
                "email": "chen@starvantis.space",
                "full_name": "K. Chen",
                "role": "Orbital Analyst",
                "access_level": "LEVEL 4 (ORBIT)",
                "assigned_satellites": "CHANDRAYAAN-3, SENTINEL-6A",
                "status": "ACTIVE",
                "is_superuser": False
            },
            {
                "username": "m.mansoor",
                "email": "mansoor@starvantis.space",
                "full_name": "M. Al-Mansoor",
                "role": "Telemetry Operator",
                "access_level": "LEVEL 3 (OPS)",
                "assigned_satellites": "STARLINK-4012, LANDSAT-9",
                "status": "IDLE",
                "is_superuser": False
            },
            {
                "username": "s.tanaka",
                "email": "tanaka@starvantis.space",
                "full_name": "S. Tanaka",
                "role": "ML Ops Engineer",
                "access_level": "LEVEL 4 (DEV)",
                "assigned_satellites": "FLEET MODELS",
                "status": "STANDBY",
                "is_superuser": False
            },
        ]
        default_pwd = get_password_hash("starvantis2026")
        for op in operators_data:
            user = User(
                username=op["username"],
                email=op["email"],
                full_name=op["full_name"],
                hashed_password=default_pwd,
                role=op["role"],
                access_level=op["access_level"],
                assigned_satellites=op["assigned_satellites"],
                status=op["status"],
                is_active=True,
                is_superuser=op["is_superuser"],
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
        db.commit()

    # 2. Seed Audit Logs
    if db.query(AuditLog).count() == 0:
        logger.info("Seeding initial audit trail logs...")
        logs = [
            AuditLog(timestamp=datetime.now(timezone.utc) - timedelta(minutes=15), user="System", action="Triggered Critical Alert ALT-904", target="SENTINEL-6A EPS", result="DISPATCHED", details="Automated anomaly trigger"),
            AuditLog(timestamp=datetime.now(timezone.utc) - timedelta(minutes=22), user="K. Chen", action="Acknowledged Conjunction Candidate", target="DEBRIS #3842", result="SUCCESS", details="Manually acknowledged via Mission Control"),
            AuditLog(timestamp=datetime.now(timezone.utc) - timedelta(minutes=38), user="Dr. Rostova", action="Telemetry Stream Diagnostic Run", target="SENTINEL-6A Bus", result="SUCCESS", details="EPS calibration test nominal"),
            AuditLog(timestamp=datetime.now(timezone.utc) - timedelta(hours=1), user="Cmdr Vance", action="Shift Handover Briefing Signed", target="Station Beta", result="VERIFIED", details="Shift handover complete"),
        ]
        db.add_all(logs)
        db.commit()

    # 3. Seed Constellation Satellites (Ensure updated fleet)
    logger.info("Ensuring constellation fleet satellites are registered...")
    sats = [
        Satellite(
            id="CHANDRAYAAN-3",
            name="CHANDRAYAAN-3 ORBITER [PRASHAST]",
            type="Lunar Polar Reconnaissance & Relay",
            orbit_type="Lunar Polar Orbit (LPO 100km)",
            altitude="100 km (Moon)",
            altitude_km=100.0,
            inclination="90.00°",
            velocity="1.63 km/s",
            launch_date="2023-07-14",
            health=99,
            status="OPERATIONAL",
            ground_station="ISTRAC (Byalalu DSN-32)",
            wave_color="#f59e0b"
        ),
        Satellite(
            id="ADITYA-L1",
            name="ADITYA-L1 [SURYA-VEDH]",
            type="Solar Corona & Space Weather Observatory",
            orbit_type="Sun-Earth L1 Halo Orbit",
            altitude="1.5M km (L1 Halo)",
            altitude_km=1500000.0,
            inclination="Halo-L1",
            velocity="0.28 km/s",
            launch_date="2023-09-02",
            health=98,
            status="OPERATIONAL",
            ground_station="ISRO Telemetry (Bangalore)",
            wave_color="#fbbf24"
        ),
        Satellite(
            id="EOS-04",
            name="EOS-04 / RISAT-1A [SAR-BHARAT]",
            type="C-Band Synthetic Aperture Radar (SAR)",
            orbit_type="Sun-Synchronous Polar Orbit (SSO)",
            altitude="529 km",
            altitude_km=529.0,
            inclination="97.50°",
            velocity="7.60 km/s",
            launch_date="2022-02-14",
            health=96,
            status="OPERATIONAL",
            ground_station="NRSC Shadnagar (Hyderabad)",
            wave_color="#38bdf8"
        ),
        Satellite(
            id="CARTOSAT-3",
            name="CARTOSAT-3 [NAVDARSHAK-3]",
            type="Sub-Meter Panchromatic Optical Imaging",
            orbit_type="Sun-Synchronous Polar Orbit (SSO)",
            altitude="505 km",
            altitude_km=505.0,
            inclination="97.40°",
            velocity="7.62 km/s",
            launch_date="2019-11-27",
            health=95,
            status="OPERATIONAL",
            ground_station="ISTRAC Ground Station (Bangalore)",
            wave_color="#10b981"
        ),
        Satellite(
            id="GAGANYAAN-G1",
            name="GAGANYAAN-G1 [VYOM-ORBITER]",
            type="Human-Rated Orbital Module Path-Finder",
            orbit_type="Low Earth Orbit (LEO 400 km)",
            altitude="400 km",
            altitude_km=400.0,
            inclination="51.60°",
            velocity="7.67 km/s",
            launch_date="2024-12-20",
            health=99,
            status="OPERATIONAL",
            ground_station="SDSC (Sriharikota)",
            wave_color="#ef4444"
        ),
        Satellite(
            id="INSAT-3DR",
            name="INSAT-3DR [MEGHDOOT-MET]",
            type="Geostationary Meteorological Imager & Sounder",
            orbit_type="Geostationary Orbit (GEO 74°E)",
            altitude="35,786 km",
            altitude_km=35786.0,
            inclination="0.05°",
            velocity="3.07 km/s",
            launch_date="2016-09-08",
            health=94,
            status="OPERATIONAL",
            ground_station="Master Control Facility (Hassan)",
            wave_color="#06b6d4"
        ),
        Satellite(
            id="OCEANSAT-3",
            name="OCEANSAT-3 / EOS-06 [SAMUDRA-NETRA]",
            type="Ocean Color Monitor & Scatterometer",
            orbit_type="Sun-Synchronous Polar Orbit (SSO)",
            altitude="720 km",
            altitude_km=720.0,
            inclination="98.28°",
            velocity="7.49 km/s",
            launch_date="2022-11-26",
            health=98,
            status="OPERATIONAL",
            ground_station="NRSC (Hyderabad)",
            wave_color="#0284c7"
        ),
        Satellite(
            id="SENTINEL-6A",
            name="SENTINEL-6A [MICHAEL-FREILICH]",
            type="Radar Altimetry & Ocean Surface Topography",
            orbit_type="Non-Sun-Synchronous LEO",
            altitude="1,336 km",
            altitude_km=1336.0,
            inclination="66.04°",
            velocity="7.20 km/s",
            launch_date="2020-11-21",
            health=98,
            status="OPERATIONAL",
            ground_station="Kiruna / Fairbanks (NASA/ESA)",
            wave_color="#63c7ff"
        ),
        Satellite(
            id="STARLINK-4012",
            name="STARLINK-4012 [LASER-CROSSLINK]",
            type="High-Throughput Optical Space Laser Relay",
            orbit_type="LEO (High Inclination)",
            altitude="550 km",
            altitude_km=550.0,
            inclination="53.20°",
            velocity="7.59 km/s",
            launch_date="2023-11-04",
            health=99,
            status="OPERATIONAL",
            ground_station="Svalbard / Starlink Gateway",
            wave_color="#10b981"
        ),
        Satellite(
            id="NOAA-20",
            name="NOAA-20 / JPSS-1 [MET-SENTINEL]",
            type="Hyperspectral JPSS Polar Weather Sentinel",
            orbit_type="Sun-Synchronous Polar Orbit (SSO)",
            altitude="824 km",
            altitude_km=824.0,
            inclination="98.70°",
            velocity="7.44 km/s",
            launch_date="2017-11-18",
            health=91,
            status="DEGRADED",
            ground_station="Svalbard / McMurdo Station",
            wave_color="#f59e0b"
        ),
        Satellite(
            id="JWST",
            name="JWST [JAMES-WEBB-DEEP-SPACE]",
            type="Infrared Deep-Space Space Observatory",
            orbit_type="Sun-Earth L2 Halo Orbit",
            altitude="1.5M km (L2 Halo)",
            altitude_km=1500000.0,
            inclination="Halo-L2",
            velocity="0.22 km/s",
            launch_date="2021-12-25",
            health=97,
            status="OPERATIONAL",
            ground_station="Deep Space Network (Goldstone / Madrid)",
            wave_color="#ec4899"
        ),
        Satellite(
            id="LANDSAT-9",
            name="LANDSAT-9 [THERMAL-SENTINEL]",
            type="High-Resolution Multispectral & Thermal Infrared",
            orbit_type="Sun-Synchronous Polar Orbit (SSO)",
            altitude="705 km",
            altitude_km=705.0,
            inclination="98.20°",
            velocity="7.50 km/s",
            launch_date="2021-09-27",
            health=96,
            status="OPERATIONAL",
            ground_station="USGS EROS / Hartebeesthoek",
            wave_color="#a855f7"
        ),
    ]
    for s in sats:
        db.merge(s)
    db.commit()

    # 4. Seed Historical Telemetry Records
    if db.query(Telemetry).count() == 0:
        logger.info("Seeding historical telemetry records...")
        now = datetime.now(timezone.utc)
        telemetries = []
        for i in range(25):
            t_time = now - timedelta(seconds=(25 - i) * 30)
            telemetries.append(
                Telemetry(
                    satellite_id="SENTINEL-6A",
                    timestamp=t_time,
                    battery_voltage=round(28.2 + (i % 5) * 0.08, 2),
                    solar_power_kw=round(1.80 + (i % 3) * 0.05, 2),
                    temp_celsius=round(22.0 + (i % 4) * 0.3, 1),
                    bus_voltage=28.0,
                    lat=round(12.0 + i * 0.4, 3),
                    lng=round(76.0 + i * 0.8, 3),
                    altitude_km=542.0,
                    velocity_kms=7.59,
                    roll_deg=round(1.0 + (i % 3) * 0.1, 2),
                    pitch_deg=round(-0.5 - (i % 2) * 0.1, 2),
                    yaw_deg=round(89.0 + (i % 4) * 0.2, 2),
                    signal_dbm=-65.0,
                    tracked_objects=128,
                    active_alerts=2,
                    eps_health=98,
                    adcs_health=99,
                    ttc_health=100,
                    payload_health=97,
                    anomaly_score=0.04,
                    is_anomalous=0
                )
            )
        db.add_all(telemetries)
        db.commit()

    # 5. Seed Initial Anomaly Events
    if db.query(AnomalyEvent).count() == 0:
        logger.info("Seeding initial anomaly events...")
        signals_data = [
            {"signal": "Battery Cell 3 Thermal Gradient", "weight": 0.42, "residual_drift": 14.2},
            {"signal": "Main 28V Bus Ripple", "weight": 0.31, "residual_drift": 1.8},
            {"signal": "Solar Array Reg 2 Shunt", "weight": 0.18, "residual_drift": 0.6},
            {"signal": "Attitude Gyro Drift", "weight": 0.09, "residual_drift": 0.2},
        ]
        ano = AnomalyEvent(
            id="ANO-904",
            satellite_id="SENTINEL-6A",
            subsystem="EPS / Power Subsystem",
            title="Battery Cell 3 Thermal Runaway Risk",
            description="Temperature gradient reached +14°C above expected orbit model (41.2°C vs 27°C baseline). AI anomaly confidence 0.94.",
            confidence=0.94,
            severity="CRITICAL",
            status="ACTIVE",
            radar_angle_deg=45.0,
            radar_distance_ratio=0.72,
            contributing_signals=json.dumps(signals_data),
            suggested_mitigation="Autonomous Peak-Power Shunt Regulator activated. Recommend cross-switching load to Battery Bay 1.",
            created_at=datetime.now(timezone.utc) - timedelta(minutes=15)
        )
        db.add(ano)
        db.commit()

    # 6. Seed Orbital Objects
    if db.query(OrbitalObject).count() == 0:
        logger.info("Seeding orbital objects catalog...")
        objects = [
            OrbitalObject(
                id="DEB-3842",
                name="COSMOS 2251 DEBRIS #3842",
                object_type="DEBRIS",
                source="SPACE_TRACK",
                altitude_km=541.2,
                inclination_deg=15.82,
                velocity_kms=14.82,
                eccentricity=0.0021,
                semi_major_axis_km=6920.4,
                estimated_diameter_min_m=0.45,
                estimated_diameter_max_m=1.20,
                is_potentially_hazardous=True,
                miss_distance_km=1.2,
                close_approach_date="2026-08-28 18:53:21 UTC",
                orbiting_body="Earth",
                pos_x=120.5,
                pos_y=85.2,
                pos_z=-12.4
            ),
            OrbitalObject(
                id="NASA-3542519",
                name="(2010 PK9) Near Earth Asteroid",
                object_type="ASTEROID",
                source="NASA_NEOWS",
                altitude_km=620.0,
                inclination_deg=12.34,
                velocity_kms=18.45,
                eccentricity=0.24,
                semi_major_axis_km=1.45 * 149597870.7,
                estimated_diameter_min_m=140.0,
                estimated_diameter_max_m=310.0,
                is_potentially_hazardous=True,
                miss_distance_km=284000.0,
                close_approach_date="2026-09-12 04:15 UTC",
                orbiting_body="Earth",
                pos_x=-210.0,
                pos_y=140.2,
                pos_z=45.0
            ),
            OrbitalObject(
                id="DEB-1999-025",
                name="FENGYUN 1C DEBRIS #1999",
                object_type="DEBRIS",
                source="SPACE_TRACK",
                altitude_km=780.4,
                inclination_deg=98.7,
                velocity_kms=7.45,
                eccentricity=0.0015,
                semi_major_axis_km=7150.0,
                estimated_diameter_min_m=0.15,
                estimated_diameter_max_m=0.60,
                is_potentially_hazardous=False,
                miss_distance_km=34.8,
                close_approach_date="2026-08-29 02:10 UTC",
                orbiting_body="Earth",
                pos_x=45.0,
                pos_y=-180.0,
                pos_z=80.0
            ),
            OrbitalObject(
                id="NASA-2024-BX1",
                name="2024 BX1 Asteroid Bolide Fragment",
                object_type="ASTEROID",
                source="NASA_NEOWS",
                altitude_km=510.0,
                inclination_deg=8.12,
                velocity_kms=15.6,
                eccentricity=0.18,
                semi_major_axis_km=1.12 * 149597870.7,
                estimated_diameter_min_m=1.0,
                estimated_diameter_max_m=3.0,
                is_potentially_hazardous=False,
                miss_distance_km=12400.0,
                close_approach_date="2026-08-30 21:00 UTC",
                orbiting_body="Earth",
                pos_x=-95.0,
                pos_y=-75.0,
                pos_z=-30.0
            ),
        ]
        db.add_all(objects)
        db.commit()

    # 7. Seed Conjunction Candidates
    if db.query(ConjunctionEvent).count() == 0:
        logger.info("Seeding conjunction events...")
        now = datetime.now(timezone.utc)
        conj = ConjunctionEvent(
            id="CONJ-8821",
            primary_satellite_id="SENTINEL-6A",
            target_object_id="DEB-3842",
            target_name="COSMOS 2251 DEBRIS #3842",
            tca_time=now + timedelta(hours=4, minutes=21, seconds=16),
            tca_formatted="18:53:21 UTC (in 04:21:16)",
            miss_distance_km=1.2,
            relative_velocity_kms=14.8,
            collision_probability=1.84e-4,
            risk_level="CRITICAL",
            recommended_delta_v_ms=0.42,
            burn_direction="RETROGRADE (-V)",
            burn_execution_epoch="16:45:00 UTC",
            projected_post_burn_miss_km=18.6,
            status="EVASION_RECOMMENDED",
            maneuver_approved=False,
            created_at=now
        )
        db.add(conj)
        db.commit()

    # 8. Seed Mission Alerts
    if db.query(Alert).count() == 0:
        logger.info("Seeding mission alerts...")
        alerts = [
            Alert(
                id="ALT-904",
                severity="critical",
                title="Battery Cell 3 Thermal Runaway Risk",
                subsystem="EPS / Power Subsystem",
                asset="SENTINEL-6A",
                timestamp_str="14:38:12 UTC",
                description="Temperature gradient reached +14°C above expected orbit model (41.2°C vs 27°C baseline). AI anomaly confidence 0.94.",
                mitigation="Autonomous Peak-Power Shunt Regulator activated. Recommend cross-switching load to Battery Bay 1.",
                confidence=94,
                acknowledged=False,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=15)
            ),
            Alert(
                id="ALT-903",
                severity="critical",
                title="High-Probability Conjunction Collision Threat",
                subsystem="AODCS / SGP4 Radar",
                asset="SENTINEL-6A ⟷ DEBRIS #3842",
                timestamp_str="14:32:05 UTC",
                description="TCA in 04:21:16 with miss distance 1.2 km (threshold < 25 km). Pc = 1.84e-4 exceeds mitigation limit.",
                mitigation="Compute delta-V retrograde burn (+0.42 m/s) at apogee to increase miss distance to 18.6 km.",
                confidence=98,
                acknowledged=False,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=22)
            ),
            Alert(
                id="ALT-899",
                severity="high",
                title="Bus Voltage Fluctuation Drift Exceeds 1-Sigma",
                subsystem="EPS / Electrical Regulation",
                asset="SENTINEL-6A",
                timestamp_str="14:15:40 UTC",
                description="Main 28V bus experiencing 1.8V peak-to-peak ripple during eclipse entry transitions.",
                mitigation="Enable shunt capacitor filter bank B and monitor solar array re-illumination curve.",
                confidence=89,
                acknowledged=True,
                acknowledged_by="Dr. Elena Rostova",
                acknowledged_at=datetime.now(timezone.utc) - timedelta(minutes=30),
                created_at=datetime.now(timezone.utc) - timedelta(minutes=45)
            ),
            Alert(
                id="ALT-882",
                severity="medium",
                title="Star Tracker Optical Signal Stray Noise Elevation",
                subsystem="ADCS / Optical Sensors",
                asset="CARTOSAT-3",
                timestamp_str="13:50:22 UTC",
                description="Elevated stray light count detected on optical sensor head during south Atlantic anomaly pass.",
                mitigation="Switch attitude estimation weights to Gyro-Inertial mode for duration of SAA pass.",
                confidence=82,
                acknowledged=True,
                acknowledged_by="K. Chen",
                acknowledged_at=datetime.now(timezone.utc) - timedelta(minutes=50),
                created_at=datetime.now(timezone.utc) - timedelta(hours=1)
            ),
            Alert(
                id="ALT-870",
                severity="low",
                title="Laser Crosslink Frame Drop Rate < 0.05%",
                subsystem="TT&C / Ground Comms",
                asset="STARLINK-4012",
                timestamp_str="12:04:18 UTC",
                description="Minor packet drop on ground station handoff at Svalbard. Auto-recovered via retransmission buffer.",
                mitigation="No operational action required. Packet integrity confirmed 100% on secondary channel.",
                confidence=99,
                acknowledged=True,
                acknowledged_by="M. Al-Mansoor",
                acknowledged_at=datetime.now(timezone.utc) - timedelta(hours=2),
                created_at=datetime.now(timezone.utc) - timedelta(hours=3)
            ),
        ]
        db.add_all(alerts)
        db.commit()

    # 9. Seed Conjunction Encounters
    if db.query(ConjunctionEvent).count() == 0:
        logger.info("Seeding orbital conjunction encounters...")
        tca_dt = datetime.now(timezone.utc) + timedelta(hours=4, minutes=21, seconds=16)
        conjs = [
            ConjunctionEvent(
                id="CONJ-8821",
                primary_satellite_id="SENTINEL-6A",
                target_object_id="DEB-3842",
                target_name="COSMOS-2251 DEBRIS FRAGMENT #3842",
                tca_time=tca_dt,
                tca_formatted=tca_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
                miss_distance_km=1.20,
                relative_velocity_kms=14.82,
                collision_probability=1.84e-4,
                risk_level="CRITICAL",
                recommended_delta_v_ms=0.42,
                burn_direction="RETROGRADE",
                burn_execution_epoch="T-45m (Apogee Pass)",
                projected_post_burn_miss_km=18.6,
                status="EVASION_RECOMMENDED",
                maneuver_approved=False,
                analysis_details="High-risk conjunction candidate with hypervelocity encounter geometry.",
            ),
            ConjunctionEvent(
                id="CONJ-8819",
                primary_satellite_id="CARTOSAT-3",
                target_object_id="DEB-1194",
                target_name="SL-16 DEBRIS #1194",
                tca_time=datetime.now(timezone.utc) + timedelta(hours=14, minutes=12),
                tca_formatted=(datetime.now(timezone.utc) + timedelta(hours=14, minutes=12)).strftime("%Y-%m-%d %H:%M:%S UTC"),
                miss_distance_km=3.85,
                relative_velocity_kms=11.40,
                collision_probability=4.12e-5,
                risk_level="HIGH",
                recommended_delta_v_ms=0.18,
                burn_direction="RADIAL_OUT",
                projected_post_burn_miss_km=12.4,
                status="MONITORING",
                maneuver_approved=False,
            ),
        ]
        db.add_all(conjs)
        db.commit()

    # 10. Seed Risk Incidents
    if db.query(RiskIncident).count() == 0:
        logger.info("Seeding fused risk incidents...")
        rsk = RiskIncident(
            id="RSK-401",
            satellite_id="SENTINEL-6A",
            title="Fused Spacecraft Thermal & Conjunction Multi-Vector Threat",
            summary="Compound mission risk fusing Battery Bay 3 thermal runaway (0.94 confidence) and uncooperative orbital debris fragment #3842 TCA in 04:21:16.",
            overall_risk_score=87.5,
            telemetry_health_score=74.0,
            conjunction_threat_score=96.0,
            space_weather_score=62.0,
            status="CRITICAL_ACTION_REQUIRED",
            recommended_action="Execute +0.42 m/s delta-V retrograde evasion maneuver and shunt battery load to Bay 1.",
            created_at=datetime.now(timezone.utc)
        )
        db.add(rsk)
        db.commit()

    logger.info("Database initialization and seed complete.")
