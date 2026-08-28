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
      <div className="max-w-7xl mx-auto px-4 md:px-6">
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

            {/* Trajectory Canvas SVG */}
            <div className="relative aspect-[16/9] w-full bg-space-navy/50 rounded-2xl overflow-hidden p-3 border border-glass-border/60">
              <svg viewBox="0 0 600 320" className="w-full h-full">
                {/* Altitude Guide Lines */}
                <line x1="40" y1="50" x2="560" y2="50" stroke="rgba(0, 212, 255, 0.15)" strokeDasharray="3,3" />
                <text x="45" y="44" fill="rgba(107, 123, 141, 0.8)" fontSize="9" fontFamily="'Space Grotesk', sans-serif">
                  30 KM (ROUGH BRAKING START)
                </text>

                <line x1="40" y1="120" x2="560" y2="120" stroke="rgba(0, 212, 255, 0.15)" strokeDasharray="3,3" />
                <text x="45" y="114" fill="rgba(107, 123, 141, 0.8)" fontSize="9" fontFamily="'Space Grotesk', sans-serif">
                  7.4 KM (ATTITUDE HOLD &amp; SENSOR LOCK)
                </text>

                <line x1="40" y1="190" x2="560" y2="190" stroke="rgba(255, 140, 0, 0.2)" strokeDasharray="3,3" />
                <text x="45" y="184" fill="rgba(255, 140, 0, 0.8)" fontSize="9" fontFamily="'Space Grotesk', sans-serif">
                  2.1 KM (FINE BRAKING CRITICAL NODE)
                </text>

                {/* Lunar Surface Ground Line */}
                <line x1="40" y1="270" x2="560" y2="270" stroke="#00d4ff" strokeWidth="2" />
                <text x="45" y="292" fill="#00d4ff" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                  LUNAR SURFACE — EXPANDED 4.0 KM x 2.4 KM LANDING BOX
                </text>

                {/* Safe Landing Zone Box Indicator */}
                <rect
                  x="430"
                  y="262"
                  width="110"
                  height="16"
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                  strokeWidth="1"
                  rx="3"
                />
                <text x="445" y="274" fill="#10b981" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                  SAFE ZONE
                </text>

                {/* Chandrayaan-3 Success Curve (Cyan) */}
                <path
                  d="M 60 50 C 200 50, 280 160, 480 270"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="3.5"
                />

                {/* Chandrayaan-2 Divergence Path (Red dashed) */}
                {compareMode === 'CH2_FAILURE_ANALYSIS' && (
                  <path
                    d="M 60 50 C 200 50, 270 160, 370 270"
                    fill="none"
                    stroke="#ff3b3b"
                    strokeWidth="2.5"
                    strokeDasharray="5,5"
                  />
                )}

                {/* Stage Interactive Waypoints on Curve */}
                {[
                  { idx: 0, x: 60, y: 50 },
                  { idx: 1, x: 190, y: 85 },
                  { idx: 2, x: 320, y: 175 },
                  { idx: 3, x: 480, y: 270 },
                ].map((wp) => {
                  const isCurrent = wp.idx === activeStageIdx;
                  return (
                    <g key={wp.idx} className="cursor-pointer" onClick={() => setActiveStageIdx(wp.idx)}>
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r={isCurrent ? 9 : 5}
                        fill={isCurrent ? '#00d4ff' : '#04182e'}
                        stroke="#00d4ff"
                        strokeWidth={isCurrent ? 2.5 : 1.5}
                      />
                      {isCurrent && (
                        <circle cx={wp.x} cy={wp.y} r={16} fill="none" stroke="#00d4ff" strokeWidth="1" className="animate-ping" opacity="0.6" />
                      )}
                      <text
                        x={wp.x}
                        y={wp.y - 14}
                        textAnchor="middle"
                        fill={isCurrent ? '#ffffff' : '#6b7b8d'}
                        fontSize={isCurrent ? '10' : '8'}
                        fontFamily="'Space Grotesk', sans-serif"
                        fontWeight={isCurrent ? 'bold' : 'normal'}
                      >
                        P0{wp.idx + 1}
                      </text>
                    </g>
                  );
                })}
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
