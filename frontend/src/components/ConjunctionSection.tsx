'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Ruler,
  ShieldAlert,
  Crosshair,
  HelpCircle,
  Navigation,
  Zap,
  CheckCircle2,
  Satellite,
  Layers,
  Compass,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';

export default function ConjunctionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, conjunctionAnalysis, runConjunctionAnalysis } = useMission();

  const [tcaProgress, setTcaProgress] = useState(0.65);
  const [simActive, setSimActive] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const primaryConj = {
    id: activeSat.conjunctionTarget.id,
    primary_satellite_id: activeSat.name,
    primary_code: activeSat.id,
    target_object_id: activeSat.conjunctionTarget.targetId,
    target_name: activeSat.conjunctionTarget.targetName,
    tca_formatted: activeSat.conjunctionTarget.tca,
    miss_distance_km: activeSat.conjunctionTarget.missDistanceKm,
    collision_probability: activeSat.conjunctionTarget.pc,
    risk_level: activeSat.conjunctionTarget.riskLevel,
    recommended_delta_v_ms: activeSat.conjunctionTarget.deltaV,
    burn_direction: activeSat.conjunctionTarget.burnDirection,
    projected_post_burn_miss_km: activeSat.conjunctionTarget.postBurnMissKm,
    crossingAngleDeg: activeSat.conjunctionTarget.crossingAngleDeg,
    approachVector: activeSat.conjunctionTarget.approachVector,
    trajectoryType: activeSat.conjunctionTarget.trajectoryType,
  };

  useEffect(() => {
    if (!simActive) return;
    const interval = setInterval(() => {
      setTcaProgress((p) => {
        const next = p + 0.005;
        return next > 1 ? 0 : next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [simActive]);

  // Unique Trajectory Geometry Coordinates based on satellite trajectoryType
  const t = tcaProgress;
  let satX = 80 + t * 440;
  let satY = 280 - Math.sin(t * Math.PI) * 160;
  let debX = 80 + t * 440;
  let debY = 80 + Math.sin(t * Math.PI) * 160;

  let satPathD = "M 60 290 Q 300 130 540 290";
  let debPathD = "M 60 70 Q 300 230 540 70";

  if (primaryConj.trajectoryType === 'retrograde-crosslink') {
    // Sharp Head-on / Retrograde X-crossing
    satX = 60 + t * 480;
    satY = 300 - t * 240;
    debX = 540 - t * 480;
    debY = 300 - t * 240 + Math.sin(t * Math.PI) * 40;
    satPathD = "M 60 300 L 540 60";
    debPathD = "M 540 300 Q 300 140 60 60";
  } else if (primaryConj.trajectoryType === 'coplanar-overtake') {
    // Near-parallel orbital chase overtaking
    satX = 80 + t * 440;
    satY = 170 + Math.sin(t * Math.PI * 2) * 20;
    debX = 40 + t * 480;
    debY = 190 - Math.sin(t * Math.PI * 2) * 18;
    satPathD = "M 60 170 Q 300 150 540 170";
    debPathD = "M 40 190 Q 300 195 540 185";
  } else if (primaryConj.trajectoryType === 'cislunar-hyperbolic') {
    // Hyperbolic sling trajectory around center body
    satX = 300 + Math.cos(t * Math.PI * 1.5 - Math.PI * 0.75) * 180;
    satY = 180 + Math.sin(t * Math.PI * 1.5 - Math.PI * 0.75) * 110;
    debX = 100 + t * 400;
    debY = 80 + Math.pow(t, 2) * 200;
    satPathD = "M 150 90 Q 300 300 450 90";
    debPathD = "M 100 80 Q 300 180 500 280";
  } else if (primaryConj.trajectoryType === 'lagrange-halo') {
    // Lissajous Figure-8 Halo Loop
    satX = 300 + Math.sin(t * Math.PI * 2) * 160;
    satY = 180 + Math.sin(t * Math.PI * 4) * 70;
    debX = 120 + t * 360;
    debY = 120 + Math.cos(t * Math.PI * 2) * 90;
    satPathD = "M 140 180 Q 300 90 460 180 Q 300 270 140 180";
    debPathD = "M 120 210 Q 300 90 480 210";
  } else if (primaryConj.trajectoryType === 'sso-descending') {
    // Polar Vertical 90° Descending Slice
    satX = 300 + Math.sin(t * Math.PI) * 35;
    satY = 50 + t * 260;
    debX = 80 + t * 440;
    debY = 180 + Math.sin(t * Math.PI * 2) * 45;
    satPathD = "M 300 50 Q 335 180 300 310";
    debPathD = "M 80 180 Q 300 225 520 180";
  }

  const handleComputeCAM = async () => {
    setIsCalculating(true);
    try {
      await runConjunctionAnalysis({
        primary_satellite_id: primaryConj.primary_code,
        target_object_id: primaryConj.target_object_id,
        initial_miss_distance_km: primaryConj.miss_distance_km,
      });
    } catch (e) {
      console.error('Error computing CAM:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  const isCritical = primaryConj.risk_level === 'CRITICAL' || primaryConj.risk_level === 'HIGH';

  return (
    <section id="orbital" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-alert-critical/20 bg-alert-critical/5 mb-4">
            <ShieldAlert size={13} className="text-alert-critical animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-alert-critical uppercase font-bold">
              CONJUNCTION INTERSECTION TRAJECTORY SOLVER
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            CONJUNCTION ANALYSIS
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            High-precision 3D orbital trajectory intersection prediction with unique orbital plane geometry per satellite asset.
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
              const satConj = sat.conjunctionTarget;
              const isSatCritical = satConj.riskLevel === 'CRITICAL';
              return (
                <div role="button" tabIndex={0} key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? isSatCritical
                        ? 'bg-alert-critical/20 border-alert-critical text-star-white shadow-[0_0_20px_rgba(255,59,59,0.35)] scale-105 font-bold'
                        : 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_20px_rgba(99,199,255,0.3)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      satConj.riskLevel === 'CRITICAL'
                        ? 'bg-alert-critical/20 text-alert-critical border border-alert-critical/40'
                        : satConj.riskLevel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {satConj.riskLevel}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Visual Trajectory Radar Simulation Canvas */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-6 relative border border-glass-border overflow-hidden shadow-[0_0_60px_rgba(4,18,34,0.9)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* HUD Status Header */}
            <div className="flex items-center justify-between border-b border-glass-border/70 pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Crosshair size={18} className="text-cyan-glow animate-spin" style={{ animationDuration: '8s' }} />
                <div>
                  <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                    ORBITAL PLANE: {primaryConj.trajectoryType.toUpperCase()} ({primaryConj.crossingAngleDeg}° CROSSING)
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    ASSET: {primaryConj.primary_code} ({activeSat.altitude}) ⟷ DEBRIS: {primaryConj.target_object_id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div role="button" tabIndex={0} onClick={isCalculating ? undefined : handleComputeCAM}
                  aria-disabled={isCalculating}
                  className={`px-3.5 py-1.5 rounded-lg border border-alert-critical/40 bg-alert-critical/15 text-[11px] font-space text-alert-critical hover:bg-alert-critical/25 transition-all uppercase tracking-wider flex items-center gap-1.5 font-bold ${isCalculating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <Zap size={12} className={isCalculating ? 'animate-spin' : ''} />
                  <span>{isCalculating ? 'Calculating...' : 'Compute Avoidance Burn'}</span>
                </div>
                <div role="button" tabIndex={0} onClick={() => setSimActive(!simActive)}
                  className="px-3 py-1.5 rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 text-[10px] font-space text-cyan-glow hover:bg-cyan-glow/20 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {simActive ? 'Pause Sim' : 'Play Sim'}
                </div>
              </div>
            </div>

            {/* Trajectory Canvas SVG with Dynamic Custom Crossing Shapes */}
            <div className="relative aspect-[16/9] w-full bg-space-navy/40 rounded-2xl overflow-hidden border border-glass-border/40">
              <svg viewBox="0 0 600 360" className="w-full h-full">
                <defs>
                  <linearGradient id="satTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="debTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Radar Range Rings */}
                <circle cx="300" cy="180" r="140" fill="none" stroke="rgba(0, 212, 255, 0.06)" strokeDasharray="3,6" />
                <circle cx="300" cy="180" r="80" fill="none" stroke="rgba(0, 212, 255, 0.1)" strokeDasharray="2,4" />
                <circle cx="300" cy="180" r="28" fill="none" stroke="rgba(255, 59, 59, 0.25)" />
                <line x1="300" y1="0" x2="300" y2="360" stroke="rgba(0, 212, 255, 0.05)" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(0, 212, 255, 0.05)" />

                {/* Unique Satellite Trajectory Curve */}
                <path
                  d={satPathD}
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.45)"
                  strokeWidth="2"
                  strokeDasharray="5,4"
                />

                {/* Unique Debris Trajectory Curve */}
                <path
                  d={debPathD}
                  fill="none"
                  stroke="rgba(255, 59, 59, 0.45)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Closest Approach (TCA) Pulsing Hotspot Marker */}
                <g transform="translate(300, 180)">
                  <circle r="36" fill="rgba(255, 59, 59, 0.08)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                  <circle r="20" fill="rgba(255, 59, 59, 0.15)" />
                  <circle r="4" fill="#ff3b3b" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#ff3b3b" strokeWidth="1.5" />
                  <line x1="0" y1="-12" x2="0" y2="12" stroke="#ff3b3b" strokeWidth="1.5" />
                  <text x="14" y="-10" fill="#ff3b3b" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                    TCA POINT ({primaryConj.crossingAngleDeg}°)
                  </text>
                  <text x="14" y="6" fill="rgba(232, 237, 242, 0.8)" fontSize="9" fontFamily="'Inter', sans-serif">
                    Δ: {primaryConj.miss_distance_km} km ({primaryConj.risk_level})
                  </text>
                </g>

                {/* Animated Satellite Node */}
                <g transform={`translate(${satX}, ${satY})`}>
                  <circle r="6" fill="#00d4ff" className="animate-pulse" />
                  <circle r="15" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6" />
                  <text x="12" y="-8" fill="#00d4ff" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                    {primaryConj.primary_code}
                  </text>
                </g>

                {/* Animated Debris Node */}
                <g transform={`translate(${debX}, ${debY})`}>
                  <circle r="5" fill="#ff3b3b" className="animate-pulse" />
                  <circle r="13" fill="none" stroke="#ff3b3b" strokeWidth="1.5" opacity="0.6" />
                  <text x="12" y="16" fill="#ff3b3b" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                    {primaryConj.target_object_id}
                  </text>
                </g>
              </svg>
            </div>

            {/* Trajectory Scrub Slider */}
            <div className="mt-4 flex items-center gap-4">
              <span className="font-space text-[10px] text-muted-gray tracking-wider uppercase">TCA Scrub:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={tcaProgress}
                onChange={(e) => {
                  setSimActive(false);
                  setTcaProgress(parseFloat(e.target.value));
                }}
                className="flex-1 accent-cyan-glow cursor-pointer bg-white/10 rounded-lg h-1.5"
              />
              <span className="font-space text-xs text-cyan-glow w-16 text-right font-medium">
                {tcaProgress < 0.7 ? `T - ${((0.7 - tcaProgress) * 60).toFixed(0)}m` : `T + ${((tcaProgress - 0.7) * 60).toFixed(0)}m`}
              </span>
            </div>
          </motion.div>

          {/* Conjunction Intelligence Telemetry Card (Right Column) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              className={`glass-panel rounded-3xl p-6 border ${
                isCritical ? 'border-alert-critical/30' : 'border-cyan-glow/30'
              } box-glow relative overflow-hidden`}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${
                  isCritical ? 'bg-alert-critical/10' : 'bg-cyan-glow/10'
                } rounded-full blur-2xl pointer-events-none`}
              />

              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <span
                  className={`font-space text-xs tracking-[0.25em] uppercase font-semibold ${
                    isCritical ? 'text-alert-critical' : 'text-cyan-glow'
                  }`}
                >
                  {primaryConj.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-space tracking-widest border font-bold ${
                    primaryConj.risk_level === 'CRITICAL'
                      ? 'bg-alert-critical/15 text-alert-critical border-alert-critical/30'
                      : primaryConj.risk_level === 'HIGH'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {primaryConj.risk_level}
                </span>
              </div>

              {/* Primary Conjunction Metrics */}
              <div className="space-y-3.5">
                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ruler size={18} className="text-cyan-glow" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block">Miss Distance</span>
                      <span className="font-space text-xl text-star-white font-bold">{primaryConj.miss_distance_km} km</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-space font-bold ${
                      primaryConj.miss_distance_km < 5 ? 'text-alert-critical' : 'text-emerald-400'
                    }`}
                  >
                    THRESHOLD &lt; 25km
                  </span>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-orange-400" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block">Time of Closest Approach</span>
                      <span className="font-space text-sm text-star-white font-bold">{primaryConj.tca_formatted}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-space text-orange-400 font-bold">PREDICTED TCA</span>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-glass-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation size={18} className="text-alert-critical" />
                    <div>
                      <span className="font-inter text-[10px] text-muted-gray uppercase block">Collision Probability (Pc)</span>
                      <span className="font-space text-xl text-alert-critical font-bold">
                        {primaryConj.collision_probability < 0.001
                          ? primaryConj.collision_probability.toExponential(2)
                          : primaryConj.collision_probability}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-space font-bold ${
                      primaryConj.collision_probability > 1e-4 ? 'text-alert-critical' : 'text-emerald-400'
                    }`}
                  >
                    {primaryConj.collision_probability > 1e-4 ? 'CRITICAL EXCEEDANCE' : 'NOMINAL MONITOR'}
                  </span>
                </div>
              </div>

              {/* Computed Collision Avoidance Maneuver (CAM) Recommendation */}
              {conjunctionAnalysis ? (
                <div className="mt-4 p-3.5 rounded-xl bg-cyan-glow/10 border border-cyan-glow/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-space text-[10px] text-cyan-glow uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      BACKEND COMPUTED CAM: {conjunctionAnalysis.recommended_maneuver.burn_type}
                    </span>
                    <span className="font-space text-[10px] text-emerald-400 font-bold">
                      {conjunctionAnalysis.recommended_maneuver.risk_reduction_percentage}% RISK CUT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-space text-star-white">
                    <div className="p-2 rounded bg-black/40 border border-cyan-glow/20">
                      <span className="text-muted-gray block">DELTA-V BURN:</span>
                      <span className="font-bold text-cyan-glow">
                        +{conjunctionAnalysis.recommended_maneuver.delta_v_ms} m/s ({conjunctionAnalysis.recommended_maneuver.burn_direction})
                      </span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-cyan-glow/20">
                      <span className="text-muted-gray block">POST-BURN MISS:</span>
                      <span className="font-bold text-emerald-400">
                        {conjunctionAnalysis.recommended_maneuver.post_burn_miss_km} km (SAFE)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-alert-critical/10 border border-alert-critical/25">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-alert-critical" />
                    <span className="font-space text-[10px] tracking-wider text-alert-critical uppercase font-bold">
                      RECOMMENDED MITIGATION
                    </span>
                  </div>
                  <p className="font-inter text-xs text-star-white/80 leading-relaxed">
                    {activeSat.conjunctionTarget.recommendedBurn} Projected post-burn separation: {primaryConj.projected_post_burn_miss_km} km.
                  </p>
                </div>
              )}

              {/* Astrodynamics Model Footnote */}
              <div className="mt-3 pt-2.5 border-t border-glass-border flex items-start gap-2">
                <HelpCircle size={12} className="text-muted-gray shrink-0 mt-0.5" />
                <p className="font-inter text-[9px] text-muted-gray leading-tight">
                  High-precision SGP4 covariance propagation with B-Plane orbital separation calculations.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
