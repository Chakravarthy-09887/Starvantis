'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  ShieldAlert,
  Activity,
  Radio,
  AlertOctagon,
  Orbit,
  Zap,
  Thermometer,
  Wifi,
  ChevronRight,
  Sparkles,
  Layers,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function MissionOverview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId } = useMission();

  const [activeFilter, setActiveFilter] = useState<'all' | 'isro' | 'earth_obs' | 'deep_space' | 'critical'>('all');

  const filteredSatellites = FLEET_SATELLITES.filter((sat) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'isro') return sat.agency === 'ISRO';
    if (activeFilter === 'earth_obs')
      return (
        sat.type.toLowerCase().includes('earth') ||
        sat.type.toLowerCase().includes('imaging') ||
        sat.type.toLowerCase().includes('radar') ||
        sat.type.toLowerCase().includes('altimetry') ||
        sat.type.toLowerCase().includes('cartography') ||
        sat.type.toLowerCase().includes('meteorological')
      );
    if (activeFilter === 'deep_space')
      return (
        sat.orbitType.toLowerCase().includes('lunar') ||
        sat.orbitType.toLowerCase().includes('halo') ||
        sat.orbitType.toLowerCase().includes('heo') ||
        sat.type.toLowerCase().includes('deep-space') ||
        sat.type.toLowerCase().includes('solar')
      );
    if (activeFilter === 'critical')
      return sat.riskBreakdown.status === 'CRITICAL' || sat.status === 'DEGRADED' || sat.activeAlerts > 0;
    return true;
  });

  const avgHealth = Math.round(
    FLEET_SATELLITES.reduce((acc, sat) => acc + sat.health, 0) / FLEET_SATELLITES.length
  );
  const totalTracked = FLEET_SATELLITES.reduce((acc, sat) => acc + sat.trackedObjects, 0);
  const criticalCount = FLEET_SATELLITES.filter((s) => s.riskBreakdown.status === 'CRITICAL').length;

  return (
    <section id="mission" className="section-spacing relative overflow-hidden py-20 md:py-28" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3.5 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <Orbit size={13} className="text-cyan-glow animate-spin" style={{ animationDuration: '12s' }} />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Global Spacecraft Constellation Fleet
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            MISSION OVERVIEW
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed">
            Real-time orbital tracking, multi-channel subsystem health telemetry, and AI-fused risk classification across active ISRO and international spacecraft assets.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'all', label: 'ALL ASSETS', count: FLEET_SATELLITES.length },
              { key: 'isro', label: 'ISRO FLEET', count: FLEET_SATELLITES.filter((s) => s.agency === 'ISRO').length },
              { key: 'earth_obs', label: 'EARTH OBSERVATION & SAR', count: 6 },
              { key: 'deep_space', label: 'DEEP SPACE & CISLUNAR', count: 3 },
              { key: 'critical', label: 'ELEVATED / CRITICAL THREATS', count: criticalCount },
            ].map((tab) => {
              const isSel = activeFilter === tab.key;
              return (
                <div role="button" tabIndex={0} key={tab.key}
                  onClick={() => setActiveFilter(tab.key as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 border cursor-pointer ${
                    isSel
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold shadow-[0_0_15px_rgba(99,199,255,0.3)]'
                      : 'border-glass-border bg-space-navy/50 text-muted-gray hover:text-star-white hover:border-cyan-glow/30'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSel ? 'bg-cyan-glow text-black font-bold' : 'bg-white/10 text-star-white/60'
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top High-Level Fleet KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10">
          {[
            { label: 'FLEET HEALTH', val: `${avgHealth}%`, color: '#10b981', icon: Activity },
            { label: 'ACTIVE ASSETS', val: `${FLEET_SATELLITES.length}`, color: '#e8edf2', icon: Satellite },
            { label: 'CRITICAL THREATS', val: `${criticalCount}`, color: '#ff3b3b', icon: AlertOctagon },
            { label: 'TRACKED OBJECTS', val: `${totalTracked}`, color: '#40e8ff', icon: Radio },
            { label: 'CONJUNCTIONS', val: '4 ACTIVE', color: '#ff8c00', icon: ShieldAlert },
            { label: 'INGESTION RATE', val: '50 Hz', color: '#38bdf8', icon: Orbit },
          ].map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * idx, duration: 0.6 }}
              className="glass-panel rounded-2xl p-4 border border-glass-border flex flex-col justify-between shadow-[0_0_20px_rgba(4,18,34,0.6)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-inter text-[9px] text-muted-gray tracking-wider uppercase font-semibold">{kpi.label}</span>
                <kpi.icon size={14} style={{ color: kpi.color }} />
              </div>
              <span className="font-space text-lg md:text-xl font-bold tracking-tight" style={{ color: kpi.color }}>
                {kpi.val}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Constellation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredSatellites.map((sat, i) => {
              const isSelected = sat.id === selectedSatelliteId;
              const isCritical = sat.riskBreakdown.status === 'CRITICAL';
              const isElevated = sat.riskBreakdown.status === 'ELEVATED';

              return (
                <motion.div
                  key={sat.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.05 * i, duration: 0.5 }}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`glass-panel rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-cyan-glow bg-cyan-glow/10 shadow-[0_0_35px_rgba(99,199,255,0.35)] ring-1 ring-cyan-glow'
                      : isCritical
                      ? 'border-alert-critical/40 bg-alert-critical/5 hover:border-alert-critical shadow-[0_0_20px_rgba(255,59,59,0.15)]'
                      : 'border-glass-border hover:border-cyan-glow/40 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Top Badge & Agency Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: isCritical ? '#ff3b3b' : isElevated ? '#f59e0b' : '#10b981' }}
                        />
                        <span className="px-2 py-0.5 rounded text-[10px] font-space tracking-wider uppercase bg-white/10 text-star-white/90 font-bold border border-white/10">
                          {sat.agency}
                        </span>
                        <span className="font-space text-xs font-bold text-star-white">{sat.id}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-space tracking-wider border font-bold ${
                          sat.status === 'OPERATIONAL'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {sat.status}
                      </span>
                    </div>

                    {/* Satellite Name & Role */}
                    <h3 className="font-space text-sm md:text-base font-bold text-star-white tracking-wide group-hover:text-cyan-glow transition-colors mb-1">
                      {sat.name}
                    </h3>
                    <p className="font-inter text-xs text-muted-gray mb-3 line-clamp-1">{sat.role}</p>

                    {/* Orbit and Ground Station Badges */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-black/50 border border-glass-border mb-4 text-[11px] font-space">
                      <div>
                        <span className="text-muted-gray text-[9px] block uppercase">Orbit Regime</span>
                        <span className="text-star-white font-medium truncate block">{sat.orbitType}</span>
                      </div>
                      <div>
                        <span className="text-muted-gray text-[9px] block uppercase">Ground Station</span>
                        <span className="text-cyan-glow font-medium truncate block">{sat.groundStation.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Subsystem Health Progress */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs font-space">
                        <span className="text-muted-gray">Subsystem Health</span>
                        <span
                          className="font-bold"
                          style={{ color: isCritical ? '#ff3b3b' : isElevated ? '#f59e0b' : '#10b981' }}
                        >
                          {sat.health}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${sat.health}%`,
                            backgroundColor: isCritical ? '#ff3b3b' : isElevated ? '#f59e0b' : '#10b981',
                          }}
                        />
                      </div>
                    </div>

                    {/* Telemetry Snapshot (Power, Bus, Temp) */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-space-navy/40 border border-glass-border/60 text-center mb-4 font-space">
                      <div>
                        <span className="text-muted-gray text-[9px] block uppercase">Bus</span>
                        <span className="text-star-white text-xs font-bold">{sat.batteryVoltage}</span>
                      </div>
                      <div>
                        <span className="text-muted-gray text-[9px] block uppercase">Solar</span>
                        <span className="text-star-white text-xs font-bold">{sat.solarPower}</span>
                      </div>
                      <div>
                        <span className="text-muted-gray text-[9px] block uppercase">Temp</span>
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: parseFloat(sat.temp) > 35 ? '#ff3b3b' : '#38bdf8',
                          }}
                        >
                          {sat.temp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Conjunction Target & Select Action */}
                  <div className="pt-3 border-t border-glass-border flex items-center justify-between text-[11px] font-space">
                    <div>
                      <span className="text-muted-gray text-[9px] block uppercase">FUSED RISK INDEX</span>
                      <span
                        className="font-bold"
                        style={{
                          color: isCritical ? '#ff3b3b' : isElevated ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {sat.riskBreakdown.overallScore} / 100 ({sat.riskBreakdown.status})
                      </span>
                    </div>

                    <div role="button" tabIndex={0} onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSatelliteId(sat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-space font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-glow text-black border-cyan-glow shadow-[0_0_12px_rgba(99,199,255,0.4)]'
                          : 'border-cyan-glow/30 text-cyan-glow hover:bg-cyan-glow/15'
                      }`}
                    >
                      <span>{isSelected ? 'SELECTED' : 'INSPECT'}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
