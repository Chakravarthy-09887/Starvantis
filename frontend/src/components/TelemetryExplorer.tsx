'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LineChart,
  Zap,
  Thermometer,
  Wifi,
  Compass,
  RefreshCw,
  Layers,
  Satellite,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Info,
  Database,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';

export default function TelemetryExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry, formatMissionTime, currentClock, timezone } = useMission();

  const [activeStreamId, setActiveStreamId] = useState('battery-temp');
  const [refreshKey, setRefreshKey] = useState(0);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Derive stable live numeric telemetry values for smooth continuous stream interpolation
  const currentTempNum = liveTelemetry.temp
    ? parseFloat(liveTelemetry.temp.replace(/[^\d.-]/g, '')) || activeSat.telemetryMetrics.batteryTemp.current
    : activeSat.telemetryMetrics.batteryTemp.current;

  const currentVoltNum = liveTelemetry.battery_voltage
    ? parseFloat(liveTelemetry.battery_voltage.replace(/[^\d.-]/g, '')) || activeSat.telemetryMetrics.busVoltage.current
    : activeSat.telemetryMetrics.busVoltage.current;

  const currentPowerNum = activeSat.telemetryMetrics.powerDraw.current;
  const currentAttitudeNum = activeSat.telemetryMetrics.attitudeError.current;
  const currentSnrNum = activeSat.telemetryMetrics.commsSnr.current;

  // Generate smooth, physically-coherent historical data points that seamlessly merge with live observed value
  const buildSmoothStreamData = (baseVal: number, curVal: number) => {
    const diff = curVal - baseVal;
    return [
      { time: 'T-10m', current: Number((baseVal + diff * 0.12).toFixed(3)), baseline: baseVal },
      { time: 'T-8m', current: Number((baseVal + diff * 0.28).toFixed(3)), baseline: baseVal },
      { time: 'T-6m', current: Number((baseVal + diff * 0.48).toFixed(3)), baseline: baseVal },
      { time: 'T-4m', current: Number((baseVal + diff * 0.70).toFixed(3)), baseline: baseVal },
      { time: 'T-2m', current: Number((baseVal + diff * 0.88).toFixed(3)), baseline: baseVal },
      { time: 'NOW', current: Number(curVal.toFixed(3)), baseline: baseVal },
    ];
  };

  // Dynamic telemetry streams calculated for selected satellite
  const telemetryStreams = useMemo(() => [
    {
      id: 'battery-temp',
      name: 'BATTERY / SUBSYSTEM TEMPERATURE',
      unit: '°C',
      currentVal: currentTempNum.toFixed(1),
      baselineVal: activeSat.telemetryMetrics.batteryTemp.baseline.toFixed(1),
      deviation: `${currentTempNum >= activeSat.telemetryMetrics.batteryTemp.baseline ? '+' : ''}${(currentTempNum - activeSat.telemetryMetrics.batteryTemp.baseline).toFixed(1)}°C`,
      status: activeSat.telemetryMetrics.batteryTemp.status,
      color:
        activeSat.telemetryMetrics.batteryTemp.status === 'critical'
          ? '#ff3b3b'
          : activeSat.telemetryMetrics.batteryTemp.status === 'warning'
          ? '#f59e0b'
          : '#10b981',
      icon: Thermometer,
      description: 'Internal thermal sensor reading compared against thermodynamic radiator equilibrium baseline.',
      data: buildSmoothStreamData(activeSat.telemetryMetrics.batteryTemp.baseline, currentTempNum),
    },
    {
      id: 'bus-voltage',
      name: 'MAIN 28V REGULATED POWER BUS',
      unit: 'V',
      currentVal: currentVoltNum.toFixed(2),
      baselineVal: activeSat.telemetryMetrics.busVoltage.baseline.toFixed(1),
      deviation: `${currentVoltNum >= activeSat.telemetryMetrics.busVoltage.baseline ? '+' : ''}${(currentVoltNum - activeSat.telemetryMetrics.busVoltage.baseline).toFixed(2)}V`,
      status: activeSat.telemetryMetrics.busVoltage.status,
      color:
        activeSat.telemetryMetrics.busVoltage.status === 'critical'
          ? '#ff3b3b'
          : activeSat.telemetryMetrics.busVoltage.status === 'warning'
          ? '#f59e0b'
          : '#00d4ff',
      icon: Zap,
      description: 'Solid-state electrical power distribution bus voltage regulating solar array and battery cell draw.',
      data: buildSmoothStreamData(activeSat.telemetryMetrics.busVoltage.baseline, currentVoltNum),
    },
    {
      id: 'power-draw',
      name: 'PRIMARY PAYLOAD POWER DRAW',
      unit: 'W',
      currentVal: currentPowerNum.toFixed(1),
      baselineVal: activeSat.telemetryMetrics.powerDraw.baseline.toFixed(1),
      deviation: activeSat.telemetryMetrics.powerDraw.deviation,
      status: activeSat.telemetryMetrics.powerDraw.status,
      color: activeSat.telemetryMetrics.powerDraw.status === 'warning' ? '#ffd700' : '#38bdf8',
      icon: Layers,
      description: 'Instantaneous optical, SAR radar, or transponder payload power consumption under active mission load.',
      data: buildSmoothStreamData(activeSat.telemetryMetrics.powerDraw.baseline, currentPowerNum),
    },
    {
      id: 'attitude-error',
      name: '3-AXIS ATTITUDE POINTING JITTER',
      unit: 'deg',
      currentVal: currentAttitudeNum.toFixed(3),
      baselineVal: activeSat.telemetryMetrics.attitudeError.baseline.toFixed(3),
      deviation: activeSat.telemetryMetrics.attitudeError.deviation,
      status: activeSat.telemetryMetrics.attitudeError.status,
      color:
        activeSat.telemetryMetrics.attitudeError.status === 'critical'
          ? '#ff3b3b'
          : activeSat.telemetryMetrics.attitudeError.status === 'warning'
          ? '#f59e0b'
          : '#00d4ff',
      icon: Compass,
      description: 'Fine sun-sensor and star-tracker attitude deviation from optimal nadir/solar pointing orientation.',
      data: buildSmoothStreamData(activeSat.telemetryMetrics.attitudeError.baseline, currentAttitudeNum),
    },
    {
      id: 'comms-snr',
      name: 'GROUND LINK SNR & CARRIER LOCK',
      unit: 'dB',
      currentVal: currentSnrNum.toFixed(1),
      baselineVal: activeSat.telemetryMetrics.commsSnr.baseline.toFixed(1),
      deviation: activeSat.telemetryMetrics.commsSnr.deviation,
      status: activeSat.telemetryMetrics.commsSnr.status,
      color: '#10b981',
      icon: Wifi,
      description: 'Telemetry, Tracking & Command (TT&C) carrier signal-to-noise ratio received at active ground station.',
      data: buildSmoothStreamData(activeSat.telemetryMetrics.commsSnr.baseline, currentSnrNum),
    },
  ], [activeSat, currentTempNum, currentVoltNum, currentPowerNum, currentAttitudeNum, currentSnrNum]);

  const activeStream = telemetryStreams.find((s) => s.id === activeStreamId) || telemetryStreams[0];

  // Robust mathematical scaling for glitch-free SVG plotting
  const allVals = activeStream.data.flatMap((d) => [d.current, d.baseline]);
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const delta = Math.abs(rawMax - rawMin);
  const pad = delta > 0.0001 ? delta * 0.35 : Math.max(Math.abs(rawMax) * 0.15, 0.5);
  const minVal = rawMin - pad;
  const maxVal = rawMax + pad;
  const range = maxVal - minVal || 1;

  // Safe normalized Y coordinate [25, 125]
  const toY = (val: number) => {
    const ratio = (val - minVal) / range;
    const clamped = Math.max(0, Math.min(1, ratio));
    return 125 - clamped * 95;
  };

  // Generate smooth cubic spline for flawless aerospace charting
  const generateSmoothSpline = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const observedPoints = activeStream.data.map((d, i) => ({
    x: 45 + i * 122,
    y: toY(d.current),
  }));

  const baselinePoints = activeStream.data.map((d, i) => ({
    x: 45 + i * 122,
    y: toY(d.baseline),
  }));

  const observedSplinePath = generateSmoothSpline(observedPoints);
  const baselineSplinePath = generateSmoothSpline(baselinePoints);
  const shadedAreaPath = `${observedSplinePath} L ${observedPoints[observedPoints.length - 1].x} 132 L ${observedPoints[0].x} 132 Z`;

  // Recent simulated / ingested TimescaleDB packets table with dynamic timezone formatting
  const recentPackets = [
    { time: formatMissionTime(new Date(), 'hms'), ch: activeStream.id, val: `${activeStream.currentVal} ${activeStream.unit}`, dev: activeStream.deviation, status: 'INGESTED 200 OK' },
    { time: formatMissionTime(new Date(Date.now() - 1000), 'hms'), ch: activeStream.id, val: `${(parseFloat(activeStream.currentVal) - 0.05).toFixed(1)} ${activeStream.unit}`, dev: activeStream.deviation, status: 'INGESTED 200 OK' },
    { time: formatMissionTime(new Date(Date.now() - 2000), 'hms'), ch: activeStream.id, val: `${(parseFloat(activeStream.currentVal) - 0.12).toFixed(1)} ${activeStream.unit}`, dev: activeStream.deviation, status: 'INGESTED 200 OK' },
  ];

  return (
    <section id="telemetry" className="section-spacing relative overflow-hidden py-16 md:py-24 w-full" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3.5 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <LineChart size={13} className="text-cyan-glow" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Real-Time TimescaleDB Ingestion Pipeline
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            TELEMETRY EXPLORER
          </h2>
          <p className="font-inter text-xs sm:text-sm text-star-white/70 mt-3 max-w-2xl mx-auto leading-relaxed">
            Interactive multi-channel sensor drift monitoring. Switch across Indian and international constellation assets to inspect residual deviations from physical thermodynamic baselines.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS (Responsive horizontal scroll on mobile, flex-wrap on desktop) */}
          <div className="mt-8 flex items-center gap-2 max-w-5xl mx-auto overflow-x-auto pb-2 sm:pb-0 sm:justify-center sm:flex-wrap scrollbar-thin">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              const hasAlert = sat.riskBreakdown.status === 'CRITICAL';
              return (
                <div role="button" tabIndex={0} key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer flex-shrink-0 select-none ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_20px_rgba(99,199,255,0.3)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-star-white/70 hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                  title={`${sat.name} • ${sat.type}`}
                >
                  <Satellite size={12} className={isSelected ? 'text-cyan-glow' : 'text-star-white/60'} />
                  <span>{sat.code}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasAlert ? 'bg-alert-critical animate-ping' : sat.status === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FULL-WIDTH BALANCED GRID (4 COLS LEFT, 8 COLS RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left Column: Sensor Stream Selectors (4 cols) */}
          <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 pb-1 text-xs font-space text-star-white/70">
                <span className="uppercase text-[10px] tracking-widest font-bold text-cyan-glow">
                  SENSORS: {activeSat.name}
                </span>
                <span className="text-[10px] text-star-white/80 font-semibold">{activeSat.orbitType}</span>
              </div>

              <div className="space-y-2.5">
                {telemetryStreams.map((stream) => {
                  const isSelected = stream.id === activeStreamId;
                  const Icon = stream.icon;

                  return (
                    <motion.div role="button" tabIndex={0} key={stream.id}
                      onClick={() => setActiveStreamId(stream.id)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                        isSelected
                          ? 'glass-panel border-cyan-glow bg-cyan-glow/15 shadow-[0_0_25px_rgba(99,199,255,0.2)] ring-1 ring-cyan-glow/50'
                          : 'glass-panel border-glass-border hover:border-cyan-glow/30 hover:bg-white/[0.02]'
                      }`}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2.5 rounded-xl border shrink-0"
                          style={{
                            backgroundColor: `${stream.color}20`,
                            borderColor: `${stream.color}40`,
                            color: stream.color,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-space text-xs text-star-white font-bold block truncate">
                            {stream.name}
                          </span>
                          <span className="font-space text-[11px] text-star-white/60">
                            Base: {stream.baselineVal} {stream.unit}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="font-space text-sm font-bold block font-mono" style={{ color: stream.color }}>
                          {stream.currentVal} {stream.unit}
                        </span>
                        <span className="font-space text-[10px] text-star-white/70 font-medium">
                          {stream.deviation}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Satellite Metadata Quick Card */}
            <div className="p-4 rounded-2xl bg-black/50 border border-glass-border space-y-2 mt-4 text-xs font-space">
              <div className="flex justify-between text-star-white/70">
                <span>Ground Station:</span>
                <span className="text-star-white font-bold truncate">{activeSat.groundStation}</span>
              </div>
              <div className="flex justify-between text-star-white/70">
                <span>Orbit Inclination:</span>
                <span className="text-cyan-glow font-bold font-mono">{activeSat.inclination}</span>
              </div>
              <div className="flex justify-between text-star-white/70">
                <span>Orbital Velocity:</span>
                <span className="text-star-white font-bold font-mono">{activeSat.velocity}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Complete Statistical Telemetry Deck (8 cols, Fills 100% width) */}
          <div className="lg:col-span-8 w-full">
            <motion.div
              className="glass-panel rounded-3xl p-5 sm:p-6 md:p-7 border border-glass-border box-glow shadow-[0_0_50px_rgba(4,18,34,0.9)] space-y-5 w-full h-full flex flex-col justify-between"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-glass-border pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2.5 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: `${activeStream.color}20`,
                      borderColor: `${activeStream.color}40`,
                      color: activeStream.color,
                    }}
                  >
                    {React.createElement(activeStream.icon, { size: 22 })}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-space text-base md:text-lg font-bold text-star-white tracking-wide truncate">
                      {activeStream.name}
                    </h3>
                    <span className="font-space text-xs text-cyan-glow font-medium block mt-0.5 font-mono">
                      {activeSat.name} • LAT: {activeSat.lat}, LNG: {activeSat.lng}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-space tracking-wider uppercase border font-bold"
                    style={{
                      backgroundColor: `${activeStream.color}15`,
                      borderColor: `${activeStream.color}35`,
                      color: activeStream.color,
                    }}
                  >
                    {activeStream.status.toUpperCase()}
                  </span>
                  <div role="button" tabIndex={0} onClick={() => setRefreshKey((k) => k + 1)}
                    className="p-2 rounded-lg border border-glass-border hover:border-cyan-glow/40 text-star-white/60 hover:text-cyan-glow transition-colors cursor-pointer"
                    title="Refresh Telemetry Feed"
                  >
                    <RefreshCw size={14} />
                  </div>
                </div>
              </div>

              {/* Sensor Description Banner */}
              <div className="p-3.5 rounded-2xl bg-space-navy/60 border border-glass-border flex items-start gap-2.5">
                <Info size={16} className="text-cyan-glow shrink-0 mt-0.5" />
                <p className="font-inter text-xs md:text-sm text-star-white/90 leading-relaxed">
                  {activeStream.description}
                </p>
              </div>

              {/* Smooth Spline Telemetry Graph Frame (Glitch-Free & Monotonic Bezier Curves) */}
              <div className="relative w-full h-52 md:h-60 bg-[#040914]/90 rounded-2xl p-4 border border-cyan-glow/20 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                <svg viewBox="0 0 700 160" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="telemetryStreamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={activeStream.color} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={activeStream.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.25, 0.5, 0.75].map((r, i) => (
                    <line
                      key={i}
                      x1="30"
                      y1={130 - r * 95}
                      x2="670"
                      y2={130 - r * 95}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray="4,4"
                    />
                  ))}

                  {/* Model Baseline Curve (Dashed Reference Line) */}
                  <path
                    d={baselineSplinePath}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Shaded Area Under Observed Curve */}
                  <path
                    d={shadedAreaPath}
                    fill="url(#telemetryStreamGrad)"
                  />

                  {/* Observed Live Stream Curve (Smooth Aerospace Spline) */}
                  <path
                    d={observedSplinePath}
                    fill="none"
                    stroke={activeStream.color}
                    strokeWidth="2.5"
                  />

                  {/* Data Points */}
                  {activeStream.data.map((d, i) => {
                    const cx = observedPoints[i].x;
                    const cy = observedPoints[i].y;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r={i === 5 ? 5.5 : 4} fill={activeStream.color} />
                        {i === 5 && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="11"
                            fill="none"
                            stroke={activeStream.color}
                            opacity="0.6"
                            className="animate-ping"
                          />
                        )}
                        <text
                          x={cx}
                          y="152"
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.65)"
                          fontSize="10"
                          fontFamily="'Space Grotesk', sans-serif"
                          fontWeight="bold"
                        >
                          {d.time}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Comprehensive Statistical Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border text-center">
                  <span className="font-inter text-[9px] text-star-white/60 uppercase block font-semibold">OBSERVED VALUE</span>
                  <span className="font-space text-sm md:text-base font-bold text-star-white mt-1 block font-mono">
                    {activeStream.currentVal} {activeStream.unit}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border text-center">
                  <span className="font-inter text-[9px] text-star-white/60 uppercase block font-semibold">MODEL BASELINE</span>
                  <span className="font-space text-sm md:text-base font-medium text-cyan-glow mt-1 block font-mono">
                    {activeStream.baselineVal} {activeStream.unit}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border text-center">
                  <span className="font-inter text-[9px] text-star-white/60 uppercase block font-semibold">RESIDUAL DRIFT</span>
                  <span
                    className="font-space text-sm md:text-base font-bold mt-1 block font-mono"
                    style={{ color: activeStream.color }}
                  >
                    {activeStream.deviation}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border text-center">
                  <span className="font-inter text-[9px] text-star-white/60 uppercase block font-semibold">SAMPLING FREQ</span>
                  <span className="font-space text-sm md:text-base font-bold text-emerald-400 mt-1 block font-mono">
                    1.0 Hz (Live 50Hz)
                  </span>
                </div>
              </div>

              {/* Real-time TimescaleDB Ingestion Log Packets */}
              <div className="p-4 rounded-2xl bg-black/60 border border-glass-border space-y-2.5">
                <div className="flex items-center justify-between text-xs font-space text-star-white/70 border-b border-white/10 pb-2 flex-wrap gap-2">
                  <span className="flex items-center gap-2 text-cyan-glow font-bold text-[11px] tracking-wider uppercase">
                    <Database size={14} />
                    <span>TIMESCALE HYPERTABLE INGESTION STREAM // {activeSat.code}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>LIVE PIPELINE 200 OK</span>
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] font-space">
                  {recentPackets.map((pkt, idx) => (
                    <div key={idx} className="flex items-center justify-between text-star-white/80 py-1 border-b border-white/5 last:border-0">
                      <span className="text-star-white/60 font-mono" suppressHydrationWarning>{pkt.time}</span>
                      <span className="text-star-white font-medium font-mono">{pkt.val}</span>
                      <span className="text-cyan-glow font-mono">{pkt.dev}</span>
                      <span className="text-emerald-400 text-[10px] font-bold font-mono">{pkt.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend Footer */}
              <div className="flex items-center justify-between text-xs font-space text-star-white/70 flex-wrap gap-2 pt-2 border-t border-glass-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeStream.color }} />
                    <span className="text-star-white text-[11px] font-medium">Observed Telemetry</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-white/50" />
                    <span className="text-star-white/70 text-[11px]">Physical Model Baseline</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-cyan-glow text-[11px] font-bold">
                    POSTGRESQL 16 • TIMESCALEDB HYPERTABLE
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
