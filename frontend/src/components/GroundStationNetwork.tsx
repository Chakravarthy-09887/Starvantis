'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Radio,
  Globe2,
  Compass,
  Zap,
  Activity,
  CheckCircle2,
  Satellite,
  Clock,
  Sliders,
  Maximize2,
  Signal,
  Cpu,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import {
  api,
  GroundStationDefinition,
  ActiveSpacecraftLink,
  DSNComplexStatus,
  PassPredictionItem,
  AntennaSteerResponse,
} from '../lib/api';

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
  const { selectedSatelliteId, setSelectedSatelliteId } = useMission();

  const [viewMode, setViewMode] = useState<'GLOBAL_MAP' | 'POLAR_SKY' | 'DSN_ARRAY'>('GLOBAL_MAP');
  const [stations, setStations] = useState<GroundStationDefinition[]>(DEFAULT_STATIONS);
  const [links, setLinks] = useState<ActiveSpacecraftLink[]>([]);
  const [dsnComplexes, setDsnComplexes] = useState<DSNComplexStatus[]>([]);
  const [passPredictions, setPassPredictions] = useState<PassPredictionItem[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('GS-ISTRAC-BLR');
  const [beamTick, setBeamTick] = useState(0);

  // Manual Steering Simulator States
  const [trackingMode, setTrackingMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualAzimuth, setManualAzimuth] = useState(142.6);
  const [manualElevation, setManualElevation] = useState(48.2);
  const [steerResult, setSteerResult] = useState<AntennaSteerResponse | null>(null);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  useEffect(() => {
    let isMounted = true;
    const fetchGroundData = async () => {
      try {
        const [gsList, gsLinks, dsnList, passes] = await Promise.all([
          api.getGroundStations(),
          api.getSatelliteGroundLinks(selectedSatelliteId),
          api.getDSNStatus(),
          api.getPassPredictions(selectedSatelliteId),
        ]);
        if (isMounted) {
          if (gsList && gsList.length > 0) setStations(gsList);
          if (gsLinks && gsLinks.length > 0) setLinks(gsLinks);
          if (dsnList && dsnList.length > 0) setDsnComplexes(dsnList);
          if (passes && passes.length > 0) setPassPredictions(passes);
        }
      } catch {
        // Keep active state
      }
    };
    fetchGroundData();
    const interval = setInterval(fetchGroundData, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSatelliteId]);

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

  const getMapCoords = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * 700,
    y: ((90 - lat) / 180) * 360,
  });

  const satLat = parseFloat(activeSat.lat.replace('°', '')) || 13.0;
  const satLng = parseFloat(activeSat.lng.replace('°', '')) || 77.5;
  const satPos = getMapCoords(satLat, satLng);
  const stPos = getMapCoords(selectedStation.latitude, selectedStation.longitude);

  const handleSteerDish = async (az: number, el: number) => {
    setManualAzimuth(az);
    setManualElevation(el);
    try {
      const res = await api.steerAntenna({
        station_id: selectedStationId,
        satellite_id: selectedSatelliteId,
        target_azimuth_deg: az,
        target_elevation_deg: el,
      });
      setSteerResult(res);
    } catch {
      // Keep state
    }
  };

  return (
    <section id="ground-stations" className="section-spacing relative overflow-hidden py-16 md:py-24" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/30 bg-cyan-glow/10 mb-3 shadow-[0_0_20px_rgba(99,199,255,0.2)]">
            <Radio size={14} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.25em] text-cyan-glow uppercase font-bold">
              GLOBAL TT&amp;C UPLINK / DOWNLINK &amp; DEEP SPACE NETWORK (DSN)
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-star-white">
            GROUND STATIONS &amp; DSN
          </h2>
          <p className="font-inter text-xs sm:text-sm text-muted-gray mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Real-time parabolic dish pointing, Deep Space Network (DSN) 70m antenna arrays at Goldstone, Madrid, and Canberra, Doppler S-curve tracking, and automated 24h pass handoffs.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/60 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SELECTOR PILLS */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <button
                  type="button"
                  key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_20px_rgba(99,199,255,0.35)] scale-105 font-bold ring-1 ring-cyan-glow'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* MULTI-MODE SWITCHER */}
          <div className="mt-5 inline-flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/10 gap-1.5">
            {[
              { id: 'GLOBAL_MAP', label: 'WORLD TRACKING MAP', icon: Globe2 },
              { id: 'POLAR_SKY', label: '360° POLAR SKY DOME', icon: Compass },
              { id: 'DSN_ARRAY', label: 'DSN 70M ARRAY MATRIX', icon: Radio },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSel = viewMode === mode.id;
              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-space text-[10px] sm:text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSel
                      ? 'bg-cyan-glow/20 border border-cyan-glow text-star-white font-bold shadow-[0_0_15px_rgba(99,199,255,0.3)]'
                      : 'text-muted-gray hover:text-star-white border border-transparent'
                  }`}
                >
                  <Icon size={13} className={isSel ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* MAIN VISUALIZATION CANVAS & METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Visualizer Area (Left Column - 8 Cols) */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 relative border border-glass-border overflow-hidden shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Header with Active Station & Lock Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/70 pb-4 mb-4 gap-2">
              <div className="flex items-center gap-3">
                <Globe2 size={18} className="text-cyan-glow animate-pulse shrink-0" />
                <div>
                  <span className="font-space text-xs sm:text-sm tracking-wider text-star-white uppercase block font-bold">
                    {viewMode === 'GLOBAL_MAP' && 'GLOBAL TRACKING NETWORK & GROUND FOOTPRINTS'}
                    {viewMode === 'POLAR_SKY' && `360° SKY DOME POLAR PLOT // ${selectedStation.name}`}
                    {viewMode === 'DSN_ARRAY' && 'NASA / ESA / ISRO DEEP SPACE NETWORK COMPLEX'}
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    ACTIVE STATION: {selectedStation.name} ({selectedStation.antenna_type})
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-space text-[10px] font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 size={12} />
                <span>RF CARRIER LOCKED (X-BAND)</span>
              </span>
            </div>

            {/* VISUALIZER SWITCHER CONTENT */}
            {viewMode === 'GLOBAL_MAP' && (
              <div className="relative aspect-[16/9] w-full bg-[#010613] rounded-2xl overflow-hidden border border-glass-border/60 select-none shadow-2xl">
                <svg viewBox="0 0 700 360" className="w-full h-full">
                  <defs>
                    <linearGradient id="rfBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.9" />
                    </linearGradient>

                    <radialGradient id="antennaCoverage" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.35" />
                      <stop offset="60%" stopColor="#00d4ff" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.0" />
                    </radialGradient>

                    <linearGradient id="dayNightTerminator" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
                      <stop offset="42%" stopColor="#000000" stopOpacity="0.0" />
                      <stop offset="58%" stopColor="#000000" stopOpacity="0.0" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
                    </linearGradient>

                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Latitude & Longitude Graticule Grid */}
                  {[-60, -30, 0, 30, 60].map((lat) => {
                    const y = ((90 - lat) / 180) * 360;
                    return (
                      <g key={lat}>
                        <line x1="0" y1={y} x2="700" y2={y} stroke="rgba(0, 212, 255, 0.08)" strokeDasharray="3,3" />
                        <text x="6" y={y - 2} fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="'Space Grotesk', sans-serif">
                          {lat > 0 ? `${lat}°N` : lat < 0 ? `${Math.abs(lat)}°S` : 'EQ 0°'}
                        </text>
                      </g>
                    );
                  })}

                  {[-150, -100, -50, 0, 50, 100, 150].map((lng) => {
                    const x = ((lng + 180) / 360) * 700;
                    return (
                      <g key={lng}>
                        <line x1={x} y1="0" x2={x} y2="360" stroke="rgba(0, 212, 255, 0.08)" strokeDasharray="3,3" />
                        <text x={x + 2} y="10" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="'Space Grotesk', sans-serif">
                          {lng > 0 ? `${lng}°E` : lng < 0 ? `${Math.abs(lng)}°W` : '0°'}
                        </text>
                      </g>
                    );
                  })}

                  {/* High-Resolution Vector Continental Coastlines */}
                  <g fill="#0b172a" stroke="#00d4ff" strokeWidth="0.85" opacity="0.85">
                    {/* North America */}
                    <path d="M 60 70 Q 110 50 170 65 Q 210 80 200 120 Q 185 145 155 150 Q 130 170 115 155 Q 85 140 70 105 Z" />
                    {/* Greenland */}
                    <path d="M 220 35 Q 260 30 250 65 Q 230 75 220 50 Z" />
                    {/* South America */}
                    <path d="M 175 175 Q 225 185 240 240 Q 220 305 190 325 Q 170 295 165 240 Q 160 200 175 175 Z" />
                    {/* Europe */}
                    <path d="M 310 65 Q 360 55 385 75 Q 375 110 350 120 Q 320 125 310 95 Z" />
                    {/* Africa */}
                    <path d="M 310 130 Q 380 125 410 175 Q 400 270 360 295 Q 330 280 320 220 Q 300 170 310 130 Z" />
                    {/* Asia */}
                    <path d="M 390 60 Q 520 50 620 90 Q 600 160 540 185 Q 480 190 440 150 Q 400 130 390 60 Z" />
                    {/* Indian Subcontinent */}
                    <path d="M 465 140 Q 505 145 500 200 Q 480 230 460 200 Q 455 165 465 140 Z" />
                    {/* Australia */}
                    <path d="M 545 225 Q 625 215 635 270 Q 600 305 550 285 Q 535 255 545 225 Z" />
                    {/* Antarctica Strip */}
                    <path d="M 0 340 L 700 340 L 700 360 L 0 360 Z" fill="#0f172a" stroke="rgba(255,255,255,0.2)" />
                  </g>

                  {/* Day-Night Terminator Shadow Overlay */}
                  <rect x="0" y="0" width="700" height="360" fill="url(#dayNightTerminator)" pointerEvents="none" />

                  {/* Night-Side City Lights Clusters */}
                  <g fill="#fef08a" opacity="0.65">
                    <circle cx="140" cy="110" r="1.4" />
                    <circle cx="160" cy="120" r="1.2" />
                    <circle cx="110" cy="130" r="1.5" />
                    <circle cx="330" cy="90" r="1.6" />
                    <circle cx="350" cy="85" r="1.8" />
                    <circle cx="360" cy="100" r="1.4" />
                    <circle cx="480" cy="170" r="1.8" />
                    <circle cx="490" cy="160" r="1.5" />
                    <circle cx="580" cy="120" r="1.6" />
                    <circle cx="590" cy="135" r="1.7" />
                  </g>

                  {/* SGP4 Ground Track Orbit Ribbon */}
                  <path
                    d="M 0 190 Q 175 40, 350 190 T 700 190"
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.45)"
                    strokeWidth="1.8"
                    strokeDasharray="5,4"
                  />

                  {/* Ground Station Coverage Footprint (Elevation Mask 5°) */}
                  <ellipse
                    cx={stPos.x}
                    cy={stPos.y}
                    rx="85"
                    ry="55"
                    fill="url(#antennaCoverage)"
                    stroke="rgba(0, 212, 255, 0.5)"
                    strokeWidth="1.4"
                    strokeDasharray="4,3"
                  />

                  {/* RF Carrier Uplink / Downlink Beam with Animated Traveling Packets */}
                  <line
                    x1={stPos.x}
                    y1={stPos.y}
                    x2={satPos.x}
                    y2={satPos.y}
                    stroke="url(#rfBeamGrad)"
                    strokeWidth="3.0"
                    strokeDasharray="8,5"
                    strokeDashoffset={-beamTick * 1.8}
                    filter="url(#glowFilter)"
                  />

                  {/* Traveling Data Packet Node */}
                  {(() => {
                    const packetProgress = (beamTick % 100) / 100;
                    const px = stPos.x + (satPos.x - stPos.x) * packetProgress;
                    const py = stPos.y + (satPos.y - stPos.y) * packetProgress;
                    return (
                      <g transform={`translate(${px}, ${py})`}>
                        <circle r="4.5" fill="#10b981" />
                        <circle r="9" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
                      </g>
                    );
                  })()}

                  {/* Ground Station Nodes (Clean, Non-overlapping UI) */}
                  {stations.map((st) => {
                    const pos = getMapCoords(st.latitude, st.longitude);
                    const isSel = st.id === selectedStationId;
                    return (
                      <g
                        key={st.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => setSelectedStationId(st.id)}
                        className="cursor-pointer group"
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
                          opacity={isSel ? 0.9 : 0.35}
                        />

                        {/* Station Callout HUD Badge */}
                        {isSel && (
                          <g transform="translate(14, -20)">
                            <rect
                              x="0"
                              y="0"
                              width="140"
                              height="32"
                              rx="6"
                              fill="rgba(4, 18, 34, 0.95)"
                              stroke="#10b981"
                              strokeWidth="1.2"
                            />
                            <text
                              x="8"
                              y="13"
                              fill="#10b981"
                              fontSize="9.5"
                              fontFamily="'Space Grotesk', sans-serif"
                              fontWeight="bold"
                            >
                              {st.name}
                            </text>
                            <text
                              x="8"
                              y="25"
                              fill="rgba(232, 237, 242, 0.85)"
                              fontSize="8"
                              fontFamily="'Inter', sans-serif"
                            >
                              {st.dish_diameter_m}m Dish // {st.agency}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Satellite Marker with Sub-Satellite Point (SSP) Callout */}
                  <g transform={`translate(${satPos.x}, ${satPos.y})`}>
                    <circle r="8" fill="#fbbf24" className="animate-pulse" />
                    <circle r="22" fill="none" stroke="#fbbf24" strokeWidth="1.8" opacity="0.9" />
                    <g transform="translate(14, -24)">
                      <rect
                        x="0"
                        y="0"
                        width="155"
                        height="34"
                        rx="6"
                        fill="rgba(4, 18, 34, 0.95)"
                        stroke="#fbbf24"
                        strokeWidth="1.2"
                      />
                      <text
                        x="8"
                        y="14"
                        fill="#fbbf24"
                        fontSize="10"
                        fontFamily="'Space Grotesk', sans-serif"
                        fontWeight="bold"
                      >
                        {activeSat.name.split(' ')[0]} [SSP ORBIT]
                      </text>
                      <text
                        x="8"
                        y="26"
                        fill="rgba(232, 237, 242, 0.85)"
                        fontSize="8.5"
                        fontFamily="'Inter', sans-serif"
                      >
                        Slant: {activeLink.slant_range_km} km | Az: {activeLink.azimuth_deg}°
                      </text>
                    </g>
                  </g>
                </svg>

                {/* Station Quick Selector Pills at Bottom */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {stations.map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setSelectedStationId(st.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-space tracking-wider border cursor-pointer shrink-0 transition-all ${
                        st.id === selectedStationId
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'bg-black/70 border-white/10 text-star-white/70 hover:text-star-white hover:border-cyan-glow/40'
                      }`}
                    >
                      {st.name.split(' ')[0]} ({st.dish_diameter_m}m)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 360° POLAR SKY DOME PLOT */}
            {viewMode === 'POLAR_SKY' && (
              <div className="relative aspect-[16/9] w-full bg-[#030816] rounded-2xl overflow-hidden border border-glass-border/50 p-4 flex flex-col md:flex-row items-center justify-around gap-6">
                <div className="relative w-[280px] h-[280px] shrink-0">
                  <svg viewBox="-140 -140 280 280" className="w-full h-full">
                    {/* Elevation Rings */}
                    {[125, 85, 45].map((r, i) => (
                      <g key={r}>
                        <circle
                          r={r}
                          fill="none"
                          stroke="rgba(0, 212, 255, 0.22)"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                        <text x="3" y={-r + 10} fill="rgba(0,212,255,0.6)" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif">
                          {i === 0 ? '0° HORIZON' : i === 1 ? '30° ELEV' : '60° ELEV'}
                        </text>
                      </g>
                    ))}

                    {/* Radial Azimuth Spokes */}
                    <line x1="0" y1="-135" x2="0" y2="135" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
                    <line x1="-135" y1="0" x2="135" y2="0" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />

                    {/* Cardinal Labels */}
                    <g transform="translate(0, -128)">
                      <rect x="-14" y="-8" width="28" height="15" rx="3" fill="#020612" stroke="#00d4ff" strokeWidth="0.8" />
                      <text x="0" y="3" fill="#00d4ff" fontSize="8.5" fontWeight="bold" textAnchor="middle">0° N</text>
                    </g>
                    <g transform="translate(122, 0)">
                      <rect x="-14" y="-7" width="28" height="15" rx="3" fill="#020612" stroke="#00d4ff" strokeWidth="0.8" />
                      <text x="0" y="4" fill="#00d4ff" fontSize="8.5" fontWeight="bold" textAnchor="middle">90° E</text>
                    </g>
                    <g transform="translate(0, 128)">
                      <rect x="-14" y="-7" width="28" height="15" rx="3" fill="#020612" stroke="#00d4ff" strokeWidth="0.8" />
                      <text x="0" y="4" fill="#00d4ff" fontSize="8.5" fontWeight="bold" textAnchor="middle">180° S</text>
                    </g>
                    <g transform="translate(-122, 0)">
                      <rect x="-14" y="-7" width="28" height="15" rx="3" fill="#020612" stroke="#00d4ff" strokeWidth="0.8" />
                      <text x="0" y="4" fill="#00d4ff" fontSize="8.5" fontWeight="bold" textAnchor="middle">270° W</text>
                    </g>

                    {/* Satellite Point Calculation in Polar Space */}
                    {(() => {
                      const azRad = ((activeLink.azimuth_deg - 90) * Math.PI) / 180;
                      const r = ((90 - Math.max(0, activeLink.elevation_deg)) / 90) * 125;
                      const px = r * Math.cos(azRad);
                      const py = r * Math.sin(azRad);

                      return (
                        <g>
                          {/* Radial Tracking Vector */}
                          <line x1="0" y1="0" x2={px} y2={py} stroke="#10b981" strokeWidth="2.2" strokeDasharray="4,2" />
                          <circle cx={px} cy={py} r="8" fill="#fbbf24" className="animate-pulse" />
                          <circle cx={px} cy={py} r="18" fill="none" stroke="#fbbf24" strokeWidth="1.8" opacity="0.8" />
                          <g transform={`translate(${px + 12}, ${py - 12})`}>
                            <rect x="0" y="0" width="95" height="26" rx="5" fill="#041222" stroke="#fbbf24" strokeWidth="1" />
                            <text x="6" y="11" fill="#fbbf24" fontSize="9.5" fontWeight="bold" fontFamily="'Space Grotesk', sans-serif">
                              {activeSat.name.split(' ')[0]}
                            </text>
                            <text x="6" y="22" fill="rgba(255,255,255,0.85)" fontSize="7.5" fontFamily="'Inter', sans-serif">
                              Az: {activeLink.azimuth_deg}° | El: {activeLink.elevation_deg}°
                            </text>
                          </g>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Polar Details Box */}
                <div className="space-y-3 max-w-xs text-xs font-space">
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                    <span className="text-[10px] text-muted-gray uppercase block font-semibold">HORIZON GEOMETRY:</span>
                    <span className="font-mono text-cyan-glow text-sm font-bold block">
                      Azimuth: {activeLink.azimuth_deg}° // Elevation: {activeLink.elevation_deg}°
                    </span>
                    <span className="text-[10px] text-star-white/70 block">
                      Slant Distance: <strong className="text-star-white">{activeLink.slant_range_km} km</strong>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] text-emerald-400 uppercase block font-bold">DISH SLEW MOTORS:</span>
                    <span className="text-[11px] text-star-white block">
                      Azimuth Slew Rate: <strong className="font-mono text-emerald-300">2.4°/sec (Nominal)</strong>
                    </span>
                    <span className="text-[11px] text-star-white block">
                      Elevation Slew Rate: <strong className="font-mono text-emerald-300">1.8°/sec (Nominal)</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DSN ARRAY COMPLEX VIEW */}
            {viewMode === 'DSN_ARRAY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {(dsnComplexes.length > 0 ? dsnComplexes : [
                    { complex_id: 'DSN-GOLDSTONE', name: 'Goldstone DSN (DSS-14)', location: 'Mojave Desert, California', active_spacecraft_count: 3, network_health: 'NOMINAL_99.99%', antennas: [{ antenna_id: 'DSS-14', diameter_m: 70, tracked_spacecraft: 'JWST', tx_power_kw: 18.5, rx_cryo_temp_k: 4.2, status: 'TRACKING_ONLINE' }] },
                    { complex_id: 'DSN-MADRID', name: 'Madrid DSN (DSS-63)', location: 'Robledo de Chavela, Spain', active_spacecraft_count: 3, network_health: 'NOMINAL_99.99%', antennas: [{ antenna_id: 'DSS-63', diameter_m: 70, tracked_spacecraft: 'ADITYA-L1', tx_power_kw: 19.2, rx_cryo_temp_k: 4.3, status: 'TRACKING_ONLINE' }] },
                    { complex_id: 'DSN-CANBERRA', name: 'Canberra DSN (DSS-43)', location: 'Tidbinbilla, Australia', active_spacecraft_count: 2, network_health: 'NOMINAL_99.99%', antennas: [{ antenna_id: 'DSS-43', diameter_m: 70, tracked_spacecraft: 'CHANDRAYAAN-3', tx_power_kw: 20.0, rx_cryo_temp_k: 4.2, status: 'TRACKING_ONLINE' }] },
                  ]).map((complex: any) => (
                    <div key={complex.complex_id} className="p-4 rounded-2xl bg-black/60 border border-cyan-glow/30 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-space text-xs font-bold text-cyan-glow">{complex.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          {complex.network_health}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-gray font-inter block">{complex.location}</span>

                      {/* Schematic Animated 70m Parabolic Dish */}
                      <div className="relative h-28 bg-[#030917] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 160 100" className="w-full h-full">
                          {/* Dish Stand / Pedestal */}
                          <line x1="80" y1="90" x2="80" y2="55" stroke="#475569" strokeWidth="4" />
                          <polygon points="65,95 95,95 85,85 75,85" fill="#334155" />

                          {/* Parabolic Reflector Curve */}
                          <path
                            d="M 30 35 Q 80 70 130 35"
                            fill="none"
                            stroke="#00d4ff"
                            strokeWidth="3"
                            filter="url(#glowFilter)"
                          />

                          {/* Sub-Reflector Focal Quadripod */}
                          <line x1="45" y1="42" x2="80" y2="20" stroke="#64748b" strokeWidth="1" />
                          <line x1="115" y1="42" x2="80" y2="20" stroke="#64748b" strokeWidth="1" />
                          <polygon points="76,20 84,20 80,16" fill="#fbbf24" />

                          {/* Microwave Focal Beam Ray trace */}
                          <line x1="80" y1="20" x2="80" y2="54" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,2" />

                          {/* RF Signal Wave Rings */}
                          <circle cx="80" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6" className="animate-ping" style={{ animationDuration: '3s' }} />
                        </svg>
                        <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-mono text-cyan-glow">
                          70M CASSEGRAIN ARRAY
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {complex.antennas?.map((ant: any) => (
                          <div key={ant.antenna_id} className="p-2.5 rounded-xl bg-space-navy/60 border border-white/5 space-y-1.5">
                            <div className="flex justify-between text-[11px] font-space">
                              <span className="font-bold text-star-white">{ant.antenna_id} ({ant.diameter_m}m)</span>
                              <span className="text-emerald-400 font-mono text-[9px] font-bold">{ant.status}</span>
                            </div>
                            <span className="text-[10px] font-inter text-amber-300 block truncate font-semibold">
                              Locked Target: {ant.tracked_spacecraft}
                            </span>
                            <div className="flex justify-between text-[9px] font-mono text-muted-gray">
                              <span>Tx: <strong className="text-star-white">{ant.tx_power_kw} kW</strong></span>
                              <span>Cryo: <strong className="text-emerald-400">{ant.rx_cryo_temp_k} K (He)</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column (RF Link Budget & Manual Steer Control) */}
          <div className="lg:col-span-4 space-y-5">
            {/* RF Link Budget */}
            <motion.div
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-glow/30 box-glow relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
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
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Compass size={18} className="text-cyan-glow" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        ANTENNA POINTING (AZ / EL)
                      </span>
                      <span className="font-space text-base text-star-white font-bold">
                        Az {activeLink.azimuth_deg}° // El {activeLink.elevation_deg}°
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-space text-emerald-400 font-bold">AUTO-TRACK</span>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-purple-400" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        DOPPLER FREQUENCY SHIFT (Δf)
                      </span>
                      <span className="font-space text-base text-purple-400 font-bold font-mono">
                        {activeLink.doppler_shift_khz > 0 ? `+${activeLink.doppler_shift_khz}` : activeLink.doppler_shift_khz} kHz
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-star-white/60">
                    {activeLink.carrier_freq_mhz} MHz
                  </span>
                </div>

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

                <div className="p-3 rounded-xl bg-space-navy/50 border border-white/10 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-star-white/60">Bit Error Rate (BER):</span>
                    <span className="text-emerald-400 font-mono font-bold">{activeLink.bit_error_rate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-star-white/60">Max Downlink Rate:</span>
                    <span className="text-cyan-glow font-mono font-bold">{selectedStation.max_data_rate_mbps} Mbps</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* MANUAL DISH STEERING SIMULATOR */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-3">
              <div className="flex items-center justify-between border-b border-glass-border pb-3">
                <span className="font-space text-xs tracking-wider uppercase font-bold text-star-white flex items-center gap-2">
                  <Sliders size={14} className="text-cyan-glow" />
                  <span>MANUAL DISH STEERING SIMULATOR</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTrackingMode(trackingMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border cursor-pointer ${
                    trackingMode === 'MANUAL'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  }`}
                >
                  {trackingMode === 'MANUAL' ? 'MANUAL OVERRIDE' : 'AUTO-LOCK ON'}
                </button>
              </div>

              <div className="space-y-3 text-xs font-space">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-gray">Azimuth Slew:</span>
                    <span className="font-mono text-cyan-glow font-bold">{manualAzimuth}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="0.5"
                    value={manualAzimuth}
                    onChange={(e) => handleSteerDish(parseFloat(e.target.value), manualElevation)}
                    className="w-full accent-cyan-glow cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-gray">Elevation Slew:</span>
                    <span className="font-mono text-cyan-glow font-bold">{manualElevation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="0.5"
                    value={manualElevation}
                    onChange={(e) => handleSteerDish(manualAzimuth, parseFloat(e.target.value))}
                    className="w-full accent-cyan-glow cursor-pointer"
                  />
                </div>

                {steerResult && (
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-gray">Pointing Offset:</span>
                      <span className="font-mono text-amber-400 font-bold">{steerResult.pointing_error_deg}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-gray">RF Pointing Loss:</span>
                      <span className="font-mono text-red-400 font-bold">-{steerResult.rf_pointing_loss_db} dB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-gray">Lock Status:</span>
                      <span className={`font-bold ${steerResult.achieved_carrier_lock ? 'text-emerald-400' : 'text-red-400'}`}>
                        {steerResult.achieved_carrier_lock ? 'LOCK MAINTAINED' : 'CARRIER LOST'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 24-HOUR PASS PREDICTIONS */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-3">
              <div className="flex items-center justify-between border-b border-glass-border pb-3">
                <span className="font-space text-xs tracking-wider uppercase font-bold text-star-white flex items-center gap-2">
                  <Clock size={14} className="text-cyan-glow" />
                  <span>24H GROUND PASS SCHEDULE</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-glow">
                  {passPredictions.length} PASSES PREDICTED
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {passPredictions.map((p) => (
                  <div key={p.pass_id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-space">
                      <span className="font-bold text-star-white">{p.station_name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-glow/15 text-cyan-glow">
                        Peak: {p.max_elevation_deg}°
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-gray">
                      <span>Duration: {p.pass_duration_min} min</span>
                      <span className="text-emerald-400 font-bold">{p.link_quality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
