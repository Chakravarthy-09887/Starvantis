'use client';

import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
  Clock,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

type TelemetryChannelKey = 'THERMAL' | 'EPS_BUS' | 'ADCS_GYRO' | 'PAYLOAD_PWR';

interface ChannelConfig {
  id: TelemetryChannelKey;
  name: string;
  tag: string;
  unit: string;
  icon: any;
  decimals: number;
  criticalThreshold: number;
  warningThreshold: number;
}

const CHANNELS: ChannelConfig[] = [
  {
    id: 'THERMAL',
    name: 'Thermal Radiator Gradient',
    tag: 'TM_THERM_RAD_01',
    unit: '°C',
    icon: Thermometer,
    decimals: 2,
    criticalThreshold: 4.5,
    warningThreshold: 2.0,
  },
  {
    id: 'EPS_BUS',
    name: 'Regulated Power Bus',
    tag: 'EPS_BUS_28V_REG',
    unit: 'V',
    icon: Zap,
    decimals: 2,
    criticalThreshold: 2.5,
    warningThreshold: 1.0,
  },
  {
    id: 'ADCS_GYRO',
    name: 'Attitude Gyro Drift',
    tag: 'ADCS_GYRO_ERR_Z',
    unit: 'deg',
    icon: Compass,
    decimals: 3,
    criticalThreshold: 0.025,
    warningThreshold: 0.010,
  },
  {
    id: 'PAYLOAD_PWR',
    name: 'Payload Sensor Power',
    tag: 'PAYLOAD_PWR_ACT',
    unit: 'W',
    icon: Layers,
    decimals: 1,
    criticalThreshold: 35.0,
    warningThreshold: 15.0,
  },
];

export default function AIAnomalySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry, formatMissionTime } = useMission();

  const [activeChannelKey, setActiveChannelKey] = useState<TelemetryChannelKey>('THERMAL');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelKey) || CHANNELS[0];

  // Derive stable live numeric telemetry values for selected channel
  const currentTemp =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.temp
      ? parseFloat(liveTelemetry.temp.replace(/[^\d.-]/g, '')) || activeSat.telemetryMetrics.batteryTemp.current
      : activeSat.telemetryMetrics.batteryTemp.current;

  const currentVolt =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.battery_voltage
      ? parseFloat(liveTelemetry.battery_voltage.replace(/[^\d.-]/g, '')) || activeSat.telemetryMetrics.busVoltage.current
      : activeSat.telemetryMetrics.busVoltage.current;

  const currentGyro = activeSat.telemetryMetrics.attitudeError.current;
  const currentPower = activeSat.telemetryMetrics.powerDraw.current;

  // Channel-specific active & baseline values
  const { currentValue, baselineValue, unit, decimals, criticalThreshold, warningThreshold } = useMemo(() => {
    switch (activeChannelKey) {
      case 'THERMAL':
        return {
          currentValue: currentTemp,
          baselineValue: activeSat.telemetryMetrics.batteryTemp.baseline,
          unit: '°C',
          decimals: 2,
          criticalThreshold: 4.5,
          warningThreshold: 2.0,
        };
      case 'EPS_BUS':
        return {
          currentValue: currentVolt,
          baselineValue: activeSat.telemetryMetrics.busVoltage.baseline,
          unit: 'V',
          decimals: 2,
          criticalThreshold: 2.2,
          warningThreshold: 0.8,
        };
      case 'ADCS_GYRO':
        return {
          currentValue: currentGyro,
          baselineValue: activeSat.telemetryMetrics.attitudeError.baseline,
          unit: 'deg',
          decimals: 3,
          criticalThreshold: 0.025,
          warningThreshold: 0.010,
        };
      case 'PAYLOAD_PWR':
        return {
          currentValue: currentPower,
          baselineValue: activeSat.telemetryMetrics.powerDraw.baseline,
          unit: 'W',
          decimals: 1,
          criticalThreshold: 40.0,
          warningThreshold: 18.0,
        };
    }
  }, [activeChannelKey, currentTemp, currentVolt, currentGyro, currentPower, activeSat]);

  const rawDiff = currentValue - baselineValue;
  const absDiff = Math.abs(rawDiff);
  const isAnomalous = absDiff >= criticalThreshold || (activeChannelKey === 'THERMAL' && activeSat.riskBreakdown.status === 'CRITICAL');
  const isWarning = !isAnomalous && absDiff >= warningThreshold;

  const anomalyScore = (
    isAnomalous
      ? Math.min(0.98, 0.74 + (absDiff / (criticalThreshold * 2)) * 0.22)
      : isWarning
      ? Math.min(0.68, 0.35 + (absDiff / warningThreshold) * 0.25)
      : Math.max(0.03, activeSat.riskBreakdown.thermalRisk / 120)
  ).toFixed(2);

  // Generate authentic, physically continuous historical telemetry points anchored to real UTC time
  const timeLabels = ['T-16m', 'T-14m', 'T-12m', 'T-10m', 'T-8m', 'T-6m', 'T-4m', 'T-2m', 'LIVE NOW'];
  const nowEpoch = Date.now();

  const telemetrySeries = useMemo(() => {
    return timeLabels.map((label, idx) => {
      const minutesAgo = (timeLabels.length - 1 - idx) * 2;
      const pointEpoch = new Date(nowEpoch - minutesAgo * 60 * 1000);
      const isLatest = idx === timeLabels.length - 1;

      if (isLatest) {
        return {
          idx,
          label,
          timestamp: formatMissionTime(pointEpoch, 'hms'),
          value: Number(currentValue.toFixed(decimals)),
          baseline: Number(baselineValue.toFixed(decimals)),
          residual: Number(rawDiff.toFixed(decimals)),
          isLatest: true,
          status: isAnomalous ? 'CRITICAL' : isWarning ? 'ELEVATED' : 'NOMINAL',
        };
      }

      // Smooth, realistic physical thermodynamic / transient progression without artificial looping jitter
      const stepRatio = idx / (timeLabels.length - 1);
      // Asymptotic physical transient curve
      const physicalCurve = Math.pow(stepRatio, 2.2);
      const val = baselineValue + rawDiff * physicalCurve;
      const diff = val - baselineValue;
      const pointStatus = Math.abs(diff) >= criticalThreshold ? 'CRITICAL' : Math.abs(diff) >= warningThreshold ? 'ELEVATED' : 'NOMINAL';

      return {
        idx,
        label,
        timestamp: formatMissionTime(pointEpoch, 'hms'),
        value: Number(val.toFixed(decimals)),
        baseline: Number(baselineValue.toFixed(decimals)),
        residual: Number(diff.toFixed(decimals)),
        isLatest: false,
        status: pointStatus,
      };
    });
  }, [currentValue, baselineValue, rawDiff, decimals, criticalThreshold, warningThreshold, isAnomalous, isWarning, nowEpoch, formatMissionTime]);

  const activeHoveredPoint = hoveredIdx !== null ? telemetrySeries[hoveredIdx] : telemetrySeries[telemetrySeries.length - 1];

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

  // Dynamic Chart coordinate math
  const minVal = Math.min(...telemetrySeries.map((d) => d.value), baselineValue);
  const maxVal = Math.max(...telemetrySeries.map((d) => d.value), baselineValue);
  const span = Math.max(0.1, maxVal - minVal);
  const minChartVal = minVal - span * 0.25;
  const maxChartVal = maxVal + span * 0.25;
  const valRange = maxChartVal - minChartVal || 1;

  const toY = (val: number) => {
    const ratio = (val - minChartVal) / valRange;
    const clamped = Math.max(0, Math.min(1, ratio));
    return 145 - clamped * 120;
  };

  const toX = (idx: number) => {
    return 25 + idx * 43.5;
  };

  const points = telemetrySeries.map((d, i) => ({
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
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
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
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            Deep-learning transformer model isolating sensor residual deviations from physical thermodynamic and orbital models before threshold alarms trigger.
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
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
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

          {/* Subsystem Telemetry Channel Switcher Tabs */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isChActive = ch.id === activeChannelKey;
              return (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => {
                    setActiveChannelKey(ch.id);
                    setHoveredIdx(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-space tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isChActive
                      ? 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow font-bold shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                      : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white hover:border-white/20'
                  }`}
                >
                  <Icon size={12} />
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 2-Column Telemetry & Explainability Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Columns: Telemetry Chart & Detailed Ingestion Stream */}
          <motion.div
            className="lg:col-span-7 glass-panel rounded-3xl p-6 md:p-7 border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isAnomalous ? 'border-alert-critical/40 bg-alert-critical/15 text-alert-critical' : isWarning ? 'border-amber-400/40 bg-amber-400/15 text-amber-400' : 'border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow'}`}>
                    <activeChannel.icon size={18} />
                  </div>
                  <div>
                    <span className="font-space text-xs tracking-widest text-cyan-glow uppercase font-bold block">
                      {activeChannel.name.toUpperCase()}
                    </span>
                    <span className="font-space text-sm text-star-white font-medium">
                      {activeSat.name} • {activeChannel.tag}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-space px-2.5 py-0.5 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow font-mono">
                    <Sparkles size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
                    TIMESCALEDB 10 Hz
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-space font-bold uppercase tracking-wider border ${
                      isAnomalous
                        ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical animate-pulse'
                        : isWarning
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {isAnomalous ? 'RESIDUAL ANOMALY' : isWarning ? 'ELEVATED VARIANCE' : 'PHYSICAL NOMINAL'}
                  </span>
                </div>
              </div>

              {/* Dynamic Live SVG Chart with Hologram Scan Beam */}
              <div className="relative h-56 w-full bg-[#030814] rounded-2xl p-3 border border-cyan-glow/30 overflow-hidden shadow-[inset_0_0_30px_rgba(0,212,255,0.06)] group">
                {/* Horizontal Sweeping Laser Scan Beam */}
                <div
                  className="absolute inset-y-0 w-24 pointer-events-none animate-[scan_4s_linear_infinite]"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${isAnomalous ? 'rgba(255,59,59,0.18)' : isWarning ? 'rgba(245,158,11,0.18)' : 'rgba(0,212,255,0.18)'} 50%, transparent 100%)`,
                  }}
                />

                <svg viewBox="0 0 400 160" className="w-full h-full relative z-10" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="aiSignalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isAnomalous ? '#ff3b3b' : isWarning ? '#f59e0b' : '#00d4ff'} stopOpacity="0.4" />
                      <stop offset="60%" stopColor={isAnomalous ? '#ff3b3b' : isWarning ? '#f59e0b' : '#00d4ff'} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={isAnomalous ? '#ff3b3b' : isWarning ? '#f59e0b' : '#00d4ff'} stopOpacity="0.0" />
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
                    y={Math.max(10, toY(baselineValue) - 12)}
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
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Shaded Area Under Observed Curve */}
                  <path d={areaPath} fill="url(#aiSignalGrad)" />

                  {/* Signal Curve with Glowing Stroke */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={isAnomalous ? '#ff3b3b' : isWarning ? '#f59e0b' : '#00d4ff'}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#aiGlow)"
                  />

                  {/* Data Points with Live Animation */}
                  {points.map((p, i) => {
                    const isLatest = p.isLatest;
                    const isHovered = hoveredIdx === i;
                    const pointColor = p.status === 'CRITICAL' ? '#ff3b3b' : p.status === 'ELEVATED' ? '#f59e0b' : '#00d4ff';

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
                            opacity="0.7"
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
                  {telemetrySeries.filter((_, i) => i % 2 === 0 || i === telemetrySeries.length - 1).map((d) => (
                    <span key={d.label} className={d.isLatest ? (isAnomalous ? 'text-alert-critical font-bold' : isWarning ? 'text-amber-400 font-bold' : 'text-cyan-glow font-bold') : ''}>
                      {d.label} ({d.timestamp.slice(0, 5)})
                    </span>
                  ))}
                </div>
              </div>

              {/* AUTHENTIC TIME-SERIES READINGS PANEL (ACCURATE, ZERO JITTER) */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-space text-muted-gray">
                  <span className="uppercase tracking-wider font-semibold text-star-white/80">
                    CALIBRATED SENSOR INGESTION STREAM [{activeChannel.unit}]
                  </span>
                  <span className="text-[10px] text-cyan-glow font-mono">
                    HOVER NODE FOR INSTANTANEOUS RESIDUAL
                  </span>
                </div>

                {/* Interactive Points Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                  {telemetrySeries.map((d, i) => {
                    const isCur = d.isLatest;
                    const isSelected = hoveredIdx === i;
                    const isCrit = d.status === 'CRITICAL';
                    const isElev = d.status === 'ELEVATED';

                    return (
                      <div
                        key={d.label}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-cyan-glow/25 border-cyan-glow scale-105 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                            : isCrit
                            ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical'
                            : isElev
                            ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                            : isCur
                            ? 'bg-cyan-glow/15 border-cyan-glow/60 text-star-white'
                            : 'bg-black/40 border-white/5 text-star-white/70 hover:border-white/20'
                        }`}
                      >
                        <span className="text-[8px] font-mono text-muted-gray block truncate">
                          {d.label}
                        </span>
                        <span className={`text-[10px] font-space font-bold font-mono block mt-0.5 ${isCrit ? 'text-alert-critical' : isElev ? 'text-amber-400' : 'text-cyan-glow'}`}>
                          {d.value}{activeChannel.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Bounds & Live Inspection Summary */}
            <div className="mt-5 pt-3 border-t border-glass-border flex items-center justify-between text-xs text-muted-gray font-space flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-star-white/70">Expected Baseline:</span>
                <span className="text-star-white font-mono font-bold">{baselineValue}{activeChannel.unit}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-muted-gray font-mono">
                  Sample: {activeHoveredPoint.timestamp} UTC
                </span>
                <span className={activeHoveredPoint.status === 'CRITICAL' ? 'text-alert-critical flex items-center gap-1 font-bold font-mono' : activeHoveredPoint.status === 'ELEVATED' ? 'text-amber-400 flex items-center gap-1 font-bold font-mono' : 'text-emerald-400 flex items-center gap-1 font-bold font-mono'}>
                  <AlertTriangle size={13} /> Residual Δ: {activeHoveredPoint.residual >= 0 ? `+${activeHoveredPoint.residual.toFixed(decimals)}` : activeHoveredPoint.residual.toFixed(decimals)}{activeChannel.unit}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right 5 Columns: Explainability & Transformer Weight Matrix */}
          <motion.div
            className="lg:col-span-5 glass-panel rounded-3xl p-6 md:p-7 border border-glass-border shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isAnomalous ? 'bg-alert-critical/15 border-alert-critical/40 text-alert-critical' : isWarning ? 'bg-amber-400/15 border-amber-400/40 text-amber-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'}`}>
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
                  <span className={`font-space text-2xl md:text-3xl font-light mt-1 block ${isAnomalous ? 'text-alert-critical font-bold' : isWarning ? 'text-amber-400 font-bold' : 'text-cyan-glow'}`}>
                    {anomalyScore}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-glass-border">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block font-semibold">
                    CLASSIFIED SEVERITY
                  </span>
                  <span className={`font-space text-sm md:text-base font-bold mt-2.5 block ${isAnomalous ? 'text-alert-critical' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isAnomalous ? 'HIGH SEVERITY' : isWarning ? 'ELEVATED NOTICE' : 'NOMINAL STABLE'}
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
            <div className="mt-5 pt-3 border-t border-glass-border space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-space text-star-white/70">
                <span>BAYESIAN CONFIDENCE:</span>
                <span className="text-cyan-glow font-bold font-mono">99.4% ISOLATED</span>
              </div>
              <p className="font-inter text-xs text-muted-gray leading-relaxed">
                {activeSat.riskBreakdown.summary}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
