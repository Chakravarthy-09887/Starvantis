'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Thermometer, AlertTriangle, Satellite, Zap, Compass, Activity, Radio } from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function AIAnomalySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry } = useMission();

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const currentTemp =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.temp
      ? parseFloat(liveTelemetry.temp.replace(' °C', ''))
      : activeSat.telemetryMetrics.batteryTemp.current;

  const baselineTemp = activeSat.telemetryMetrics.batteryTemp.baseline;
  const tempDiff = currentTemp - baselineTemp;
  const isAnomalous = tempDiff > 5.0 || activeSat.riskBreakdown.status === 'CRITICAL';

  const anomalyScore = (
    isAnomalous
      ? Math.min(0.98, 0.70 + Math.abs(tempDiff) * 0.02)
      : Math.max(0.04, activeSat.riskBreakdown.thermalRisk / 100)
  ).toFixed(2);

  // Generate 9 time-series progression steps
  const times = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', 'NOW'];
  const tempData = times.map((t, idx) => {
    if (idx === times.length - 1) return { time: t, value: Math.round(currentTemp * 10) / 10 };
    const stepRatio = idx / (times.length - 1);
    const val = baselineTemp + (currentTemp - baselineTemp) * Math.pow(stepRatio, 1.8);
    return { time: t, value: Math.round(val * 10) / 10 };
  });

  const explainability = [
    {
      label: 'Thermal Radiator Gradient',
      value: activeSat.riskBreakdown.thermalRisk,
      color: activeSat.riskBreakdown.thermalRisk > 40 ? '#ff3b3b' : '#38bdf8',
    },
    {
      label: 'Power Bus & Voltage Variance',
      value: Math.max(12, 100 - activeSat.health),
      color: activeSat.health < 95 ? '#ff8c00' : '#10b981',
    },
    {
      label: 'Orbital SGP4 Conjunction Risk',
      value: activeSat.riskBreakdown.conjunctionRisk,
      color: activeSat.riskBreakdown.conjunctionRisk > 50 ? '#ff3b3b' : '#fbbf24',
    },
    {
      label: 'Attitude Sensor Gyro Drift',
      value: activeSat.riskBreakdown.gyroDriftRisk,
      color: activeSat.riskBreakdown.gyroDriftRisk > 30 ? '#f59e0b' : '#00d4ff',
    },
  ];

  const maxChartVal = Math.max(50, Math.ceil(currentTemp * 1.25));

  return (
    <section className="section-spacing relative overflow-hidden py-20 md:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <Radio size={13} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Pre-Emptive Machine Learning Diagnostics
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            SEE THE SIGNAL
          </h2>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-cyan-glow mt-1 text-glow">
            BEFORE THE ALERT.
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Deep-learning transformer model isolating sensor residual deviations from physical thermodynamic models before telemetry threshold breach.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* Interactive Satellite Selector Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              const hasThreat = sat.riskBreakdown.status === 'CRITICAL';
              return (
                <div role="button" tabIndex={0} key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_18px_rgba(99,199,255,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/50 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={12} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.code}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasThreat ? 'bg-alert-critical animate-ping' : 'bg-emerald-400'}`} />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 2-Column Telemetry & Explainability Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Telemetry Chart Panel */}
          <motion.div
            className="glass-panel rounded-3xl p-6 md:p-7 border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow">
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <span className="font-space text-xs tracking-widest text-cyan-glow uppercase font-bold block">
                      SUBSYSTEM THERMAL DRIFT
                    </span>
                    <span className="font-space text-sm text-star-white font-medium">
                      {activeSat.name}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-space font-bold uppercase tracking-wider border ${
                    isAnomalous
                      ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {isAnomalous ? 'RESIDUAL ANOMALY' : 'NOMINAL PROFILE'}
                </span>
              </div>

              {/* SVG Chart */}
              <div className="relative h-48 w-full bg-space-navy/40 rounded-2xl p-3 border border-glass-border/60 overflow-hidden">
                <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                  {/* Baseline reference box */}
                  <rect x="0" y="80" width="400" height="40" fill="rgba(0,212,255,0.04)" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8" strokeDasharray="4,4" />
                  <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8" strokeDasharray="4,4" />

                  {/* Horizontal Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
                    <line key={i} x1="0" y1={160 * r} x2="400" y2={160 * r} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  ))}

                  {/* Temperature curve */}
                  <motion.path
                    d={`M ${tempData
                      .map((d, i) => `${i * 48 + 8},${150 - (d.value / maxChartVal) * 140}`)
                      .join(' L ')}`}
                    fill="none"
                    stroke={isAnomalous ? '#ff3b3b' : '#00d4ff'}
                    strokeWidth="2.5"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 1.5, delay: 0.4 }}
                  />

                  {/* Data points */}
                  {tempData.map((d, i) => {
                    const cx = i * 48 + 8;
                    const cy = 150 - (d.value / maxChartVal) * 140;
                    return (
                      <g key={i}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={i === tempData.length - 1 ? 5 : 3.5}
                          fill={d.value > baselineTemp + 5 ? '#ff3b3b' : '#00d4ff'}
                        />
                        {i === tempData.length - 1 && isAnomalous && (
                          <circle cx={cx} cy={cy} r="10" fill="none" stroke="#ff3b3b" className="animate-ping" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] text-muted-gray font-space">
                  {tempData.filter((_, i) => i % 2 === 0).map((d) => (
                    <span key={d.time}>{d.time}</span>
                  ))}
                </div>
              </div>

              {/* Instantaneous Values Pill Row */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {tempData.map((d, i) => (
                  <span
                    key={i}
                    className={`text-xs font-space px-2.5 py-1 rounded-xl border ${
                      d.value > baselineTemp + 5
                        ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical font-bold'
                        : 'bg-space-navy/60 border-glass-border text-star-white/80'
                    }`}
                  >
                    {d.value}°C
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Bounds Summary */}
            <div className="mt-5 pt-3 border-t border-glass-border flex items-center justify-between text-xs text-muted-gray font-space">
              <span>Expected Equilibrium: {baselineTemp}°C</span>
              <span className={isAnomalous ? 'text-alert-critical flex items-center gap-1 font-bold' : 'text-emerald-400 flex items-center gap-1 font-bold'}>
                <AlertTriangle size={13} /> Residual Drift: {tempDiff >= 0 ? `+${tempDiff.toFixed(1)}` : tempDiff.toFixed(1)}°C
              </span>
            </div>
          </motion.div>

          {/* Explainability & AI Contribution Panel */}
          <motion.div
            className="glass-panel rounded-3xl p-6 md:p-7 border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isAnomalous ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="font-space text-xs tracking-widest uppercase font-bold text-star-white block">
                      MULTI-VARIATE EXPLAINABILITY
                    </span>
                    <span className="font-space text-xs text-muted-gray">
                      Transformer Weight Vector
                    </span>
                  </div>
                </div>
                <span className="font-space text-xs text-cyan-glow font-bold">
                  {activeSat.code}
                </span>
              </div>

              {/* Anomaly Score & Severity KPI */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-black/50 border border-glass-border">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                    ANOMALY RESIDUAL SCORE
                  </span>
                  <span className={`font-space text-2xl md:text-3xl font-light mt-1 block ${isAnomalous ? 'text-alert-critical font-bold' : 'text-cyan-glow'}`}>
                    {anomalyScore}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-glass-border">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                    CLASSIFIED SEVERITY
                  </span>
                  <span className={`font-space text-sm md:text-base font-bold mt-2.5 block ${isAnomalous ? 'text-alert-critical' : 'text-emerald-400'}`}>
                    {isAnomalous ? 'HIGH SEVERITY' : 'NOMINAL STABLE'}
                  </span>
                </div>
              </div>

              {/* Contributing Factors Progress Bars */}
              <h4 className="font-space text-xs tracking-widest text-muted-gray uppercase mb-3 font-semibold">
                CONTRIBUTING RESIDUAL FACTORS
              </h4>
              <div className="space-y-3.5">
                {explainability.map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-space mb-1">
                      <span className="text-star-white/80">{item.label}</span>
                      <span style={{ color: item.color }} className="font-bold">{item.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${item.value}%` } : {}}
                        transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Summary Note */}
            <p className="mt-5 pt-3 border-t border-glass-border font-inter text-xs text-muted-gray leading-relaxed">
              {activeSat.riskBreakdown.summary}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
