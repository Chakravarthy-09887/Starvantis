'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LayoutDashboard,
  Radio,
  Activity,
  ShieldAlert,
  Cpu,
  Orbit,
  Sparkles,
  ArrowRight,
  Satellite,
  CheckCircle2,
  Crosshair,
  Wifi,
  Clock,
  Radar,
  Zap,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';

export default function MissionControlPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry, formatMissionTime, currentClock, timezone } = useMission();
  const [radarStep, setRadarStep] = useState(0);
  const [currentEpochMs, setCurrentEpochMs] = useState<number>(Date.now());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentEpochMs(Date.now());
    }, 1000);

    const animInterval = setInterval(() => {
      setRadarStep((s) => s + 1);
    }, 40);

    return () => {
      clearInterval(clockInterval);
      clearInterval(animInterval);
    };
  }, []);

  const selectedSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Merge live high-fidelity telemetry pulse
  const activeSat: SatelliteFleetDefinition = {
    ...selectedSat,
    batteryVoltage: liveTelemetry.battery_voltage || selectedSat.batteryVoltage,
    solarPower: liveTelemetry.solar_power || selectedSat.solarPower,
    temp: liveTelemetry.temp || selectedSat.temp,
    lat: liveTelemetry.lat || selectedSat.lat,
    lng: liveTelemetry.lng || selectedSat.lng,
    altitude: selectedSat.altitude,
    velocity: liveTelemetry.velocity || selectedSat.velocity,
    roll: liveTelemetry.roll || selectedSat.roll,
    pitch: liveTelemetry.pitch || selectedSat.pitch,
    yaw: liveTelemetry.yaw || selectedSat.yaw,
    health: liveTelemetry.health ?? selectedSat.health,
  };

  // Dynamic moving coordinates for satellite & uncooperative debris in radar
  const radT = radarStep * 0.025;
  const satOrbitRadius = 80;
  const debOrbitRadius = 98;

  const satRadarX = Math.cos(radT * 0.8) * satOrbitRadius;
  const satRadarY = Math.sin(radT * 0.8) * (satOrbitRadius * 0.55);

  const debRadarX = Math.cos(radT * 1.1 + Math.PI * 0.6) * debOrbitRadius;
  const debRadarY = Math.sin(radT * 1.1 + Math.PI * 0.6) * (debOrbitRadius * 0.65);

  // Dynamic instantaneous separation in km
  const currentSeparationKm = Math.max(
    activeSat.conjunctionTarget.missDistanceKm,
    Math.round(Math.sqrt(Math.pow(satRadarX - debRadarX, 2) + Math.pow(satRadarY - debRadarY, 2)) * 0.15 * 10) / 10
  );

  // Derive live conjunction TCA target for the active spacecraft
  // Ephemeris orbit intersection cycle (~95 min orbit with satellite-specific phase)
  const orbitCycleMs = 5700 * 1000;
  const satHash = selectedSatelliteId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cycleOffsetMs = (satHash * 480000) % orbitCycleMs;
  const currentCycleProgress = (currentEpochMs + cycleOffsetMs) % orbitCycleMs;
  const tcaRemainingMs = orbitCycleMs - currentCycleProgress;
  const tcaTargetEpochMs = currentEpochMs + tcaRemainingMs;

  const tcaSecondsRemaining = Math.max(0, Math.floor(tcaRemainingMs / 1000));
  const tcaHours = Math.floor(tcaSecondsRemaining / 3600);
  const tcaMins = Math.floor((tcaSecondsRemaining % 3600) / 60);
  const tcaSecs = tcaSecondsRemaining % 60;
  const tcaString = `${String(tcaHours).padStart(2, '0')}:${String(tcaMins).padStart(2, '0')}:${String(tcaSecs).padStart(2, '0')}`;
  const tcaTargetTimeFormatted = formatMissionTime(new Date(tcaTargetEpochMs), 'hms');

  return (
    <section id="mission-control" className="section-spacing relative overflow-hidden py-20 md:py-28" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3.5 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <LayoutDashboard size={13} className="text-cyan-glow" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Integrated Operations Deck
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            MISSION CONTROL INTERFACE
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Unified aerospace command console fusing multi-satellite health telemetry, dynamic collision threat radars, and AI anomaly feeds.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* Dashboard Grid Frame */}
        <motion.div
          className="glass-panel rounded-3xl p-6 md:p-8 border border-glass-border shadow-[0_0_50px_rgba(0,212,255,0.05)] relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Top Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-glass-border pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-glow animate-pulse" />
              <span className="font-space text-xs tracking-widest text-star-white uppercase font-bold">
                STARVANTIS MISSION OS — ASSET: {activeSat.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-space text-muted-gray flex-wrap">
              <span className="flex items-center gap-1.5 text-star-white font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-cyan-glow/20" suppressHydrationWarning>
                <Clock size={13} className="text-cyan-glow animate-pulse" /> {currentClock}
              </span>
              <span className="text-cyan-glow font-bold">LIVE TIMESCALEDB // OK</span>
              <a
                href="#satellite-inspector"
                className="px-4 py-1.5 rounded-xl border border-cyan-glow/40 bg-cyan-glow/15 text-cyan-glow hover:bg-cyan-glow/25 text-[11px] font-space tracking-wider uppercase flex items-center gap-1.5 transition-all font-bold cursor-pointer shadow-[0_0_15px_rgba(99,199,255,0.2)]"
              >
                <span>Enter Primary Mission Control</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          {/* Core HUD Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'ASSET HEALTH', val: `${activeSat.health}%`, color: activeSat.health > 95 ? '#10b981' : '#f59e0b' },
              { label: 'ORBIT ALTITUDE', val: activeSat.altitude, color: '#e8edf2' },
              { label: 'INCLINATION', val: activeSat.inclination, color: '#63c7ff' },
              { label: 'VELOCITY', val: activeSat.velocity, color: '#40e8ff' },
              { label: 'CONJUNCTION RISK', val: activeSat.conjunctionTarget.riskLevel, color: activeSat.conjunctionTarget.riskLevel === 'CRITICAL' ? '#ff3b3b' : '#ffd700' },
              { label: 'GROUND STATION', val: activeSat.groundStation.split(' ')[0], color: '#38bdf8' },
            ].map((m) => (
              <div key={m.label} className="glass-panel p-3 rounded-2xl border border-glass-border/70 text-center">
                <span className="font-inter text-[9px] text-muted-gray uppercase block font-semibold">{m.label}</span>
                <span className="font-space text-base md:text-lg font-bold mt-0.5 block" style={{ color: m.color }}>
                  {m.val}
                </span>
              </div>
            ))}
          </div>

          {/* 3-Column Deck Layout */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
            {/* Column 1: Fleet Satellites Switcher List (4 cols) */}
            <div className="lg:col-span-4 space-y-2.5">
              <span className="font-space text-[10px] tracking-widest text-cyan-glow uppercase block font-semibold">
                CONSTELLATION ASSETS (CLICK TO SWITCH)
              </span>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                {FLEET_SATELLITES.map((sat) => {
                  const isSelected = sat.id === selectedSatelliteId;
                  return (
                    <div role="button" tabIndex={0} key={sat.id}
                      
                      
                      onClick={() => setSelectedSatelliteId(sat.id)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'glass-panel border-cyan-glow bg-cyan-glow/15 shadow-[0_0_20px_rgba(99,199,255,0.2)]'
                          : 'glass-panel border-glass-border hover:border-cyan-glow/40 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Satellite size={16} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                        <div>
                          <span className="font-space text-xs font-bold text-star-white block">{sat.name}</span>
                          <span className="font-inter text-[10px] text-muted-gray">{sat.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-space text-xs font-bold text-cyan-glow">{sat.health}%</span>
                        <span className={`font-space text-[9px] uppercase tracking-wider block ${sat.status === 'OPERATIONAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {sat.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Center Dynamic Animated Radar Viewport (5 cols, Enlarged) */}
            <div className="lg:col-span-5 space-y-2.5">
              <span className="font-space text-[10px] tracking-widest text-cyan-glow uppercase block font-semibold">
                DYNAMIC REAL-TIME SGP4 RADAR [{activeSat.id}]
              </span>
              <div className="glass-panel rounded-3xl p-5 border border-cyan-glow/25 aspect-[16/12] min-h-[320px] relative flex items-center justify-center bg-[#030814] overflow-hidden shadow-[0_0_50px_rgba(4,18,34,0.95)]">
                {/* SVG Radar Grid & Crosshairs */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(99,199,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(99,199,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                  <ellipse cx="50%" cy="50%" rx="100" ry="56" fill="none" stroke="rgba(99,199,255,0.25)" strokeWidth="1" strokeDasharray="3,3" />
                  <ellipse cx="50%" cy="50%" rx="125" ry="78" fill="none" stroke="rgba(255,59,59,0.22)" strokeWidth="1" strokeDasharray="3,3" />
                </svg>

                {/* Radar Grid Concentric Circles (Enlarged) */}
                <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-glow/25 flex items-center justify-center pointer-events-none relative">
                  <div className="w-48 h-48 sm:w-54 sm:h-54 rounded-full border border-cyan-glow/20" />
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-dashed border-cyan-glow/15" />
                  <div className="w-16 h-16 rounded-full border border-cyan-glow/10" />
                  {/* Cardinal Range Markings */}
                  <span className="absolute top-1 text-[8px] font-mono text-cyan-glow/60 font-bold">100 KM</span>
                  <span className="absolute top-10 text-[8px] font-mono text-cyan-glow/60 font-bold">50 KM</span>
                </div>

                {/* Rotating Conic Radar Sweep */}
                <div
                  className="absolute inset-3 rounded-full animate-spin pointer-events-none"
                  style={{
                    animationDuration: '4s',
                    background: 'conic-gradient(from 0deg, rgba(0, 212, 255, 0.4) 0deg, rgba(0, 212, 255, 0.0) 70deg, transparent 70deg)',
                  }}
                />

                {/* Moving Satellite Node with Trail */}
                <div
                  className="absolute transition-all duration-75 flex flex-col items-center pointer-events-none z-10"
                  style={{
                    transform: `translate(${satRadarX * 1.15}px, ${satRadarY * 1.15}px)`,
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-cyan-glow shadow-[0_0_15px_#00d4ff] animate-pulse" />
                  <span className="font-space text-[10px] text-cyan-glow font-bold mt-1 bg-black/85 px-2 py-0.5 rounded border border-cyan-glow/40 shadow">
                    {activeSat.code}
                  </span>
                </div>

                {/* Moving Debris Target Node with Threat Halo */}
                <div
                  className="absolute transition-all duration-75 flex flex-col items-center pointer-events-none z-10"
                  style={{
                    transform: `translate(${debRadarX * 1.15}px, ${debRadarY * 1.15}px)`,
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-alert-critical shadow-[0_0_15px_#ff3b3b] animate-ping" />
                  <span className="font-space text-[9px] text-alert-critical font-bold mt-1 bg-black/85 px-1.5 py-0.5 rounded border border-alert-critical/40 shadow">
                    {activeSat.conjunctionTarget.targetId}
                  </span>
                </div>

                {/* Live Relative Distance Overlay Top-Right */}
                <div className="absolute top-3 right-3 bg-black/85 px-3 py-1.5 rounded-xl border border-glass-border text-right pointer-events-none shadow">
                  <span className="font-space text-[9px] text-muted-gray uppercase block">SGP4 RANGE</span>
                  <span className="font-space text-xs text-star-white font-bold font-mono">{currentSeparationKm} km</span>
                </div>

                {/* Tracking Mode Tag Bottom-Left */}
                <div className="absolute bottom-3 left-3 bg-black/85 px-2.5 py-1 rounded-lg border border-cyan-glow/30 text-left pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-space text-[9px] text-cyan-glow font-bold uppercase">AODCS RADAR LOCKED</span>
                </div>
              </div>
            </div>

            {/* Column 3: Mission Risk & Decision Actions (3 cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <span className="font-space text-[10px] tracking-widest text-cyan-glow uppercase block font-semibold">
                FUSED DECISION ENGINE
              </span>
              <div className="glass-panel p-5 rounded-3xl border border-glass-border space-y-3 text-xs shadow-[0_0_40px_rgba(4,18,34,0.8)]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-gray">Threat Target:</span>
                  <span className="font-space text-xs text-star-white font-bold">{activeSat.conjunctionTarget.targetId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-gray">Miss Separation:</span>
                  <span className="font-space text-sm text-cyan-glow font-bold">{activeSat.conjunctionTarget.missDistanceKm} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-gray">Risk Category:</span>
                  <span
                    className={`font-space text-xs font-bold ${
                      activeSat.conjunctionTarget.riskLevel === 'CRITICAL' ? 'text-alert-critical' : 'text-amber-400'
                    }`}
                  >
                    {activeSat.conjunctionTarget.riskLevel}
                  </span>
                </div>
                <div className="w-full h-px bg-glass-border my-2" />
                <span className="font-space text-[10px] text-star-white uppercase block font-bold">
                  RECOMMENDED BURN:
                </span>
                <p className="font-inter text-[11px] text-muted-gray leading-relaxed">
                  {activeSat.conjunctionTarget.recommendedBurn}
                </p>

                <div className="pt-2">
                  <a
                    href="#satellite-inspector"
                    className="w-full py-3 rounded-xl border border-cyan-glow/40 bg-cyan-glow/15 hover:bg-cyan-glow/25 text-star-white text-xs font-space font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all block text-center cursor-pointer shadow-[0_0_15px_rgba(99,199,255,0.2)]"
                  >
                    <span>Command Deck</span>
                    <ArrowRight size={13} className="text-cyan-glow" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* COMPLETE BOTTOM ANIMATION BANNER (FULL WAVEFORM & TCA COUNTDOWN) */}
          <div className="p-4 md:p-5 rounded-2xl bg-black/70 border border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Live Streaming Waveform Animation */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2.5 rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow shrink-0">
                <Activity size={18} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-space text-xs font-bold text-star-white uppercase">
                    50 Hz TELEMETRY PULSE STREAM
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="h-6 w-full max-w-[280px] flex items-end gap-1 mt-1">
                  {[40, 65, 30, 85, 45, 95, 60, 75, 50, 90, 35, 70, 80, 55, 100, 65, 45, 80].map((h, i) => {
                    const dynamicH = Math.max(15, (h + (radarStep * 4 + i * 8) % 60));
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all duration-100"
                        style={{
                          height: `${dynamicH}%`,
                          backgroundColor: i % 4 === 0 ? '#ff3b3b' : '#00d4ff',
                          opacity: 0.8,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TCA Countdown & Orbital Ingestion Clock */}
            <div className="flex items-center gap-6 text-xs font-space flex-wrap justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
              <div>
                <span className="text-[10px] text-muted-gray uppercase block font-semibold">TCA CONJUNCTION COUNTDOWN</span>
                <span className="text-sm md:text-base font-bold text-alert-critical tracking-wider font-mono" suppressHydrationWarning>
                  {tcaString} ({tcaTargetTimeFormatted})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-gray uppercase block font-semibold">PASS WINDOW</span>
                <span className="text-sm font-bold text-emerald-400">
                  AOS 14:52 // LOS 15:08
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-gray uppercase block font-semibold">TIMESCALEDB STATUS</span>
                <span className="text-sm font-bold text-cyan-glow">
                  100% INGESTION
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
