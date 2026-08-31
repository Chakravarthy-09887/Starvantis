'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Gauge, ShieldAlert, Sparkles, Database, Layers, ArrowRight, Satellite, ShieldCheck } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';

export default function MissionRiskCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId } = useMission();
  const [animatedScore, setAnimatedScore] = useState(0);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const targetScore = activeSat.riskBreakdown.overallScore;

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeOut * targetScore));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [targetScore]);

  const isCritical = targetScore > 60;
  const isElevated = targetScore > 30 && targetScore <= 60;

  return (
    <section id="risk-center" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <Gauge size={13} className="text-cyan-glow" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Mission-Risk Fusion Analytics Engine
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            MISSION RISK CENTER
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Single explainable operational risk index synthesized from spacecraft internal telemetry health and external orbital proximity threats.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER BAR */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              const satRisk = sat.riskBreakdown.overallScore;
              return (
                <div role="button" tabIndex={0} key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? satRisk > 60
                        ? 'bg-alert-critical/20 border-alert-critical text-star-white shadow-[0_0_20px_rgba(255,59,59,0.35)] scale-105 font-bold'
                        : 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_20px_rgba(99,199,255,0.3)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      satRisk > 60
                        ? 'bg-alert-critical/20 text-alert-critical'
                        : satRisk > 30
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {satRisk}/100
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Central Risk Fusion Dashboard */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Fusion Contributors (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-space text-[10px] tracking-widest text-cyan-glow uppercase block font-semibold">
              PRIMARY RISK CONTRIBUTORS [{activeSat.code}]
            </span>

            {[
              {
                label: 'Spacecraft Health Score',
                val: `${activeSat.health}%`,
                weight: '35%',
                color: activeSat.health < 95 ? '#ff3b3b' : '#00d4ff',
                desc: `Subsystem health state: ${activeSat.status}`,
              },
              {
                label: 'Thermal / Battery Degradation',
                val: `${activeSat.riskBreakdown.thermalRisk}%`,
                weight: '30%',
                color: activeSat.riskBreakdown.thermalRisk > 50 ? '#ff3b3b' : '#38bdf8',
                desc: `Sensor temp ${activeSat.temp} • bus ${activeSat.batteryVoltage}`,
              },
              {
                label: 'Orbital Debris Proximity',
                val: `${activeSat.conjunctionTarget.missDistanceKm} km`,
                weight: '25%',
                color: activeSat.conjunctionTarget.missDistanceKm < 3 ? '#ff3b3b' : '#ff8c00',
                desc: `${activeSat.conjunctionTarget.targetId} TCA ${activeSat.conjunctionTarget.tca}`,
              },
              {
                label: 'Telemetry Confidence & SNR',
                val: `${activeSat.telemetryMetrics.commsSnr.current} dB`,
                weight: '10%',
                color: '#10b981',
                desc: `${activeSat.groundStation} lock verified`,
              },
            ].map((stream, idx) => (
              <motion.div
                key={stream.label}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
                className="glass-panel rounded-2xl p-4 border border-glass-border space-y-2 hover:border-cyan-glow/30 transition-all shadow-[0_0_20px_rgba(4,18,34,0.6)]"
              >
                <div className="flex justify-between items-center text-xs font-space">
                  <span className="text-star-white font-medium">{stream.label}</span>
                  <span className="font-bold" style={{ color: stream.color }}>{stream.val}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: stream.weight, backgroundColor: stream.color }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-gray font-inter">
                  <span>{stream.desc}</span>
                  <span className="font-space font-medium">{stream.weight} weight</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Large Spinning Score Gauge (Center 4 cols) */}
          <motion.div
            className="lg:col-span-4 flex flex-col items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Spinning Circular Gauge */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
              {/* Outer Decorative Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-glow/20 animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute inset-3 rounded-full border border-dashed border-cyan-glow/15 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />

              {/* Center Gauge Arc SVG */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                {/* Track */}
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress Arc */}
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  stroke="url(#riskGradient)"
                  strokeWidth="12"
                  strokeDasharray="565.48"
                  strokeDashoffset={565.48 - (565.48 * animatedScore) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-300 ease-out"
                />
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#ff3b3b" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Number HUD */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-space text-[10px] tracking-[0.3em] text-muted-gray uppercase font-semibold">
                  FUSED RISK INDEX
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-space text-5xl md:text-6xl text-star-white font-light">
                    {animatedScore}
                  </span>
                  <span className="font-space text-sm text-muted-gray">/100</span>
                </div>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-space tracking-widest uppercase font-bold border ${
                    isCritical
                      ? 'bg-alert-critical/15 text-alert-critical border-alert-critical/30'
                      : isElevated
                      ? 'bg-alert-medium/15 text-alert-medium border-alert-medium/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {activeSat.riskBreakdown.status}
                </span>
              </div>
            </div>

            <span className="font-space text-[11px] text-cyan-glow tracking-widest uppercase mt-4 font-bold text-center">
              ACTION: {isCritical ? 'EMERGENCY EVASION BURN REQUIRED' : isElevated ? 'SCHEDULED MONITORING & TRIM' : 'NOMINAL FLIGHT PROFILE'}
            </span>
          </motion.div>

          {/* Fusion Synthesis Insights (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-space text-[10px] tracking-widest text-cyan-glow uppercase block font-semibold">
              OPERATIONAL EVIDENCE SYNTHESIS
            </span>

            <div className="glass-panel rounded-3xl p-6 border border-glass-border space-y-4 shadow-[0_0_40px_rgba(4,18,34,0.8)]">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-space-navy/60 border border-glass-border">
                  <span className="font-space text-xs text-star-white font-bold block mb-1">
                    1. Telemetry Drift Correlation
                  </span>
                  <p className="font-inter text-xs text-muted-gray leading-relaxed">
                    {activeSat.telemetryMetrics.batteryTemp.status === 'nominal'
                      ? `Thermal sensors for ${activeSat.code} are operating within nominal baseline margins (${activeSat.temp}).`
                      : `Battery thermal anomaly detected (${activeSat.temp}), reducing available payload power headroom.`}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-space-navy/60 border border-glass-border">
                  <span className="font-space text-xs text-star-white font-bold block mb-1">
                    2. Conjunction Threat Overlap
                  </span>
                  <p className="font-inter text-xs text-muted-gray leading-relaxed">
                    {activeSat.conjunctionTarget.targetName} predicted at {activeSat.conjunctionTarget.missDistanceKm} km miss distance with Pc={activeSat.conjunctionTarget.pc.toExponential(2)}.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-space-navy/60 border border-glass-border">
                  <span className="font-space text-xs text-star-white font-bold block mb-1">
                    3. Unified Mission Decision
                  </span>
                  <p className="font-inter text-xs text-muted-gray leading-relaxed">
                    {activeSat.conjunctionTarget.recommendedBurn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
