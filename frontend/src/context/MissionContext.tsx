'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  api,
  API_BASE_URL,
  WS_BASE_URL,
  SatelliteAsset,
  TelemetryRecord,
  AnomalyItem,
  OrbitalObjectItem,
  ConjunctionItem,
  ConjunctionAnalysis,
  AlertItem,
  RiskIncidentItem,
  OperatorItem,
  AuditLogItem,
} from '../lib/api';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { alarmAudio } from '../lib/alarmAudio';

export type MissionTimezone = 'UTC' | 'IST' | 'EST' | 'PST' | 'JST' | 'LOCAL';

export interface TimezoneOption {
  code: MissionTimezone;
  label: string;
  utcOffset: string;
  iana: string;
  center: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { code: 'UTC', label: 'UTC (GMT)', utcOffset: 'UTC+00:00', iana: 'UTC', center: 'Universal Space Ephemeris' },
  { code: 'IST', label: 'IST (India)', utcOffset: 'UTC+05:30', iana: 'Asia/Kolkata', center: 'ISRO ISTRAC / Master Control' },
  { code: 'EST', label: 'EST (US East)', utcOffset: 'UTC-05:00', iana: 'America/New_York', center: 'NASA Kennedy / Goddard' },
  { code: 'PST', label: 'PST (US West)', utcOffset: 'UTC-08:00', iana: 'America/Los_Angeles', center: 'NASA JPL / Hawthorne' },
  { code: 'JST', label: 'JST (Tokyo)', utcOffset: 'UTC+09:00', iana: 'Asia/Tokyo', center: 'JAXA Tsukuba Space Center' },
  { code: 'LOCAL', label: 'Local Time', utcOffset: 'Local System', iana: '', center: 'Client Ground Station' },
];

export interface LiveTelemetryPulse {
  battery_voltage: string;
  solar_power: string;
  temp: string;
  lat: string;
  lng: string;
  altitude: string;
  velocity: string;
  roll: string;
  pitch: string;
  yaw: string;
  signal: string;
  health: number;
  tracked_objects: number;
  active_alerts: number;
  eclipse_status?: string;
  pointing_jitter?: string;
}

interface MissionContextType {
  wsConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  databaseEngine: string;

  selectedSatelliteId: string;
  setSelectedSatelliteId: (id: string) => void;

  // Timezone System
  timezone: MissionTimezone;
  setTimezone: (tz: MissionTimezone) => void;
  timezoneOptions: TimezoneOption[];
  formatMissionTime: (dateOrIso?: string | Date | number, formatType?: 'time' | 'full' | 'short' | 'hms') => string;
  currentClock: string;

  satellites: SatelliteAsset[];
  liveTelemetry: LiveTelemetryPulse;
  historicalTelemetry: TelemetryRecord[];

  alerts: AlertItem[];
  alertScanCountdownSeconds: number;
  dispatchLiveAlert: () => void;
  anomalies: AnomalyItem[];
  orbitalObjects: OrbitalObjectItem[];
  conjunctions: ConjunctionItem[];
  conjunctionAnalysis: ConjunctionAnalysis | null;
  riskIncidents: RiskIncidentItem[];

  operators: OperatorItem[];
  auditLogs: AuditLogItem[];

  ackAlert: (id: string, operatorName?: string, comment?: string) => Promise<void>;
  runConjunctionAnalysis: (req?: { primary_satellite_id?: string; target_object_id?: string; initial_miss_distance_km?: number }) => Promise<ConjunctionAnalysis>;
  injectTelemetry: (payload: Partial<TelemetryRecord>) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DEFAULT_LIVE_TELEMETRY: LiveTelemetryPulse = {
  battery_voltage: '28.60 V',
  solar_power: '2.14 kW',
  temp: '24.2 °C',
  lat: '12.456° N',
  lng: '77.123° E',
  altitude: '1,336.00 km',
  velocity: '7.20 km/s',
  roll: '+0.120°',
  pitch: '-0.080°',
  yaw: '89.30°',
  signal: '-65 dBm',
  health: 98,
  tracked_objects: 128,
  active_alerts: 2,
  eclipse_status: 'SUNLIT',
  pointing_jitter: '0.0042° / s',
};

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-904',
    severity: 'critical',
    title: 'Battery Cell 3 Thermal Runaway Risk',
    subsystem: 'EPS / Power Subsystem',
    asset: 'SENTINEL-6A',
    timestamp: '14:38:12 UTC',
    description: 'Temperature gradient reached +14°C above expected orbit model (41.2°C vs 27°C baseline). AI anomaly confidence 0.94.',
    mitigation: 'Autonomous Peak-Power Shunt Regulator activated. Recommend cross-switching load to Battery Bay 1.',
    confidence: 94,
    acknowledged: false,
  },
  {
    id: 'ALT-903',
    severity: 'critical',
    title: 'High-Probability Conjunction Collision Threat',
    subsystem: 'AODCS / SGP4 Radar',
    asset: 'SENTINEL-6A ⟷ DEBRIS #3842',
    timestamp: '14:32:05 UTC',
    description: 'TCA in 04:21:16 with miss distance 1.2 km (threshold < 25 km). Pc = 1.84e-4 exceeds mitigation limit.',
    mitigation: 'Compute delta-V retrograde burn (+0.42 m/s) at apogee to increase miss distance to 18.6 km.',
    confidence: 98,
    acknowledged: false,
  },
  {
    id: 'ALT-899',
    severity: 'high',
    title: 'Bus Voltage Fluctuation Drift Exceeds 1-Sigma',
    subsystem: 'EPS / Electrical Regulation',
    asset: 'SENTINEL-6A',
    timestamp: '14:15:40 UTC',
    description: 'Main 28V bus experiencing 1.8V peak-to-peak ripple during eclipse entry transitions.',
    mitigation: 'Enable shunt capacitor filter bank B and monitor solar array re-illumination curve.',
    confidence: 89,
    acknowledged: true,
  },
  {
    id: 'ALT-882',
    severity: 'medium',
    title: 'Star Tracker Optical Signal Stray Noise Elevation',
    subsystem: 'ADCS / Optical Sensors',
    asset: 'CARTOSAT-3',
    timestamp: '13:50:22 UTC',
    description: 'Elevated stray light count detected on optical sensor head during south Atlantic anomaly pass.',
    mitigation: 'Switch attitude estimation weights to Gyro-Inertial mode for duration of SAA pass.',
    confidence: 82,
    acknowledged: true,
  },
  {
    id: 'ALT-870',
    severity: 'low',
    title: 'Laser Crosslink Frame Drop Rate < 0.05%',
    subsystem: 'TT&C / Ground Comms',
    asset: 'STARLINK-4012',
    timestamp: '12:04:18 UTC',
    description: 'Minor packet drop on ground station handoff at Svalbard. Auto-recovered via retransmission buffer.',
    mitigation: 'No operational action required. Packet integrity confirmed 100% on secondary channel.',
    confidence: 99,
    acknowledged: true,
  },
];

export interface DynamicAlertTemplate {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  subsystem: string;
  asset: string;
  description: string;
  mitigation: string;
  confidence: number;
}

const DYNAMIC_ALERT_POOL: DynamicAlertTemplate[] = [
  {
    severity: 'critical',
    title: 'Battery Cell #3 Thermal Runaway Divergence',
    subsystem: 'EPS / Power Regulation',
    asset: 'SENTINEL-6A',
    description: 'Temperature gradient accelerated to +16.4°C over baseline (42.6°C vs 26.2°C nominal). AI anomaly confidence 0.96.',
    mitigation: 'Autonomous Peak-Power Shunt Regulator activated. Load diverted to Battery Bay 1.',
    confidence: 96,
  },
  {
    severity: 'critical',
    title: 'Orbital SGP4 Conjunction TCA Proximity Breach',
    subsystem: 'AODCS / Radar Surveillance',
    asset: 'CHANDRAYAAN-3 ⟷ DEBRIS #1948',
    description: 'TCA within 03:12:45 with miss distance 0.88 km (threshold < 25 km). Pc = 3.12e-4 requires CAM burn.',
    mitigation: 'Compute prograde delta-V apolune burn (+0.24 m/s) to push radial separation to 24.2 km.',
    confidence: 98,
  },
  {
    severity: 'high',
    title: 'Aditya-L1 STEPS Solar Proton Energy Surge',
    subsystem: 'PAYLOAD / Space Weather',
    asset: 'ADITYA-L1',
    description: 'Energetic solar proton flux exceeded 10⁴ pfu at >10 MeV following M8.4 coronal mass ejection flare.',
    mitigation: 'Deploy payload radiation shielding latch and toggle high-voltage detectors to Safe Standby.',
    confidence: 93,
  },
  {
    severity: 'high',
    title: 'JWST MIRI Closed-Cycle Cryocooler Temperature Delta',
    subsystem: 'CRYOGENICS / MIRI Instrument',
    asset: 'JWST [L2 OBSERVATORY]',
    description: 'Cold head temperature rose from 6.40 K to 6.82 K (+0.42 K drift). Helium loop compressor duty cycle at 88%.',
    mitigation: 'Increase Pulse-Tube valve frequency to 61.5 Hz and purge bypass accumulator.',
    confidence: 95,
  },
  {
    severity: 'critical',
    title: 'Pragyan Rover Solar Tilt Sun-Angle Misalignment',
    subsystem: 'POWER / Lunar Surface Mobility',
    asset: 'CHANDRAYAAN-3 [PRAGYAN]',
    description: 'Low sun elevation (3.8° over lunar horizon) causing solar array output drop to 28W (nominal 50W).',
    mitigation: 'Execute 14° clockwise yaw pivot maneuver to align high-efficiency solar panel with polar sun vector.',
    confidence: 97,
  },
  {
    severity: 'high',
    title: 'Reaction Wheel #3 Friction Torque Ripple Surge',
    subsystem: 'ADCS / Momentum Wheels',
    asset: 'CARTOSAT-3',
    description: 'Bearing drag torque ripple elevated by 24 mNm during high-rate slew maneuver over target grid.',
    mitigation: 'Switch attitude actuation torque allocation to magnetic torque rods and wheel #4 redundant axis.',
    confidence: 91,
  },
  {
    severity: 'medium',
    title: 'Laser Inter-Satellite Crosslink Jitter Outlier',
    subsystem: 'TT&C / Optical Comms',
    asset: 'STARLINK-4012',
    description: 'Beam pointing jitter reached 12.4 µrad on inter-plane crosslink. BER briefly drifted to 2.4e-6.',
    mitigation: 'Fine-steering fast steering mirror (FSM) closed-loop bandwidth recalibrated.',
    confidence: 88,
  },
  {
    severity: 'medium',
    title: 'TIRS-2 Cryocooler Cold Finger Temperature Ripple',
    subsystem: 'PAYLOAD / Thermal Control',
    asset: 'LANDSAT-9',
    description: 'Cryogenic cold head at 43.1 K (+1.1 K drift) during high sun-angle orbital eclipse exit.',
    mitigation: 'Pulse-tube cryocooler compressor drive frequency adjusted from 58.2 Hz to 60.1 Hz.',
    confidence: 87,
  },
  {
    severity: 'low',
    title: 'GNSS NavIC Carrier-Phase Slip at Svalbard Pass',
    subsystem: 'NAV / GNSS Receiver',
    asset: 'RISAT-2BR1',
    description: 'Single-epoch ionospheric delay jump caused cycle slip on L5 channel. Resolved on L1 dual-frequency filter.',
    mitigation: 'Auto-cleared via Kalman filter innovation gating. Nominal lock resumed in 120ms.',
    confidence: 99,
  },
  {
    severity: 'high',
    title: 'GEO West Graveyard Drift Conjunction Warning',
    subsystem: 'AODCS / Geostationary Ring',
    asset: 'INSAT-3DR',
    description: 'Derelict apogee kick motor fragment predicted within 4.8 km during north-south inclination stationkeeping.',
    mitigation: 'East-west tri-propellant thruster trim burn scheduled at next node crossing.',
    confidence: 94,
  },
  {
    severity: 'medium',
    title: 'Hydrazine RCS Catalyst Bed Heater Anomaly',
    subsystem: 'PROPULSION / RCS',
    asset: 'SENTINEL-6A',
    description: 'RCS thruster pack 2 catalyst bed pre-heater thermistor reading 88°C (nominal >110°C).',
    mitigation: 'Switched secondary redundant heater circuit to continuous active mode.',
    confidence: 89,
  },
  {
    severity: 'critical',
    title: 'High-Energy Solar Cosmic Ray Radiation Spike',
    subsystem: 'EPS / Radiation Belts',
    asset: 'ADITYA-L1',
    description: 'South Atlantic Anomaly equivalent flux detected outside magnetosphere: dose rate 1.48 rad/hr.',
    mitigation: 'Autonomous payload protective down-clock and memory SEU scrubber cycle initiated.',
    confidence: 97,
  },
  {
    severity: 'high',
    title: 'Star Tracker Optical Stray Light SNR Drop',
    subsystem: 'ADCS / Optical Sensors',
    asset: 'CARTOSAT-3',
    description: 'Stray albedo reflection from polar ice cap elevated background noise on focal plane detector.',
    mitigation: 'Shifted attitude determination Kalman filter to Gyro-Aided Mode.',
    confidence: 92,
  },
  {
    severity: 'medium',
    title: 'Deep Space Network Ka-Band Doppler Track Shift',
    subsystem: 'COMM / DSN Ground Station',
    asset: 'CHANDRAYAAN-3 ⟷ ISTRAC-32M',
    description: 'Lunar orbital Doppler residual drifted by +42 Hz due to unmodeled mascon gravitational perturbation.',
    mitigation: 'Closed-loop PLL Doppler filter bandwidth adjusted to 500 Hz for automated carrier lock.',
    confidence: 91,
  },
  {
    severity: 'high',
    title: 'JWST Primary Mirror Segment C3 Actuator Micro-Piston Drift',
    subsystem: 'OPTICS / Wavefront Sensing',
    asset: 'JWST [PRIMARY MIRROR]',
    description: 'Segment C3 nanometer hex actuator drifted +18 nm out of phase following micro-meteoroid impulse.',
    mitigation: 'Trigger automated coarse-phasing Hartmann mask recalibration routine.',
    confidence: 96,
  },
  {
    severity: 'low',
    title: 'Synthetic Aperture Radar X-Band Pulse Droop',
    subsystem: 'PAYLOAD / Radar Imaging',
    asset: 'RISAT-2BR1',
    description: 'Solid-state power amplifier (SSPA) peak output reduced by 0.3 dB at end of 40-second stripmap imaging swath.',
    mitigation: 'Autonomous thermal cooling rest period extended by 5 seconds between acquisition passes.',
    confidence: 95,
  },
];

const INITIAL_OPERATORS: OperatorItem[] = [
  { id: 1, username: 'commander.vance', email: 'vance@starvantis.space', full_name: 'Commander Vance', role: 'Mission Director', access_level: 'LEVEL 5 (EXEC)', assigned_satellites: 'ALL ASSETS', status: 'ACTIVE' },
  { id: 2, username: 'elena.rostova', email: 'rostova@starvantis.space', full_name: 'Dr. Elena Rostova', role: 'Systems Engineer', access_level: 'LEVEL 4 (SYS)', assigned_satellites: 'SENTINEL-6A', status: 'ACTIVE' },
  { id: 3, username: 'k.chen', email: 'chen@starvantis.space', full_name: 'K. Chen', role: 'Orbital Analyst', access_level: 'LEVEL 4 (ORBIT)', assigned_satellites: 'CHANDRAYAAN-3, SENTINEL-6A', status: 'ACTIVE' },
  { id: 4, username: 'm.mansoor', email: 'mansoor@starvantis.space', full_name: 'M. Al-Mansoor', role: 'Telemetry Operator', access_level: 'LEVEL 3 (OPS)', assigned_satellites: 'STARLINK-4012, LANDSAT-9', status: 'IDLE' },
  { id: 5, username: 's.tanaka', email: 'tanaka@starvantis.space', full_name: 'S. Tanaka', role: 'ML Ops Engineer', access_level: 'LEVEL 4 (DEV)', assigned_satellites: 'FLEET MODELS', status: 'STANDBY' },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 101, timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'commander.vance', action: 'System Integrity Check', target: 'FastAPI + TimescaleDB Engine', result: 'SUCCESS', details: 'All 12 spacecraft telemetry channels verified nominal' },
  { id: 102, timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'k.chen', action: 'Conjunction Analysis Run', target: 'CHANDRAYAAN-3 ⟷ DEBRIS #1948', result: 'COMPLETED', details: 'Miss distance 1.2 km, Pc 1.84e-4 calculated' },
  { id: 103, timestamp: new Date(Date.now() - 10800000).toISOString(), user: 'elena.rostova', action: 'Thermal Threshold Adjusted', target: 'SENTINEL-6A Battery Bay', result: 'APPLIED', details: 'Upper thermal threshold locked at 42.0°C' },
];

const INITIAL_ASSETS: SatelliteAsset[] = FLEET_SATELLITES.map((s) => ({
  id: s.id,
  name: s.name,
  type: s.type,
  orbit_type: s.orbitType,
  altitude: s.altitude,
  altitude_km: s.altitudeKm,
  inclination: s.inclination,
  velocity: s.velocity,
  launch_date: s.launchDate,
  health: s.health,
  status: s.status === 'STANDBY' ? 'NOMINAL' : s.status,
  ground_station: s.groundStation,
  wave_color: s.waveColor,
}));

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [databaseEngine, setDatabaseEngine] = useState('TimescaleDB / PostgreSQL 16');
  const [selectedSatelliteId, setSelectedSatelliteId] = useState('SENTINEL-6A');

  // Timezone State
  const [timezone, setTimezone] = useState<MissionTimezone>('IST');
  const [currentClock, setCurrentClock] = useState('');

  const [satellites, setSatellites] = useState<SatelliteAsset[]>(INITIAL_ASSETS);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetryPulse>(DEFAULT_LIVE_TELEMETRY);
  const [historicalTelemetry, setHistoricalTelemetry] = useState<TelemetryRecord[]>([]);

  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [alertScanCountdownSeconds, setAlertScanCountdownSeconds] = useState<number>(30); // 30-second live countdown (30s)
  const alertIndexRef = useRef<number>(0);
  const alertIdCounterRef = useRef<number>(905);

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [orbitalObjects, setOrbitalObjects] = useState<OrbitalObjectItem[]>([]);
  const [conjunctions, setConjunctions] = useState<ConjunctionItem[]>([]);
  const [conjunctionAnalysis, setConjunctionAnalysis] = useState<ConjunctionAnalysis | null>(null);
  const [riskIncidents, setRiskIncidents] = useState<RiskIncidentItem[]>([]);
  const [operators, setOperators] = useState<OperatorItem[]>(INITIAL_OPERATORS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedSatIdRef = useRef(selectedSatelliteId);
  const lastWsMessageTimeRef = useRef<number>(0);

  useEffect(() => {
    selectedSatIdRef.current = selectedSatelliteId;
    const satDef = FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];
    
    // Immediately calibrate initial telemetry state on asset switch to avoid cross-satellite flickering
    setLiveTelemetry({
      battery_voltage: satDef.batteryVoltage,
      solar_power: satDef.solarPower,
      temp: satDef.temp,
      lat: satDef.lat,
      lng: satDef.lng,
      altitude: satDef.altitude,
      velocity: satDef.velocity,
      roll: satDef.roll,
      pitch: satDef.pitch,
      yaw: satDef.yaw,
      signal: satDef.signal,
      health: satDef.health,
      tracked_objects: satDef.trackedObjects,
      active_alerts: satDef.activeAlerts,
      eclipse_status: 'SUNLIT',
      pointing_jitter: '< 0.0038° / s RMS',
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ action: 'SUBSCRIBE_SATELLITE', satellite_id: selectedSatelliteId }));
      } catch {
        // Safe ignore
      }
    }
  }, [selectedSatelliteId]);

  // Mission Time Formatter (Supports UTC, IST, EST, PST, JST, LOCAL)
  const formatMissionTime = useCallback(
    (dateOrIso?: string | Date | number, formatType: 'time' | 'full' | 'short' | 'hms' = 'time'): string => {
      try {
        const d = dateOrIso
          ? typeof dateOrIso === 'string' || typeof dateOrIso === 'number'
            ? new Date(dateOrIso)
            : dateOrIso
          : new Date();
        if (isNaN(d.getTime())) return typeof dateOrIso === 'string' ? dateOrIso : '00:00:00';

        const opt = TIMEZONE_OPTIONS.find((t) => t.code === timezone) || TIMEZONE_OPTIONS[0];
        const timeZone = opt.iana || undefined;

        if (formatType === 'hms') {
          const timeStr = d.toLocaleTimeString('en-GB', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return `${timeStr} ${opt.code}`;
        } else if (formatType === 'full') {
          const dateStr = d.toLocaleDateString('en-GB', { timeZone, day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = d.toLocaleTimeString('en-GB', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return `${dateStr} ${timeStr} ${opt.code}`;
        } else if (formatType === 'short') {
          const timeStr = d.toLocaleTimeString('en-GB', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit' });
          return `${timeStr} ${opt.code}`;
        } else {
          const timeStr = d.toLocaleTimeString('en-GB', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return `${timeStr} ${opt.code}`;
        }
      } catch {
        return new Date().toISOString();
      }
    },
    [timezone]
  );

  // Update live clock and continuous synchronized 1Hz telemetry propagation
  useEffect(() => {
    const updateClockAndTelemetry = () => {
      const now = new Date();
      const opt = TIMEZONE_OPTIONS.find((t) => t.code === timezone) || TIMEZONE_OPTIONS[0];
      const timeZone = opt.iana || undefined;
      const timeStr = now.toLocaleTimeString('en-GB', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentClock(`${timeStr} ${opt.code}`);

      // If active WebSocket is delivering live telemetry packets, yield to the live server stream
      if (Date.now() - lastWsMessageTimeRef.current < 2200) {
        return;
      }

      // Continuous Keplerian physics propagation synchronized to UTC epoch seconds
      const t_sec = now.getTime() / 1000;
      const activeSatDef = FLEET_SATELLITES.find((s) => s.id === selectedSatIdRef.current) || FLEET_SATELLITES[0];
      const altNum = activeSatDef.altitudeKm || 700;
      const r_km = 6371.0 + altNum;
      const isDeepSpace = activeSatDef.id === 'ADITYA-L1' || activeSatDef.id === 'JWST';
      const mean_motion = isDeepSpace ? 0.0001 : Math.sqrt(398600.4418 / Math.pow(r_km, 3));
      const omega = (t_sec * mean_motion * 180.0 / Math.PI) % 360.0;
      const omega_rad = (omega * Math.PI) / 180.0;
      const inc_rad = ((parseFloat(activeSatDef.inclination) || 66.0) * Math.PI) / 180.0;

      const lat_val = (Math.asin(Math.sin(inc_rad) * Math.sin(omega_rad)) * 180.0) / Math.PI;
      const sat_hash_offset = (Math.abs(activeSatDef.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360);
      const earth_rot_deg = (t_sec * 0.004178 * 180.0 / Math.PI) % 360.0;
      const lng_val = (((Math.atan2(Math.cos(inc_rad) * Math.sin(omega_rad), Math.cos(omega_rad)) * 180.0 / Math.PI) - earth_rot_deg + sat_hash_offset) % 360.0) - 180.0;

      // Smooth continuous sigmoid sunlight transition
      const sun_elevation = Math.sin(omega_rad);
      const sunlight_factor = isDeepSpace ? 1.0 : 1.0 / (1.0 + Math.exp(-8.0 * (sun_elevation + 0.05)));
      const inSun = sunlight_factor > 0.35;

      const baseVolt = parseFloat(activeSatDef.batteryVoltage.replace(' V', '')) || 28.4;
      const basePower = parseFloat(activeSatDef.solarPower.replace(' kW', '')) || 2.1;
      const baseTemp = parseFloat(activeSatDef.temp.replace(' °C', '')) || 22.0;

      const solar_kw = (basePower * sunlight_factor * (0.95 + 0.05 * Math.sin(t_sec * 0.05))).toFixed(2);
      const temp_c = (baseTemp + 3.5 * (sunlight_factor - 0.5) + 0.4 * Math.sin(t_sec * 0.04)).toFixed(1);
      const batt_v = (baseVolt + (0.25 * sunlight_factor - 0.12) + 0.01 * Math.sin(t_sec * 0.02)).toFixed(2);

      const roll = (0.035 * Math.sin(t_sec * 0.08) + 0.01 * Math.cos(t_sec * 0.15)).toFixed(3);
      const pitch = (-0.028 * Math.cos(t_sec * 0.07) + 0.01 * Math.sin(t_sec * 0.12)).toFixed(3);
      const yaw = ((omega + 0.05 * Math.sin(t_sec * 0.05)) % 360.0).toFixed(2);
      const rssi = -64 - Math.floor(Math.abs(Math.sin(t_sec * 0.03)) * 6);

      setLiveTelemetry((prev) => ({
        battery_voltage: `${batt_v} V`,
        solar_power: `${solar_kw} kW`,
        temp: `${temp_c} °C`,
        lat: `${Math.abs(lat_val).toFixed(3)}° ${lat_val >= 0 ? 'N' : 'S'}`,
        lng: `${Math.abs(lng_val).toFixed(3)}° ${lng_val >= 0 ? 'E' : 'W'}`,
        altitude: activeSatDef.altitude,
        velocity: activeSatDef.velocity,
        roll: `${parseFloat(roll) >= 0 ? '+' : ''}${roll}°`,
        pitch: `${parseFloat(pitch) >= 0 ? '+' : ''}${pitch}°`,
        yaw: `${yaw}°`,
        signal: `${rssi} dBm`,
        health: activeSatDef.health || prev.health || 98,
        tracked_objects: prev.tracked_objects || 128,
        active_alerts: prev.active_alerts || 2,
        eclipse_status: inSun ? 'SUNLIT' : 'PENUMBRA_ECLIPSE',
        pointing_jitter: '< 0.0038° / s RMS',
      }));
    };

    updateClockAndTelemetry();
    const timer = setInterval(updateClockAndTelemetry, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  // Dispatch a realistic live space mission alert
  const dispatchLiveAlert = useCallback(() => {
    const template = DYNAMIC_ALERT_POOL[alertIndexRef.current % DYNAMIC_ALERT_POOL.length];
    alertIndexRef.current += 1;
    alertIdCounterRef.current += 1;
    const newAlertId = `ALT-${alertIdCounterRef.current}`;
    const timestampStr = formatMissionTime(new Date(), 'time');

    const newAlert: AlertItem = {
      id: newAlertId,
      severity: template.severity,
      title: template.title,
      subsystem: template.subsystem,
      asset: template.asset,
      timestamp: timestampStr,
      description: template.description,
      mitigation: template.mitigation,
      confidence: template.confidence,
      acknowledged: false,
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 24)]);
    setAlertScanCountdownSeconds(30); // reset 30-second timer

    // Also attempt background sync with backend alerts
    api.getAlerts().then((serverAlerts) => {
      if (serverAlerts && serverAlerts.length > 0) {
        // Merge without losing latest local live alert
        setAlerts((current) => {
          const ids = new Set(current.map((a) => a.id));
          const toAdd = serverAlerts.filter((sa) => !ids.has(sa.id));
          return [...current, ...toAdd].slice(0, 25);
        });
      }
    }).catch(() => {});

    // Log to mission audit trail
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user: 'AI-Telemetry-Watcher',
        action: `Live Alert Dispatched [${newAlertId}]`,
        target: template.asset,
        result: template.severity === 'critical' ? 'CRITICAL_DISPATCH' : 'TRIGGERED',
        details: `${template.title} (${template.subsystem}) - Telemetry Anomaly Detected`,
      },
      ...prev,
    ]);

    // Play alert alarm sound ONLY when a CRITICAL alert comes
    if (template.severity === 'critical') {
      try {
        alarmAudio.playOnce().catch(() => {});
      } catch {
        // Ignore
      }
    }
  }, [formatMissionTime]);

  // 30-second (30s) alert countdown and auto-dispatch timer
  useEffect(() => {
    const alertTimer = setInterval(() => {
      setAlertScanCountdownSeconds((sec) => {
        if (sec <= 1) {
          dispatchLiveAlert();
          return 30;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(alertTimer);
  }, [dispatchLiveAlert]);

  // Fetch all initial data from REST API
  const refreshAll = useCallback(async () => {
    try {
      const [satsRes, alertsRes, anomaliesRes, objectsRes, conjRes, riskRes, opsRes, auditRes] =
        await Promise.allSettled([
          api.getSatellites(),
          api.getAlerts(),
          api.getAnomalies(),
          api.getOrbitalObjects(),
          api.getConjunctions(),
          api.getRiskIncidents(),
          api.getOperators(),
          api.getAuditLogs(),
        ]);

      if (satsRes.status === 'fulfilled' && satsRes.value && satsRes.value.length > 0) {
        setSatellites(satsRes.value);
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value && alertsRes.value.length > 0) {
        setAlerts(alertsRes.value);
      }
      if (anomaliesRes.status === 'fulfilled' && anomaliesRes.value && anomaliesRes.value.length > 0) {
        setAnomalies(anomaliesRes.value);
      }
      if (objectsRes.status === 'fulfilled' && objectsRes.value && objectsRes.value.length > 0) {
        setOrbitalObjects(objectsRes.value);
      }
      if (conjRes.status === 'fulfilled' && conjRes.value && conjRes.value.length > 0) {
        setConjunctions(conjRes.value);
      }
      if (riskRes.status === 'fulfilled' && riskRes.value && riskRes.value.length > 0) {
        setRiskIncidents(riskRes.value);
      }
      if (opsRes.status === 'fulfilled' && opsRes.value && opsRes.value.length > 0) {
        setOperators(opsRes.value);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value && auditRes.value.length > 0) {
        setAuditLogs(auditRes.value);
      }

      // Initial historical telemetry
      const telRes = await api.getSatelliteTelemetry(selectedSatIdRef.current, 50).catch(() => null);
      if (telRes && telRes.length > 0) {
        setHistoricalTelemetry(telRes);
      }
    } catch {
      // Seamless fallback to client-side physics propagation
    }
  }, []);

  // Recurring 30-second global fleet and mission state live synchronization
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Connect to Live Real-time WebSocket with Graceful Backoff and Silent Failover
  useEffect(() => {
    let isMounted = true;
    const reconnectDelayRef = { current: 5000 };

    // Gently wake up backend if sleeping
    const wakeUpBackend = () => {
      try {
        fetch(`${API_BASE_URL}/health`).catch(() => {});
      } catch {
        // Ignore
      }
    };
    wakeUpBackend();
    const wakeUpInterval = setInterval(wakeUpBackend, 30000);

    function connectWebSocket() {
      if (!isMounted) return;

      const targetUrl = WS_BASE_URL;

      try {
        const ws = new WebSocket(targetUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);
          setConnectionStatus('connected');
          reconnectDelayRef.current = 5000; // Reset backoff on success
          try {
            ws.send(JSON.stringify({ action: 'SUBSCRIBE_SATELLITE', satellite_id: selectedSatIdRef.current }));
          } catch {
            // Ignore
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'CONNECTION_ESTABLISHED') {
              if (data.database_engine) setDatabaseEngine(data.database_engine);
              setWsConnected(true);
            } else if (data.type === 'LIVE_TELEMETRY_PULSE') {
              lastWsMessageTimeRef.current = Date.now();
              if (data.satellite_id === selectedSatIdRef.current || !data.satellite_id) {
                setLiveTelemetry(data.telemetry);
              }
            } else if (data.type === 'TELEMETRY_UPDATE') {
              lastWsMessageTimeRef.current = Date.now();
              if (data.telemetry) {
                setLiveTelemetry((prev) => ({
                  ...prev,
                  battery_voltage: `${data.telemetry.battery_voltage} V`,
                  solar_power: `${data.telemetry.solar_power_kw} kW`,
                  temp: `${data.telemetry.temp_celsius} °C`,
                  health: data.telemetry.health || prev.health,
                }));
              }
              if (data.alert) {
                api.getAlerts().then((res) => {
                  if (res && res.length > 0) setAlerts(res);
                }).catch(() => {});
              }
            } else if (data.type === 'ALERT_ACKNOWLEDGED') {
              setAlerts((prev) =>
                prev.map((a) =>
                  a.id === data.alert_id
                    ? { ...a, acknowledged: true, acknowledged_by: data.operator, acknowledged_at: data.timestamp }
                    : a
                )
              );
              setAuditLogs((prev) => [
                {
                  id: Date.now(),
                  timestamp: data.timestamp,
                  user: data.operator,
                  action: `Acknowledged Alert ${data.alert_id} (via Live WS)`,
                  target: 'Mission Alert System',
                  result: 'ACKNOWLEDGED',
                  details: `Real-time acknowledgment received from ${data.operator}`,
                },
                ...prev,
              ]);
            } else if (data.type === 'CONJUNCTION_ANALYSIS_RESULT') {
              if (data.analysis) {
                setConjunctionAnalysis(data.analysis);
              }
            }
          } catch {
            // Ignore message parse errors
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setWsConnected(false);
          setConnectionStatus('disconnected');
          // Exponential backoff up to 30s to prevent console spam
          const delay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(30000, delay * 1.5);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch {
            // Ignore
          }
        };
      } catch {
        setConnectionStatus('disconnected');
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(30000, delay * 1.5);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      }
    }

    refreshAll();
    connectWebSocket();

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ action: 'PING' }));
        } catch {
          // Ignore
        }
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(wakeUpInterval);
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // Ignore
        }
      }
    };
  }, [refreshAll]);

  // Acknowledge an active threat alert
  const ackAlert = async (id: string, operatorName: string = 'Commander Vance', comment?: string) => {
    const timestamp = new Date().toISOString();

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, acknowledged: true, acknowledged_by: operatorName, acknowledged_at: timestamp } : a
      )
    );

    setAuditLogs((prev) => [
      {
        id: Date.now(),
        timestamp,
        user: operatorName,
        action: `Acknowledged Alert ${id}`,
        target: 'Mission Alert System',
        result: 'SUCCESS',
        details: comment || `Operator ${operatorName} acknowledged threat alert in real-time console.`,
      },
      ...prev,
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'ACK_ALERT',
            alert_id: id,
            operator: operatorName,
          })
        );
      } catch {
        // Fallback to REST
      }
    }

    try {
      await api.acknowledgeAlert(id, operatorName, comment);
    } catch {
      // Handled locally
    }
  };

  // Run instant conjunction collision avoidance analysis
  const runConjunctionAnalysis = async (req?: {
    primary_satellite_id?: string;
    target_object_id?: string;
    initial_miss_distance_km?: number;
  }): Promise<ConjunctionAnalysis> => {
    const payload = {
      primary_satellite_id: req?.primary_satellite_id || selectedSatelliteId,
      target_object_id: req?.target_object_id || 'DEB-3842',
      initial_miss_distance_km: req?.initial_miss_distance_km || 1.2,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'ANALYZE_CONJUNCTION',
            conjunction: payload,
          })
        );
      } catch {
        // Fallback to REST
      }
    }

    try {
      const res = await api.analyzeConjunction(payload);
      setConjunctionAnalysis(res);
      return res;
    } catch {
      const fallbackAnalysis: ConjunctionAnalysis = {
        analysis_id: `ANL-${Date.now()}`,
        primary_satellite_id: payload.primary_satellite_id,
        target_object_id: payload.target_object_id,
        evaluated_at: new Date().toISOString(),
        tca_iso: new Date(Date.now() + 15676000).toISOString(),
        time_to_tca_hours: 4.35,
        miss_distance_km: payload.initial_miss_distance_km,
        collision_probability_pc: 0.000184,
        risk_assessment: 'CRITICAL_COLLISION_WARNING',
        recommended_maneuver: {
          burn_type: 'RETROGRADE_IMPULSIVE',
          delta_v_ms: 0.42,
          burn_direction: 'OPPOSITE_VELOCITY_VECTOR',
          fuel_cost_kg: 0.28,
          post_burn_miss_km: 18.64,
          post_burn_pc: 1.2e-7,
          risk_reduction_percentage: 99.4,
        },
        alternative_maneuvers: [],
        mitigation_notes: 'Foster-1992 3D Covariance Collision Model computed optimal burn',
      };
      setConjunctionAnalysis(fallbackAnalysis);
      return fallbackAnalysis;
    }
  };

  // Ingest manual or simulated telemetry packet
  const injectTelemetry = async (payload: Partial<TelemetryRecord>) => {
    const fullPayload: TelemetryRecord = {
      id: Date.now(),
      satellite_id: payload.satellite_id || selectedSatelliteId,
      timestamp: new Date().toISOString(),
      battery_voltage: payload.battery_voltage ?? 28.5,
      solar_power_kw: payload.solar_power_kw ?? 2.1,
      temp_celsius: payload.temp_celsius ?? 24.0,
      bus_voltage: payload.bus_voltage ?? 28.0,
      lat: payload.lat ?? 12.45,
      lng: payload.lng ?? 77.12,
      altitude_km: payload.altitude_km ?? 1336.0,
      velocity_kms: payload.velocity_kms ?? 7.2,
      roll_deg: payload.roll_deg ?? 0.1,
      pitch_deg: payload.pitch_deg ?? -0.08,
      yaw_deg: payload.yaw_deg ?? 89.3,
      signal_dbm: payload.signal_dbm ?? -65,
      tracked_objects: payload.tracked_objects ?? 128,
      active_alerts: payload.active_alerts ?? 2,
      eps_health: payload.eps_health ?? 98,
      adcs_health: payload.adcs_health ?? 97,
      ttc_health: payload.ttc_health ?? 99,
      payload_health: payload.payload_health ?? 98,
      anomaly_score: payload.anomaly_score ?? 0.02,
      is_anomalous: payload.is_anomalous ?? 0,
    };

    setHistoricalTelemetry((prev) => [fullPayload, ...prev.slice(0, 49)]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'INGEST_TELEMETRY',
            telemetry: fullPayload,
          })
        );
      } catch {
        // Fallback to REST
      }
    }

    try {
      await api.ingestTelemetry(fullPayload);
    } catch {
      // Local state preserved
    }
  };

  return (
    <MissionContext.Provider
      value={{
        wsConnected,
        connectionStatus,
        databaseEngine,
        selectedSatelliteId,
        setSelectedSatelliteId,
        timezone,
        setTimezone,
        timezoneOptions: TIMEZONE_OPTIONS,
        formatMissionTime,
        currentClock,
        satellites,
        liveTelemetry,
        historicalTelemetry,
        alerts,
        alertScanCountdownSeconds,
        dispatchLiveAlert,
        anomalies,
        orbitalObjects,
        conjunctions,
        conjunctionAnalysis,
        riskIncidents,
        operators,
        auditLogs,
        ackAlert,
        runConjunctionAnalysis,
        injectTelemetry,
        refreshAll,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}
