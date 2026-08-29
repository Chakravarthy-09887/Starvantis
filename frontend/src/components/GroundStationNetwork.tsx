'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Radio,
  Wifi,
  Globe2,
  Compass,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Satellite,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { api, GroundStationDefinition, ActiveSpacecraftLink } from '../lib/api';

const DEFAULT_STATIONS: GroundStationDefinition[] = [
  { id: 'GS-ISTRAC-BLR', name: 'ISTRAC Bangalore', agency: 'ISRO', latitude: 13.03, longitude: 77.56, antenna_type: '32m DSN Parabolic Dish', dish_diameter_m: 32.0, frequency_bands: ['S-Band', 'X-Band', 'Ka-Band'], max_data_rate_mbps: 600.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-SVALBARD', name: 'Svalbard SvalSat', agency: 'KSAT / NASA', latitude: 78.23, longitude: 15.40, antenna_type: '13m Polar Radome', dish_diameter_m: 13.0, frequency_bands: ['S-Band', 'X-Band'], max_data_rate_mbps: 450.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-GOLDSTONE', name: 'Goldstone DSN', agency: 'NASA / JPL', latitude: 35.42, longitude: -116.89, antenna_type: '70m Deep Space Dish', dish_diameter_m: 70.0, frequency_bands: ['S-Band', 'X-Band', 'Ka-Band'], max_data_rate_mbps: 800.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-MADRID', name: 'Madrid DSN', agency: 'NASA / ESA', latitude: 40.43, longitude: -4.25, antenna_type: '70m Beam Waveguide', dish_diameter_m: 70.0, frequency_bands: ['S-Band', 'X-Band'], max_data_rate_mbps: 800.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-CANBERRA', name: 'Canberra DSN', agency: 'NASA / CSIRO', latitude: -35.40, longitude: 148.98, antenna_type: '70m Deep Space Dish', dish_diameter_m: 70.0, frequency_bands: ['S-Band', 'X-Band', 'Ka-Band'], max_data_rate_mbps: 800.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-KIRUNA', name: 'Kiruna ESTRACK', agency: 'ESA', latitude: 67.86, longitude: 20.96, antenna_type: '15m High-Latitude Dish', dish_diameter_m: 15.0, frequency_bands: ['S-Band', 'X-Band'], max_data_rate_mbps: 300.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-SHADNAGAR', name: 'NRSC Shadnagar', agency: 'ISRO', latitude: 17.06, longitude: 78.20, antenna_type: '7.5m Earth Observation Dish', dish_diameter_m: 7.5, frequency_bands: ['X-Band', 'Ka-Band'], max_data_rate_mbps: 520.0, status: 'OPERATIONAL_ONLINE' },
  { id: 'GS-MCF-HASSAN', name: 'MCF Hassan', agency: 'ISRO', latitude: 13.07, longitude: 76.10, antenna_type: '11m GEO TT&C Dish', dish_diameter_m: 11.0, frequency_bands: ['C-Band', 'Ku-Band'], max_data_rate_mbps: 250.0, status: 'OPERATIONAL_ONLINE' },
];

export default function GroundStationNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, formatMissionTime } = useMission();

  const [stations, setStations] = useState<GroundStationDefinition[]>(DEFAULT_STATIONS);
  const [links, setLinks] = useState<ActiveSpacecraftLink[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('GS-ISTRAC-BLR');
  const [beamTick, setBeamTick] = useState(0);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Fetch ground stations & links
  useEffect(() => {
    const fetchGroundData = async () => {
      try {
        const [gsList, gsLinks] = await Promise.all([
          api.getGroundStations(),
          api.getSatelliteGroundLinks(selectedSatelliteId),
        ]);
        if (gsList.length > 0) setStations(gsList);
        if (gsLinks.length > 0) setLinks(gsLinks);
      } catch {
        // Fallback to active state
      }
    };
    fetchGroundData();
    const interval = setInterval(fetchGroundData, 8000);
    return () => clearInterval(interval);
  }, [selectedSatelliteId]);

  // Radio carrier pulse
  useEffect(() => {
    const pInterval = setInterval(() => {
      setBeamTick((t) => (t + 1) % 360);
    }, 40);
    return () => clearInterval(pInterval);
  }, []);

  const activeLink = links.find((l) => l.station_id === selectedStationId) || links[0] || {
    station_id: 'GS-ISTRAC-BLR',
    station_name: 'ISTRAC Bangalore (Deep Space Network)',
    satellite_id: selectedSatelliteId,
    satellite_name: activeSat.name,
    link_status: 'TRACKING_LOCKED',
    azimuth_deg: 142.6,
    elevation_deg: 48.2,
    slant_range_km: 742.0,
    doppler_shift_khz: 34.2,
    carrier_freq_mhz: 8450.0,
    signal_strength_dbm: -74.2,
    snr_db: 24.6,
    bit_error_rate: '< 1.0e-9 (NOMINAL)',
    aos_time_iso: new Date().toISOString(),
    los_time_iso: new Date().toISOString(),
    time_to_aos_sec: 0,
    pass_duration_sec: 580,
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Map coordinate conversion
  const getMapCoords = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * 600,
    y: ((90 - lat) / 180) * 360,
  });

  const satLat = parseFloat(activeSat.lat.replace('°', '')) || 13.0;
  const satLng = parseFloat(activeSat.lng.replace('°', '')) || 77.5;
  const satPos = getMapCoords(satLat, satLng);
  const stPos = getMapCoords(selectedStation.latitude, selectedStation.longitude);

  return (
    <section id="ground-stations" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-4">
            <Radio size={13} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-bold">
              GLOBAL TT&amp;C UPLINK / DOWNLINK GROUND NETWORK
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            GROUND STATIONS &amp; DSN
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            Real-time parabolic dish antenna pointing (Azimuth/Elevation), Deep Space Network (DSN) laser &amp; RF carrier links, Doppler frequency shift tracking, and automated ground handoffs.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_20px_rgba(99,199,255,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Global Ground Tracking Network Map (Left Column) */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-6 relative border border-glass-border overflow-hidden shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-glass-border/70 pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe2 size={18} className="text-cyan-glow animate-pulse" />
                <div>
                  <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                    GLOBAL TRACKING ANTENNAS &amp; DSN DISH MATRIX
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    ACTIVE LOCK: {selectedStation.name} ({selectedStation.antenna_type})
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-space text-[10px] font-bold flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span>RF CARRIER LOCKED (X-BAND)</span>
              </span>
            </div>

            {/* Global Ground Tracking Map Canvas */}
            <div className="relative aspect-[16/9] w-full bg-[#020612] rounded-2xl overflow-hidden border border-glass-border/50">
              <svg viewBox="0 0 600 360" className="w-full h-full">
                <defs>
                  <linearGradient id="rfBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.8" />
                  </linearGradient>

                  <radialGradient id="antennaCoverage" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#00d4ff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.0" />
                  </radialGradient>
                </defs>

                {/* Latitude / Longitude Grid */}
                {[-60, -30, 0, 30, 60].map((lat) => {
                  const y = ((90 - lat) / 180) * 360;
                  return (
                    <line key={lat} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  );
                })}

                {[-120, -60, 0, 60, 120].map((lng) => {
                  const x = ((lng + 180) / 360) * 600;
                  return (
                    <line key={lng} x1={x} y1="0" x2={x} y2="360" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  );
                })}

                {/* Continents Silhouettes */}
                <g fill="rgba(255, 255, 255, 0.04)" stroke="rgba(0, 212, 255, 0.12)" strokeWidth="0.8">
                  <path d="M 80 80 Q 140 60 170 90 Q 150 140 120 160 Q 90 140 80 80 Z" />
                  <path d="M 170 170 Q 210 190 200 280 Q 170 310 160 250 Q 150 200 170 170 Z" />
                  <path d="M 280 80 Q 340 70 350 110 Q 370 160 360 270 Q 320 290 300 240 Q 270 150 280 80 Z" />
                  <path d="M 370 70 Q 480 60 520 120 Q 490 200 420 180 Q 400 140 370 70 Z" />
                  <path d="M 460 230 Q 520 220 530 270 Q 480 290 460 230 Z" />
                </g>

                {/* Selected Antenna Visibility Horizon Cone */}
                <ellipse
                  cx={stPos.x}
                  cy={stPos.y}
                  rx="68"
                  ry="48"
                  fill="url(#antennaCoverage)"
                  stroke="rgba(0, 212, 255, 0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />

                {/* Active Tracking Uplink / Downlink RF Beam */}
                <line
                  x1={stPos.x}
                  y1={stPos.y}
                  x2={satPos.x}
                  y2={satPos.y}
                  stroke="url(#rfBeamGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  strokeDashoffset={-beamTick * 1.5}
                />

                {/* All Ground Station Nodes */}
                {stations.map((st) => {
                  const pos = getMapCoords(st.latitude, st.longitude);
                  const isSel = st.id === selectedStationId;
                  return (
                    <g
                      key={st.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={() => setSelectedStationId(st.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={isSel ? 9 : 5}
                        fill={isSel ? '#10b981' : '#00d4ff'}
                        className={isSel ? 'animate-pulse' : ''}
                      />
                      <circle
                        r={isSel ? 18 : 10}
                        fill="none"
                        stroke={isSel ? '#10b981' : '#00d4ff'}
                        strokeWidth="1.2"
                        opacity={isSel ? 0.8 : 0.4}
                      />
                      <text
                        x="12"
                        y="4"
                        fill={isSel ? '#10b981' : 'rgba(232, 237, 242, 0.7)'}
                        fontSize="9"
                        fontFamily="'Space Grotesk', sans-serif"
                        fontWeight={isSel ? 'bold' : 'normal'}
                      >
                        {st.name.split(' ')[0]} ({st.dish_diameter_m}m)
                      </text>
                    </g>
                  );
                })}

                {/* Active Spacecraft Marker */}
                <g transform={`translate(${satPos.x}, ${satPos.y})`}>
                  <circle r="7" fill="#fbbf24" className="animate-pulse" />
                  <circle r="18" fill="none" stroke="#fbbf24" strokeWidth="1.8" opacity="0.9" />
                  <text
                    x="14"
                    y="-8"
                    fill="#fbbf24"
                    fontSize="11"
                    fontFamily="'Space Grotesk', sans-serif"
                    fontWeight="bold"
                  >
                    {activeSat.name}
                  </text>
                  <text
                    x="14"
                    y="6"
                    fill="rgba(232, 237, 242, 0.8)"
                    fontSize="9"
                    fontFamily="'Inter', sans-serif"
                  >
                    Slant: {activeLink.slant_range_km} km | Az: {activeLink.azimuth_deg}°
                  </text>
                </g>
              </svg>

              {/* Station Quick Selector Overlay Pills */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
                {stations.map((st) => (
                  <div
                    role="button"
                    tabIndex={0}
                    key={st.id}
                    onClick={() => setSelectedStationId(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-space tracking-wider border cursor-pointer shrink-0 transition-all ${
                      st.id === selectedStationId
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-black/60 border-white/10 text-star-white/60 hover:text-star-white hover:border-cyan-glow/40'
                    }`}
                  >
                    {st.name} ({st.agency})
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Active RF Link Budget & Doppler Shift Metrics (Right Column) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              className="glass-panel rounded-3xl p-6 border border-cyan-glow/30 box-glow relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-glow/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-cyan-glow">
                  RF LINK BUDGET // {selectedStation.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-space font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {activeLink.link_status}
                </span>
              </div>

              {/* RF Parameters Grid */}
              <div className="space-y-3 font-space text-xs">
                {/* Elevation & Azimuth */}
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Compass size={18} className="text-cyan-glow" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        ANTENNA POINTING (AZ / EL)
                      </span>
                      <span className="font-space text-lg text-star-white font-bold">
                        Az {activeLink.azimuth_deg}° // El {activeLink.elevation_deg}°
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-space text-emerald-400 font-bold">AUTO-TRACK</span>
                </div>

                {/* Doppler Shift */}
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-purple-400" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        DOPPLER FREQUENCY SHIFT (Δf)
                      </span>
                      <span className="font-space text-lg text-purple-400 font-bold font-mono">
                        {activeLink.doppler_shift_khz > 0 ? `+${activeLink.doppler_shift_khz}` : activeLink.doppler_shift_khz} kHz
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-star-white/60">
                    {activeLink.carrier_freq_mhz} MHz
                  </span>
                </div>

                {/* Signal Strength & SNR */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                      CARRIER RSSI:
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-400 mt-0.5 block">
                      {activeLink.signal_strength_dbm} dBm
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                      SIGNAL-TO-NOISE:
                    </span>
                    <span className="font-mono text-sm font-bold text-cyan-glow mt-0.5 block">
                      {activeLink.snr_db} dB SNR
                    </span>
                  </div>
                </div>

                {/* Bit Error Rate & Max Data Rate */}
                <div className="p-3 rounded-xl bg-space-navy/50 border border-white/10 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-star-white/60">Bit Error Rate (BER):</span>
                    <span className="text-emerald-400 font-mono font-bold">{activeLink.bit_error_rate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-star-white/60">Max Downlink Throughput:</span>
                    <span className="text-cyan-glow font-mono font-bold">{selectedStation.max_data_rate_mbps} Mbps</span>
                  </div>
                </div>

                {/* Ground Handoff Schedule */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <span className="font-space text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={13} />
                    <span>AUTOMATED HANDOFF SCHEDULE</span>
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-space text-star-white/90">
                    <span>{selectedStation.name.split(' ')[0]}</span>
                    <ArrowRight size={13} className="text-cyan-glow" />
                    <span>Svalbard Polar Pass</span>
                    <ArrowRight size={13} className="text-cyan-glow" />
                    <span>Kiruna ESTRACK</span>
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <div className="mt-3 pt-2.5 border-t border-glass-border flex items-start gap-2">
                <HelpCircle size={12} className="text-muted-gray shrink-0 mt-0.5" />
                <p className="font-inter text-[9px] text-muted-gray leading-tight">
                  CCSDS 131.0-B-3 Space Link Protocol with real-time S-band/X-band doppler carrier compensation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
