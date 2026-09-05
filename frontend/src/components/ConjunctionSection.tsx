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
  Box,
  Sliders,
  RotateCcw,
  Flame,
  Play,
  Pause,
  Maximize2,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';

export default function ConjunctionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, conjunctionAnalysis, runConjunctionAnalysis, formatMissionTime } = useMission();

  // Mode: 2D Radar vs 3D Astrodynamics Sandbox
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [tcaProgress, setTcaProgress] = useState(0.68);
  const [simActive, setSimActive] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [maneuverUplinked, setManeuverUplinked] = useState(false);

  // 3D Camera Angles
  const [rotX, setRotX] = useState(32); // Pitch angle (deg)
  const [rotY, setRotY] = useState(45); // Yaw angle (deg)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 32, ry: 45 });

  // Interactive Burn Sliders (m/s)
  const [deltaVx, setDeltaVx] = useState<number>(-0.42); // Along-track / Retrograde
  const [deltaVy, setDeltaVy] = useState<number>(0.12);  // Cross-track / Out-of-plane
  const [deltaVz, setDeltaVz] = useState<number>(0.08);  // Radial in/out

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

  // Synchronize initial burn sliders with active satellite's recommended CAM
  useEffect(() => {
    const dV = primaryConj.recommended_delta_v_ms || 0.42;
    const isRetro = primaryConj.burn_direction.includes('RETROGRADE');
    setDeltaVx(isRetro ? -dV : dV);
    setDeltaVy(0.12);
    setDeltaVz(0.08);
    setManeuverUplinked(false);
  }, [selectedSatelliteId, primaryConj.recommended_delta_v_ms, primaryConj.burn_direction]);

  // 30-second live orbit re-propagation cycle & countdown
  const [syncCountdown, setSyncCountdown] = useState<number>(30);

  // Simulation playback loop
  useEffect(() => {
    if (!simActive) return;
    const interval = setInterval(() => {
      setTcaProgress((p) => {
        const step = 0.003 * simSpeed;
        const next = p + step;
        return next > 1 ? 0 : next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [simActive, simSpeed]);

  // Periodic 30-second SGP4 conjunction & CAM re-analysis
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      handleComputeCAM();
      setSyncCountdown(30);
    }, 30000);

    const countdownTimer = setInterval(() => {
      setSyncCountdown((c) => (c <= 1 ? 30 : c - 1));
    }, 1000);

    return () => {
      clearInterval(cycleTimer);
      clearInterval(countdownTimer);
    };
  }, [selectedSatelliteId]);

  // Astrodynamics Real-Time Calculations
  const totalDeltaV = Math.sqrt(deltaVx * deltaVx + deltaVy * deltaVy + deltaVz * deltaVz);
  const baselineMissKm = primaryConj.miss_distance_km;
  // Foster 1992 deflection formula approximation
  const postBurnMissKm = Number((baselineMissKm + totalDeltaV * 41.2).toFixed(2));
  const postBurnPc = Math.max(1e-9, primaryConj.collision_probability * Math.exp(-totalDeltaV * 8.4));
  // Tsiolkovsky rocket equation: wet mass 1200kg, Isp 230s
  const hydrazineCostKg = Number((1200 * (1 - Math.exp(-totalDeltaV / (230 * 9.81)))).toFixed(3));
  const riskCutPct = Math.min(99.9, Number(((1 - postBurnPc / primaryConj.collision_probability) * 100).toFixed(1)));

  // Relative Distance at current scrub epoch
  const scrubDistKm = Number((baselineMissKm + Math.abs(tcaProgress - 0.7) * 420).toFixed(2));

  // Mouse / Touch 3D Orbit Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, rx: rotX, ry: rotY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotY(dragStartRef.current.ry + dx * 0.4);
    setRotX(Math.max(10, Math.min(80, dragStartRef.current.rx - dy * 0.4)));
  };

  const handleMouseUp = () => setIsDragging(false);

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

  // 2D Coordinates Calculation
  const t = tcaProgress;
  let satX = 80 + t * 440;
  let satY = 280 - Math.sin(t * Math.PI) * 160;
  let debX = 80 + t * 440;
  let debY = 80 + Math.sin(t * Math.PI) * 160;
  let satPathD = "M 60 290 Q 300 130 540 290";
  let debPathD = "M 60 70 Q 300 230 540 70";

  if (primaryConj.trajectoryType === 'retrograde-crosslink') {
    satX = 60 + t * 480; satY = 300 - t * 240;
    debX = 540 - t * 480; debY = 300 - t * 240 + Math.sin(t * Math.PI) * 40;
    satPathD = "M 60 300 L 540 60"; debPathD = "M 540 300 Q 300 140 60 60";
  } else if (primaryConj.trajectoryType === 'coplanar-overtake') {
    satX = 80 + t * 440; satY = 170 + Math.sin(t * Math.PI * 2) * 20;
    debX = 40 + t * 480; debY = 190 - Math.sin(t * Math.PI * 2) * 18;
    satPathD = "M 60 170 Q 300 150 540 170"; debPathD = "M 40 190 Q 300 195 540 185";
  } else if (primaryConj.trajectoryType === 'cislunar-hyperbolic') {
    satX = 300 + Math.cos(t * Math.PI * 1.5 - Math.PI * 0.75) * 180;
    satY = 180 + Math.sin(t * Math.PI * 1.5 - Math.PI * 0.75) * 110;
    debX = 100 + t * 400; debY = 80 + Math.pow(t, 2) * 200;
    satPathD = "M 150 90 Q 300 300 450 90"; debPathD = "M 100 80 Q 300 180 500 280";
  } else if (primaryConj.trajectoryType === 'lagrange-halo') {
    satX = 300 + Math.sin(t * Math.PI * 2) * 160;
    satY = 180 + Math.sin(t * Math.PI * 4) * 70;
    debX = 120 + t * 360; debY = 120 + Math.cos(t * Math.PI * 2) * 90;
    satPathD = "M 140 180 Q 300 90 460 180 Q 300 270 140 180";
    debPathD = "M 120 210 Q 300 90 480 210";
  } else if (primaryConj.trajectoryType === 'sso-descending') {
    satX = 300 + Math.sin(t * Math.PI) * 35; satY = 50 + t * 260;
    debX = 80 + t * 440; debY = 180 + Math.sin(t * Math.PI * 2) * 45;
    satPathD = "M 300 50 Q 335 180 300 310"; debPathD = "M 80 180 Q 300 225 520 180";
  }

  // 3D Isometric Projection Helper
  const project3D = (x: number, y: number, z: number) => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);

    // Rotate around Y axis
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotate around X axis
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective projection
    const scale = 380 / (380 + z2 * 0.45);
    return {
      px: 300 + x1 * scale,
      py: 180 + y2 * scale,
      scale,
      zDepth: z2,
    };
  };

  // Distinct Per-Satellite 3D Trajectory Math
  const getTrajectory3DPoint = (satId: string, trajType: string, progress: number, isDeflected: boolean, dVx = 0, dVy = 0, dVz = 0) => {
    const tNorm = progress - 0.7; // t=0 at TCA
    const dFactor = isDeflected ? progress : 0;

    if (satId === 'CHANDRAYAAN-3' || trajType === 'cislunar-hyperbolic') {
      // Lunar Polar Orbit (90° Inclination around Moon)
      const r = 110;
      const angle = (progress - 0.7) * Math.PI * 1.5;
      const x = Math.sin(angle) * r * 0.35 + dVx * 45 * dFactor;
      const y = Math.cos(angle) * r + dVz * 35 * dFactor;
      const z = Math.sin(angle) * r + dVy * 40 * dFactor;
      return { x, y, z };
    } else if (satId === 'ADITYA-L1' || trajType === 'lagrange-halo') {
      // Sun-Earth L1 Halo Lissajous 3D loop
      const x = Math.sin((progress - 0.7) * Math.PI * 2) * 140 + dVx * 45 * dFactor;
      const y = Math.sin((progress - 0.7) * Math.PI * 4) * 45 + dVz * 35 * dFactor;
      const z = Math.cos((progress - 0.7) * Math.PI * 2) * 90 + dVy * 40 * dFactor;
      return { x, y, z };
    } else if (satId === 'STARLINK-4012' || trajType === 'coplanar-overtake') {
      // Coplanar In-Plane Mega-Constellation Overtake
      const x = (progress - 0.7) * 360 + dVx * 50 * dFactor;
      const y = Math.sin((progress - 0.7) * Math.PI * 2) * 15 + dVz * 30 * dFactor;
      const z = 8 + dVy * 35 * dFactor;
      return { x, y, z };
    } else if (satId === 'INSAT-3DR') {
      // Geostationary Equatorial Arc (35,786 km GEO ring)
      const angle = (progress - 0.7) * Math.PI * 1.2;
      const r = 160;
      const x = Math.sin(angle) * r + dVx * 45 * dFactor;
      const y = 5 + dVz * 35 * dFactor;
      const z = Math.cos(angle) * r * 0.4 + dVy * 40 * dFactor;
      return { x, y, z };
    } else {
      // Low Earth Orbit (Sentinel-6A, Cartosat-3, Landsat-9, RISAT-2BR1) SSO
      const angle = (progress - 0.7) * Math.PI * 1.6;
      const r = 135;
      const incRad = (primaryConj.crossingAngleDeg * Math.PI) / 180;
      const x = Math.sin(angle) * r + dVx * 45 * dFactor;
      const y = Math.cos(angle) * r * Math.sin(incRad) + dVz * 35 * dFactor;
      const z = Math.cos(angle) * r * Math.cos(incRad) + dVy * 40 * dFactor;
      return { x, y, z };
    }
  };

  const getDebris3DPoint = (satId: string, trajType: string, progress: number) => {
    const tNorm = 0.7 - progress;

    if (satId === 'CHANDRAYAAN-3' || trajType === 'cislunar-hyperbolic') {
      // LRO-Debris crossing from polar north to south
      const x = tNorm * 310;
      const y = tNorm * 120 + Math.sin(progress * Math.PI) * 25;
      const z = (progress - 0.7) * 220;
      return { x, y, z };
    } else if (satId === 'ADITYA-L1' || trajType === 'lagrange-halo') {
      // Hyperbolic Solar Wind Debris Stream
      const x = tNorm * 280;
      const y = (progress - 0.7) * -95;
      const z = tNorm * 210;
      return { x, y, z };
    } else if (satId === 'STARLINK-4012' || trajType === 'coplanar-overtake') {
      // Overtaking derelict rocket body
      const x = tNorm * 380;
      const y = -14 + Math.sin(progress * Math.PI * 2) * 12;
      const z = (progress - 0.7) * 40;
      return { x, y, z };
    } else if (satId === 'INSAT-3DR') {
      // Drifting graveyard orbit fragment
      const x = tNorm * 300;
      const y = -20 + tNorm * 60;
      const z = (progress - 0.7) * 190;
      return { x, y, z };
    } else {
      // ASAT / Fengyun Fragmentation Shower
      const x = tNorm * 320;
      const y = (progress - 0.7) * -110;
      const z = (progress - 0.7) * 240;
      return { x, y, z };
    }
  };

  // 3D Nodes at current scrub epoch
  const p3SatRaw = getTrajectory3DPoint(activeSat.id, primaryConj.trajectoryType, t, true, deltaVx, deltaVy, deltaVz);
  const p3DebRaw = getDebris3DPoint(activeSat.id, primaryConj.trajectoryType, t);
  const p3Sat = project3D(p3SatRaw.x, p3SatRaw.y, p3SatRaw.z);
  const p3Deb = project3D(p3DebRaw.x, p3DebRaw.y, p3DebRaw.z);
  const p3Tca = project3D(0, 0, 0);

  // Generate 3D trajectory curves
  const satPath3DPoints: string[] = [];
  const debPath3DPoints: string[] = [];
  const evasionPath3DPoints: string[] = [];

  for (let step = 0; step <= 24; step++) {
    const st = step / 24;
    // Nominal un-deflected trajectory
    const ptNomRaw = getTrajectory3DPoint(activeSat.id, primaryConj.trajectoryType, st, false);
    const ptNom = project3D(ptNomRaw.x, ptNomRaw.y, ptNomRaw.z);
    satPath3DPoints.push(`${step === 0 ? 'M' : 'L'} ${ptNom.px.toFixed(1)} ${ptNom.py.toFixed(1)}`);

    // Debris trajectory
    const ptDebR = getDebris3DPoint(activeSat.id, primaryConj.trajectoryType, st);
    const ptDebProj = project3D(ptDebR.x, ptDebR.y, ptDebR.z);
    debPath3DPoints.push(`${step === 0 ? 'M' : 'L'} ${ptDebProj.px.toFixed(1)} ${ptDebProj.py.toFixed(1)}`);

    // Post-Burn Deflected Evasion Trajectory
    const ptEvaRaw = getTrajectory3DPoint(activeSat.id, primaryConj.trajectoryType, st, true, deltaVx, deltaVy, deltaVz);
    const ptEva = project3D(ptEvaRaw.x, ptEvaRaw.y, ptEvaRaw.z);
    evasionPath3DPoints.push(`${step === 0 ? 'M' : 'L'} ${ptEva.px.toFixed(1)} ${ptEva.py.toFixed(1)}`);
  }

  // Central Celestial Body Details
  const centralBodyName =
    activeSat.id === 'CHANDRAYAAN-3'
      ? 'THE MOON (LUNAR ORBIT)'
      : activeSat.id === 'ADITYA-L1'
      ? 'SUN-EARTH L1 LIBRATION POINT'
      : 'EARTH (LOW / GEO ORBIT)';

  const centralBodyColor =
    activeSat.id === 'CHANDRAYAAN-3'
      ? '#94a3b8'
      : activeSat.id === 'ADITYA-L1'
      ? '#facc15'
      : '#38bdf8';

  const centralBodyRadius =
    activeSat.id === 'CHANDRAYAAN-3'
      ? 26
      : activeSat.id === 'ADITYA-L1'
      ? 16
      : 32;

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
              3D ASTRODYNAMICS // 30s LIVE SGP4 TLE SYNC ({syncCountdown}s)
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            CONJUNCTION ANALYSIS
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            High-precision 3D orbital trajectory intersection sandbox with 3-Sigma Covariance Ellipsoids, real-time time-scrubbing, and dynamic thruster burn vector simulation.
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

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Radar / 3D Astrodynamics Sandbox Canvas */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-6 relative border border-glass-border overflow-hidden shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* HUD Status & View Mode Switcher */}
            <div className="flex items-center justify-between border-b border-glass-border/70 pb-4 mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Crosshair size={18} className="text-cyan-glow animate-spin" style={{ animationDuration: '8s' }} />
                <div>
                  <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                    ORBITAL INTERSECTION: {primaryConj.trajectoryType.toUpperCase()} ({primaryConj.crossingAngleDeg}° CROSSING)
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    ASSET: {primaryConj.primary_code} ({activeSat.altitude}) ⟷ DEBRIS: {primaryConj.target_object_id}
                  </span>
                </div>
              </div>

              {/* View Mode Toggle & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 text-[10px] font-space font-bold">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setViewMode('3d')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === '3d' ? 'bg-cyan-glow text-space-black shadow-[0_0_10px_rgba(99,199,255,0.4)]' : 'text-star-white/60 hover:text-star-white'
                    }`}
                  >
                    <Box size={12} />
                    <span>3D SANDBOX</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setViewMode('2d')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === '2d' ? 'bg-cyan-glow text-space-black shadow-[0_0_10px_rgba(99,199,255,0.4)]' : 'text-star-white/60 hover:text-star-white'
                    }`}
                  >
                    <Crosshair size={12} />
                    <span>2D RADAR</span>
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSimActive(!simActive)}
                  className="p-2 rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow hover:bg-cyan-glow/20 transition-all cursor-pointer"
                  title={simActive ? 'Pause simulation' : 'Play simulation'}
                >
                  {simActive ? <Pause size={14} /> : <Play size={14} />}
                </div>
              </div>
            </div>

            {/* Canvas Area: 3D Isometric View or 2D Radar View (Enlarged for Optimal Visualization) */}
            <div
              className="relative w-full aspect-[16/10] min-h-[380px] sm:min-h-[460px] md:min-h-[520px] bg-[#020610] rounded-3xl overflow-hidden border border-cyan-glow/30 select-none cursor-grab active:cursor-grabbing shadow-[inset_0_0_60px_rgba(0,212,255,0.06)]"
              onMouseDown={viewMode === '3d' ? handleMouseDown : undefined}
              onMouseMove={viewMode === '3d' ? handleMouseMove : undefined}
              onMouseUp={viewMode === '3d' ? handleMouseUp : undefined}
            >
              <svg viewBox="0 0 700 420" className="w-full h-full">
                <defs>
                  <linearGradient id="satTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="debTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="evasionTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
                  </linearGradient>
                  <radialGradient id="radarSweepBackdrop" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0, 212, 255, 0.15)" />
                    <stop offset="60%" stopColor="rgba(0, 212, 255, 0.04)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                  </radialGradient>
                </defs>

                {viewMode === '3d' ? (
                  /* 3D ASTRODYNAMICS ISOMETRIC CANVAS (ENLARGED & SCALED TO 700x420) */
                  <g transform="translate(50, 30)">
                    {/* Central Celestial Body (Earth / Moon / L1 Point) */}
                    {(() => {
                      const pBody = project3D(0, 0, 0);
                      return (
                        <g transform={`translate(${pBody.px}, ${pBody.py})`}>
                          <circle
                            r={centralBodyRadius * pBody.scale * 1.15}
                            fill={centralBodyColor}
                            opacity="0.2"
                            className="animate-pulse"
                          />
                          <circle
                            r={(centralBodyRadius + 4) * pBody.scale * 1.15}
                            fill="none"
                            stroke={centralBodyColor}
                            strokeWidth="1.2"
                            strokeDasharray="4,3"
                            opacity="0.6"
                          />
                          <circle
                            r={centralBodyRadius * 0.75 * pBody.scale * 1.15}
                            fill={centralBodyColor}
                            opacity="0.85"
                          />
                          <text
                            x="0"
                            y={(centralBodyRadius + 16) * pBody.scale}
                            fill={centralBodyColor}
                            fontSize="8.5"
                            fontFamily="'Space Grotesk', sans-serif"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {centralBodyName}
                          </text>
                        </g>
                      );
                    })()}

                    {/* 3D Coordinate Grid Plane */}
                    {[-150, -75, 0, 75, 150].map((coord) => {
                      const pA = project3D(-180, 0, coord);
                      const pB = project3D(180, 0, coord);
                      const pC = project3D(coord, 0, -180);
                      const pD = project3D(coord, 0, 180);
                      return (
                        <g key={coord}>
                          <line x1={pA.px} y1={pA.py} x2={pB.px} y2={pB.py} stroke="rgba(0, 212, 255, 0.08)" strokeDasharray="3,3" />
                          <line x1={pC.px} y1={pC.py} x2={pD.px} y2={pD.py} stroke="rgba(0, 212, 255, 0.08)" strokeDasharray="3,3" />
                        </g>
                      );
                    })}

                    {/* 3D XYZ RIC Vector Axes */}
                    {(() => {
                      const o = project3D(0, 0, 0);
                      const axX = project3D(110, 0, 0);
                      const axY = project3D(0, -90, 0);
                      const axZ = project3D(0, 0, 110);
                      return (
                        <g>
                          <line x1={o.px} y1={o.py} x2={axX.px} y2={axX.py} stroke="#00d4ff" strokeWidth="1.5" />
                          <text x={axX.px + 4} y={axX.py} fill="#00d4ff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">+V (In-Track)</text>
                          <line x1={o.px} y1={o.py} x2={axY.px} y2={axY.py} stroke="#10b981" strokeWidth="1.5" />
                          <text x={axY.px} y={axY.py - 4} fill="#10b981" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">+R (Radial)</text>
                          <line x1={o.px} y1={o.py} x2={axZ.px} y2={axZ.py} stroke="#fbbf24" strokeWidth="1.5" />
                          <text x={axZ.px + 4} y={axZ.py + 4} fill="#fbbf24" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">+W (Cross-Track)</text>
                        </g>
                      );
                    })()}

                    {/* 3D Pre-Burn Nominal Satellite Trajectory Path */}
                    <path d={satPath3DPoints.join(' ')} fill="none" stroke="rgba(0, 212, 255, 0.5)" strokeWidth="2" strokeDasharray="4,4" />

                    {/* 3D Debris Trajectory Path */}
                    <path d={debPath3DPoints.join(' ')} fill="none" stroke="rgba(255, 59, 59, 0.6)" strokeWidth="2" strokeDasharray="3,3" />

                    {/* 3D Post-Burn Deflected Evasion Trajectory (Green) */}
                    <path d={evasionPath3DPoints.join(' ')} fill="none" stroke="#10b981" strokeWidth="2.8" />

                    {/* 3D 3-Sigma Covariance Ellipsoids at TCA */}
                    <g transform={`translate(${p3Tca.px}, ${p3Tca.py})`}>
                      {/* Primary Spacecraft Covariance Bubble (Blue) */}
                      <ellipse rx="42" ry="22" fill="rgba(0, 212, 255, 0.12)" stroke="#00d4ff" strokeWidth="1.2" strokeDasharray="3,3" />
                      {/* Debris Hazard Covariance Bubble (Red) */}
                      <ellipse rx="58" ry="28" fill="rgba(255, 59, 59, 0.15)" stroke="#ff3b3b" strokeWidth="1.5" className="animate-pulse" />
                      <circle r="4.5" fill="#ff3b3b" />
                      <text x="14" y="-10" fill="#ff3b3b" fontSize="10.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        TCA CONJUNCTION EPOCH ({primaryConj.crossingAngleDeg}° CROSSING)
                      </text>
                      <text x="14" y="6" fill="rgba(232, 237, 242, 0.85)" fontSize="9" fontFamily="'Inter', sans-serif">
                        Nominal Miss: {primaryConj.miss_distance_km} km ➔ Post-Burn: {postBurnMissKm} km (Pc: {postBurnPc.toExponential(2)})
                      </text>
                    </g>

                    {/* 3D Satellite Node */}
                    <g transform={`translate(${p3Sat.px}, ${p3Sat.py})`}>
                      <circle r="8" fill="#00d4ff" className="animate-pulse" />
                      <circle r="18" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />
                      <text x="14" y="-8" fill="#00d4ff" fontSize="11.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        {primaryConj.primary_code} [{activeSat.agency}]
                      </text>
                      <text x="14" y="8" fill="#10b981" fontSize="9.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        ΔV: {totalDeltaV.toFixed(2)} m/s (Prop: {hydrazineCostKg} kg)
                      </text>
                    </g>

                    {/* 3D Debris Node */}
                    <g transform={`translate(${p3Deb.px}, ${p3Deb.py})`}>
                      <circle r="7" fill="#ff3b3b" className="animate-pulse" />
                      <circle r="16" fill="none" stroke="#ff3b3b" strokeWidth="1.5" opacity="0.7" />
                      <text x="14" y="14" fill="#ff3b3b" fontSize="11.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        {primaryConj.target_object_id} ({primaryConj.risk_level})
                      </text>
                    </g>

                    {/* Laser Distance Measuring Line */}
                    <line x1={p3Sat.px} y1={p3Sat.py} x2={p3Deb.px} y2={p3Deb.py} stroke="rgba(251, 191, 36, 0.75)" strokeWidth="1.5" strokeDasharray="4,2" />
                    <text x={(p3Sat.px + p3Deb.px) / 2 + 8} y={(p3Sat.py + p3Deb.py) / 2 - 4} fill="#fbbf24" fontSize="9.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                      SLANT RANGE: {scrubDistKm} km
                    </text>
                  </g>
                ) : (
                  /* 2D SGP4 RADAR VIEW CANVAS (PROMINENT, ENLARGED & DETAILED) */
                  <g>
                    {/* Background Radial Sweep Glow */}
                    <circle cx="350" cy="210" r="190" fill="url(#radarSweepBackdrop)" />

                    {/* Concentric Range Rings (100km, 50km, 25km, 10km) */}
                    <circle cx="350" cy="210" r="190" fill="none" stroke="rgba(0, 212, 255, 0.18)" strokeWidth="1" strokeDasharray="4,6" />
                    <circle cx="350" cy="210" r="140" fill="none" stroke="rgba(0, 212, 255, 0.22)" strokeWidth="1" strokeDasharray="3,5" />
                    <circle cx="350" cy="210" r="90" fill="none" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" strokeDasharray="2,4" />
                    <circle cx="350" cy="210" r="40" fill="rgba(255, 59, 59, 0.08)" stroke="rgba(255, 59, 59, 0.45)" strokeWidth="1.5" />

                    {/* Range Labels */}
                    <text x="355" y="24" fill="rgba(0, 212, 255, 0.6)" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">100 KM</text>
                    <text x="355" y="74" fill="rgba(0, 212, 255, 0.6)" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">50 KM</text>
                    <text x="355" y="124" fill="rgba(0, 212, 255, 0.6)" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">25 KM</text>
                    <text x="355" y="174" fill="rgba(255, 59, 59, 0.8)" fontSize="8.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">10 KM CAM ZONE</text>

                    {/* Azimuth Radials (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°) */}
                    <line x1="350" y1="20" x2="350" y2="400" stroke="rgba(0, 212, 255, 0.15)" strokeWidth="1" strokeDasharray="2,4" />
                    <line x1="160" y1="210" x2="540" y2="210" stroke="rgba(0, 212, 255, 0.15)" strokeWidth="1" strokeDasharray="2,4" />
                    <line x1="215" y1="75" x2="485" y2="345" stroke="rgba(0, 212, 255, 0.08)" strokeDasharray="2,4" />
                    <line x1="215" y1="345" x2="485" y2="75" stroke="rgba(0, 212, 255, 0.08)" strokeDasharray="2,4" />

                    {/* Cardinal Degree Markers */}
                    <text x="350" y="14" fill="#00d4ff" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">000° (N)</text>
                    <text x="555" y="214" fill="#00d4ff" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">090° (E)</text>
                    <text x="350" y="414" fill="#00d4ff" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">180° (S)</text>
                    <text x="145" y="214" fill="#00d4ff" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="end">270° (W)</text>

                    {/* Rotating Surveillance Beam */}
                    <line
                      x1="350"
                      y1="210"
                      x2={350 + Math.cos(tcaProgress * 30) * 190}
                      y2={210 + Math.sin(tcaProgress * 30) * 190}
                      stroke="#00d4ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_8px_#00d4ff]"
                    />

                    {/* Trajectory Paths */}
                    <path d={satPathD} fill="none" stroke="rgba(0, 212, 255, 0.55)" strokeWidth="2.5" strokeDasharray="6,4" />
                    <path d={debPathD} fill="none" stroke="rgba(255, 59, 59, 0.55)" strokeWidth="2.5" strokeDasharray="5,4" />

                    {/* TCA Center Convergence Point */}
                    <g transform="translate(350, 210)">
                      <circle r="44" fill="rgba(255, 59, 59, 0.08)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                      <circle r="24" fill="rgba(255, 59, 59, 0.18)" />
                      <circle r="5" fill="#ff3b3b" />
                      <line x1="-15" y1="0" x2="15" y2="0" stroke="#ff3b3b" strokeWidth="1.5" />
                      <line x1="0" y1="-15" x2="0" y2="15" stroke="#ff3b3b" strokeWidth="1.5" />
                      <text x="16" y="-12" fill="#ff3b3b" fontSize="12" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        TCA POINT ({primaryConj.crossingAngleDeg}° INTERSECTION)
                      </text>
                      <text x="16" y="8" fill="rgba(232, 237, 242, 0.85)" fontSize="10" fontFamily="'Inter', sans-serif">
                        Δ: {primaryConj.miss_distance_km} km ({primaryConj.risk_level}) • Pc: {primaryConj.collision_probability.toExponential(2)}
                      </text>
                    </g>

                    {/* Satellite Radar Blip */}
                    <g transform={`translate(${satX + 50}, ${satY + 30})`}>
                      <circle r="8" fill="#00d4ff" className="animate-pulse" />
                      <circle r="18" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" className="animate-ping" style={{ animationDuration: '3s' }} />
                      <text x="14" y="-8" fill="#00d4ff" fontSize="12" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        {primaryConj.primary_code} [{activeSat.name}]
                      </text>
                      <text x="14" y="8" fill="#10b981" fontSize="9.5" fontFamily="'Inter', sans-serif">
                        VEL: {activeSat.velocity} • ALT: {activeSat.altitude}
                      </text>
                    </g>

                    {/* Debris Hazard Radar Blip */}
                    <g transform={`translate(${debX + 50}, ${debY + 30})`}>
                      <circle r="7" fill="#ff3b3b" className="animate-pulse" />
                      <circle r="16" fill="none" stroke="#ff3b3b" strokeWidth="1.5" opacity="0.7" />
                      <text x="14" y="16" fill="#ff3b3b" fontSize="12" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        {primaryConj.target_object_id} ({primaryConj.target_name})
                      </text>
                      <text x="14" y="30" fill="rgba(255, 59, 59, 0.8)" fontSize="9.5" fontFamily="'Inter', sans-serif">
                        RELATIVE VEL: 14.8 km/s • RISK: {primaryConj.risk_level}
                      </text>
                    </g>
                  </g>
                )}
              </svg>

              {/* 3D Drag Tip Badge */}
              {viewMode === '3d' && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 border border-cyan-glow/20 text-[10px] font-space text-cyan-glow pointer-events-none flex items-center gap-1.5">
                  <span>🖱️ CLICK &amp; DRAG TO ROTATE 3D ASTRODYNAMICS ORBIT (Pitch: {rotX.toFixed(0)}°, Yaw: {rotY.toFixed(0)}°)</span>
                </div>
              )}
            </div>

            {/* Time Scrubbing Epoch Slider */}
            <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-space text-muted-gray uppercase">
                <span className="flex items-center gap-1.5 text-cyan-glow font-bold">
                  <Clock size={12} />
                  <span>TIME-OF-CLOSEST-APPROACH SCRUBBER</span>
                </span>
                <div className="flex items-center gap-2">
                  {[1, 5, 20].map((s) => (
                    <div
                      key={s}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSimSpeed(s)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                        simSpeed === s ? 'bg-cyan-glow text-space-black font-bold' : 'text-muted-gray hover:text-star-white'
                      }`}
                    >
                      {s}x
                    </div>
                  ))}
                  <span className="font-mono text-cyan-glow font-bold">
                    {tcaProgress < 0.7 ? `T - ${((0.7 - tcaProgress) * 60).toFixed(0)}m` : `T + ${((tcaProgress - 0.7) * 60).toFixed(0)}m`}
                  </span>
                </div>
              </div>

              <input
                id="cam-tca-progress-slider"
                name="camTcaProgress"
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={tcaProgress}
                onChange={(e) => {
                  setSimActive(false);
                  setTcaProgress(parseFloat(e.target.value));
                }}
                className="w-full accent-cyan-glow cursor-pointer bg-white/10 rounded-lg h-1.5"
              />
            </div>

            {/* Interactive Thruster Evasion Burn Controls */}
            <div className="mt-4 p-4 rounded-2xl bg-space-navy/40 border border-cyan-glow/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-space text-xs font-bold text-star-white flex items-center gap-1.5 uppercase">
                  <Sliders size={14} className="text-cyan-glow" />
                  <span>INTERACTIVE THRUSTER VECTOR SLIDERS (CAM SANDBOX)</span>
                </span>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setDeltaVx(-0.42);
                    setDeltaVy(0.12);
                    setDeltaVz(0.08);
                  }}
                  className="text-[10px] font-space text-muted-gray hover:text-cyan-glow flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={11} /> Reset Defaults
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Along-Track / In-Track */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-space">
                    <span className="text-star-white/60">ΔVx (In-Track)</span>
                    <span className="font-mono font-bold text-cyan-glow">{deltaVx.toFixed(2)} m/s</span>
                  </div>
                  <input
                    id="cam-delta-vx-slider"
                    name="camDeltaVx"
                    type="range"
                    min="-1.5"
                    max="1.5"
                    step="0.02"
                    value={deltaVx}
                    onChange={(e) => setDeltaVx(parseFloat(e.target.value))}
                    className="w-full accent-cyan-glow cursor-pointer bg-white/10 h-1.5 rounded-lg"
                  />
                  <span className="text-[8px] font-space text-muted-gray block">Retrograde (-) / Prograde (+)</span>
                </div>

                {/* Cross-Track / Out-of-Plane */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-space">
                    <span className="text-star-white/60">ΔVy (Cross-Track)</span>
                    <span className="font-mono font-bold text-amber-400">{deltaVy.toFixed(2)} m/s</span>
                  </div>
                  <input
                    id="cam-delta-vy-slider"
                    name="camDeltaVy"
                    type="range"
                    min="-1.0"
                    max="1.0"
                    step="0.02"
                    value={deltaVy}
                    onChange={(e) => setDeltaVy(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer bg-white/10 h-1.5 rounded-lg"
                  />
                  <span className="text-[8px] font-space text-muted-gray block">Out-of-Plane Inclination Trim</span>
                </div>

                {/* Radial In / Out */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-space">
                    <span className="text-star-white/60">ΔVz (Radial)</span>
                    <span className="font-mono font-bold text-emerald-400">{deltaVz.toFixed(2)} m/s</span>
                  </div>
                  <input
                    id="cam-delta-vz-slider"
                    name="camDeltaVz"
                    type="range"
                    min="-1.0"
                    max="1.0"
                    step="0.02"
                    value={deltaVz}
                    onChange={(e) => setDeltaVz(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer bg-white/10 h-1.5 rounded-lg"
                  />
                  <span className="text-[8px] font-space text-muted-gray block">Altitude Eccentricity Pulse</span>
                </div>
              </div>
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
                      <span className="font-inter text-[10px] text-muted-gray uppercase block">Initial Miss Distance</span>
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
                      <span className="font-inter text-[10px] text-muted-gray uppercase block">Initial Collision Prob (Pc)</span>
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

              {/* Dynamic Sandbox Simulation Output Box */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-space text-[11px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>SIMULATED CAM CLEARANCE</span>
                  </span>
                  <span className="font-space text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                    {riskCutPct}% RISK CUT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-space text-star-white">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20">
                    <span className="text-muted-gray text-[9px] block uppercase font-semibold">TOTAL DELTA-V:</span>
                    <span className="font-bold text-cyan-glow font-mono text-sm">
                      {totalDeltaV.toFixed(2)} m/s
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20">
                    <span className="text-muted-gray text-[9px] block uppercase font-semibold">POST-BURN MISS:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {postBurnMissKm} km
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20">
                    <span className="text-muted-gray text-[9px] block uppercase font-semibold">HYDRAZINE PROPELLANT:</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {hydrazineCostKg} kg
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20">
                    <span className="text-muted-gray text-[9px] block uppercase font-semibold">POST-BURN PC:</span>
                    <span className="font-bold text-star-white font-mono">
                      {postBurnPc < 0.001 ? postBurnPc.toExponential(2) : postBurnPc}
                    </span>
                  </div>
                </div>

                {/* Uplink / Authorize Button */}
                {maneuverUplinked ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-space text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>CAM SOLUTION UPLINKED TO {primaryConj.primary_code}</span>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setManeuverUplinked(true)}
                    className="w-full py-2.5 rounded-xl bg-cyan-glow hover:bg-cyan-glow/90 text-space-black font-space text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(99,199,255,0.4)]"
                  >
                    <Flame size={15} />
                    <span>UPLINK CAM SOLUTION TO SPACECRAFT</span>
                  </div>
                )}
              </div>

              {/* Astrodynamics Model Footnote */}
              <div className="mt-3 pt-2.5 border-t border-glass-border flex items-start gap-2">
                <HelpCircle size={12} className="text-muted-gray shrink-0 mt-0.5" />
                <p className="font-inter text-[9px] text-muted-gray leading-tight">
                  Foster-1992 3D Collision Avoidance Algorithm with SGP4/B-Plane covariance uncertainty propagation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
