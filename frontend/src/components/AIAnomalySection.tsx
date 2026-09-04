'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Thermometer,
  AlertTriangle,
  Satellite,
  Zap,
  Compass,
  Activity,
  Radio,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function AIAnomalySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry } = useMission();

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pulseTick, setPulseTick] = useState(0);

  // High-frequency live breathing pulse for realistic graph dynamics
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((p) => (p + 1) % 360);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const currentTemp =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.temp
      ? parseFloat(liveTelemetry.temp.replace(/[^\d.-]/g, '')) || activeSat.telemetryMetrics.batteryTemp.current
      : activeSat.telemetryMetrics.batteryTemp.current;

  const baselineTemp = activeSat.telemetryMetrics.batteryTemp.baseline;
  const tempDiff = currentTemp - baselineTemp;
  const isAnomalous = tempDiff > 4.5 || activeSat.riskBreakdown.status === 'CRITICAL';

  const anomalyScore = (
    isAnomalous
      ? Math.min(0.98, 0.72 + Math.abs(tempDiff) * 0.02)
      : Math.max(0.04, activeSat.riskBreakdown.thermalRisk / 100)
  ).toFixed(2);

  // Generate continuous, live time-series progression steps with subtle breathing micro-variations
  const timeLabels = ['T-16m', 'T-14m', 'T-12m', 'T-10m', 'T-8m', 'T-6m', 'T-4m', 'T-2m', 'LIVE NOW'];
  
  const tempData = useMemo(() => {
    return timeLabels.map((t, idx) => {
      const isLatest = idx === timeLabels.length - 1;
      if (isLatest) {
        return {
          time: t,
          value: Number(currentTemp.toFixed(2)),
          baseline: baselineTemp,
          residual: Number((currentTemp - baselineTemp).toFixed(2)),
        };
      }
      const stepRatio = idx / (timeLabels.length - 1);
      // Subtle dynamic sinusoidal modulation based on pulseTick to give realistic live stream motion
      const waveOffset = Math.sin((pulseTick * 0.1) + idx * 0.8) * 0.12;
      const val = baselineTemp + (currentTemp - baselineTemp) * Math.pow(stepRatio, 1.7) + waveOffset;
      return {
        time: t,
        value: Number(val.toFixed(2)),
        baseline: baselineTemp,
        residual: Number((val - baselineTemp).toFixed(2)),
      };
    });
  }, [currentTemp, baselineTemp, pulseTick]);

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

  const minChartVal = Math.floor(Math.min(baselineTemp - 4, currentTemp - 4));
  const maxChartVal = Math.ceil(Math.max(baselineTemp + 8, currentTemp + 6));
  const valRange = maxChartVal - minChartVal || 1;

  const toY = (val: number) => {
    const ratio = (val - minChartVal) / valRange;
    const clamped = Math.max(0, Math.min(1, ratio));
    return 145 - clamped * 120;
  };

  const toX = (idx: number) => {
    return 30 + idx * 42;
  };

  const points = tempData.map((d, i) => ({
    x: toX(i),
    y: toY(d.value),
    baselineY: toY(d.baseline),
    ...d,
  }));

  const linePath = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
    ''
  );

  const baselinePath = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.baselineY.toFixed(1)}`,
    ''
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} 150 L ${points[0].x.toFixed(1)} 150 Z`;

  return (
    <section className="section-spacing relative overflow-hidden py-16 md:py-24" ref={ref}>
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
                <div
                  role="button"
                  tabIndex={0}
                  key={sat.id}
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
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Telemetry Chart Panel */}
          <motion.div
            className="glass-panel rounded-3xl p-6 md:p-7 border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isAnomalous ? 'border-alert-critical/40 bg-alert-critical/15 text-alert-critical' : 'border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow'}`}>
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <span className="font-space text-xs tracking-widest text-cyan-glow uppercase font-bold block">
                      SUBSYSTEM THERMAL DRIFT
                    </span>
                    <span className="font-space text-sm text-star-white font-medium">
                      {activeSat.name} • {activeSat.code}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-space px-2 py-0.5 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow font-mono">
                    <Sparkles size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
                    LIVE 1.0 Hz
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-space font-bold uppercase tracking-wider border ${
                      isAnomalous
                        ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical animate-pulse'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {isAnomalous ? 'RESIDUAL ANOMALY' : 'NOMINAL PROFILE'}
                  </span>
                </div>
              </div>

              {/* Dynamic Live SVG Chart with Hologram Scan Beam & Glowing Reticle */}
              <div className="relative h-56 w-full bg-[#030814] rounded-2xl p-3 border border-cyan-glow/30 overflow-hidden shadow-[inset_0_0_30px_rgba(0,212,255,0.06)] group">
                {/* Horizontal Sweeping Laser Scan Beam */}
                <div
                  className="absolute inset-y-0 w-20 pointer-events-none animate-[scan_4s_linear_infinite]"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${isAnomalous ? 'rgba(255,59,59,0.15)' : 'rgba(0,212,255,0.15)'} 50%, transparent 100%)`,
                  }}
                />

                <svg viewBox="0 0 400 160" className="w-full h-full relative z-10" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="aiSignalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isAnomalous ? '#ff3b3b' : '#00d4ff'} stopOpacity="0.4" />
                      <stop offset="60%" stopColor={isAnomalous ? '#ff3b3b' : '#00d4ff'} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={isAnomalous ? '#ff3b3b' : '#00d4ff'} stopOpacity="0.0" />
                    </linearGradient>

                    <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Nominal Equilibrium Baseline Band */}
                  <rect
                    x="20"
                    y={Math.max(10, toY(baselineTemp) - 12)}
                    width="360"
                    height="24"
                    fill="rgba(0,212,255,0.05)"
                    stroke="rgba(0,212,255,0.15)"
                    strokeDasharray="3,3"
                    rx="4"
                  />

                  {/* Horizontal Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
                    <line
                      key={i}
                      x1="20"
                      y1={160 * r}
                      x2="380"
                      y2={160 * r}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="0.5"
                      strokeDasharray="2,4"
                    />
                  ))}

                  {/* Baseline Target Track */}
                  <path
                    d={baselinePath}
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Shaded Area Under Observed Curve */}
                  <path d={areaPath} fill="url(#aiSignalGrad)" />

                  {/* Temperature Curve with Glowing Stroke */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={isAnomalous ? '#ff3b3b' : '#00d4ff'}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#aiGlow)"
                  />

                  {/* Data Points with Live Animation */}
                  {points.map((p, i) => {
                    const isLatest = i === points.length - 1;
                    const isHovered = hoveredIdx === i;
                    const pointColor = p.residual > 4.0 ? '#ff3b3b' : '#00d4ff';

                    return (
                      <g
                        key={i}
                        className="cursor-pointer transition-transform duration-200"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        {/* Vertical Guideline on Hover or Latest */}
                        {(isHovered || isLatest) && (
                          <line
                            x1={p.x}
                            y1={p.y}
                            x2={p.x}
                            y2="148"
                            stroke={pointColor}
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            opacity="0.6"
                          />
                        )}

                        {/* Node Halo Ring */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 6.5 : isLatest ? 5.5 : 3.5}
                          fill="#030814"
                          stroke={pointColor}
                          strokeWidth={isLatest || isHovered ? 2.5 : 1.5}
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 3.5 : isLatest ? 3 : 1.8}
                          fill={pointColor}
                        />

                        {/* Radar Pulse on Latest "NOW" Node */}
                        {isLatest && (
                          <>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="10"
                              fill="none"
                              stroke={pointColor}
                              className="animate-ping"
                              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                              opacity="0.75"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="14"
                              fill="none"
                              stroke={pointColor}
                              opacity="0.3"
                            />
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis time labels */}
                <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[9px] text-muted-gray font-space">
                  {tempData.filter((_, i) => i % 2 === 0 || i === tempData.length - 1).map((d) => (
                    <span key={d.time} className={d.time === 'LIVE NOW' ? (isAnomalous ? 'text-alert-critical font-bold' : 'text-cyan-glow font-bold') : ''}>
                      {d.time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instantaneous Values Pill Row */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {tempData.map((d, i) => {
                  const isCur = i === tempData.length - 1;
                  const isHigh = d.value > baselineTemp + 4.5;
                  return (
                    <span
                      key={i}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className={`text-[11px] font-space px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                        isHigh
                          ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical font-bold shadow-[0_0_10px_rgba(255,59,59,0.2)]'
                          : isCur
                          ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                          : 'bg-space-navy/60 border-glass-border text-star-white/80 hover:border-cyan-glow/40'
                      }`}
                    >
                      {d.value}°C
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Bottom Bounds Summary */}
            <div className="mt-5 pt-3 border-t border-glass-border flex items-center justify-between text-xs text-muted-gray font-space">
              <span>Expected Equilibrium: {baselineTemp}°C</span>
              <span className={isAnomalous ? 'text-alert-critical flex items-center gap-1 font-bold' : 'text-emerald-400 flex items-center gap-1 font-bold'}>
                <AlertTriangle size={13} /> Residual Drift: {tempDiff >= 0 ? `+${tempDiff.toFixed(2)}` : tempDiff.toFixed(2)}°C
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
                      Transformer Attention Weight Vector
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
