/**
 * STARVANTIS Aerospace Intelligence API Client
 * Connects Next.js Frontend directly with FastAPI + PostgreSQL + TimescaleDB Backend
 */

const defaultApiUrl =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://starvantis-1.onrender.com'
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

export interface CopilotTelecommand {
  command_id: string;
  satellite_id: string;
  subsystem: string;
  action_type: string;
  delta_v_ms?: number;
  burn_vector?: string;
  target_parameter?: string;
  target_value?: string;
  verification_hash: string;
  estimated_fuel_kg?: number;
  risk_reduction_pct?: number;
}

export interface CopilotResponse {
  query_id: string;
  timestamp: string;
  satellite_id: string;
  operator: string;
  intent: string;
  summary: string;
  detailed_analysis: string;
  technical_metrics: Record<string, any>;
  suggested_telecommand?: CopilotTelecommand | null;
  suggested_followups: string[];
}

export interface SolarFlareEvent {
  id: string;
  class_type: string;
  active_region: string;
  peak_time_utc: string;
  flux_wm2: number;
  cme_associated: boolean;
  radio_blackout_level: string;
}

export interface SpaceWeatherIndices {
  timestamp: string;
  kp_index: number;
  storm_level: string;
  storm_category: string;
  solar_wind_speed_kms: number;
  solar_wind_density_pcm3: number;
  solar_wind_pressure_npa?: number;
  magnetopause_standoff_re?: number;
  imf_bz_nt: number;
  imf_bt_nt?: number;
  dst_index_nt?: number;
  auroral_power_gw?: number;
  goes_xray_flux: string;
  flare_class: string;
  radio_flux_f107: number;
  aditya_l1_stream: string;
  saa_status: string;
  van_allen_inner_flux?: string;
  van_allen_outer_flux?: string;
  kp_history_24h?: Array<{ time: string; kp: number }>;
  solar_wind_history_24h?: Array<{ time: string; speed: number; pressure: number }>;
  recent_flares?: SolarFlareEvent[];
}

export interface SpacecraftRadiationDose {
  satellite_id: string;
  satellite_name: string;
  sub_lat: number;
  sub_lng: number;
  altitude_km: number;
  orbit_type?: string;
  is_in_saa: boolean;
  is_in_van_allen: boolean;
  van_allen_region?: string;
  ambient_flux_pcm2s: number;
  cumulative_dose_krad: number;
  tid_limit_krad?: number;
  tid_health_pct?: number;
  seu_risk_level: string;
  edac_scrub_rate_hz?: number;
  solar_cell_degradation_pct: number;
  saa_ingress_time_utc?: string;
  saa_transit_duration_min?: number;
  recommended_mitigation: string;
}

export interface AdityaL1DeepSpaceData {
  spacecraft_id: string;
  orbit_regime: string;
  distance_from_earth_km: number;
  distance_to_sun_km: number;
  light_time_delay_sec: number;
  coronagraph_velc_status: string;
  cme_event_detected: boolean;
  solar_uv_suit_flux_wm2: number;
  aspex_proton_alpha_ratio_pct: number;
  plasma_speed_kms: number;
  triaxial_mag_field_nt: Record<string, number>;
  halo_orbit_phase_deg: number;
  station_keeping_delta_v_ms_yr: number;
}

export interface Chandrayaan3DeepSpaceData {
  spacecraft_id: string;
  landing_site: string;
  latitude_deg: number;
  longitude_deg: number;
  distance_from_earth_km: number;
  light_time_delay_sec: number;
  chaste_surface_temp_c: number;
  chaste_subsurface_10cm_temp_c: number;
  ilsa_seismic_events_24h: number;
  apxs_elemental_abundances: Record<string, number>;
  rambha_plasma_density_cm3: number;
  rover_pragyan_distance_traversed_m: number;
  battery_charge_pct: number;
}

export interface JWSTDeepSpaceData {
  spacecraft_id: string;
  orbit_regime: string;
  distance_from_earth_km: number;
  light_time_delay_sec: number;
  sunshield_hot_side_temp_c: number;
  sunshield_cold_side_temp_k: number;
  miri_cryocooler_temp_k: number;
  fgs_pointing_jitter_mas: number;
  active_instrument: string;
  exposure_target: string;
  station_keeping_fuel_margin_years: number;
}

export interface GroundStationDefinition {
  id: string;
  name: string;
  agency: string;
  latitude: number;
  longitude: number;
  antenna_type: string;
  dish_diameter_m: number;
  frequency_bands: string[];
  max_data_rate_mbps: number;
  status: string;
}

export interface ActiveSpacecraftLink {
  station_id: string;
  station_name: string;
  satellite_id: string;
  satellite_name: string;
  link_status: 'TRACKING_LOCKED' | 'VISIBILITY_ACQUIRED' | 'AOS_PENDING' | 'BELOW_HORIZON';
  azimuth_deg: number;
  elevation_deg: number;
  slant_range_km: number;
  doppler_shift_khz: number;
  carrier_freq_mhz: number;
  signal_strength_dbm: number;
  snr_db: number;
  bit_error_rate: string;
  aos_time_iso: string;
  los_time_iso: string;
  time_to_aos_sec: number;
  pass_duration_sec: number;
}

export interface DSNAntennaNode {
  antenna_id: string;
  complex_name: string;
  diameter_m: number;
  tracked_spacecraft: string;
  uplink_freq_mhz: number;
  downlink_freq_mhz: number;
  tx_power_kw: number;
  rx_cryo_temp_k: number;
  wind_speed_kmh: number;
  azimuth_deg: number;
  elevation_deg: number;
  status: string;
}

export interface DSNComplexStatus {
  complex_id: string;
  name: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  antennas: DSNAntennaNode[];
  active_spacecraft_count: number;
  network_health: string;
}

export interface PassPredictionItem {
  pass_id: string;
  station_id: string;
  station_name: string;
  satellite_id: string;
  aos_time_iso: string;
  peak_time_iso: string;
  los_time_iso: string;
  max_elevation_deg: number;
  pass_duration_min: number;
  azimuth_at_aos_deg: number;
  azimuth_at_los_deg: number;
  link_quality: 'EXCELLENT' | 'GOOD' | 'LOW_ELEVATION';
}

export interface AntennaSteerResponse {
  status: string;
  station_id: string;
  target_azimuth_deg: number;
  target_elevation_deg: number;
  pointing_error_deg: number;
  rf_pointing_loss_db: number;
  achieved_carrier_lock: boolean;
  carrier_snr_db: number;
  message: string;
}

export interface CyberThreatLog {
  id: string;
  timestamp_iso: string;
  source_rf_carrier: string;
  attack_vector: string;
  severity: string;
  mitigation_action: string;
  quarantined: boolean;
}

export interface GNSSConstellationStatus {
  name: string;
  tracked_sats: number;
  health_status: string;
  pseudorange_residual_ns: number;
  c_n0_dbhz: number;
}

export interface PacketPipelineStats {
  demodulated_fps: number;
  frame_counter_valid_pct: number;
  hmac_authenticated_pct: number;
  zero_trust_quarantined_fps: number;
  obc_queue_status: string;
}

export interface SpacecraftCyberThreatStatus {
  satellite_id: string;
  satellite_name: string;
  overall_threat_level: string;
  trust_index_pct: number;
  ccsds_sdls_crypto_mode: string;
  key_rotation_status: string;
  key_epoch_id?: string;
  key_entropy_bits?: number;
  hsm_enclave_status?: string;
  gnss_raim_status: string;
  gps_pseudorange_residual_ns: number;
  carrier_to_noise_c_n0_dbhz: number;
  frame_sequence_counter: number;
  active_crypto_suite: string;
  quarantined_packets_24h: number;
  threat_logs: CyberThreatLog[];
  gnss_constellations?: GNSSConstellationStatus[];
  packet_pipeline?: PacketPipelineStats;
}

export interface PacketVerificationResult {
  status: string;
  satellite_id: string;
  is_authentic: boolean;
  computed_hmac: string;
  trust_score: number;
  action_taken: string;
}

export interface KeyRotationResult {
  status: string;
  satellite_id: string;
  new_key_epoch_id: string;
  session_key_fingerprint: string;
  entropy_bits: number;
  valid_until_iso: string;
  message: string;
}

export interface AttackSimulationResult {
  status: string;
  attack_type: string;
  satellite_id: string;
  threat_severity: string;
  detected_anomaly: string;
  autonomous_mitigation: string;
  flight_computer_action: string;
  quarantined_log: CyberThreatLog;
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

  // AERO-AI Flight Director Copilot
  queryCopilot: (payload: { prompt: string; satellite_id?: string; operator?: string; context?: any }) =>
    fetchApi<CopilotResponse>('/copilot/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  executeTelecommand: (payload: { command_id: string; satellite_id: string; operator: string; telecommand: CopilotTelecommand }) =>
    fetchApi<{ status: string; command_id: string; satellite_id: string; message: string }>('/copilot/execute-telecommand', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Space Weather & Radiation Belt Threat Matrix
  getSpaceWeather: () => fetchApi<SpaceWeatherIndices>('/space-weather/live'),
  getSpacecraftRadiation: (satelliteId: string) =>
    fetchApi<SpacecraftRadiationDose>(`/space-weather/radiation/${satelliteId}`),

  // Deep-Space & Lagrange Point Specialized Displays
  getAdityaL1DeepSpace: () => fetchApi<AdityaL1DeepSpaceData>('/deep-space/aditya-l1'),
  getChandrayaan3DeepSpace: () => fetchApi<Chandrayaan3DeepSpaceData>('/deep-space/chandrayaan-3'),
  getJWSTDeepSpace: () => fetchApi<JWSTDeepSpaceData>('/deep-space/jwst'),

  // Ground Station & Deep Space Tracking Network
  getGroundStations: () => fetchApi<GroundStationDefinition[]>('/ground-stations/stations'),
  getSatelliteGroundLinks: (satelliteId: string) =>
    fetchApi<ActiveSpacecraftLink[]>(`/ground-stations/link/${satelliteId}`),
  getDSNStatus: () => fetchApi<DSNComplexStatus[]>('/ground-stations/dsn-status'),
  getPassPredictions: (satelliteId: string) =>
    fetchApi<PassPredictionItem[]>(`/ground-stations/pass-predictions/${satelliteId}`),
  steerAntenna: (payload: { station_id: string; satellite_id: string; target_azimuth_deg: number; target_elevation_deg: number }) =>
    fetchApi<AntennaSteerResponse>('/ground-stations/steer-antenna', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Spacecraft Cyber-Defense & Anti-Spoofing Matrix
  getCyberDefenseStatus: (satelliteId: string) =>
    fetchApi<SpacecraftCyberThreatStatus>(`/cyber-defense/status/${satelliteId}`),
  verifyUplinkPacket: (payload: { satellite_id: string; command_name: string; raw_payload_hex: string; signature_hmac: string; operator_key_id: string }) =>
    fetchApi<PacketVerificationResult>('/cyber-defense/verify-packet', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  rotateCyberKeys: (payload: { satellite_id: string; operator_id?: string; crypto_suite?: string }) =>
    fetchApi<KeyRotationResult>('/cyber-defense/rotate-keys', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  simulateCyberAttack: (payload: { satellite_id: string; attack_type: string }) =>
    fetchApi<AttackSimulationResult>('/cyber-defense/simulate-attack', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
