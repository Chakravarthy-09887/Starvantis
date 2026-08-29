/**
 * STARVANTIS Aerospace Intelligence API Client
 * Connects Next.js Frontend directly with FastAPI + PostgreSQL + TimescaleDB Backend
 */

const defaultApiUrl =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://starvantis.onrender.com'
    : 'http://localhost:8000';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, '');
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (API_BASE_URL.startsWith('https://')
    ? API_BASE_URL.replace('https://', 'wss://') + '/ws/mission'
    : API_BASE_URL.startsWith('http://')
    ? API_BASE_URL.replace('http://', 'ws://') + '/ws/mission'
    : 'ws://localhost:8000/ws/mission');

export interface SatelliteAsset {
  id: string;
  name: string;
  type: string;
  orbit_type: string;
  altitude: string;
  altitude_km: number;
  inclination: string;
  velocity: string;
  launch_date: string;
  health: number;
  status: 'OPERATIONAL' | 'NOMINAL' | 'DEGRADED';
  ground_station: string;
  wave_color: string;
}

export interface TelemetryRecord {
  id: number;
  satellite_id: string;
  timestamp: string;
  battery_voltage: number;
  solar_power_kw: number;
  temp_celsius: number;
  bus_voltage: number;
  lat: number;
  lng: number;
  altitude_km: number;
  velocity_kms: number;
  roll_deg: number;
  pitch_deg: number;
  yaw_deg: number;
  signal_dbm: number;
  tracked_objects: number;
  active_alerts: number;
  eps_health: number;
  adcs_health: number;
  ttc_health: number;
  payload_health: number;
  anomaly_score: number;
  is_anomalous: number;
}

export interface AnomalyItem {
  id: string;
  satellite_id: string;
  subsystem: string;
  title: string;
  description: string;
  confidence: number;
  severity: string;
  status: string;
  radar_angle_deg: number;
  radar_distance_ratio: number;
  contributing_signals?: Array<{ signal: string; weight: number; residual_drift?: number }>;
  suggested_mitigation?: string;
  created_at: string;
}

export interface OrbitalObjectItem {
  id: string;
  name: string;
  object_type: string;
  source: string;
  altitude_km?: number;
  inclination_deg?: number;
  velocity_kms?: number;
  is_potentially_hazardous: boolean;
  miss_distance_km?: number;
  close_approach_date?: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
}

export interface ConjunctionItem {
  id: string;
  primary_satellite_id: string;
  target_object_id: string;
  target_name: string;
  tca_time: string;
  tca_formatted: string;
  miss_distance_km: number;
  relative_velocity_kms: number;
  collision_probability: number;
  risk_level: string;
  recommended_delta_v_ms: number;
  burn_direction: string;
  projected_post_burn_miss_km: number;
  status: string;
  maneuver_approved: boolean;
}

export interface ManeuverOption {
  burn_type: string;
  delta_v_ms: number;
  burn_direction: string;
  fuel_cost_kg: number;
  post_burn_miss_km: number;
  post_burn_pc: number;
  risk_reduction_percentage: number;
}

export interface ConjunctionAnalysis {
  analysis_id: string;
  primary_satellite_id: string;
  target_object_id: string;
  evaluated_at: string;
  tca_iso: string;
  time_to_tca_hours: number;
  miss_distance_km: number;
  collision_probability_pc: number;
  risk_assessment: string;
  recommended_maneuver: ManeuverOption;
  alternative_maneuvers: ManeuverOption[];
  mitigation_notes: string;
}

export interface AlertItem {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  subsystem: string;
  asset: string;
  timestamp: string;
  description: string;
  mitigation: string;
  confidence: number;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface RiskIncidentItem {
  id: string;
  satellite_id: string;
  title: string;
  summary: string;
  overall_risk_score: number;
  telemetry_health_score: number;
  conjunction_threat_score: number;
  space_weather_score: number;
  status: string;
  recommended_action?: string;
}

export interface OperatorItem {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  access_level: string;
  assigned_satellites: string;
  status: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  result: string;
  details?: string;
}

// REST API Helper with Graceful Network Handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[STARVANTIS API] Request note for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Satellites & Fleet
  getSatellites: () => fetchApi<SatelliteAsset[]>('/satellites'),
  getSatelliteTelemetry: (id: string, limit = 50) =>
    fetchApi<TelemetryRecord[]>(`/satellites/${id}/telemetry?limit=${limit}`),
  
  // Telemetry Ingestion
  ingestTelemetry: (payload: Partial<TelemetryRecord>) =>
    fetchApi<{ status: string; telemetry_id: number; anomaly_score: number; alert_triggered?: string }>('/telemetry', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // AI Anomalies
  getAnomalies: (satelliteId?: string) =>
    fetchApi<AnomalyItem[]>(`/anomalies${satelliteId ? `?satellite_id=${satelliteId}` : ''}`),

  // Orbital Objects & NASA Intelligence
  getOrbitalObjects: (limit = 30) => fetchApi<OrbitalObjectItem[]>(`/objects?limit=${limit}`),
  getNasaApod: () => fetchApi<any>('/objects/nasa-apod'),

  // Conjunctions & Collision Avoidance Maneuver (CAM)
  getConjunctions: () => fetchApi<ConjunctionItem[]>('/conjunctions'),
  analyzeConjunction: (payload: { primary_satellite_id?: string; target_object_id?: string; initial_miss_distance_km?: number }) =>
    fetchApi<ConjunctionAnalysis>('/conjunctions/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Fused Risk Incidents
  getRiskIncidents: () => fetchApi<RiskIncidentItem[]>('/risk-incidents'),

  // Alerts & Acknowledgment
  getAlerts: (severity?: string) =>
    fetchApi<AlertItem[]>(`/alerts${severity ? `?severity=${severity}` : ''}`),
  acknowledgeAlert: (id: string, operatorName = 'Commander Vance', comment = 'Acknowledged via Mission Deck') =>
    fetchApi<{ id: string; acknowledged: boolean; message: string }>(`/alerts/${id}/ack`, {
      method: 'POST',
      body: JSON.stringify({ operator_name: operatorName, comment }),
    }),

  // Operators & Audit Logs
  getOperators: () => fetchApi<OperatorItem[]>('/auth/operators'),
  getAuditLogs: () => fetchApi<AuditLogItem[]>('/auth/audit-logs'),
};
