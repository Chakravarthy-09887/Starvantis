'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  api,
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
import { FLEET_SATELLITES } from '../lib/satellites';

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
  const [databaseEngine, setDatabaseEngine] = useState('PostgreSQL 16 (Render Cloud)');
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

  useEffect(() => {
    selectedSatIdRef.current = selectedSatelliteId;
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

  // Update live clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const opt = TIMEZONE_OPTIONS.find((t) => t.code === timezone) || TIMEZONE_OPTIONS[0];
      const timeZone = opt.iana || undefined;
      const timeStr = now.toLocaleTimeString('en-GB', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentClock(`${timeStr} ${opt.code}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
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

  // Connect to Live Real-time WebSocket
  useEffect(() => {
    let isMounted = true;

    function connectWebSocket() {
      if (!isMounted) return;
      setConnectionStatus('connecting');

      try {
        const ws = new WebSocket(WS_BASE_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('[STARVANTIS] Real-Time WebSocket connected to backend');
          setWsConnected(true);
          setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'CONNECTION_ESTABLISHED') {
              if (data.database_engine) setDatabaseEngine(data.database_engine);
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
          console.warn('[STARVANTIS] WebSocket closed. Reconnecting in 3s...');
          setWsConnected(false);
          setConnectionStatus('disconnected');
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (err) => {
          console.warn('[STARVANTIS] WebSocket error:', err);
          ws.close();
        };
      } catch (err) {
        console.warn('[STARVANTIS] Failed to initialize WebSocket:', err);
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 4000);
      }
    }

    refreshAll();
    connectWebSocket();

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'PING' }));
      }
    }, 15000);

    return () => {
      isMounted = false;
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
      } catch (wsErr) {
        console.warn('[STARVANTIS] WebSocket send warning:', wsErr);
      }
    }

    try {
      await api.acknowledgeAlert(id, operatorName, comment);
    } catch (apiErr) {
      console.warn('[STARVANTIS] Backend REST ack warning (proceeding with local state):', apiErr);
    }
  };

  // Run Real-time Conjunction Collision Avoidance Analysis
  const runConjunctionAnalysis = async (req?: {
    primary_satellite_id?: string;
    target_object_id?: string;
    initial_miss_distance_km?: number;
  }): Promise<ConjunctionAnalysis> => {
    const primaryId = req?.primary_satellite_id || selectedSatelliteId;
    const targetId = req?.target_object_id || 'DEBRIS #3842';
    const missDist = req?.initial_miss_distance_km || 1.2;

    const analysis = await api.analyzeConjunction({
      primary_satellite_id: primaryId,
      target_object_id: targetId,
      initial_miss_distance_km: missDist,
    });

    setConjunctionAnalysis(analysis);

    setAuditLogs((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user: 'k.chen',
        action: `Computed Collision Avoidance Burn (${primaryId} ⟷ ${targetId})`,
        target: 'Foster-1992 3D Conjunction Engine',
        result: 'COMPUTED',
        details: `Optimized Delta-V: ${analysis.recommended_maneuver.delta_v_ms} m/s at ${analysis.recommended_maneuver.burn_direction} vector. Post-burn miss distance: ${analysis.recommended_maneuver.post_burn_miss_km} km.`,
      },
      ...prev,
    ]);

    return analysis;
  };

  // Inject manual synthetic telemetry packet
  const injectTelemetry = async (payload: Partial<TelemetryRecord>) => {
    const fullPayload: Partial<TelemetryRecord> = {
      satellite_id: selectedSatelliteId,
      timestamp: new Date().toISOString(),
      battery_voltage: 28.4,
      solar_power_kw: 1.82,
      temp_celsius: 22.6,
      bus_voltage: 28.1,
      lat: 12.456,
      lng: 77.123,
      altitude_km: 542.0,
      velocity_kms: 7.59,
      roll_deg: 1.2,
      pitch_deg: -0.6,
      yaw_deg: 89.3,
      signal_dbm: -65,
      tracked_objects: 128,
      active_alerts: 2,
      eps_health: 98,
      adcs_health: 99,
      ttc_health: 97,
      payload_health: 100,
      anomaly_score: 0.04,
      is_anomalous: 0,
      ...payload,
    };

    setLiveTelemetry((prev) => ({
      ...prev,
      battery_voltage: fullPayload.battery_voltage ? `${fullPayload.battery_voltage} V` : prev.battery_voltage,
      solar_power: fullPayload.solar_power_kw ? `${fullPayload.solar_power_kw} kW` : prev.solar_power,
      temp: fullPayload.temp_celsius ? `${fullPayload.temp_celsius} °C` : prev.temp,
    }));

    if (fullPayload.is_anomalous) {
      const generatedAlert: AlertItem = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        severity: 'critical',
        title: `Manual Telemetry Injection: Extreme Sensor Deviation Detected`,
        subsystem: 'EPS / Power Regulation',
        asset: selectedSatelliteId,
        timestamp: formatMissionTime(new Date(), 'hms'),
        description: `Manual telemetry fault packet injected: ${fullPayload.temp_celsius}°C, ${fullPayload.battery_voltage}V bus.`,
        mitigation: 'Engage active radiator louvers, throttle non-essential sensor payloads, and prepare orbit trim.',
        confidence: 96,
        acknowledged: false,
      };
      setAlerts((prev) => [generatedAlert, ...prev.filter((a) => a.id !== generatedAlert.id)]);
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'INGEST_TELEMETRY',
            telemetry: fullPayload,
          })
        );
      } catch (wsErr) {
        console.warn('[STARVANTIS] WebSocket send warning:', wsErr);
      }
    }

    try {
      await api.ingestTelemetry(fullPayload);
    } catch (apiErr) {
      console.warn('[STARVANTIS] Backend REST ingestion warning (proceeding with local telemetry update):', apiErr);
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
