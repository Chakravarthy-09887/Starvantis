'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Brain, Crosshair, Clock, Shield, AlertTriangle, Satellite } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';

function MetricRow({
  label,
  value,
  color,
  progress,
  inView,
  delay = 0,
}: {
  label: string;
  value: string;
  color: string;
  progress: number;
  inView: boolean;
  delay?: number;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex justify-between text-xs font-space">
        <span className="text-muted-gray">{label}</span>
        <span className="font-medium" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${progress}%` } : {}}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export default function MissionRiskFusion() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { selectedSatelliteId, setSelectedSatelliteId } = useMission();

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const riskScore = activeSat.riskBreakdown.overallScore;
  const isCritical = riskScore > 60;

  return (
    <section id="intelligence" className="section-spacing relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <Brain size={13} className="text-cyan-glow" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Multi-Variate Risk Synthesis
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            MISSION RISK FUSION ENGINE
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            Real-time neural synthesis of internal spacecraft health anomalies and external orbital debris proximity threats.
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

        {/* Fusion diagram */}
        <div className="relative max-w-5xl mx-auto">
          {/* Two input streams */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Stream 1: Spacecraft Internal Health */}
            <motion.div
              className="glass-panel rounded-2xl p-6 text-center border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.8)]"
              initial={{ opacity: 0, x: -60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Activity size={24} className="text-cyan-glow mx-auto mb-3" />
              <h3 className="font-space text-xs tracking-[0.3em] text-cyan-glow uppercase mb-4 font-bold">
                {activeSat.code} • INTERNAL TELEMETRY
              </h3>
              <div className="space-y-3.5">
                <MetricRow
                  label="Thermal Drift Risk"
                  value={`${activeSat.riskBreakdown.thermalRisk}%`}
                  color={activeSat.riskBreakdown.thermalRisk > 50 ? '#ff3b3b' : '#00d4ff'}
                  progress={activeSat.riskBreakdown.thermalRisk}
                  inView={isInView}
                  delay={0.4}
                />
                <MetricRow
                  label="Gyro Attitude Jitter"
                  value={`${activeSat.riskBreakdown.gyroDriftRisk}%`}
                  color={activeSat.riskBreakdown.gyroDriftRisk > 50 ? '#ff8c00' : '#10b981'}
                  progress={activeSat.riskBreakdown.gyroDriftRisk}
                  inView={isInView}
                  delay={0.5}
                />
                <MetricRow
                  label="Space Radiation Flux"
                  value={`${activeSat.riskBreakdown.radiationRisk}%`}
                  color="#ec4899"
                  progress={activeSat.riskBreakdown.radiationRisk}
                  inView={isInView}
                  delay={0.6}
                />
              </div>
            </motion.div>

            {/* Central Fusion Engine Core */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Connecting lines */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px">
                <div className="absolute left-0 top-0 w-1/3 h-px bg-gradient-to-r from-cyan-glow/40 to-cyan-glow" />
                <div className="absolute right-0 top-0 w-1/3 h-px bg-gradient-to-l from-orange-400/40 to-orange-400" />
              </div>

              {/* Fusion core */}
              <div className="relative">
                <motion.div
                  className="w-36 h-36 md:w-44 md:h-44 rounded-full border border-cyan-glow/40 flex items-center justify-center bg-black/60 backdrop-blur-xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(0,212,255,0.15)',
                      '0 0 50px rgba(0,212,255,0.35)',
                      '0 0 20px rgba(0,212,255,0.15)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-cyan-glow/30 flex items-center justify-center text-center p-2">
                    <div>
                      <Brain size={24} className="text-cyan-glow mx-auto mb-1 animate-pulse" />
                      <span className="font-space text-[10px] tracking-[0.2em] text-cyan-glow uppercase block font-bold">
                        FUSION
                      </span>
                      <span className="font-space text-[9px] text-muted-gray uppercase">
                        {activeSat.id}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Orbital ring */}
                <motion.div
                  className="absolute inset-[-10px] rounded-full border border-dashed border-cyan-glow/25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Output: Fused Mission Risk Score */}
              <motion.div
                className="mt-8 text-center w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 }}
              >
                <div className="glass-panel rounded-2xl p-5 border border-glass-border box-glow">
                  <span className="font-space text-xs tracking-[0.3em] text-muted-gray uppercase font-semibold">
                    FUSED RISK SCORE
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mt-2">
                    <span
                      className="font-space text-4xl md:text-5xl font-light"
                      style={{ color: isCritical ? '#ff3b3b' : riskScore > 30 ? '#ffd700' : '#10b981' }}
                    >
                      {riskScore}
                    </span>
                    <span className="font-space text-xs text-muted-gray">/100</span>
                  </div>
                  <span
                    className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-space tracking-widest uppercase font-bold border ${
                      isCritical
                        ? 'bg-alert-critical/15 text-alert-critical border-alert-critical/30'
                        : riskScore > 30
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {activeSat.riskBreakdown.status}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Stream 2: Orbital Proximity Threat Stream */}
            <motion.div
              className="glass-panel rounded-2xl p-6 text-center border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.8)]"
              initial={{ opacity: 0, x: 60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Crosshair size={24} className="text-orange-400 mx-auto mb-3" />
              <h3 className="font-space text-xs tracking-[0.3em] text-orange-400 uppercase mb-4 font-bold">
                ORBITAL CONJUNCTION STREAM
              </h3>
              <div className="space-y-3.5">
                <MetricRow
                  label="Collision Probability (Pc)"
                  value={`${activeSat.riskBreakdown.conjunctionRisk}%`}
                  color={activeSat.riskBreakdown.conjunctionRisk > 50 ? '#ff3b3b' : '#ff8c00'}
                  progress={activeSat.riskBreakdown.conjunctionRisk}
                  inView={isInView}
                  delay={0.4}
                />
                <MetricRow
                  label="Radial Miss Separation"
                  value={`${activeSat.conjunctionTarget.missDistanceKm} km`}
                  color={activeSat.conjunctionTarget.missDistanceKm < 3 ? '#ff3b3b' : '#10b981'}
                  progress={Math.max(10, 100 - activeSat.conjunctionTarget.missDistanceKm * 8)}
                  inView={isInView}
                  delay={0.5}
                />
                <MetricRow
                  label="Tracked Debris Density"
                  value={`${activeSat.trackedObjects} objs`}
                  color="#63c7ff"
                  progress={Math.min(100, activeSat.trackedObjects / 2)}
                  inView={isInView}
                  delay={0.6}
                />
              </div>
            </motion.div>
          </div>

          {/* Context Explainer Footer */}
          <div className="mt-8 p-4 rounded-2xl bg-space-navy/70 border border-glass-border flex items-center justify-between gap-4 flex-wrap">
            <p className="font-inter text-xs text-star-white/80 max-w-3xl">
              <span className="font-bold text-cyan-glow font-space uppercase mr-1">FUSED ASSESSMENT [{activeSat.name}]:</span>
              {activeSat.riskBreakdown.summary}
            </p>
            <span className="text-[10px] font-space text-muted-gray uppercase tracking-widest font-semibold">
              BAYESIAN KALMAN FUSION V5.2
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
