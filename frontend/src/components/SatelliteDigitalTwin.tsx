'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Orbit,
  Calendar,
  ShieldAlert,
  FileText,
  Settings,
  Bell,
  Maximize2,
  CheckCircle2,
  Wifi,
  Compass,
  Radio,
  Clock,
  Zap,
  Thermometer,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Satellite as SatelliteIcon,
  ChevronRight,
  Download,
  AlertTriangle,
  Flame,
  Check,
  Cpu,
  Globe,
  Crosshair,
  Camera,
} from 'lucide-react';

import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function SatelliteDigitalTwin() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry, alerts, ackAlert } = useMission();

  const [utcTime, setUtcTime] = useState('2026-08-28 12:45:30 UTC');
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Telemetry' | 'Orbits' | 'Events' | 'Alerts' | 'Reports' | 'Settings'>('Dashboard');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [tick, setTick] = useState(0);

  const selectedSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Merge live telemetry pulse if primary satellite selected
  const activeSat: SatelliteFleetDefinition =
    selectedSat.id === 'SENTINEL-6A'
      ? {
          ...selectedSat,
          batteryVoltage: liveTelemetry.battery_voltage || selectedSat.batteryVoltage,
          solarPower: liveTelemetry.solar_power || selectedSat.solarPower,
          temp: liveTelemetry.temp || selectedSat.temp,
          lat: liveTelemetry.lat || selectedSat.lat,
          lng: liveTelemetry.lng || selectedSat.lng,
          roll: liveTelemetry.roll || selectedSat.roll,
          pitch: liveTelemetry.pitch || selectedSat.pitch,
          yaw: liveTelemetry.yaw || selectedSat.yaw,
          health: liveTelemetry.health ?? selectedSat.health,
        }
      : selectedSat;

  // Real-time 50Hz telemetry oscillation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 100000);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Live UTC clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const iso = d.toISOString().replace('T', ' ').substring(0, 19);
      setUtcTime(`${iso} UTC`);
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Derived live telemetry dynamics
  const t = tick * 0.08;
  const baseRoll = parseFloat(activeSat.roll.replace('°', '')) || 0;
  const basePitch = parseFloat(activeSat.pitch.replace('°', '')) || 0;
  const baseYaw = parseFloat(activeSat.yaw.replace('°', '')) || 0;
  const baseVolt = parseFloat(activeSat.batteryVoltage.replace(' V', '')) || 28.4;
  const basePower = parseFloat(activeSat.solarPower.replace(' kW', '')) || 1.82;
  const baseTemp = parseFloat(activeSat.temp.replace(' °C', '')) || 22.6;
  const baseAltKm = activeSat.altitudeKm || 1336;

  const liveRollNum = baseRoll + Math.sin(t * 1.5) * 0.06 + Math.cos(t * 3.1) * 0.02;
  const livePitchNum = basePitch + Math.cos(t * 1.2) * 0.05 + Math.sin(t * 2.7) * 0.02;
  const liveYawNum = baseYaw + Math.sin(t * 0.8) * 0.07;
  const liveAltitudeNum = baseAltKm + Math.sin(t * 0.2) * 0.6;
  const liveJitterNum = 0.005 + Math.abs(Math.sin(t * 2.5)) * 0.003;

  const liveVoltNum = baseVolt + Math.sin(t * 1.1) * 0.08 + Math.cos(t * 2.2) * 0.03;
  const livePowerNum = basePower + Math.sin(t * 0.7) * 0.04;
  const liveTempNum = baseTemp + Math.sin(t * 0.4) * 0.2;

  // Real-time dynamic sine wave path generator
  const generateLiveWavePath = (phase: number, freq: number, amp: number, baselineY: number = 15) => {
    let path = `M 0 ${(baselineY + Math.sin(phase) * amp).toFixed(1)}`;
    for (let x = 10; x <= 200; x += 10) {
      const y = baselineY + Math.sin(x * freq + phase) * amp;
      path += ` L ${x} ${y.toFixed(1)}`;
    }
    return path;
  };

  const voltWavePath = generateLiveWavePath(t * 1.8, 0.045, 6, 15);
  const powerWavePath = generateLiveWavePath(t * 1.4, 0.038, 7, 18);
  const tempWavePath = generateLiveWavePath(t * 0.9, 0.028, 5, 14);

  const satelliteAlerts = alerts.filter(
    (a) => a.asset.includes(activeSat.id) || a.asset.includes(activeSat.code) || activeSat.id === 'SENTINEL-6A'
  );

  return (
    <section id="satellite-inspector" className="section-spacing relative overflow-hidden py-16 md:py-24 w-full" ref={containerRef}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-glow/25 bg-space-navy/70 mb-3.5 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <Radio size={14} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-xs tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Fleet Telemetry &amp; Orbital Digital Twin
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-star-white">
            PRIMARY MISSION CONTROL
          </h2>
          <p className="font-inter text-xs md:text-sm text-star-white/60 mt-2.5 max-w-2xl mx-auto font-light leading-relaxed">
            Multi-satellite fleet command deck. Select any active constellation asset below to inspect its unique 3D digital twin model, live real-time attitude orientation, and streaming telemetry waveforms.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE FLEET SELECTOR BAR */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === activeSat.id;
              return (
                <div role="button" tabIndex={0} key={sat.id}
                  
                  
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-4 py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow shadow-[0_0_25px_rgba(99,199,255,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/50 border-cyan-glow/15 hover:border-cyan-glow/35 hover:bg-space-navy/80'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-black/40 border border-cyan-glow/20">
                    <SatelliteIcon size={16} className={isSelected ? 'text-cyan-glow' : 'text-star-white/60'} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-space text-xs font-bold text-star-white">{sat.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${sat.status === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </div>
                    <span className="font-inter text-[10px] text-star-white/50">{sat.altitude} • {sat.health}% Health</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* MAIN DASHBOARD FRAME */}
        <motion.div
          className="rounded-3xl border border-cyan-glow/25 bg-[#060c14]/95 shadow-[0_0_80px_rgba(4,18,34,0.95)] overflow-hidden backdrop-blur-2xl w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* 1. TOP HEADER BAR */}
          <div className="px-5 py-4 border-b border-cyan-glow/15 bg-space-navy/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/35 text-cyan-glow shadow-[0_0_15px_rgba(99,199,255,0.25)]">
                <Orbit size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-space text-base md:text-lg font-bold text-star-white tracking-wider">
                    {activeSat.name}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-space tracking-wider border font-semibold ${
                    activeSat.status === 'OPERATIONAL'
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${activeSat.status === 'OPERATIONAL' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {activeSat.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-space tracking-wider bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-bold uppercase">
                    CONSTELLATION LEO // {activeSat.orbitType}
                  </span>
                </div>
                <span className="font-space text-[10px] md:text-xs text-cyan-glow/80 tracking-widest uppercase block font-medium mt-0.5">
                  {activeSat.type.toUpperCase()} • PRIMARY MISSION CONTROL DECK
                </span>
              </div>
            </div>

            {/* Top Right Controls & Navigation Tabs */}
            <div className="flex items-center gap-3 text-xs font-space flex-wrap">
              {/* Integrated Horizontal Navigation Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-cyan-glow/20">
                {[
                  { name: 'Dashboard', icon: LayoutDashboard },
                  { name: 'Telemetry', icon: Activity },
                  { name: 'Orbits', icon: Orbit },
                  { name: 'Events', icon: Calendar },
                  { name: 'Alerts', icon: ShieldAlert },
                  { name: 'Reports', icon: FileText },
                  { name: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.name;
                  return (
                    <div role="button" tabIndex={0} key={item.name}
                      onClick={() => setActiveTab(item.name as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-space transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-glow/20 border border-cyan-glow/50 text-cyan-glow font-bold shadow-[0_0_12px_rgba(99,199,255,0.3)]'
                          : 'text-star-white/60 hover:text-star-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{item.name}</span>
                    </div>
                  );
                })}
              </div>

              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-glow/20 bg-black/50 text-star-white/90 font-medium">
                <Clock size={14} className="text-cyan-glow" />
                <span className="tracking-wider">{utcTime}</span>
              </div>
            </div>
          </div>

          {/* 2. MAIN DASHBOARD BODY (3-COLUMN LAYOUT) */}
          {activeTab === 'Dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 w-full">
              {/* LEFT HUD PANELS (3 cols) */}
              <div className="lg:col-span-3 border-r border-cyan-glow/10 bg-[#050b12]/80 p-4 md:p-5 space-y-4">
                {/* SATELLITE STATUS CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold">
                      SATELLITE STATUS
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-space bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {activeSat.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-space">
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Satellite ID</span>
                      <span className="text-star-white font-bold">{activeSat.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Mission</span>
                      <span className="text-star-white font-medium truncate max-w-[140px]">{activeSat.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Launch Date</span>
                      <span className="text-star-white/80 font-medium">{activeSat.launchDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Orbital Regime</span>
                      <span className="text-cyan-glow font-semibold">{activeSat.orbitType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Altitude</span>
                      <span className="text-star-white font-bold">{liveAltitudeNum.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Inclination</span>
                      <span className="text-star-white font-bold">{activeSat.inclination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Velocity</span>
                      <span className="text-star-white font-bold">{activeSat.velocity}</span>
                    </div>
                  </div>
                </div>

                {/* SYSTEM HEALTH CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold">
                      SYSTEM HEALTH
                    </span>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(99,199,255,0.12)" strokeWidth="7" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={activeSat.health > 95 ? '#10b981' : '#f59e0b'}
                          strokeWidth="7"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 * (1 - activeSat.health / 100)}
                          strokeLinecap="round"
                          fill="none"
                          className="filter drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-space text-2xl font-bold text-star-white">{activeSat.health}%</span>
                        <span className={`font-space text-[10px] uppercase tracking-widest font-bold ${activeSat.health > 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {activeSat.health > 95 ? 'HEALTHY' : 'DEGRADED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-space">
                    {[
                      { label: 'Power System', status: `${liveVoltNum.toFixed(1)} V` },
                      { label: 'Thermal System', status: `${liveTempNum.toFixed(1)} °C` },
                      { label: 'Communication', status: activeSat.signal },
                      { label: 'Attitude Control', status: 'LOCKED' },
                      { label: 'Payload System', status: 'ACTIVE' },
                    ].map((sub) => (
                      <div key={sub.label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                        <span className="text-star-white/70 font-medium">{sub.label}</span>
                        <span className="text-cyan-glow font-bold text-[11px]">
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER 3D HOLOGRAPHIC CAD VIEWPORT (UNIQUE MODEL FOR EACH SATELLITE) */}
              <div className="lg:col-span-6 p-4 md:p-6 flex flex-col justify-between relative bg-black/90 min-h-[540px]">
                {/* Top Viewport HUD Overlay */}
                <div className="flex items-center justify-between z-20 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg text-xs font-space tracking-wider uppercase bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow font-bold">
                      3D DIGITAL TWIN • {activeSat.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-space bg-space-navy/80 border border-glass-border text-emerald-400 font-bold">
                      CONSTELLATION LEO
                    </span>
                    <span className="text-xs font-space text-star-white/70 font-bold">{liveAltitudeNum.toFixed(1)} km</span>
                  </div>

                  {/* Compass Heading Reticle (Live Animated) */}
                  <div className="relative w-10 h-10 rounded-full border border-cyan-glow/30 flex items-center justify-center bg-black/60 shadow-[0_0_12px_rgba(99,199,255,0.2)]">
                    <Compass
                      size={20}
                      className="text-cyan-glow transition-transform duration-300"
                      style={{ transform: `rotate(${(tick * 2) % 360}deg)` }}
                    />
                    <span className="absolute -top-1 text-[8px] font-bold text-red-400">N</span>
                  </div>
                </div>

                {/* 3D Holographic Rendering Canvas with Scroll-to-Zoom */}
                <div
                  className="relative w-full h-[400px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#030712] my-2 border border-cyan-glow/30 shadow-[inset_0_0_40px_rgba(99,199,255,0.15)] group cursor-crosshair select-none"
                  onWheel={(e) => {
                    e.preventDefault();
                    setZoomLevel((z) => Number(Math.min(2.5, Math.max(0.6, z + (e.deltaY < 0 ? 0.15 : -0.15))).toFixed(2)));
                  }}
                >
                  {/* Cyber Hologram Radial Aura & Scanline Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,199,255,0.25)_0%,rgba(3,7,18,0.95)_75%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,212,255,0.04)_51%)] bg-[length:100%_4px] pointer-events-none" />

                  {/* Animated Concentric Radar & Constellation Range Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[280px] h-[280px] rounded-full border border-cyan-glow/20 border-dashed animate-spin" style={{ animationDuration: '50s' }} />
                    <div className="w-[380px] h-[380px] rounded-full border border-cyan-glow/15 border-dashed animate-spin" style={{ animationDuration: '80s', animationDirection: 'reverse' }} />
                    <div className="w-[460px] h-[460px] rounded-full border border-cyan-glow/10 border-dotted" />
                  </div>

                  {/* High-Resolution Unique Satellite Hologram Model */}
                  <div
                    className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={activeSat.image || '/images/satellites/sentinel6a.jpg'}
                      alt={`${activeSat.name} 3D Digital Twin`}
                      className="max-h-[340px] w-auto max-w-[90%] object-contain filter drop-shadow-[0_0_35px_rgba(99,199,255,0.6)] select-none pointer-events-none"
                    />

                    {/* Interactive Subsystem Telemetry Pins (Live Values) */}
                    {/* Solar Array Left Pin */}
                    <div className="absolute top-[28%] left-[20%] z-30 pointer-events-auto cursor-pointer group">
                      <div className="w-3.5 h-3.5 rounded-full border border-cyan-glow bg-cyan-glow relative shadow-[0_0_10px_#63c7ff] animate-pulse" />
                      <div className="absolute -top-7 -left-10 px-2 py-0.5 rounded bg-black/85 border border-cyan-glow/40 text-[9px] font-space text-cyan-glow whitespace-nowrap shadow-md">
                        GaAs Solar: {livePowerNum.toFixed(2)} kW
                      </div>
                    </div>

                    {/* TT&C Reflector Antenna Right Pin */}
                    <div className="absolute top-[30%] right-[22%] z-30 pointer-events-auto cursor-pointer group">
                      <div className="w-3.5 h-3.5 rounded-full border border-emerald-400 bg-emerald-400 relative shadow-[0_0_10px_#10b981] animate-pulse" />
                      <div className="absolute -top-7 -right-6 px-2 py-0.5 rounded bg-black/85 border border-emerald-400/40 text-[9px] font-space text-emerald-400 whitespace-nowrap shadow-md">
                        TT&amp;C Link ({activeSat.signal})
                      </div>
                    </div>

                    {/* Primary Payload Lens Pin */}
                    <div className="absolute bottom-[32%] left-[46%] z-30 pointer-events-auto cursor-pointer group">
                      <div className="w-3.5 h-3.5 rounded-full border border-amber-400 bg-amber-400 relative shadow-[0_0_10px_#f59e0b] animate-pulse" />
                      <div className="absolute -bottom-7 -left-8 px-2 py-0.5 rounded bg-black/85 border border-amber-400/40 text-[9px] font-space text-amber-400 whitespace-nowrap shadow-md">
                        Payload Radar // Active
                      </div>
                    </div>

                    {/* Power Storage Battery Bay Pin */}
                    <div className="absolute top-[48%] left-[48%] z-30 pointer-events-auto cursor-pointer group">
                      <div className="w-3.5 h-3.5 rounded-full border border-cyan-glow bg-cyan-glow relative shadow-[0_0_10px_#00d4ff]" />
                      <div className="absolute -top-7 -left-6 px-2 py-0.5 rounded bg-black/85 border border-cyan-glow/40 text-[9px] font-space text-cyan-glow whitespace-nowrap shadow-md">
                        EPS Bus: {liveVoltNum.toFixed(2)} V
                      </div>
                    </div>
                  </div>

                  {/* Corner HUD Telemetry Overlays */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 border border-cyan-glow/20 text-[10px] font-space text-cyan-glow pointer-events-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>TRACK: SGP4 // 50 Hz LIVE</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 border border-cyan-glow/20 text-[10px] font-space text-emerald-400 pointer-events-none">
                    CARRIER: LOCKED
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 border border-cyan-glow/20 text-[10px] font-space text-star-white/70 pointer-events-none">
                    VEL: {activeSat.velocity}
                  </div>

                  {/* Mode Indicator Overlay */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/80 border border-cyan-glow/30 flex items-center gap-2 text-[10px] font-space text-cyan-glow font-bold">
                    <span>MODE: HOLOGRAPHIC CAD</span>
                  </div>
                </div>

                {/* Interactive Subsystem Probes & Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-cyan-glow/10 z-20 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <div role="button" tabIndex={0} onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-2 rounded-xl bg-space-navy/80 border border-cyan-glow/20 hover:border-cyan-glow/50 text-cyan-glow transition-all cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={16} />
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                      className="p-2 rounded-xl bg-space-navy/80 border border-cyan-glow/20 hover:border-cyan-glow/50 text-cyan-glow transition-all cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={16} />
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setZoomLevel(1.0)}
                      className="px-3 py-1.5 rounded-xl bg-space-navy/80 border border-cyan-glow/20 hover:border-cyan-glow/50 text-star-white/80 hover:text-star-white font-space text-xs transition-all cursor-pointer"
                    >
                      Reset View
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-space text-star-white/60">MAG: {zoomLevel.toFixed(1)}x</span>
                  </div>
                </div>
              </div>

              {/* RIGHT HUD PANELS (3 cols) */}
              <div className="lg:col-span-3 border-l border-cyan-glow/10 bg-[#050b12]/80 p-4 md:p-5 space-y-4">
                {/* OBJECT TELEMETRY CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block">
                      OBJECT TELEMETRY
                    </span>
                    <h4 className="font-space text-sm font-bold text-star-white mt-1">
                      {activeSat.name}
                    </h4>
                  </div>

                  <div className="space-y-2.5 text-xs font-space">
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Type</span>
                      <span className="text-star-white font-medium truncate max-w-[140px]">{activeSat.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Distance</span>
                      <span className="text-star-white font-bold">{liveAltitudeNum.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Inclination</span>
                      <span className="text-star-white font-bold">{activeSat.inclination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Latitude</span>
                      <span className="text-cyan-glow font-semibold">{activeSat.lat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Longitude</span>
                      <span className="text-cyan-glow font-semibold">{activeSat.lng}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-cyan-glow/10">
                    <span className="font-space text-[10px] text-star-white/50 uppercase tracking-widest block mb-1">
                      OPERATIONAL STATUS
                    </span>
                    <span className="font-space text-xs text-emerald-400 font-bold block">
                      ● {activeSat.status}
                    </span>
                    <span className="font-inter text-[11px] text-star-white/50 block">
                      Subsystem telemetry locked
                    </span>
                  </div>
                </div>

                {/* TRACKING INFO CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold">
                      TRACKING INFO
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-space">
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Ground Station</span>
                      <span className="text-star-white font-medium">{activeSat.groundStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Signal Strength</span>
                      <span className="text-emerald-400 font-bold">{activeSat.signal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Last Contact</span>
                      <span className="text-star-white/80 font-medium">12:45:12 UTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-star-white/50">Next Pass</span>
                      <span className="text-cyan-glow font-semibold">13:12:45 UTC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-cyan-glow/10 text-center">
                    <div className="p-2.5 rounded-xl bg-black/50 border border-cyan-glow/20">
                      <span className="font-space text-[10px] text-star-white/60 uppercase block font-semibold">TRACKED</span>
                      <span className="font-space text-xl font-bold text-cyan-glow">{activeSat.trackedObjects}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-alert-critical/30">
                      <span className="font-space text-[10px] text-alert-critical uppercase block font-semibold">ALERTS</span>
                      <span className="font-space text-xl font-bold text-alert-critical">{activeSat.activeAlerts}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DEDICATED SECONDARY VIEWPORTS */
            <div className="p-6 md:p-8 space-y-6 min-h-[500px] w-full">
              {activeTab === 'Telemetry' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4">
                    <div>
                      <h4 className="font-space text-lg font-bold text-star-white">
                        LIVE TELEMETRY STREAM DIAGNOSTICS // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-muted-gray">
                        Direct 50 Hz sensor ingestion from {activeSat.groundStation} via TimescaleDB Hypertable
                      </p>
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-cyan-glow/20 space-y-2">
                      <div className="flex justify-between font-space text-xs">
                        <span className="text-muted-gray">Power Bus (28V)</span>
                        <span className="text-cyan-glow font-bold">{liveVoltNum.toFixed(2)} V</span>
                      </div>
                      <svg className="w-full h-12" viewBox="0 0 200 30">
                        <path d={voltWavePath} fill="none" stroke="#00d4ff" strokeWidth="2.5" />
                      </svg>
                      <span className="text-[10px] text-muted-gray font-inter block">Variance: ±0.04V (Optimal Nominal)</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-cyan-glow/20 space-y-2">
                      <div className="flex justify-between font-space text-xs">
                        <span className="text-muted-gray">Solar Generation</span>
                        <span className="text-emerald-400 font-bold">{livePowerNum.toFixed(2)} kW</span>
                      </div>
                      <svg className="w-full h-12" viewBox="0 0 200 30">
                        <path d={powerWavePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                      </svg>
                      <span className="text-[10px] text-muted-gray font-inter block">Multi-junction GaAs solar efficiency 98.4%</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-cyan-glow/20 space-y-2">
                      <div className="flex justify-between font-space text-xs">
                        <span className="text-muted-gray">Thermodynamic Temp</span>
                        <span className="text-amber-400 font-bold">{liveTempNum.toFixed(1)} °C</span>
                      </div>
                      <svg className="w-full h-12" viewBox="0 0 200 30">
                        <path d={tempWavePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                      </svg>
                      <span className="text-[10px] text-muted-gray font-inter block">Radiator louvers active at optimal angle</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Orbits' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4">
                    <div>
                      <h4 className="font-space text-lg font-bold text-star-white">
                        SGP4 ORBITAL EPHEMERIS &amp; TRAJECTORY // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-muted-gray">
                        NORAD Two-Line Element (TLE) ephemeris propagation and ground track calculation
                      </p>
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-space">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-muted-gray text-[10px] uppercase block">Orbital Regime</span>
                      <span className="text-star-white font-bold text-sm mt-1 block">{activeSat.orbitType}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-muted-gray text-[10px] uppercase block">Mean Altitude</span>
                      <span className="text-cyan-glow font-bold text-sm mt-1 block">{liveAltitudeNum.toFixed(1)} km</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-muted-gray text-[10px] uppercase block">Orbital Inclination</span>
                      <span className="text-star-white font-bold text-sm mt-1 block">{activeSat.inclination}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-muted-gray text-[10px] uppercase block">Orbital Velocity</span>
                      <span className="text-emerald-400 font-bold text-sm mt-1 block">{activeSat.velocity}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4">
                    <div>
                      <h4 className="font-space text-lg font-bold text-star-white">
                        MISSION EVENT LOG &amp; MANEUVER TIMELINE // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-muted-gray">
                        Historical and scheduled orbital events, delta-V burns, and payload operation cycles
                      </p>
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { time: '14:38:12 UTC', type: 'AUTONOMOUS MITIGATION', desc: 'Battery Bay 3 Shunt Regulator auto-activated in response to thermal elevation', status: 'EXECUTED', color: '#ff3b3b' },
                      { time: '12:04:18 UTC', type: 'GROUND HANDOFF', desc: `Telemetry tracking established with ${activeSat.groundStation}`, status: 'SUCCESS', color: '#10b981' },
                      { time: '08:15:00 UTC', type: 'ORBIT PROPAGATION', desc: 'SGP4 orbital state vector refreshed from Space-Track TLE catalogue', status: 'SYNCHRONIZED', color: '#00d4ff' },
                      { time: '04:30:00 UTC', type: 'ECLIPSE INGRESS', desc: 'Spacecraft entered umbral shadow, battery discharge curve initiated', status: 'NOMINAL', color: '#f59e0b' },
                    ].map((ev, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ev.color }} />
                          <div>
                            <span className="font-space text-xs font-bold text-star-white block">{ev.type}</span>
                            <span className="font-inter text-xs text-muted-gray">{ev.desc}</span>
                          </div>
                        </div>
                        <span className="font-space text-xs text-star-white/80">{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Alerts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4">
                    <div>
                      <h4 className="font-space text-lg font-bold text-star-white">
                        ACTIVE SUBSYSTEM ALERTS // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-muted-gray">
                        Active critical and elevated telemetry deviations requiring operator attention
                      </p>
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="space-y-3">
                    {satelliteAlerts.length > 0 ? (
                      satelliteAlerts.map((alt) => (
                        <div key={alt.id} className="p-4 rounded-2xl bg-[#140507]/90 border border-alert-critical/40 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-space font-bold uppercase bg-alert-critical/20 text-alert-critical border border-alert-critical/30">
                              {alt.severity} • {alt.id}
                            </span>
                            <span className="font-space text-xs text-muted-gray">{alt.timestamp}</span>
                          </div>
                          <h5 className="font-space text-sm font-bold text-star-white">{alt.title}</h5>
                          <p className="font-inter text-xs text-star-white/80">{alt.description}</p>
                          <div className="flex justify-end pt-1">
                            {alt.acknowledged ? (
                              <span className="text-xs font-space text-cyan-glow flex items-center gap-1 font-bold">
                                <CheckCircle2 size={14} /> ACKNOWLEDGED
                              </span>
                            ) : (
                              <div role="button" tabIndex={0} onClick={() => ackAlert(alt.id, 'Commander Vance')}
                                className="px-4 py-1.5 rounded-xl bg-alert-critical/30 border border-alert-critical text-alert-critical hover:bg-alert-critical/40 text-xs font-space font-bold uppercase cursor-pointer"
                              >
                                Acknowledge Threat
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 rounded-2xl bg-space-navy/30 border border-glass-border text-center space-y-2">
                        <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
                        <h5 className="font-space text-sm font-bold text-star-white">ALL SYSTEMS NOMINAL</h5>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Reports' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4">
                    <div>
                      <h4 className="font-space text-lg font-bold text-star-white">
                        MISSION READINESS &amp; HEALTH REPORT // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-muted-gray">
                        Consolidated engineering audit and power/thermal margin certification
                      </p>
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-2">
                      <span className="font-space text-[10px] text-muted-gray uppercase block font-semibold">OVERALL HEALTH SCORE</span>
                      <span className="font-space text-2xl font-bold text-emerald-400">{activeSat.health} / 100</span>
                      <p className="font-inter text-[11px] text-muted-gray">Meets all primary mission operational margins</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-2">
                      <span className="font-space text-[10px] text-muted-gray uppercase block font-semibold">THERMAL STABILITY MARGIN</span>
                      <span className="font-space text-2xl font-bold text-cyan-glow">+8.4°C Reserve</span>
                      <p className="font-inter text-[11px] text-muted-gray">Radiator louvers operational at optimal duty cycle</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-2">
                      <span className="font-space text-[10px] text-muted-gray uppercase block font-semibold">ORBITAL CONJUNCTION INDEX</span>
                      <span className="font-space text-2xl font-bold text-amber-400">Pc 1.84e-4</span>
                      <p className="font-inter text-[11px] text-muted-gray">Evasion delta-V burn pre-calculated</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4">
                    <div>
                      <h4 className="font-space text-lg font-bold text-star-white">
                        MISSION CONTROL CONFIGURATION // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-muted-gray">
                        Telemetry sampling frequency, TimescaleDB retention, and SGP4 propagation tolerances
                      </p>
                    </div>
                    <div role="button" tabIndex={0} onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-space">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-3">
                      <span className="font-space text-xs font-bold text-cyan-glow uppercase block">
                        TELEMETRY INGESTION FREQUENCY
                      </span>
                      <div className="flex items-center gap-2">
                        {['1 Hz', '10 Hz', '50 Hz (Live)'].map((freq, i) => (
                          <div role="button" tabIndex={0} key={freq}
                            className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                              i === 2 ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold' : 'bg-black/40 border-glass-border text-muted-gray'
                            }`}>
                            {freq}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-3">
                      <span className="font-space text-xs font-bold text-cyan-glow uppercase block">
                        TIMESCALE HYPERTABLE RETENTION
                      </span>
                      <div className="flex items-center gap-2">
                        {['30 Days', '90 Days', '365 Days (Full)'].map((ret, i) => (
                          <div role="button" tabIndex={0} key={ret}
                            className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                              i === 2 ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold' : 'bg-black/40 border-glass-border text-muted-gray'
                            }`}>
                            {ret}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. BOTTOM TELEMETRY GRID (LIVE & DYNAMIC) */}
          <div className="border-t border-cyan-glow/15 bg-[#04080e]/95 p-4 md:p-6 space-y-5 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* ORBIT OVERVIEW (LIVE ORBITING GLOBE) */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block mb-1">
                      ORBIT OVERVIEW
                    </span>
                    <span className="font-space text-xs text-star-white/80 font-medium">{activeSat.orbitType}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="relative aspect-[4/3] w-full flex items-center justify-center my-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-900 via-blue-600 to-cyan-400 shadow-[0_0_25px_rgba(99,199,255,0.4)] relative">
                    {/* Rotating Orbit Path */}
                    <div
                      className="absolute inset-0 -m-4 rounded-full border border-dashed border-cyan-glow/60 transform"
                      style={{ transform: `rotate(${((tick * 1.5) % 360)}deg)` }}
                    >
                      {/* Orbiting Satellite Marker */}
                      <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#63c7ff]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-space text-star-white/60 font-medium">
                  <span>ALT: {liveAltitudeNum.toFixed(1)} km</span>
                  <span className="text-cyan-glow font-bold">LIVE EPHEMERIS</span>
                </div>
              </div>

              {/* TELEMETRY FEED WAVEFORMS (LIVE MOVING CONTINUOUS CURVES) */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block">
                    TELEMETRY FEED
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-space text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE 50Hz
                  </span>
                </div>

                {/* Battery Voltage */}
                <div>
                  <div className="flex justify-between text-xs font-space">
                    <span className="text-star-white/60">Battery Voltage</span>
                    <span className="text-cyan-glow font-bold">{liveVoltNum.toFixed(2)} V</span>
                  </div>
                  <svg className="w-full h-8 mt-1" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <path d={voltWavePath} fill="none" stroke={activeSat.waveColor || '#00d4ff'} strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Solar Array Power */}
                <div>
                  <div className="flex justify-between text-xs font-space">
                    <span className="text-star-white/60">Solar Array Power</span>
                    <span className="text-emerald-400 font-bold">{livePowerNum.toFixed(2)} kW</span>
                  </div>
                  <svg className="w-full h-8 mt-1" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <path d={powerWavePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Onboard Temp */}
                <div>
                  <div className="flex justify-between text-xs font-space">
                    <span className="text-star-white/60">Onboard Temp.</span>
                    <span className="text-amber-400 font-bold">{liveTempNum.toFixed(1)} °C</span>
                  </div>
                  <svg className="w-full h-8 mt-1" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <path d={tempWavePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* ATTITUDE & ORIENTATION (LIVE ROTATING DIALS & JITTER) */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block mb-1">
                      ATTITUDE &amp; ORIENTATION
                    </span>
                    <span className="font-space text-[10px] text-star-white/50 block">R-P-Y STABILIZATION MATRIX</span>
                  </div>
                  <span className="text-[9px] font-space text-cyan-glow font-bold bg-cyan-glow/10 px-2 py-0.5 rounded border border-cyan-glow/20">
                    AOCS
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-2 text-center">
                  {[
                    { axis: 'ROLL', deg: `${liveRollNum >= 0 ? '+' : ''}${liveRollNum.toFixed(2)}°`, raw: liveRollNum, color: '#00d4ff' },
                    { axis: 'PITCH', deg: `${livePitchNum >= 0 ? '+' : ''}${livePitchNum.toFixed(2)}°`, raw: livePitchNum, color: '#10b981' },
                    { axis: 'YAW', deg: `${liveYawNum >= 0 ? '+' : ''}${liveYawNum.toFixed(2)}°`, raw: liveYawNum, color: '#f59e0b' },
                  ].map((att) => (
                    <div key={att.axis} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border border-dashed border-cyan-glow/40 flex items-center justify-center relative my-1 transition-transform duration-200">
                        {/* Live needle indicator */}
                        <div
                          className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-100"
                          style={{ transform: `rotate(${(att.raw * 25).toFixed(1)}deg)` }}
                        >
                          <div
                            className="w-2 h-2 rounded-full absolute -top-1 shadow-[0_0_8px_currentColor]"
                            style={{ backgroundColor: att.color, color: att.color }}
                          />
                        </div>
                        <span className="font-space text-[11px] font-bold text-star-white relative z-10">{att.deg}</span>
                      </div>
                      <span className="font-space text-[10px] text-star-white/60 font-semibold">{att.axis}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-space pt-2 border-t border-white/5">
                  <span className="text-star-white/50">Pointing Jitter</span>
                  <span className="text-emerald-400 font-semibold">{liveJitterNum.toFixed(4)}° / s (Live)</span>
                </div>
              </div>

              {/* SUBSYSTEM CONSUMPTION */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 space-y-3">
                <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block">
                  SUBSYSTEM CONSUMPTION
                </span>

                <div className="space-y-2 text-xs font-space">
                  {[
                    { label: 'Payload Instruments', pct: 65, color: '#00d4ff' },
                    { label: 'Comms / TT&C Bus', pct: 20, color: '#10b981' },
                    { label: 'Thermal Loops', pct: 10, color: '#f59e0b' },
                    { label: 'AOCS Actuators', pct: 5, color: '#a855f7' },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-star-white/70">{c.label}</span>
                        <span className="text-star-white/90 font-bold">{c.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
