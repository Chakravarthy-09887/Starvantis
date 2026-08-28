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
}

interface MissionContextType {
  wsConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  databaseEngine: string;

  selectedSatelliteId: string;
  setSelectedSatelliteId: (id: string) => void;

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
  battery_voltage: '28.4 V',
  solar_power: '1.82 kW',
  temp: '22.6 °C',
  lat: '12.456° N',
  lng: '77.123° E',
  altitude: '542 km',
  velocity: '7.59 km/s',
  roll: '1.2°',
  pitch: '-0.6°',
  yaw: '89.3°',
  signal: '-65 dBm',
  health: 98,
  tracked_objects: 128,
  active_alerts: 2,
};

import { FLEET_SATELLITES } from '../lib/satellites';

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
  { id: 1, timestamp: new Date(Date.now() - 900000).toISOString(), user: 'System', action: 'Triggered Critical Alert ALT-904', target: 'SENTINEL-6A EPS', result: 'DISPATCHED' },
  { id: 2, timestamp: new Date(Date.now() - 1320000).toISOString(), user: 'K. Chen', action: 'Acknowledged Conjunction Candidate', target: 'DEBRIS #3842', result: 'SUCCESS' },
  { id: 3, timestamp: new Date(Date.now() - 2280000).toISOString(), user: 'Dr. Rostova', action: 'Telemetry Stream Diagnostic Run', target: 'SENTINEL-6A Bus', result: 'SUCCESS' },
  { id: 4, timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Cmdr Vance', action: 'Shift Handover Briefing Signed', target: 'Station Beta', result: 'VERIFIED' },
];

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [databaseEngine, setDatabaseEngine] = useState('TimescaleDB / PostgreSQL 16');
  const [selectedSatelliteId, setSelectedSatelliteId] = useState('SENTINEL-6A');

  const [satellites, setSatellites] = useState<SatelliteAsset[]>([]);
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

  // 1. Initial REST Fetch
  const refreshAll = useCallback(async () => {
    try {
      const [sats, alts, anos, objs, conjs, risks, ops, logs, hist] = await Promise.allSettled([
        api.getSatellites(),
        api.getAlerts(),
        api.getAnomalies(),
        api.getOrbitalObjects(20),
        api.getConjunctions(),
        api.getRiskIncidents(),
        api.getOperators(),
        api.getAuditLogs(),
        api.getSatelliteTelemetry(selectedSatelliteId, 30),
      ]);

      if (sats.status === 'fulfilled' && sats.value.length > 0) setSatellites(sats.value);
      if (alts.status === 'fulfilled' && alts.value.length > 0) setAlerts(alts.value);
      if (anos.status === 'fulfilled') setAnomalies(anos.value);
      if (objs.status === 'fulfilled') setOrbitalObjects(objs.value);
      if (conjs.status === 'fulfilled' && conjs.value.length > 0) setConjunctions(conjs.value);
      if (risks.status === 'fulfilled') setRiskIncidents(risks.value);
      if (ops.status === 'fulfilled' && ops.value.length > 0) setOperators(ops.value);
      if (logs.status === 'fulfilled' && logs.value.length > 0) setAuditLogs(logs.value);
      if (hist.status === 'fulfilled') setHistoricalTelemetry(hist.value);
    } catch (e) {
      console.warn('[STARVANTIS] Error refreshing REST data:', e);
    }
  }, [selectedSatelliteId]);

  // 2. Real-time WebSocket connection
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
              if (data.satellite_id === selectedSatelliteId || !data.satellite_id) {
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
                api.getAlerts().then((res) => { if (res && res.length > 0) setAlerts(res); }).catch(() => {});
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
                  target: `Mission Alert System`,
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
  }, [refreshAll, selectedSatelliteId]);

  // 3. User Actions (Two-Way Reactivity)
  const ackAlert = async (id: string, operatorName = 'Commander Vance', comment = 'Acknowledged via Mission Control') => {
    // 1. Optimistic UI update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true, acknowledged_by: operatorName } : a))
    );

    // 2. Dispatch over WebSocket for instant peer sync
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'ACK_ALERT',
          alert_id: id,
          operator: operatorName,
          comment: comment,
        })
      );
    }

    // 3. Persist via REST API
    try {
      await api.acknowledgeAlert(id, operatorName, comment);
    } catch (err) {
      console.warn('[STARVANTIS] REST ack error (WS sync was attempted):', err);
    }
  };

  const runConjunctionAnalysis = async (req?: {
    primary_satellite_id?: string;
    target_object_id?: string;
    initial_miss_distance_km?: number;
  }) => {
    const payload = {
      primary_satellite_id: req?.primary_satellite_id || 'SENTINEL-6A',
      target_object_id: req?.target_object_id || 'DEB-3842',
      initial_miss_distance_km: req?.initial_miss_distance_km ?? 1.2,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'ANALYZE_CONJUNCTION',
          conjunction: payload,
        })
      );
    }

    const res = await api.analyzeConjunction(payload);
    setConjunctionAnalysis(res);
    return res;
  };

  const injectTelemetry = async (payload: Partial<TelemetryRecord>) => {
    const fullPayload = {
      satellite_id: payload.satellite_id || selectedSatelliteId,
      battery_voltage: payload.battery_voltage ?? 28.4,
      solar_power_kw: payload.solar_power_kw ?? 1.82,
      temp_celsius: payload.temp_celsius ?? 22.6,
      bus_voltage: payload.bus_voltage ?? 28.0,
      lat: payload.lat ?? 12.456,
      lng: payload.lng ?? 77.123,
      altitude_km: payload.altitude_km ?? 542.0,
      velocity_kms: payload.velocity_kms ?? 7.59,
      ...payload,
    };

    // 1. Optimistic live telemetry update
    setLiveTelemetry((prev) => ({
      ...prev,
      battery_voltage: `${fullPayload.battery_voltage} V`,
      solar_power: `${fullPayload.solar_power_kw} kW`,
      temp: `${fullPayload.temp_celsius} °C`,
      health: fullPayload.temp_celsius && fullPayload.temp_celsius > 38 ? 74 : prev.health,
    }));

    // 2. Generate immediate critical alert if high temperature / threat injected
    if (fullPayload.temp_celsius && fullPayload.temp_celsius > 38) {
      const generatedAlert: AlertItem = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Thermal Runaway Triggered on ${fullPayload.satellite_id}`,
        severity: 'critical',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        asset: fullPayload.satellite_id || 'SENTINEL-6A',
        subsystem: 'EPS Thermal Radiator',
        description: `High sensor temperature (${fullPayload.temp_celsius}°C) detected on ${fullPayload.satellite_id}. Emergency heat dissipation protocol engaged.`,
        confidence: 99.4,
        mitigation: 'Engage active radiator louvers, throttle non-essential sensor payloads, and prepare orbit trim.',
        acknowledged: false,
      };
      setAlerts((prev) => [generatedAlert, ...prev.filter((a) => a.id !== generatedAlert.id)]);
    }

    // 3. Broadcast over live WebSocket
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

    // 4. Ingest into backend REST API
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
