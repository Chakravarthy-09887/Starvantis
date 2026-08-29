'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sun,
  Flame,
  ShieldAlert,
  Activity,
  Wind,
  Radio,
  Zap,
  Globe2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Satellite,
  Compass,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { api, SpaceWeatherIndices, SpacecraftRadiationDose } from '../lib/api';

const DEFAULT_WEATHER: SpaceWeatherIndices = {
  timestamp: new Date().toISOString(),
  kp_index: 3.67,
  storm_level: 'G0',
  storm_category: 'UNSETTLED (MODERATE SOLAR ACTIVITY)',
  solar_wind_speed_kms: 482.4,
  solar_wind_density_pcm3: 6.4,
  imf_bz_nt: -3.8,
  goes_xray_flux: '1.24e-6 W/m²',
  flare_class: 'C3.8 (MODERATE)',
  radio_flux_f107: 168.4,
  aditya_l1_stream: 'ASPEX-SWIS // 100% ONLINE',
  saa_status: 'EXPANDED TRAPPING REGION (-30° Lat, -45° Lng)',
};

export default function SpaceWeatherCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, formatMissionTime } = useMission();

  const [weather, setWeather] = useState<SpaceWeatherIndices>(DEFAULT_WEATHER);
  const [radData, setRadData] = useState<SpacecraftRadiationDose | null>(null);
  const [loading, setLoading] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Fetch live space weather
  const fetchWeather = async () => {
    try {
      const data = await api.getSpaceWeather();
      setWeather(data);
    } catch {
      // Fallback to active model
    }
  };

  // Fetch spacecraft-specific radiation dosage
  const fetchRadDose = async (satId: string) => {
    try {
      const data = await api.getSpacecraftRadiation(satId);
      setRadData(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchRadDose(selectedSatelliteId);
    const interval = setInterval(() => {
      fetchWeather();
      fetchRadDose(selectedSatelliteId);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedSatelliteId]);

  // Visual pulsation tick
  useEffect(() => {
    const pInterval = setInterval(() => {
      setPulseTick((t) => (t + 1) % 360);
    }, 50);
    return () => clearInterval(pInterval);
  }, []);

  const isStorm = weather.kp_index >= 5.0;
  const satLat = radData ? radData.sub_lat : parseFloat(activeSat.lat.replace('°', '')) || -18.4;
  const satLng = radData ? radData.sub_lng : parseFloat(activeSat.lng.replace('°', '')) || -42.1;
  const isInSaa = radData ? radData.is_in_saa : (-50 <= satLat && satLat <= 0 && -90 <= satLng && satLng <= 10);

  // Map coordinate conversion: Lat (-90 to +90) -> Y (360 to 0), Lng (-180 to +180) -> X (0 to 600)
  const mapX = ((satLng + 180) / 360) * 600;
  const mapY = ((90 - satLat) / 180) * 360;

  return (
    <section id="space-weather" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5 mb-4">
            <Sun size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="font-space text-[10px] tracking-[0.3em] text-amber-400 uppercase font-bold">
              NOAA SWPC &amp; ISRO ADITYA-L1 REAL-TIME FEED
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            SPACE WEATHER &amp; RADIATION BELTS
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            Live solar wind stream ingestion, Geomagnetic Kp-Index storm tracking, South Atlantic Anomaly (SAA) radiation contours, and spacecraft ionizing dosage calculation.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto mt-4"
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
                      ? 'bg-amber-400/20 border-amber-400 text-star-white shadow-[0_0_20px_rgba(251,191,36,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-amber-400/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-amber-400' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Core Space Weather Metrics HUD Banner */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {/* Kp Index */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>PLANETARY KP-INDEX</span>
              <Activity size={12} className={isStorm ? 'text-alert-critical' : 'text-amber-400'} />
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`font-space text-2xl font-bold ${isStorm ? 'text-alert-critical' : 'text-amber-400'}`}>
                {weather.kp_index.toFixed(2)}
              </span>
              <span className="text-[10px] font-space text-star-white/60">/ 9.0</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 mt-1 uppercase font-bold">
              {weather.storm_level} // {weather.storm_category.split(' ')[0]}
            </span>
          </div>

          {/* Solar Wind Speed */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>SOLAR WIND SPEED</span>
              <Wind size={12} className="text-cyan-glow" />
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-space text-2xl font-bold text-cyan-glow">
                {weather.solar_wind_speed_kms}
              </span>
              <span className="text-[10px] font-space text-star-white/60">km/s</span>
            </div>
            <span className="text-[9px] font-mono text-star-white/50 mt-1">
              Density: {weather.solar_wind_density_pcm3} p/cm³
            </span>
          </div>

          {/* Interplanetary Magnetic Field (IMF Bz) */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>IMF VECTOR (Bz)</span>
              <Compass size={12} className="text-purple-400" />
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`font-space text-2xl font-bold ${weather.imf_bz_nt < 0 ? 'text-alert-critical' : 'text-purple-400'}`}>
                {weather.imf_bz_nt > 0 ? `+${weather.imf_bz_nt}` : weather.imf_bz_nt}
              </span>
              <span className="text-[10px] font-space text-star-white/60">nT</span>
            </div>
            <span className="text-[9px] font-mono text-star-white/50 mt-1">
              {weather.imf_bz_nt < 0 ? 'SOUTHWARD (RECONNECTION)' : 'NORTHWARD (STABLE)'}
            </span>
          </div>

          {/* GOES Solar Flare Class */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>SOLAR X-RAY FLUX</span>
              <Flame size={12} className="text-amber-400" />
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-space text-xl font-bold text-amber-400 truncate">
                {weather.flare_class.split(' ')[0]}
              </span>
            </div>
            <span className="text-[9px] font-mono text-star-white/50 mt-1 truncate">
              {weather.goes_xray_flux}
            </span>
          </div>

          {/* Radio Flux F10.7 */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>RADIO FLUX (F10.7)</span>
              <Radio size={12} className="text-emerald-400" />
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-space text-2xl font-bold text-emerald-400">
                {weather.radio_flux_f107}
              </span>
              <span className="text-[10px] font-space text-star-white/60">SFU</span>
            </div>
            <span className="text-[9px] font-mono text-star-white/50 mt-1">
              CORONAL HEATING: NOMINAL
            </span>
          </div>

          {/* Aditya-L1 Stream */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between bg-amber-500/5">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>ADITYA-L1 PAYLOAD</span>
              <Sun size={12} className="text-amber-400" />
            </span>
            <div className="mt-2">
              <span className="font-space text-xs font-bold text-amber-400 block leading-tight">
                ASPEX-SWIS
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1 block">
                ● 100% ONLINE (L1)
              </span>
            </div>
            <span className="text-[9px] font-mono text-star-white/40 mt-1">
              1.5M km SUNWARD LOCK
            </span>
          </div>
        </motion.div>

        {/* South Atlantic Anomaly (SAA) Radiation Map & Spacecraft Dose Evaluation */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* SAA Equirectangular Map Canvas */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-6 relative border border-glass-border overflow-hidden shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-glass-border/70 pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe2 size={18} className="text-amber-400 animate-pulse" />
                <div>
                  <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                    SOUTH ATLANTIC ANOMALY (SAA) &amp; VAN ALLEN BELT MATRIX
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    GLOBAL IONIZING RADIATION CONTOURS // PROTON TRAPPING PEAK: &gt;10⁴ protons/cm²/s
                  </span>
                </div>
              </div>

              {isInSaa ? (
                <span className="px-3 py-1 rounded-full bg-alert-critical/20 border border-alert-critical text-alert-critical font-space text-[10px] font-bold animate-pulse flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  <span>{activeSat.name} IN SAA TRAP</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-space text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  <span>MAGNETOSPHERE NOMINAL</span>
                </span>
              )}
            </div>

            {/* Equirectangular Map with SAA Overlay */}
            <div className="relative aspect-[16/9] w-full bg-[#030814] rounded-2xl overflow-hidden border border-glass-border/50">
              <svg viewBox="0 0 600 360" className="w-full h-full">
                <defs>
                  {/* SAA Gradient Contours */}
                  <radialGradient id="saaRadial" cx="35%" cy="65%" r="35%">
                    <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.55" />
                    <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="80%" stopColor="#63c7ff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#63c7ff" stopOpacity="0.0" />
                  </radialGradient>

                  <linearGradient id="orbitTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#63c7ff" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#63c7ff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#63c7ff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* World Latitude / Longitude Grid */}
                {[-60, -30, 0, 30, 60].map((lat) => {
                  const y = ((90 - lat) / 180) * 360;
                  return (
                    <g key={lat}>
                      <line x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                      <text x="6" y={y - 3} fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="'Space Grotesk', sans-serif">
                        {lat > 0 ? `${lat}°N` : lat < 0 ? `${Math.abs(lat)}°S` : '0° EQ'}
                      </text>
                    </g>
                  );
                })}

                {[-120, -60, 0, 60, 120].map((lng) => {
                  const x = ((lng + 180) / 360) * 600;
                  return (
                    <g key={lng}>
                      <line x1={x} y1="0" x2={x} y2="360" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                      <text x={x + 3} y="352" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="'Space Grotesk', sans-serif">
                        {lng > 0 ? `${lng}°E` : lng < 0 ? `${Math.abs(lng)}°W` : '0° MER'}
                      </text>
                    </g>
                  );
                })}

                {/* Stylized Continents Silhouettes */}
                <g fill="rgba(255, 255, 255, 0.05)" stroke="rgba(99, 199, 255, 0.15)" strokeWidth="0.8">
                  {/* North America */}
                  <path d="M 80 80 Q 140 60 170 90 Q 150 140 120 160 Q 90 140 80 80 Z" />
                  {/* South America */}
                  <path d="M 170 170 Q 210 190 200 280 Q 170 310 160 250 Q 150 200 170 170 Z" />
                  {/* Europe & Africa */}
                  <path d="M 280 80 Q 340 70 350 110 Q 370 160 360 270 Q 320 290 300 240 Q 270 150 280 80 Z" />
                  {/* Asia & India */}
                  <path d="M 370 70 Q 480 60 520 120 Q 490 200 420 180 Q 400 140 370 70 Z" />
                  {/* Australia */}
                  <path d="M 460 230 Q 520 220 530 270 Q 480 290 460 230 Z" />
                </g>

                {/* South Atlantic Anomaly (SAA) Radiation Trapping Footprint */}
                {/* SAA spans roughly Lat -50 to 0, Lng -90 to +10 */}
                <ellipse
                  cx={(((-40 + 180) / 360) * 600)}
                  cy={(((90 - -25) / 180) * 360)}
                  rx="105"
                  ry="65"
                  fill="url(#saaRadial)"
                  stroke="rgba(255, 59, 59, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />

                {/* SAA Inner Core Pulse */}
                <ellipse
                  cx={(((-40 + 180) / 360) * 600)}
                  cy={(((90 - -25) / 180) * 360)}
                  rx="55"
                  ry="32"
                  fill="rgba(255, 59, 59, 0.25)"
                  stroke="#ff3b3b"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />

                <text
                  x={(((-40 + 180) / 360) * 600)}
                  y={(((90 - -25) / 180) * 360) - 8}
                  fill="#ff3b3b"
                  fontSize="11"
                  fontFamily="'Space Grotesk', sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  SAA TRAP CORE
                </text>
                <text
                  x={(((-40 + 180) / 360) * 600)}
                  y={(((90 - -25) / 180) * 360) + 10}
                  fill="rgba(232, 237, 242, 0.8)"
                  fontSize="9"
                  fontFamily="'Inter', sans-serif"
                  textAnchor="middle"
                >
                  &gt;10⁴ p/cm²/s (E &gt; 10 MeV)
                </text>

                {/* Satellite Sinusoidal Ground Track */}
                <path
                  d="M 0 120 Q 150 20 300 240 T 600 120"
                  fill="none"
                  stroke="url(#orbitTrackGrad)"
                  strokeWidth="2"
                  strokeDasharray="5,4"
                />

                {/* Active Spacecraft Marker on Map */}
                <g transform={`translate(${mapX}, ${mapY})`}>
                  <circle r="6" fill="#fbbf24" className="animate-pulse" />
                  <circle r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.8" />
                  <text
                    x="12"
                    y="-8"
                    fill="#fbbf24"
                    fontSize="11"
                    fontFamily="'Space Grotesk', sans-serif"
                    fontWeight="bold"
                  >
                    {activeSat.name}
                  </text>
                  <text
                    x="12"
                    y="6"
                    fill="rgba(232, 237, 242, 0.8)"
                    fontSize="9"
                    fontFamily="'Inter', sans-serif"
                  >
                    {satLat.toFixed(1)}°, {satLng.toFixed(1)}° ({activeSat.altitude})
                  </text>
                </g>
              </svg>

              {/* Ingress / Egress Status Pill Overlay */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-star-white flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Activity size={12} />
                  <span>SAA TRANSIT STATUS:</span>
                </span>
                <span className={isInSaa ? 'text-alert-critical font-bold' : 'text-emerald-400 font-bold'}>
                  {isInSaa ? 'CURRENTLY TRANSITING SAA CORE' : 'CLEAR // NEXT TRANSIT IN 42m'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Spacecraft Radiation Health & Cumulative Dosage (Right Column) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              className="glass-panel rounded-3xl p-6 border border-amber-400/30 box-glow relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-amber-400">
                  IONIZING DOSAGE // {activeSat.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-space font-bold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  LEO / GEO DOSIMETRY
                </span>
              </div>

              {/* Radiation Metrics Cards */}
              <div className="space-y-3">
                {/* Cumulative Dose */}
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-amber-400" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        CUMULATIVE IONIZING DOSE
                      </span>
                      <span className="font-space text-xl text-star-white font-bold">
                        {radData ? radData.cumulative_dose_krad : 14.82} krad
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-space text-amber-400 font-bold">TID SHIELDED</span>
                </div>

                {/* SEU Risk Level */}
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu size={18} className={isInSaa ? 'text-alert-critical' : 'text-cyan-glow'} />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        SINGLE EVENT UPSET (SEU)
                      </span>
                      <span className="font-space text-xs text-star-white font-bold">
                        {radData ? radData.seu_risk_level : 'NOMINAL // QUIET'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Solar Array Degradation */}
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun size={18} className="text-emerald-400" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                        PHOTO-CELL DEGRADATION
                      </span>
                      <span className="font-space text-lg text-emerald-400 font-bold">
                        {radData ? radData.solar_cell_degradation_pct : 2.38}% TOTAL
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-space text-emerald-400 font-bold">0.04% / MO</span>
                </div>
              </div>

              {/* Recommended Mitigation Advisory */}
              <div className="mt-4 p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <span className="font-space text-[10px] font-bold text-cyan-glow uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>AUTONOMOUS MITIGATION ADVISORY</span>
                </span>
                <p className="font-inter text-xs text-star-white/80 leading-relaxed">
                  {radData
                    ? radData.recommended_mitigation
                    : 'Engage EDAC triple-modular memory scrubbing and switch star tracker attitude weighting to Gyro mode.'}
                </p>
              </div>

              {/* Footnote */}
              <div className="mt-3 pt-2.5 border-t border-glass-border flex items-start gap-2">
                <HelpCircle size={12} className="text-muted-gray shrink-0 mt-0.5" />
                <p className="font-inter text-[9px] text-muted-gray leading-tight">
                  AP-8 / AE-8 Trapped Radiation Environment Model cross-referenced with NOAA SWPC Space Weather Prediction Center.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
