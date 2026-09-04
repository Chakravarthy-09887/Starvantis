'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Rocket,
  ShieldCheck,
  Flame,
  Compass,
  ArrowDownRight,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES } from '../lib/satellites';

interface EDLStage {
  id: string;
  label: string;
  altitude: string;
  altitudeKm: number;
  velocity: string;
  thrust: string;
  turnRate: string;
  status: string;
  ch2Outcome: string;
  ch3Mitigation: string;
  ldvStatus: string;
}

const EDL_STAGES: EDLStage[] = [
  {
    id: 'rough-braking',
    label: '1. ROUGH BRAKING PHASE',
    altitude: '30 km ➔ 7.4 km',
    altitudeKm: 30,
    velocity: '1,680 m/s ➔ 358 m/s',
    thrust: '80% (4x 800N Engines)',
    turnRate: '0.4 °/s (Nominal)',
    status: 'Nominal Retrograde Deceleration',
    ch2Outcome: 'Accumulated slight velocity error due to throttle limit bands.',
    ch3Mitigation: 'Enhanced propellant margin (+150kg) & relaxed attitude correction limits.',
    ldvStatus: 'LDV Laser Doppler locked at 25 km altitude.',
  },
  {
    id: 'attitude-hold',
    label: '2. ATTITUDE HOLD PHASE',
    altitude: '7.4 km ➔ 6.8 km',
    altitudeKm: 7.4,
    velocity: '358 m/s ➔ 336 m/s',
    thrust: '65% Continuous Throttle',
    turnRate: '1.2 °/s',
    status: 'Optical Sensor Calibration & Attitude Slew',
    ch2Outcome: 'Cameras began imaging surface; high vehicle turn rate initiated.',
    ch3Mitigation: 'Laser Doppler Velocimeter (LDV) 3-axis continuous velocity tracking independent of camera latency.',
    ldvStatus: 'LDV 3-axis velocity vectors active (Vx=12m/s, Vy=4m/s, Vz=64m/s).',
  },
  {
    id: 'fine-braking',
    label: '3. FINE BRAKING (CRITICAL FAILURE NODE)',
    altitude: '6.8 km ➔ 800 m',
    altitudeKm: 2.1,
    velocity: '336 m/s ➔ 60 m/s',
    thrust: 'Variable 40% - 100%',
    turnRate: '4.8 °/s (High Slew)',
    status: 'High Slew Retargeting & Divert Maneuver',
    ch2Outcome: 'FAILURE NODE: Guidance attempted to eliminate accumulated velocity dispersion. Turn rate exceeded gyro constraint; thrusters failed to throttle down fast enough, causing trajectory divergence.',
    ch3Mitigation: 'FAILURE-PROOF FIX: Unbounded attitude correction software implemented; central 5th engine removed to eliminate plume aerodynamic interference; landing zone expanded to 4km x 2.4km.',
    ldvStatus: 'LHDAC autonomous real-time hazard detection scanning boulders/craters.',
  },
  {
    id: 'terminal-touchdown',
    label: '4. TERMINAL HOVER & TOUCHDOWN',
    altitude: '800 m ➔ 0 m (Shiv Shakti)',
    altitudeKm: 0,
    velocity: '60 m/s ➔ 1.2 m/s',
    thrust: 'Differential Vertical Trim',
    turnRate: '0.0 °/s (True Vertical)',
    status: 'Soft Touchdown on Lunar South Pole',
    ch2Outcome: 'Hard impact at 58 m/s vertical velocity.',
    ch3Mitigation: 'HISTORIC SUCCESS: Reinforced landing legs absorbing up to 3.0 m/s vertical impact and 12° slope; all-around vertical solar panels guaranteed continuous power.',
    ldvStatus: 'Touchdown confirmed: 0.8 m/s vertical, 0.2 m/s lateral at 69.37° S, 32.35° E.',
  },
];

export default function LandingDescentSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [activeStageIdx, setActiveStageIdx] = useState(2);
  const [compareMode, setCompareMode] = useState<'CH3_MITIGATION' | 'CH2_FAILURE_ANALYSIS'>('CH3_MITIGATION');
  const [simPlaying, setSimPlaying] = useState(true);

  const curStage = EDL_STAGES[activeStageIdx];

  useEffect(() => {
    if (!simPlaying) return;
    const timer = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % EDL_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [simPlaying]);

  return (
    <section id="landing-descent" className="section-spacing relative overflow-hidden py-20" ref={containerRef}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/25 bg-cyan-glow/10 mb-3 shadow-[0_0_15px_rgba(99,199,255,0.2)]">
            <Rocket size={14} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-xs tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Chandrayaan EDL Dynamics &amp; Failure-Proof Engineering
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-star-white">
            CHANDRAYAAN LUNAR DESCENT SIMULATION
          </h2>
          <p className="font-inter text-xs md:text-sm text-star-white/60 mt-3 max-w-3xl mx-auto font-light leading-relaxed">
            Real-time trajectory kinematics, Vikram lander sensor telemetry fusion, and comparative failure-mode analysis revealing why Chandrayaan-2 faltered and how Chandrayaan-3’s failure-proof engineering achieved historic South Pole touchdown.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* Mode Switcher */}
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <div role="button" tabIndex={0} onClick={() => setCompareMode('CH3_MITIGATION')}
              className={`px-5 py-2.5 rounded-2xl border text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                compareMode === 'CH3_MITIGATION'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105'
                  : 'bg-space-navy/50 border-glass-border text-muted-gray hover:text-star-white'
              }`}
            >
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Chandrayaan-3 Success &amp; Mitigations</span>
            </div>
            <div role="button" tabIndex={0} onClick={() => setCompareMode('CH2_FAILURE_ANALYSIS')}
              className={`px-5 py-2.5 rounded-2xl border text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                compareMode === 'CH2_FAILURE_ANALYSIS'
                  ? 'bg-alert-critical/20 border-alert-critical text-alert-critical font-bold shadow-[0_0_20px_rgba(255,59,59,0.35)] scale-105'
                  : 'bg-space-navy/50 border-glass-border text-muted-gray hover:text-star-white'
              }`}
            >
              <AlertTriangle size={15} className="text-alert-critical" />
              <span>Chandrayaan-2 Failure Root-Cause Demo</span>
            </div>
          </div>
        </motion.div>

        {/* Phase Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {EDL_STAGES.map((stg, i) => {
            const isSel = i === activeStageIdx;
            return (
              <div role="button" tabIndex={0} key={stg.id}
                onClick={() => {
                  setSimPlaying(false);
                  setActiveStageIdx(i);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? 'glass-panel border-cyan-glow bg-cyan-glow/15 shadow-[0_0_25px_rgba(99,199,255,0.25)]'
                    : 'glass-panel border-glass-border hover:border-cyan-glow/30 hover:bg-white/[0.02]'
                }`}
              >
                <span className="font-space text-[10px] text-cyan-glow tracking-widest uppercase block font-bold">
                  PHASE 0{i + 1}
                </span>
                <span className="font-space text-xs md:text-sm text-star-white font-bold block mt-1">
                  {stg.label.split('. ')[1]}
                </span>
                <span className="font-inter text-[11px] text-star-white/50 block mt-0.5">
                  Alt: {stg.altitude.split(' ➔ ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Multi-Stage Visualizer Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Visual Trajectory Curved Profile SVG Canvas (8 cols) */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-6 md:p-8 border border-glass-border relative overflow-hidden flex flex-col justify-between shadow-[0_0_50px_rgba(4,18,34,0.9)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-2">
              <div>
                <span className="font-space text-xs tracking-widest text-cyan-glow uppercase block font-bold">
                  LUNAR POLAR EDL TRAJECTORY: SHIV SHAKTI POINT (69.37° S, 32.35° E)
                </span>
                <span className="font-space text-[10px] text-muted-gray">
                  CURRENT ACTIVE STAGE: {curStage.label}
                </span>
              </div>
              <div role="button" tabIndex={0} onClick={() => setSimPlaying(!simPlaying)}
                className="px-3.5 py-1.5 rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow text-[10px] font-space tracking-wider uppercase hover:bg-cyan-glow/20 cursor-pointer"
              >
                {simPlaying ? 'Pause Auto-Cycle' : 'Play Auto-Cycle'}
              </div>
            </div>

            {/* Trajectory Canvas SVG with High-Fidelity Lunar Topography & Multi-Phase EDL Mechanics */}
            <div className="relative aspect-[16/9] w-full bg-[#020510] rounded-2xl overflow-hidden p-3 border border-cyan-glow/30 shadow-2xl select-none">
              <svg viewBox="0 0 620 330" className="w-full h-full">
                <defs>
                  {/* Space Sky Gradient */}
                  <linearGradient id="lunarDescentSky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#02040a" />
                    <stop offset="60%" stopColor="#080e1c" />
                    <stop offset="100%" stopColor="#111827" />
                  </linearGradient>

                  {/* Lunar Mountain Ridges */}
                  <linearGradient id="edlMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#242c3d" />
                    <stop offset="50%" stopColor="#181f2c" />
                    <stop offset="100%" stopColor="#0b0f19" />
                  </linearGradient>

                  {/* Lunar Surface Soil */}
                  <linearGradient id="edlSoilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e2535" />
                    <stop offset="100%" stopColor="#080a10" />
                  </linearGradient>

                  {/* Retro-Thruster Plasma Flame */}
                  <linearGradient id="edlPlumeFlame" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#38bdf8" />
                    <stop offset="65%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>

                  {/* LHDAC Laser Hazard Scan Conical Shader */}
                  <radialGradient id="edlLhdacCone" cx="50%" cy="0%" r="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Sky Base & Starfield */}
                <rect width="620" height="330" fill="url(#lunarDescentSky)" />
                {[
                  { x: 35, y: 25 }, { x: 95, y: 35 }, { x: 170, y: 18 },
                  { x: 260, y: 30 }, { x: 380, y: 20 }, { x: 490, y: 25 }, { x: 570, y: 35 }
                ].map((st, i) => (
                  <circle key={i} cx={st.x} cy={st.y} r="1" fill="#e2e8f0" opacity="0.8" />
                ))}

                {/* Distant Lunar South Pole Crater Rim Horizon */}
                <path
                  d="M 0 230 Q 90 200 190 220 T 380 210 T 620 205 L 620 330 L 0 330 Z"
                  fill="url(#edlMountainGrad)"
                  opacity="0.8"
                />
                <path
                  d="M 0 255 Q 120 240 250 255 T 500 250 T 620 255 L 620 330 L 0 330 Z"
                  fill="url(#edlSoilGrad)"
                />

                {/* Craters in Polar Regolith */}
                <ellipse cx="140" cy="285" rx="35" ry="9" fill="#04060b" stroke="#334155" strokeWidth="1" />
                <ellipse cx="330" cy="295" rx="24" ry="7" fill="#04060b" stroke="#334155" strokeWidth="1" />

                {/* Left-Aligned Clean Altitude Stage Markers (Never hidden by lander) */}
                <g transform="translate(15, 30)">
                  <rect width="130" height="18" rx="4" fill="rgba(0,0,0,0.85)" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="1" />
                  <text x="8" y="12" fill="#38bdf8" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                    ALT 30 KM // 1,680 m/s
                  </text>
                  <line x1="130" y1="9" x2="600" y2="9" stroke="rgba(0, 212, 255, 0.15)" strokeDasharray="3,3" />
                </g>

                <g transform="translate(15, 80)">
                  <rect width="130" height="18" rx="4" fill="rgba(0,0,0,0.85)" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="1" />
                  <text x="8" y="12" fill="#38bdf8" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                    ALT 7.4 KM // LDV LOCK
                  </text>
                  <line x1="130" y1="9" x2="600" y2="9" stroke="rgba(0, 212, 255, 0.15)" strokeDasharray="3,3" />
                </g>

                <g transform="translate(15, 155)">
                  <rect width="130" height="18" rx="4" fill="rgba(0,0,0,0.85)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
                  <text x="8" y="12" fill="#f59e0b" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                    ALT 2.1 KM // FINE BRAKE
                  </text>
                  <line x1="130" y1="9" x2="600" y2="9" stroke="rgba(251, 191, 36, 0.15)" strokeDasharray="3,3" />
                </g>

                {/* Safe Landing Zone Box Indicator */}
                <g transform="translate(460, 265)">
                  <rect
                    x="0"
                    y="0"
                    width="140"
                    height="20"
                    fill="rgba(16, 185, 129, 0.25)"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    rx="4"
                  />
                  <text x="70" y="13" fill="#10b981" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                    SHIV SHAKTI (4.0 x 2.4 KM)
                  </text>
                  <circle cx="70" cy="10" r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" className="animate-ping" />
                </g>

                {/* Chandrayaan-3 Success Curve (Cyan Glow) */}
                <path
                  d="M 160 39 C 260 39, 320 120, 520 265"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Chandrayaan-2 Divergence Path (Red dashed) */}
                {compareMode === 'CH2_FAILURE_ANALYSIS' && (
                  <path
                    d="M 160 39 C 260 39, 300 120, 390 270"
                    fill="none"
                    stroke="#ff3b3b"
                    strokeWidth="2.5"
                    strokeDasharray="5,5"
                  />
                )}

                {/* Stage Interactive Waypoints on Trajectory (Dedicated Positions with Non-Overlapping Labels) */}
                {[
                  { idx: 0, x: 160, y: 39, label: 'P01: ROUGH BRAKING', alt: '30km', vel: '1,680 m/s', tagX: 160, tagY: 18 },
                  { idx: 1, x: 275, y: 89, label: 'P02: ATTITUDE HOLD', alt: '7.4km', vel: '358 m/s', tagX: 275, tagY: 65 },
                  { idx: 2, x: 380, y: 164, label: 'P03: FINE BRAKING', alt: '2.1km', vel: '60 m/s', tagX: 380, tagY: 140 },
                  { idx: 3, x: 520, y: 265, label: 'P04: TOUCHDOWN', alt: '0km', vel: '0.8 m/s', tagX: 520, tagY: 240 },
                ].map((wp) => {
                  const isCurrent = wp.idx === activeStageIdx;
                  return (
                    <g key={wp.idx} className="cursor-pointer" onClick={() => setActiveStageIdx(wp.idx)}>
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r={isCurrent ? 9 : 5}
                        fill={isCurrent ? '#00d4ff' : '#04182e'}
                        stroke={isCurrent ? '#ffffff' : '#00d4ff'}
                        strokeWidth={isCurrent ? 2.5 : 1.5}
                      />
                      {isCurrent && (
                        <circle cx={wp.x} cy={wp.y} r={16} fill="none" stroke="#00d4ff" strokeWidth="1.2" className="animate-ping" opacity="0.6" />
                      )}
                      
                      {/* Waypoint Phase Callout Badge (Offset above flight track) */}
                      <g transform={`translate(${wp.tagX}, ${wp.tagY})`}>
                        <rect
                          x="-50"
                          y="-10"
                          width="100"
                          height="16"
                          rx="3"
                          fill={isCurrent ? 'rgba(0, 212, 255, 0.9)' : 'rgba(4, 18, 34, 0.85)'}
                          stroke={isCurrent ? '#ffffff' : 'rgba(0, 212, 255, 0.4)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="1.5"
                          textAnchor="middle"
                          fill={isCurrent ? '#020617' : '#93c5fd'}
                          fontSize="7"
                          fontFamily="'Space Grotesk', sans-serif"
                          fontWeight="bold"
                        >
                          {wp.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* ------------------------------------------------------------- */}
                {/* DYNAMIC HIGH-FIDELITY VIKRAM LANDER MODEL AT ACTIVE STAGE */}
                {/* ------------------------------------------------------------- */}
                {(() => {
                  const stageTransforms = [
                    { x: 195, y: 44, pitch: -85, scale: 0.95 },  // Phase 1: Horizontal retro-fire
                    { x: 300, y: 98, pitch: -52, scale: 0.95 },  // Phase 2: Attitude Slew
                    { x: 410, y: 178, pitch: -14, scale: 1.0 },  // Phase 3: Fine Braking & Divert
                    { x: 520, y: 252, pitch: 0, scale: 1.05 },   // Phase 4: Vertical Touchdown
                  ];
                  const st = stageTransforms[activeStageIdx] || stageTransforms[0];

                  return (
                    <g transform={`translate(${st.x}, ${st.y})`}>
                      {/* Floating Active Lander Telemetry Callout */}
                      <g transform="translate(25, -28)">
                        <rect width="105" height="22" rx="4" fill="rgba(0,0,0,0.9)" stroke="#00d4ff" strokeWidth="1" />
                        <line x1="-15" y1="11" x2="0" y2="11" stroke="#00d4ff" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="6" y="9" fill="#00d4ff" fontSize="6.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                          VIKRAM ATTITUDE: {st.pitch}°
                        </text>
                        <text x="6" y="17" fill="#cbd5e1" fontSize="6" fontFamily="'Space Grotesk', sans-serif">
                          {curStage.thrust.split(' ')[0]} THROTTLE
                        </text>
                      </g>

                      {/* Rotated Lander Body & Thrust Vector */}
                      <g transform={`rotate(${st.pitch}) scale(${st.scale})`}>
                        {/* Phase 1: Heavy Retrograde 4x 800N Thruster Exhaust Plumes */}
                        {activeStageIdx === 0 && (
                          <g transform="translate(0, 14)">
                            <polygon points="-12,0 -30,-6 -30,6" fill="url(#edlPlumeFlame)" className="animate-pulse" />
                            <polygon points="0,0 -36,-10 -36,10" fill="url(#edlPlumeFlame)" className="animate-pulse" />
                            <polygon points="12,0 -30,-6 -30,6" fill="url(#edlPlumeFlame)" className="animate-pulse" />
                            <line x1="0" y1="0" x2="28" y2="0" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2,2" />
                          </g>
                        )}

                        {/* Phase 2: Laser Doppler Velocimeter (LDV) 4-Beam Cluster */}
                        {activeStageIdx === 1 && (
                          <g transform="translate(0, 12)">
                            <line x1="-10" y1="0" x2="-22" y2="70" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-pulse" />
                            <line x1="-3" y1="0" x2="-7" y2="70" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-pulse" />
                            <line x1="3" y1="0" x2="7" y2="70" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-pulse" />
                            <line x1="10" y1="0" x2="22" y2="70" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-pulse" />
                            <polygon points="-6,0 -6,18 6,18 6,0" fill="url(#edlPlumeFlame)" opacity="0.75" />
                          </g>
                        )}

                        {/* Phase 3: LHDAC Laser Hazard Scan Conical Beam & Divert Vector */}
                        {activeStageIdx === 2 && (
                          <g transform="translate(0, 12)">
                            <polygon points="0,0 -40,65 40,65" fill="url(#edlLhdacCone)" stroke="#10b981" strokeWidth="0.8" strokeDasharray="4,3" />
                            <polygon points="-10,0 -13,24 -5,24" fill="url(#edlPlumeFlame)" className="animate-pulse" />
                            <polygon points="10,0 13,24 5,24" fill="url(#edlPlumeFlame)" className="animate-pulse" />
                            <line x1="0" y1="-8" x2="22" y2="-22" stroke="#10b981" strokeWidth="1.8" strokeDasharray="2,2" />
                            <polygon points="22,-22 16,-19 19,-16" fill="#10b981" />
                          </g>
                        )}

                        {/* Phase 4: Touchdown Shock Compression */}
                        {activeStageIdx === 3 && (
                          <g transform="translate(0, 12)">
                            <ellipse cx="0" cy="8" rx="28" ry="5" fill="rgba(16, 185, 129, 0.3)" />
                            <line x1="10" y1="0" x2="35" y2="8" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="2,1" />
                          </g>
                        )}

                        {/* 4 Shock-Absorbing Landing Legs */}
                        <line x1="-12" y1="6" x2="-22" y2="20" stroke="#94a3b8" strokeWidth="1.8" />
                        <circle cx="-22" cy="20" r="2" fill="#cbd5e1" />
                        <line x1="12" y1="6" x2="22" y2="20" stroke="#94a3b8" strokeWidth="1.8" />
                        <circle cx="22" cy="20" r="2" fill="#cbd5e1" />

                        {/* Octagonal Lander Body with Gold Foil MLI */}
                        <polygon
                          points="-14,-8 14,-8 18,6 -18,6"
                          fill="#f59e0b"
                          stroke="#fbbf24"
                          strokeWidth="1"
                        />

                        {/* Top Deck Solar Panel & Avionics */}
                        <rect x="-15" y="-12" width="30" height="4" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
                        <circle cx="0" cy="-14" r="1.5" fill="#10b981" />

                        {/* Vikram Callout */}
                        <text x="0" y="2" fill="#020617" fontSize="5.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          VIKRAM
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Sensor Telemetry Real-Time Bar */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20 text-center">
                <span className="font-inter text-[9px] text-muted-gray uppercase block">ALTITUDE</span>
                <span className="font-space text-sm font-bold text-cyan-glow">{curStage.altitude}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20 text-center">
                <span className="font-inter text-[9px] text-muted-gray uppercase block">VELOCITY</span>
                <span className="font-space text-sm font-bold text-star-white">{curStage.velocity}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20 text-center">
                <span className="font-inter text-[9px] text-muted-gray uppercase block">THRUST PROFILE</span>
                <span className="font-space text-sm font-bold text-amber-400">{curStage.thrust}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20 text-center">
                <span className="font-inter text-[9px] text-muted-gray uppercase block">ATTITUDE SLEW</span>
                <span className="font-space text-sm font-bold text-emerald-400">{curStage.turnRate}</span>
              </div>
            </div>
          </motion.div>

          {/* Deep Engineering Analysis Card (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              key={`${activeStageIdx}-${compareMode}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-6 border border-glass-border space-y-4 shadow-[0_0_40px_rgba(4,18,34,0.8)]"
            >
              <div className="flex items-center justify-between border-b border-glass-border pb-3">
                <span className="font-space text-xs tracking-widest text-cyan-glow uppercase font-bold">
                  {curStage.label}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-space tracking-wider uppercase font-bold border ${
                    compareMode === 'CH3_MITIGATION'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-alert-critical/15 border-alert-critical/30 text-alert-critical'
                  }`}
                >
                  {compareMode === 'CH3_MITIGATION' ? 'CH-3 HARDENED' : 'CH-2 ROOT CAUSE'}
                </span>
              </div>

              {/* Core Root-Cause or Mitigation Description */}
              {compareMode === 'CH2_FAILURE_ANALYSIS' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-alert-critical/10 border border-alert-critical/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-alert-critical" />
                      <span className="font-space text-xs font-bold text-alert-critical uppercase">
                        Chandrayaan-2 Failure Analysis
                      </span>
                    </div>
                    <p className="font-inter text-xs text-star-white/90 leading-relaxed">
                      {curStage.ch2Outcome}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-space-navy/70 border border-glass-border space-y-1">
                    <span className="font-space text-[10px] text-muted-gray uppercase block font-bold">
                      CORE MECHANICAL / SOFTWARE FLAWS:
                    </span>
                    <ul className="font-inter text-xs text-star-white/80 space-y-1 list-disc pl-4">
                      <li>Narrow engine throttling bounds prevented rapid speed shedding.</li>
                      <li>Attitude guidance attempted sharp attitude turns exceeding rate-gyro threshold.</li>
                      <li>Constrained 500m x 500m landing zone left zero margin for divert.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-emerald-400" />
                      <span className="font-space text-xs font-bold text-emerald-400 uppercase">
                        Chandrayaan-3 Failure-Proof Fix
                      </span>
                    </div>
                    <p className="font-inter text-xs text-star-white/90 leading-relaxed">
                      {curStage.ch3Mitigation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-space-navy/70 border border-glass-border space-y-1">
                    <span className="font-space text-[10px] text-cyan-glow uppercase block font-bold">
                      DEPLOYED MITIGATION MEASURES:
                    </span>
                    <ul className="font-inter text-xs text-star-white/80 space-y-1 list-disc pl-4">
                      <li><strong>Expanded Landing Area:</strong> 4.0 km x 2.4 km (16x larger area).</li>
                      <li><strong>Reinforced Legs:</strong> Absorbs 3.0 m/s vertical velocity &amp; 12° slope.</li>
                      <li><strong>Laser Doppler (LDV):</strong> Instantaneous 3-axis velocity locking.</li>
                      <li><strong>Unbounded Guidance:</strong> Software allows full attitude recovery.</li>
                      <li><strong>Solar Panels All Sides:</strong> Guaranteed power on any tilt.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Sensor State Banner */}
              <div className="p-3 rounded-xl bg-black/60 border border-cyan-glow/20 flex items-center gap-2">
                <Activity size={14} className="text-cyan-glow shrink-0" />
                <span className="font-inter text-[11px] text-star-white/80">
                  {curStage.ldvStatus}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
