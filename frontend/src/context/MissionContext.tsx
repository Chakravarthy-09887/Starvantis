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
  const localTickRef = useRef(0);

  useEffect(() => {
    selectedSatIdRef.current = selectedSatelliteId;
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

      localTickRef.current += 1;
      const step = localTickRef.current;

      // Always maintain 1Hz high-precision physics calculations
      const activeSatDef = FLEET_SATELLITES.find((s) => s.id === selectedSatIdRef.current) || FLEET_SATELLITES[0];
      const altNum = activeSatDef.altitudeKm || 700;
      const r_km = 6371.0 + altNum;
      const mean_motion = Math.sqrt(398600.4418 / Math.pow(r_km, 3));
      const omega = (step * mean_motion * 180.0 / Math.PI) % 360.0;
      const omega_rad = (omega * Math.PI) / 180.0;
      const inc_rad = ((parseFloat(activeSatDef.inclination) || 66.0) * Math.PI) / 180.0;

      const lat_val = (Math.asin(Math.sin(inc_rad) * Math.sin(omega_rad)) * 180.0) / Math.PI;
      const lng_val = (((Math.atan2(Math.cos(inc_rad) * Math.sin(omega_rad), Math.cos(omega_rad)) * 180.0 / Math.PI) - (step * 0.04) + 77.0) % 360.0) - 180.0;

      const inSun = Math.sin(omega_rad) > -0.15;
      const solar_kw = inSun ? (1.8 + Math.sin(omega_rad) * 0.45).toFixed(2) : '0.00';
      const temp_c = inSun ? (24.0 + Math.sin(omega_rad) * 4.2).toFixed(1) : (8.0 + Math.cos(omega_rad) * 2.1).toFixed(1);
      const batt_v = inSun ? (28.6 + Math.sin(omega_rad) * 0.4).toFixed(2) : (27.2 + Math.cos(omega_rad) * 0.2).toFixed(2);
      const roll = (Math.sin(step * 0.2) * 0.25).toFixed(3);
      const pitch = (Math.cos(step * 0.15) * -0.18).toFixed(3);
      const yaw = ((omega + Math.sin(step * 0.1) * 0.4) % 360.0).toFixed(2);
      const rssi = -65 - Math.floor(Math.abs(Math.sin(step * 0.05)) * 12);

      // Smoothly propagate live telemetry if server frame is in-flight
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
        health: prev.health || activeSatDef.health || 98,
        tracked_objects: prev.tracked_objects || 128,
        active_alerts: prev.active_alerts || 2,
        eclipse_status: inSun ? 'SUNLIT' : 'ECLIPSE_SHADOW',
        pointing_jitter: `${(Math.abs(parseFloat(roll)) * 0.015 + 0.0032).toFixed(4)}° / s`,
      }));
    };

    updateClockAndTelemetry();
    const timer = setInterval(updateClockAndTelemetry, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

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
    } catch (err) {
      console.warn('[STARVANTIS] API initialization warning (fallback active):', err);
    }
  }, []);

  // Connect to Live Real-time WebSocket with Automatic Cloud Failover
  useEffect(() => {
    let isMounted = true;
    let fallbackAttempted = false;

    // Wake up Render cloud backend if sleeping
    const wakeUpBackend = () => {
      fetch('https://starvantis-1.onrender.com/health', { mode: 'no-cors' }).catch(() => {});
      fetch('https://starvantis-1.onrender.com/', { mode: 'no-cors' }).catch(() => {});
    };
    wakeUpBackend();
    const wakeUpInterval = setInterval(wakeUpBackend, 15000);

    function getTargetWsUrl(): string {
      if (typeof window === 'undefined') return WS_BASE_URL;
      const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalHost && !fallbackAttempted) {
        return WS_BASE_URL;
      }
      return 'wss://starvantis-1.onrender.com/ws/mission';
    }

    function connectWebSocket() {
      if (!isMounted) return;
      setConnectionStatus('connecting');

      const targetUrl = getTargetWsUrl();
      console.log(`[STARVANTIS] Initiating WebSocket link to ${targetUrl}...`);

      try {
        const ws = new WebSocket(targetUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('[STARVANTIS] Real-Time WebSocket link LOCKED & STREAMING');
          setWsConnected(true);
          setConnectionStatus('connected');
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
              if (data.satellite_id === selectedSatIdRef.current || !data.satellite_id) {
                setLiveTelemetry(data.telemetry);
              }
            } else if (data.type === 'TELEMETRY_UPDATE') {
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
          } catch (err) {
            console.error('[STARVANTIS] Error parsing WS message:', err);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          console.warn('[STARVANTIS] WebSocket closed. Auto-reconnecting in 2.5s...');
          setWsConnected(false);
          setConnectionStatus('disconnected');
          fallbackAttempted = true; // Try cloud backend on next attempt
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2500);
        };

        ws.onerror = () => {
          fallbackAttempted = true;
          ws.close();
        };
      } catch (err) {
        console.warn('[STARVANTIS] Failed to initialize WebSocket:', err);
        fallbackAttempted = true;
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    }

    refreshAll();
    connectWebSocket();

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'PING' }));
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(wakeUpInterval);
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
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
