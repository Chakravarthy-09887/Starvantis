'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
  Layers,
  BarChart3,
  Shield,
  Eye,
  Sliders,
  Play,
  RotateCcw,
  Maximize2,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { api, SpaceWeatherIndices, SpacecraftRadiationDose, SolarFlareEvent } from '../lib/api';

const DEFAULT_WEATHER: SpaceWeatherIndices = {
  timestamp: new Date().toISOString(),
  kp_index: 3.67,
  storm_level: 'G0',
  storm_category: 'UNSETTLED (MODERATE SOLAR ACTIVITY)',
  solar_wind_speed_kms: 482.4,
  solar_wind_density_pcm3: 6.4,
  solar_wind_pressure_npa: 2.48,
  magnetopause_standoff_re: 10.2,
  imf_bz_nt: -3.8,
  imf_bt_nt: 6.4,
  dst_index_nt: -28.0,
  auroral_power_gw: 34.2,
  goes_xray_flux: '1.24e-6 W/m²',
  flare_class: 'C3.8 (MODERATE)',
  radio_flux_f107: 168.4,
  aditya_l1_stream: 'ASPEX-SWIS & VELC // 100% ONLINE',
  saa_status: 'EXPANDED TRAPPING REGION (-30° Lat, -45° Lng)',
  van_allen_inner_flux: '1.84e4 p/cm²/s (E > 10 MeV)',
  van_allen_outer_flux: '4.62e5 e⁻/cm²/s (E > 2 MeV)',
  kp_history_24h: [
    { time: '00:00', kp: 2.33 },
    { time: '03:00', kp: 2.67 },
    { time: '06:00', kp: 3.00 },
    { time: '09:00', kp: 3.67 },
    { time: '12:00', kp: 4.33 },
    { time: '15:00', kp: 4.00 },
    { time: '18:00', kp: 3.33 },
    { time: '21:00', kp: 3.67 },
  ],
  solar_wind_history_24h: [
    { time: '00:00', speed: 410, pressure: 1.8 },
    { time: '03:00', speed: 425, pressure: 2.0 },
    { time: '06:00', speed: 440, pressure: 2.1 },
    { time: '09:00', speed: 470, pressure: 2.3 },
    { time: '12:00', speed: 495, pressure: 2.6 },
    { time: '15:00', speed: 485, pressure: 2.5 },
    { time: '18:00', speed: 475, pressure: 2.4 },
    { time: '21:00', speed: 482, pressure: 2.48 },
  ],
  recent_flares: [
    {
      id: 'FLR-2026-0831A',
      class_type: 'X1.2 (STRONG)',
      active_region: 'AR-3664',
      peak_time_utc: '06:14 UTC',
      flux_wm2: 1.2e-4,
      cme_associated: true,
      radio_blackout_level: 'R3 (STRONG HF BLACKOUT)',
    },
    {
      id: 'FLR-2026-0830B',
      class_type: 'M4.5 (MODERATE)',
      active_region: 'AR-3663',
      peak_time_utc: '19:45 UTC',
      flux_wm2: 4.5e-5,
      cme_associated: false,
      radio_blackout_level: 'R2 (MODERATE HF BLACKOUT)',
    },
    {
      id: 'FLR-2026-0830A',
      class_type: 'C8.2 (INTERMEDIATE)',
      active_region: 'AR-3668',
      peak_time_utc: '12:10 UTC',
      flux_wm2: 8.2e-6,
      cme_associated: false,
      radio_blackout_level: 'R1 (MINOR HF ATTENUATION)',
    },
  ],
};

type ViewTab = 'saa' | 'van-allen' | 'trends' | 'dosimetry';

export default function SpaceWeatherCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, formatMissionTime } = useMission();

  const [weather, setWeather] = useState<SpaceWeatherIndices>(DEFAULT_WEATHER);
  const [radData, setRadData] = useState<SpacecraftRadiationDose | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('saa');
  const [simCmeActive, setSimCmeActive] = useState(false);
  const [showContours, setShowContours] = useState(true);
  const [showOrbitTrack, setShowOrbitTrack] = useState(true);
  const [showAuroralOvals, setShowAuroralOvals] = useState(true);
  const [customAltKm, setCustomAltKm] = useState<number | null>(null);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Fetch live space weather
  const fetchWeather = async () => {
    try {
      const data = await api.getSpaceWeather();
      if (!simCmeActive) {
        setWeather(data);
      }
    } catch {
      // Keep active state
    }
  };

  // Fetch spacecraft-specific radiation dosage
  const fetchRadDose = async (satId: string) => {
    try {
      const data = await api.getSpacecraftRadiation(satId);
      setRadData(data);
    } catch {
      // Keep active
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
  }, [selectedSatelliteId, simCmeActive]);

  // Toggle CME Storm Simulation Mode
  const toggleCmeSim = () => {
    const next = !simCmeActive;
    setSimCmeActive(next);
    if (next) {
      setWeather((prev) => ({
        ...prev,
        kp_index: 8.33,
        storm_level: 'G4',
        storm_category: 'SEVERE GEOMAGNETIC STORM (CME IMPACT)',
        solar_wind_speed_kms: 785.0,
        solar_wind_density_pcm3: 18.5,
        solar_wind_pressure_npa: 19.1,
        magnetopause_standoff_re: 6.8,
        imf_bz_nt: -18.4,
        dst_index_nt: -164.0,
        auroral_power_gw: 142.0,
        flare_class: 'X2.4 (EXTREME)',
        saa_status: 'HIGHLY EXPANDED TRAPPING ENVELOPE',
      }));
    } else {
      fetchWeather();
    }
  };

  const effectiveKp = simCmeActive ? 8.33 : weather.kp_index;
  const isStorm = effectiveKp >= 5.0;
  const isSevere = effectiveKp >= 7.0;

  const satLat = radData ? radData.sub_lat : parseFloat(activeSat.lat.replace('°', '')) || -18.4;
  const satLng = radData ? radData.sub_lng : parseFloat(activeSat.lng.replace('°', '')) || -42.1;
  const currentAlt = customAltKm !== null ? customAltKm : radData ? radData.altitude_km : activeSat.altitudeKm || 700;
  const isInSaa = radData ? radData.is_in_saa : (-50 <= satLat && satLat <= 0 && -90 <= satLng && satLng <= 10);

  // Map coordinate conversion: Lat (-90 to +90) -> Y (360 to 0), Lng (-180 to +180) -> X (0 to 600)
  const mapX = ((satLng + 180) / 360) * 600;
  const mapY = ((90 - satLat) / 180) * 360;

  // Flare scale conversion (Log scale: A=1, B=2, C=3, M=4, X=5)
  const getFlareProgress = (flareStr: string) => {
    const char = flareStr.charAt(0).toUpperCase();
    const num = parseFloat(flareStr.slice(1)) || 1.0;
    const base = char === 'A' ? 0 : char === 'B' ? 20 : char === 'C' ? 40 : char === 'M' ? 60 : 80;
    return Math.min(100, Math.max(5, base + (num / 10) * 20));
  };

  return (
    <section id="space-weather" className="section-spacing relative overflow-hidden py-16 md:py-24" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 mb-3.5 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            <Sun size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="font-space text-[10px] tracking-[0.3em] text-amber-400 uppercase font-bold">
              NOAA SWPC &amp; ISRO ADITYA-L1 REAL-TIME FEED
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            SPACE WEATHER &amp; RADIATION BELTS
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed">
            Live solar wind dynamics, Geomagnetic Kp-Index storm tracking, South Atlantic Anomaly (SAA) contours, Van Allen radiation belts, and spacecraft ionizing dosage modeling.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SIMULATION MODE BANNER / TOGGLE */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div
              role="button"
              tabIndex={0}
              onClick={toggleCmeSim}
              className={`px-4 py-2 rounded-2xl border text-xs font-space tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                simCmeActive
                  ? 'bg-alert-critical/20 border-alert-critical text-alert-critical shadow-[0_0_25px_rgba(255,59,59,0.5)] animate-pulse font-bold'
                  : 'bg-space-navy/50 border-glass-border text-star-white/70 hover:text-amber-400 hover:border-amber-400/40'
              }`}
              title="Toggle severe coronal mass ejection solar storm simulation"
            >
              <Flame size={14} className={simCmeActive ? 'text-alert-critical animate-bounce' : 'text-amber-400'} />
              <span>{simCmeActive ? 'CME STORM SIMULATION ACTIVE (G4 SEVERE)' : 'SIMULATE G4 CME SOLAR STORM'}</span>
            </div>

            {simCmeActive && (
              <div
                role="button"
                tabIndex={0}
                onClick={toggleCmeSim}
                className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-space text-muted-gray hover:text-star-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>RESTORE LIVE STREAM</span>
              </div>
            )}
          </div>

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={sat.id}
                  onClick={() => {
                    setSelectedSatelliteId(sat.id);
                    setCustomAltKm(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-star-white shadow-[0_0_18px_rgba(251,191,36,0.3)] font-bold scale-105'
                      : 'bg-space-navy/50 border-glass-border text-muted-gray hover:text-star-white hover:border-amber-400/40'
                  }`}
                >
                  <Satellite size={12} className={isSelected ? 'text-amber-400' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Core Space Weather Metrics HUD Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {/* 1. Kp Index */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between relative overflow-hidden">
            {isStorm && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-alert-critical animate-ping" />}
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>PLANETARY KP-INDEX</span>
              <Activity size={12} className={isSevere ? 'text-alert-critical' : isStorm ? 'text-amber-400' : 'text-emerald-400'} />
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`font-space text-2xl font-bold ${isSevere ? 'text-alert-critical' : isStorm ? 'text-amber-400' : 'text-emerald-400'}`}>
                {effectiveKp.toFixed(2)}
              </span>
              <span className="text-[10px] font-space text-star-white/60">/ 9.0</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 mt-1 uppercase font-bold truncate">
              {weather.storm_level} • {weather.storm_category.split(' ')[0]}
            </span>
          </div>

          {/* 2. Solar Wind Speed */}
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
            <span className="text-[9px] font-mono text-star-white/60 mt-1 truncate">
              Density: {weather.solar_wind_density_pcm3} p/cm³
            </span>
          </div>

          {/* 3. Solar Wind Dynamic Pressure & Magnetopause */}
          <div className="glass-panel p-4 rounded-2xl border border-glass-border flex flex-col justify-between">
            <span className="text-[10px] font-space text-muted-gray uppercase font-semibold flex items-center justify-between">
              <span>DYNAMIC PRESSURE</span>
              <Zap size={12} className="text-amber-400" />
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-space text-2xl font-bold text-amber-400">
                {weather.solar_wind_pressure_npa || 2.48}
              </span>
              <span className="text-[10px] font-space text-star-white/60">nPa</span>
            </div>
            <span className="text-[9px] font-mono text-star-white/60 mt-1">
              Bow Shock: {weather.magnetopause_standoff_re || 10.2} R_E
            </span>
          </div>

          {/* 4. Interplanetary Magnetic Field (IMF Bz) */}
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
            <span className="text-[9px] font-mono text-star-white/60 mt-1 truncate">
              {weather.imf_bz_nt < 0 ? 'SOUTHWARD (RECONNECT)' : 'NORTHWARD (STABLE)'}
            </span>
          </div>

          {/* 5. GOES Solar Flare Class */}
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
            <span className="text-[9px] font-mono text-star-white/60 mt-1 truncate">
              {weather.goes_xray_flux}
            </span>
          </div>

          {/* 6. Radio Flux F10.7 */}
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
            <span className="text-[9px] font-mono text-star-white/60 mt-1 truncate">
              Dst: {weather.dst_index_nt || -28.0} nT
            </span>
          </div>
        </motion.div>

        {/* VISUALIZATION SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-2xl glass-panel border border-glass-border">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'saa', label: 'SOUTH ATLANTIC ANOMALY (SAA)', icon: Globe2 },
              { id: 'van-allen', label: 'VAN ALLEN RADIATION BELTS', icon: Layers },
              { id: 'trends', label: '24H STORM TRENDS & FLARES', icon: BarChart3 },
              { id: 'dosimetry', label: 'SPACECRAFT DOSIMETRY & HARDENING', icon: Shield },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ViewTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-star-white font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'border-glass-border bg-space-navy/50 text-muted-gray hover:text-star-white hover:border-amber-400/30'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-muted-gray'} />
                  <span>{tab.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-space text-star-white/70 px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ASTRODYNAMICS MODELING ACTIVE</span>
          </div>
        </div>

        {/* TAB 1: SOUTH ATLANTIC ANOMALY (SAA) EQUIRECTANGULAR MAP */}
        {activeTab === 'saa' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Map Canvas */}
            <motion.div
              className="lg:col-span-8 glass-panel rounded-3xl p-6 relative border border-glass-border overflow-hidden shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between border-b border-glass-border/70 pb-4 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Globe2 size={18} className="text-amber-400 animate-pulse" />
                  <div>
                    <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                      SOUTH ATLANTIC ANOMALY (SAA) GEOMAGNETIC TRAP
                    </span>
                    <span className="font-space text-[10px] text-muted-gray">
                      INNER PROTON BELT DIVERGENCE // PEAK FLUX: &gt;10⁴ protons/cm²/s (E &gt; 10 MeV)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isInSaa ? (
                    <span className="px-3 py-1 rounded-full bg-alert-critical/20 border border-alert-critical text-alert-critical font-space text-[10px] font-bold animate-pulse flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      <span>{activeSat.name} IN SAA CORE</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-space text-[10px] font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={12} />
                      <span>MAGNETOSPHERE NOMINAL</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Map Canvas */}
              <div className="relative aspect-[16/9] w-full bg-[#030814] rounded-2xl overflow-hidden border border-glass-border/50">
                <svg viewBox="0 0 600 360" className="w-full h-full">
                  <defs>
                    <radialGradient id="saaRadial" cx="35%" cy="65%" r="35%">
                      <stop offset="0%" stopColor="#ff3b3b" stopOpacity={simCmeActive ? '0.85' : '0.60'} />
                      <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.40" />
                      <stop offset="75%" stopColor="#63c7ff" stopOpacity="0.20" />
                      <stop offset="100%" stopColor="#63c7ff" stopOpacity="0.0" />
                    </radialGradient>

                    <linearGradient id="orbitTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#63c7ff" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#63c7ff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#63c7ff" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
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

                  {/* Continent Outlines */}
                  <g fill="rgba(255, 255, 255, 0.05)" stroke="rgba(99, 199, 255, 0.15)" strokeWidth="0.8">
                    <path d="M 80 80 Q 140 60 170 90 Q 150 140 120 160 Q 90 140 80 80 Z" />
                    <path d="M 170 170 Q 210 190 200 280 Q 170 310 160 250 Q 150 200 170 170 Z" />
                    <path d="M 280 80 Q 340 70 350 110 Q 370 160 360 270 Q 320 290 300 240 Q 270 150 280 80 Z" />
                    <path d="M 370 70 Q 480 60 520 120 Q 490 200 420 180 Q 400 140 370 70 Z" />
                    <path d="M 460 230 Q 520 220 530 270 Q 480 290 460 230 Z" />
                  </g>

                  {/* Geomagnetic Dip Equator */}
                  <path
                    d="M 0 170 Q 150 195 300 170 T 600 175"
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.3)"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                  />

                  {/* Auroral Ovals (Expanded during Storms) */}
                  {showAuroralOvals && (
                    <>
                      {/* North Auroral Oval */}
                      <ellipse
                        cx="260"
                        cy="40"
                        rx={simCmeActive ? '130' : '90'}
                        ry={simCmeActive ? '35' : '22'}
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        className="animate-pulse"
                      />
                      {/* South Auroral Oval */}
                      <ellipse
                        cx="300"
                        cy="320"
                        rx={simCmeActive ? '140' : '95'}
                        ry={simCmeActive ? '36' : '24'}
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        className="animate-pulse"
                      />
                    </>
                  )}

                  {/* SAA Trapping Region Contours */}
                  {showContours && (
                    <>
                      <ellipse
                        cx={(((-40 + 180) / 360) * 600)}
                        cy={(((90 - -25) / 180) * 360)}
                        rx={simCmeActive ? '125' : '105'}
                        ry={simCmeActive ? '75' : '65'}
                        fill="url(#saaRadial)"
                        stroke="rgba(255, 59, 59, 0.5)"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                      />
                      <ellipse
                        cx={(((-40 + 180) / 360) * 600)}
                        cy={(((90 - -25) / 180) * 360)}
                        rx="55"
                        ry="32"
                        fill="rgba(255, 59, 59, 0.3)"
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
                        SAA CORE TRAP
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
                    </>
                  )}

                  {/* Satellite Sinusoidal Ground Track */}
                  {showOrbitTrack && (
                    <path
                      d="M 0 120 Q 150 20 300 240 T 600 120"
                      fill="none"
                      stroke="url(#orbitTrackGrad)"
                      strokeWidth="2"
                      strokeDasharray="5,4"
                    />
                  )}

                  {/* Spacecraft Marker */}
                  <g transform={`translate(${mapX}, ${mapY})`}>
                    <circle r="6" fill="#fbbf24" className="animate-pulse" />
                    <circle r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.8" />
                    <text
                      x="14"
                      y="-6"
                      fill="#fbbf24"
                      fontSize="11"
                      fontFamily="'Space Grotesk', sans-serif"
                      fontWeight="bold"
                    >
                      {activeSat.name}
                    </text>
                    <text
                      x="14"
                      y="8"
                      fill="rgba(232, 237, 242, 0.85)"
                      fontSize="9"
                      fontFamily="'Inter', sans-serif"
                    >
                      {satLat.toFixed(1)}°, {satLng.toFixed(1)}° ({activeSat.altitude})
                    </text>
                  </g>
                </svg>

                {/* Overlay Status Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-star-white flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Activity size={12} />
                      <span>SAA TRANSIT:</span>
                    </span>
                    <span className={isInSaa ? 'text-alert-critical font-bold' : 'text-emerald-400 font-bold'}>
                      {isInSaa ? 'CURRENTLY TRANSITING SAA CORE' : 'CLEAR // NEXT INGRESS IN 42m'}
                    </span>
                  </div>

                  {/* Layer Toggles */}
                  <div className="flex items-center gap-1.5 bg-black/70 p-1 rounded-xl border border-white/10 text-[9px] font-space">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowContours(!showContours)}
                      className={`px-2 py-1 rounded-lg cursor-pointer transition-all ${
                        showContours ? 'bg-amber-400/20 text-amber-400 font-bold' : 'text-muted-gray hover:text-white'
                      }`}
                    >
                      SAA Contours
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowAuroralOvals(!showAuroralOvals)}
                      className={`px-2 py-1 rounded-lg cursor-pointer transition-all ${
                        showAuroralOvals ? 'bg-emerald-400/20 text-emerald-400 font-bold' : 'text-muted-gray hover:text-white'
                      }`}
                    >
                      Auroral Ovals
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowOrbitTrack(!showOrbitTrack)}
                      className={`px-2 py-1 rounded-lg cursor-pointer transition-all ${
                        showOrbitTrack ? 'bg-cyan-glow/20 text-cyan-glow font-bold' : 'text-muted-gray hover:text-white'
                      }`}
                    >
                      Ground Track
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Card: Radiation Dosage & Real-time Mitigation */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass-panel rounded-3xl p-6 border border-amber-400/30 box-glow relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                  <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-amber-400">
                    IONIZING DOSAGE // {activeSat.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-space font-bold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    LEO / GEO RAD-HARD
                  </span>
                </div>

                <div className="space-y-3">
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
                    <span className="text-[10px] font-space text-amber-400 font-bold">
                      {radData ? radData.tid_health_pct : 85.2}% TID BUDGET
                    </span>
                  </div>

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
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VAN ALLEN RADIATION BELTS CROSS-SECTION VISUALIZER */}
        {activeTab === 'van-allen' && (
          <motion.div
            className="glass-panel rounded-3xl p-6 border border-glass-border space-y-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between border-b border-glass-border pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Layers size={20} className="text-cyan-glow" />
                <div>
                  <h3 className="font-space text-base font-bold text-star-white tracking-wider">
                    VAN ALLEN RADIATION BELTS &amp; MAGNETOSPHERE CROSS-SECTION
                  </h3>
                  <p className="font-inter text-xs text-muted-gray">
                    Earth's geomagnetic dipole trap: Inner Proton Belt (1k–6k km), Slot Region (6k–12k km), and Outer Relativistic Electron Belt (13k–40k km).
                  </p>
                </div>
              </div>

              {/* Orbit Regime Preset Buttons */}
              <div className="flex items-center gap-2">
                {[
                  { label: 'LEO (500 km)', alt: 500 },
                  { label: 'MEO / GPS (20,200 km)', alt: 20200 },
                  { label: 'GEO (35,786 km)', alt: 35786 },
                  { label: 'L1 Halo (1.5M km)', alt: 1500000 },
                ].map((reg) => (
                  <div
                    role="button"
                    tabIndex={0}
                    key={reg.label}
                    onClick={() => setCustomAltKm(reg.alt)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-space cursor-pointer transition-all ${
                      currentAlt === reg.alt
                        ? 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow font-bold'
                        : 'border-white/10 bg-white/5 text-star-white/70 hover:text-star-white'
                    }`}
                  >
                    {reg.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Van Allen Belt Visualizer SVG Canvas */}
            <div className="relative aspect-[21/9] w-full bg-[#020612] rounded-2xl overflow-hidden border border-glass-border/70 p-4 flex flex-col justify-center items-center">
              <svg viewBox="0 0 900 380" className="w-full h-full">
                <defs>
                  {/* Outer Belt Glow */}
                  <radialGradient id="outerBeltGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </radialGradient>

                  {/* Inner Belt Glow */}
                  <radialGradient id="innerBeltGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.65" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </radialGradient>

                  {/* Earth Gradient */}
                  <radialGradient id="earthGrad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="70%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                </defs>

                {/* Geomagnetic Dipole Field Lines */}
                {[-140, -100, -60, 60, 100, 140].map((deg) => (
                  <path
                    key={deg}
                    d={`M 450 160 C ${450 + deg * 2.8} ${190 - Math.abs(deg) * 1.5}, ${450 + deg * 2.8} ${190 + Math.abs(deg) * 1.5}, 450 220`}
                    fill="none"
                    stroke="rgba(99, 199, 255, 0.25)"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Outer Relativistic Electron Belt (13,000 km to 40,000 km) */}
                <ellipse cx="280" cy="190" rx="140" ry="110" fill="url(#outerBeltGrad)" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" />
                <ellipse cx="620" cy="190" rx="140" ry="110" fill="url(#outerBeltGrad)" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" />

                {/* Safe Slot Region (6,000 km to 12,000 km) */}
                <ellipse cx="370" cy="190" rx="40" ry="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <ellipse cx="530" cy="190" rx="40" ry="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Inner High-Energy Proton Belt (1,000 km to 6,000 km) */}
                <ellipse cx="400" cy="190" rx="35" ry="50" fill="url(#innerBeltGrad)" stroke="#ef4444" strokeWidth="1.5" className="animate-pulse" />
                <ellipse cx="500" cy="190" rx="35" ry="50" fill="url(#innerBeltGrad)" stroke="#ef4444" strokeWidth="1.5" className="animate-pulse" />

                {/* Earth Sphere */}
                <circle cx="450" cy="190" r="32" fill="url(#earthGrad)" stroke="#60a5fa" strokeWidth="1.5" />
                <text x="450" y="194" fill="#ffffff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                  EARTH
                </text>

                {/* Belt Labels */}
                <text x="280" y="70" fill="#a78bfa" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                  OUTER ELECTRON BELT (&gt;2 MeV)
                </text>
                <text x="500" y="115" fill="#f87171" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                  INNER PROTON BELT (&gt;10 MeV)
                </text>

                {/* Spacecraft Altitude Marker Indicator */}
                {(() => {
                  let markerX = 450;
                  if (currentAlt < 1000) markerX = 450 + 38;
                  else if (currentAlt <= 6000) markerX = 450 + 55;
                  else if (currentAlt <= 12000) markerX = 450 + 90;
                  else if (currentAlt <= 40000) markerX = 450 + 170;
                  else markerX = 450 + 340;

                  return (
                    <g transform={`translate(${markerX}, 190)`}>
                      <circle r="7" fill="#fbbf24" className="animate-ping" opacity="0.75" />
                      <circle r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1="0" y1="-8" x2="0" y2="-45" stroke="#fbbf24" strokeWidth="1.5" />
                      <rect x="-80" y="-72" width="160" height="26" rx="6" fill="#090d16" stroke="#fbbf24" strokeWidth="1" />
                      <text x="0" y="-55" fill="#fbbf24" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        {activeSat.name} // {currentAlt.toLocaleString()} km
                      </text>
                    </g>
                  );
                })()}

                {/* Bow Shock Compression Line */}
                <path
                  d={`M ${simCmeActive ? '800' : '860'} 30 C ${simCmeActive ? '720' : '790'} 190, ${simCmeActive ? '720' : '790'} 190, ${simCmeActive ? '800' : '860'} 350`}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
                <text x={simCmeActive ? '725' : '795'} y="40" fill="#fbbf24" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                  BOW SHOCK // {weather.magnetopause_standoff_re || 10.2} R_E
                </text>
              </svg>

              {/* Belt Trapping Details Footer */}
              <div className="w-full mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-space">
                <div className="p-3 rounded-xl bg-black/60 border border-red-500/30">
                  <span className="text-red-400 font-bold block">INNER PROTON BELT</span>
                  <span className="text-[10px] text-star-white/80 mt-0.5 block">1,000 – 6,000 km altitude • Energetic protons &gt;10 MeV</span>
                  <span className="text-[9px] font-mono text-muted-gray mt-1 block">Flux: {weather.van_allen_inner_flux}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-blue-500/30">
                  <span className="text-cyan-glow font-bold block">SLOT REGION (SAFE CORRIDOR)</span>
                  <span className="text-[10px] text-star-white/80 mt-0.5 block">6,000 – 12,000 km altitude • Low particle trapping</span>
                  <span className="text-[9px] font-mono text-emerald-400 mt-1 block">TID Hazard Minimum</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-purple-500/30">
                  <span className="text-purple-400 font-bold block">OUTER ELECTRON BELT</span>
                  <span className="text-[10px] text-star-white/80 mt-0.5 block">13,000 – 40,000 km altitude • Relativistic electrons &gt;2 MeV</span>
                  <span className="text-[9px] font-mono text-muted-gray mt-1 block">Flux: {weather.van_allen_outer_flux}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: 24H NOAA STORM TRENDS & SOLAR FLARES */}
        {activeTab === 'trends' && (
          <motion.div
            className="grid lg:grid-cols-12 gap-8 items-start"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* 24-Hour Kp-Index Histogram */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-glass-border space-y-4">
              <div className="flex items-center justify-between border-b border-glass-border pb-3">
                <div>
                  <h3 className="font-space text-sm font-bold text-star-white tracking-wider flex items-center gap-2">
                    <BarChart3 size={16} className="text-amber-400" />
                    <span>24-HOUR PLANETARY KP-INDEX HISTOGRAM</span>
                  </h3>
                  <span className="font-mono text-[10px] text-muted-gray">NOAA 3-HOUR SYNOPTIC INTERVALS</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 font-mono text-[10px] font-bold">
                  G0–G5 SCALE
                </span>
              </div>

              {/* Bar Histogram */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
                {weather.kp_history_24h?.map((item, idx) => {
                  const heightPct = (item.kp / 9.0) * 100;
                  const isStormBar = item.kp >= 5.0;
                  const isSevereBar = item.kp >= 7.0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-mono text-star-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.kp.toFixed(1)}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isSevereBar
                            ? 'bg-alert-critical shadow-[0_0_12px_rgba(255,59,59,0.7)]'
                            : isStormBar
                            ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                            : 'bg-emerald-400/80 hover:bg-emerald-400'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-muted-gray">{item.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* NOAA Scale Legend */}
              <div className="flex items-center justify-between text-[9px] font-space text-muted-gray pt-3 border-t border-glass-border flex-wrap gap-2">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Kp &lt; 5.0 (Quiet)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Kp 5.0–6.0 (G1 Minor)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Kp 6.0–7.0 (G2 Moderate)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-alert-critical" /> Kp &ge; 7.0 (G3–G5 Storm)</span>
              </div>
            </div>

            {/* Solar Flare Dynamic Spectrum & Flare Feed */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-glass-border space-y-4">
              <div className="border-b border-glass-border pb-3">
                <h3 className="font-space text-sm font-bold text-star-white tracking-wider flex items-center gap-2">
                  <Flame size={16} className="text-amber-400" />
                  <span>GOES SOLAR FLARE DYNAMIC SPECTRUM</span>
                </h3>
                <span className="font-mono text-[10px] text-muted-gray">LOGARITHMIC X-RAY PEAK CLASSIFICATION</span>
              </div>

              {/* Logarithmic Spectrum Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-space font-bold">
                  <span className="text-blue-400">CLASS A</span>
                  <span className="text-cyan-400">CLASS B</span>
                  <span className="text-emerald-400">CLASS C</span>
                  <span className="text-amber-400">CLASS M</span>
                  <span className="text-alert-critical">CLASS X (EXTREME)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-black/60 border border-white/10 relative overflow-hidden flex">
                  <div className="h-full w-1/5 bg-blue-500/40" />
                  <div className="h-full w-1/5 bg-cyan-500/40" />
                  <div className="h-full w-1/5 bg-emerald-500/40" />
                  <div className="h-full w-1/5 bg-amber-500/50" />
                  <div className="h-full w-1/5 bg-alert-critical/60" />
                  {/* Current Flare Marker */}
                  <div
                    style={{ left: `${getFlareProgress(weather.flare_class)}%` }}
                    className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_#ffffff] -translate-x-1"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-muted-gray">
                  <span>10⁻⁸ W/m²</span>
                  <span>10⁻⁷</span>
                  <span>10⁻⁶</span>
                  <span>10⁻⁵</span>
                  <span>&gt;10⁻⁴ W/m²</span>
                </div>
              </div>

              {/* Recent Solar Flare Events Feed */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-space text-muted-gray uppercase font-bold block">
                  RECENT SOLAR FLARE DETECTIONS:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {weather.recent_flares?.map((flr) => (
                    <div
                      key={flr.id}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-space"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-amber-400">{flr.class_type}</span>
                        <span className="text-[9px] font-mono text-muted-gray">{flr.active_region} • {flr.peak_time_utc}</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">{flr.radio_blackout_level.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: SPACECRAFT DOSIMETRY & HARDENING */}
        {activeTab === 'dosimetry' && (
          <motion.div
            className="grid lg:grid-cols-12 gap-8 items-start"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-glass-border space-y-4">
              <div className="border-b border-glass-border pb-3">
                <h3 className="font-space text-sm font-bold text-star-white tracking-wider flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  <span>TOTAL IONIZING DOSE (TID) HEALTH GAUGE</span>
                </h3>
                <span className="font-mono text-[10px] text-muted-gray">MIL-STD-883 RAD-HARDENED RATING: 100 krad(Si)</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-space text-sm text-star-white font-bold">REMAINING RADIATION LIFETIME</span>
                  <span className="font-space text-2xl font-bold text-emerald-400">
                    {radData ? radData.tid_health_pct : 85.2}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${radData ? radData.tid_health_pct : 85.2}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-gray">
                  <span>Accumulated: {radData ? radData.cumulative_dose_krad : 14.82} krad</span>
                  <span>Max Rated Limit: 100.0 krad</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-glass-border space-y-4">
              <div className="border-b border-glass-border pb-3">
                <h3 className="font-space text-sm font-bold text-star-white tracking-wider flex items-center gap-2">
                  <Cpu size={16} className="text-cyan-glow" />
                  <span>SINGLE EVENT EFFECTS (SEE) &amp; EDAC SCRUBBING</span>
                </h3>
                <span className="font-mono text-[10px] text-muted-gray">TRIPLE MODULAR REDUNDANCY (TMR) ARCHITECTURE</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-space">
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] text-muted-gray uppercase">EDAC SCRUB RATE</span>
                  <span className="font-space text-lg font-bold text-cyan-glow mt-1">
                    {radData?.edac_scrub_rate_hz || 4.8} Hz (ACTIVE)
                  </span>
                  <span className="text-[9px] text-emerald-400 mt-1">0 Uncorrected Faults</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] text-muted-gray uppercase">ORBIT REGIME HAZARD</span>
                  <span className="font-space text-sm font-bold text-amber-400 mt-1 truncate">
                    {radData?.van_allen_region?.split('(')[0] || 'LEO Under-Belt'}
                  </span>
                  <span className="text-[9px] text-star-white/60 mt-1">Shielding: 2.5mm Al eq.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
