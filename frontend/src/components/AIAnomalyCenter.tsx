'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { BrainCircuit, Radar, AlertTriangle, ShieldCheck, CheckCircle2, Cpu, Satellite } from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function AIAnomalyCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry } = useMission();
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((a) => (a + 2) % 360);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const currentTemp =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.temp
      ? parseFloat(liveTelemetry.temp.replace(' °C', ''))
      : activeSat.telemetryMetrics.batteryTemp.current;

  const isCritical = activeSat.riskBreakdown.status === 'CRITICAL';
  const isElevated = activeSat.riskBreakdown.status === 'ELEVATED';

  const anomalyScore = isCritical ? '0.94' : isElevated ? '0.54' : '0.04';
  const confidence = isCritical ? '98.2%' : isElevated ? '94.5%' : '99.1%';

  // Signal breakdown tailored to active satellite
  const contributingSignals = [
    {
      name: `${activeSat.code} Subsystem Temperature Gradient`,
      weight: activeSat.riskBreakdown.thermalRisk,
      val: `${currentTemp}°C (Base: ${activeSat.telemetryMetrics.batteryTemp.baseline}°C)`,
      color: activeSat.riskBreakdown.thermalRisk > 40 ? '#ff3b3b' : '#38bdf8',
    },
    {
      name: `${activeSat.code} Power Bus Voltage Variance`,
      weight: Math.max(14, 100 - activeSat.health),
      val: `${activeSat.telemetryMetrics.busVoltage.current}V (${activeSat.telemetryMetrics.busVoltage.deviation})`,
      color: activeSat.health < 95 ? '#ff8c00' : '#10b981',
    },
    {
      name: 'Orbital SGP4 Conjunction Risk Factor',
      weight: activeSat.riskBreakdown.conjunctionRisk,
      val: `Pc = ${activeSat.conjunctionTarget.pc.toExponential(2)} [${activeSat.conjunctionTarget.targetId}]`,
      color: activeSat.riskBreakdown.conjunctionRisk > 50 ? '#ff3b3b' : '#ffd700',
    },
  ];

  return (
    <section id="anomaly-center" className="section-spacing relative overflow-hidden py-20 md:py-28" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-alert-critical/25 bg-alert-critical/10 mb-3 shadow-[0_0_15px_rgba(255,59,59,0.15)]">
            <BrainCircuit size={13} className="text-alert-critical animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-alert-critical uppercase font-semibold">
              Deep Learning Residual Diagnostics
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            AI ANOMALY CENTER
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Transformer models sweeping real-time telemetry streams to isolate component degradation prior to hardware fault.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              const hasAlert = sat.riskBreakdown.status === 'CRITICAL';
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
                  <span className={`w-1.5 h-1.5 rounded-full ${hasAlert ? 'bg-alert-critical animate-ping' : 'bg-emerald-400'}`} />
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Radar Sweep Viewport (Left 6 cols) */}
          <motion.div
            className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-glass-border relative overflow-hidden aspect-square flex flex-col items-center justify-center shadow-[0_0_50px_rgba(4,18,34,0.8)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Background Circular Radar Grid */}
            <div className="relative w-full h-full max-w-[380px] max-h-[380px] rounded-full border border-cyan-glow/20 flex items-center justify-center">
              <div className="absolute inset-8 rounded-full border border-cyan-glow/15" />
              <div className="absolute inset-20 rounded-full border border-cyan-glow/10" />
              <div className="absolute inset-32 rounded-full border border-cyan-glow/10" />
              <div className="absolute w-full h-px bg-cyan-glow/10" />
              <div className="absolute h-full w-px bg-cyan-glow/10" />

              {/* Rotating Sweep Beam */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  transform: `rotate(${radarAngle}deg)`,
                  background: 'conic-gradient(from 0deg, rgba(0, 212, 255, 0.4) 0deg, rgba(0, 212, 255, 0.0) 60deg, transparent 60deg)',
                }}
              />

              {/* Active Anomaly Blip (Highlighted by Radar) */}
              {isCritical ? (
                <div className="absolute top-[28%] right-[32%] flex flex-col items-center z-20">
                  <div className="w-4 h-4 rounded-full bg-alert-critical animate-ping opacity-75" />
                  <div className="w-2.5 h-2.5 rounded-full bg-alert-critical -mt-3.5 shadow-[0_0_12px_#ff3b3b]" />
                  <span className="font-space text-[9px] text-alert-critical font-bold mt-1 tracking-widest bg-black/90 px-2 py-0.5 rounded-md border border-alert-critical/50">
                    FLAGGED: {anomalyScore}
                  </span>
                </div>
              ) : (
                <div className="absolute top-[35%] right-[30%] flex flex-col items-center z-20">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                  <span className="font-space text-[8px] text-emerald-400 font-bold mt-1 bg-black/80 px-1.5 py-0.2 rounded border border-emerald-400/40">
                    NOMINAL: {anomalyScore}
                  </span>
                </div>
              )}

              {/* Nominal Sensor Nodes */}
              <div className="absolute bottom-[35%] left-[25%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_8px_#00d4ff]" />
                <span className="font-space text-[8px] text-cyan-glow/70 mt-1">EPS-BUS: 0.04</span>
              </div>
              <div className="absolute top-[40%] left-[30%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_8px_#00d4ff]" />
                <span className="font-space text-[8px] text-cyan-glow/70 mt-1">AOCS-GYRO: 0.08</span>
              </div>
              <div className="absolute bottom-[25%] right-[28%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_8px_#00d4ff]" />
                <span className="font-space text-[8px] text-cyan-glow/70 mt-1">TT&C-LINK: 0.11</span>
              </div>

              {/* Center Radar Axis Hub */}
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-glow border-2 border-black z-10 shadow-[0_0_10px_#00d4ff]" />
            </div>

            {/* Radar Legend */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-space text-muted-gray">
              <span>SCAN FREQUENCY: 50 Hz • {activeSat.code}</span>
              <span className={isCritical ? 'text-alert-critical font-bold' : 'text-emerald-400 font-bold'}>
                {isCritical ? '1 ANOMALY ACTIVE' : 'ALL NODES NOMINAL'}
              </span>
            </div>
          </motion.div>

          {/* Detailed Anomaly Diagnostics Card (Right 6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <motion.div
              className={`glass-panel rounded-3xl p-6 md:p-7 border space-y-5 shadow-[0_0_40px_rgba(4,18,34,0.8)] ${
                isCritical
                  ? 'border-alert-critical/40 bg-alert-critical/5'
                  : 'border-glass-border'
              }`}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-glass-border pb-4">
                <div>
                  <span className="font-space text-[10px] tracking-widest text-cyan-glow uppercase block font-semibold">
                    ASSET: {activeSat.name}
                  </span>
                  <h3 className="font-space text-lg md:text-xl text-star-white font-bold mt-0.5">
                    {isCritical ? 'BATTERY THERMAL RUNAWAY RESIDUAL' : 'NOMINAL SUBSYSTEM PROFILES'}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-space tracking-widest font-bold border ${
                    isCritical
                      ? 'bg-alert-critical/15 text-alert-critical border-alert-critical/40'
                      : isElevated
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {activeSat.riskBreakdown.status}
                </span>
              </div>

              {/* Primary Anomaly KPI Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border/60 text-center">
                  <span className="font-inter text-[9px] text-muted-gray uppercase block font-semibold">Anomaly Score</span>
                  <span className={`font-space text-xl md:text-2xl font-light mt-1 block ${isCritical ? 'text-alert-critical font-bold' : 'text-cyan-glow'}`}>
                    {anomalyScore}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border/60 text-center">
                  <span className="font-inter text-[9px] text-muted-gray uppercase block font-semibold">AI Confidence</span>
                  <span className="font-space text-xl md:text-2xl font-light text-cyan-glow mt-1 block">
                    {confidence}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-glass-border/60 text-center">
                  <span className="font-inter text-[9px] text-muted-gray uppercase block font-semibold">Model Build</span>
                  <span className="font-space text-xs font-medium text-star-white mt-2 block">
                    v4.8-Transformer
                  </span>
                </div>
              </div>

              {/* Sensor Breakdown Table */}
              <div className="space-y-2.5 pt-2">
                <span className="font-space text-[10px] tracking-widest text-muted-gray uppercase block font-semibold">
                  CONTRIBUTING SIGNAL WEIGHTS FOR {activeSat.code}
                </span>
                {contributingSignals.map((sig) => (
                  <div key={sig.name} className="p-3.5 rounded-2xl bg-space-navy/50 border border-glass-border/50">
                    <div className="flex justify-between text-xs font-space mb-1.5">
                      <span className="text-star-white/90 font-medium">{sig.name}</span>
                      <span style={{ color: sig.color }} className="font-bold">{sig.weight}% weight</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-1.5">
                      <div className="h-full rounded-full" style={{ width: `${sig.weight}%`, backgroundColor: sig.color }} />
                    </div>
                    <span className="text-[10px] font-inter text-muted-gray">{sig.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
