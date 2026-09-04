'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Sparkles,
  Radio,
  Clock,
  Thermometer,
  Zap,
  Activity,
  Compass,
  Layers,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Shield,
  Eye,
  Crosshair,
  TrendingUp,
  Flame,
  Radar,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Orbit,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import {
  api,
  AdityaL1DeepSpaceData,
  Chandrayaan3DeepSpaceData,
  JWSTDeepSpaceData,
  getChandrayaan3DeepSpaceFallback,
  getAdityaL1DeepSpaceFallback,
  getJWSTDeepSpaceFallback,
} from '../lib/api';

// JWST 18-Hex Mirror Segment Definition
interface HexMirrorSegment {
  id: string;
  ring: 'A' | 'B' | 'C';
  col: number;
  cx: number;
  cy: number;
  pistonNm: number;
  tiltArcsec: number;
  wavefrontRmsNm: number;
  status: 'NOMINAL_PHASED' | 'FINE_TUNING';
}

const JWST_HEX_SEGMENTS: HexMirrorSegment[] = [
  // Ring A (Inner 6 segments)
  { id: 'A1', ring: 'A', col: 1, cx: 300, cy: 120, pistonNm: +2.1, tiltArcsec: 0.004, wavefrontRmsNm: 24.2, status: 'NOMINAL_PHASED' },
  { id: 'A2', ring: 'A', col: 2, cx: 345, cy: 145, pistonNm: -1.4, tiltArcsec: 0.003, wavefrontRmsNm: 22.8, status: 'NOMINAL_PHASED' },
  { id: 'A3', ring: 'A', col: 3, cx: 345, cy: 195, pistonNm: +0.8, tiltArcsec: 0.005, wavefrontRmsNm: 26.1, status: 'NOMINAL_PHASED' },
  { id: 'A4', ring: 'A', col: 4, cx: 300, cy: 220, pistonNm: +1.9, tiltArcsec: 0.002, wavefrontRmsNm: 21.5, status: 'NOMINAL_PHASED' },
  { id: 'A5', ring: 'A', col: 5, cx: 255, cy: 195, pistonNm: -2.3, tiltArcsec: 0.004, wavefrontRmsNm: 25.0, status: 'NOMINAL_PHASED' },
  { id: 'A6', ring: 'A', col: 6, cx: 255, cy: 145, pistonNm: +0.4, tiltArcsec: 0.003, wavefrontRmsNm: 23.4, status: 'NOMINAL_PHASED' },

  // Ring B (Outer middle segments)
  { id: 'B1', ring: 'B', col: 1, cx: 300, cy: 70, pistonNm: +3.4, tiltArcsec: 0.006, wavefrontRmsNm: 28.1, status: 'NOMINAL_PHASED' },
  { id: 'B2', ring: 'B', col: 2, cx: 390, cy: 120, pistonNm: -0.9, tiltArcsec: 0.004, wavefrontRmsNm: 24.8, status: 'NOMINAL_PHASED' },
  { id: 'B3', ring: 'B', col: 3, cx: 390, cy: 220, pistonNm: +4.2, tiltArcsec: 0.007, wavefrontRmsNm: 29.5, status: 'NOMINAL_PHASED' },
  { id: 'B4', ring: 'B', col: 4, cx: 300, cy: 270, pistonNm: -1.8, tiltArcsec: 0.005, wavefrontRmsNm: 27.2, status: 'NOMINAL_PHASED' },
  { id: 'B5', ring: 'B', col: 5, cx: 210, cy: 220, pistonNm: +2.7, tiltArcsec: 0.004, wavefrontRmsNm: 26.4, status: 'NOMINAL_PHASED' },
  { id: 'B6', ring: 'B', col: 6, cx: 210, cy: 120, pistonNm: -3.1, tiltArcsec: 0.006, wavefrontRmsNm: 30.1, status: 'NOMINAL_PHASED' },

  // Ring C (Outer wings)
  { id: 'C1', ring: 'C', col: 1, cx: 345, cy: 95, pistonNm: +1.1, tiltArcsec: 0.003, wavefrontRmsNm: 25.6, status: 'NOMINAL_PHASED' },
  { id: 'C2', ring: 'C', col: 2, cx: 435, cy: 170, pistonNm: -2.0, tiltArcsec: 0.005, wavefrontRmsNm: 28.9, status: 'NOMINAL_PHASED' },
  { id: 'C3', ring: 'C', col: 3, cx: 345, cy: 245, pistonNm: +5.0, tiltArcsec: 0.008, wavefrontRmsNm: 34.2, status: 'FINE_TUNING' },
  { id: 'C4', ring: 'C', col: 4, cx: 255, cy: 245, pistonNm: -0.6, tiltArcsec: 0.002, wavefrontRmsNm: 22.0, status: 'NOMINAL_PHASED' },
  { id: 'C5', ring: 'C', col: 5, cx: 165, cy: 170, pistonNm: +3.8, tiltArcsec: 0.007, wavefrontRmsNm: 31.8, status: 'NOMINAL_PHASED' },
  { id: 'C6', ring: 'C', col: 6, cx: 255, cy: 95, pistonNm: -1.5, tiltArcsec: 0.004, wavefrontRmsNm: 26.7, status: 'NOMINAL_PHASED' },
];

export default function DeepSpaceExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { formatMissionTime } = useMission();

  const [activeTab, setActiveTab] = useState<'aditya' | 'chandrayaan' | 'jwst'>('chandrayaan');
  const [adityaData, setAdityaData] = useState<AdityaL1DeepSpaceData>(getAdityaL1DeepSpaceFallback);
  const [ch3Data, setCh3Data] = useState<Chandrayaan3DeepSpaceData>(getChandrayaan3DeepSpaceFallback);
  const [jwstData, setJwstData] = useState<JWSTDeepSpaceData>(getJWSTDeepSpaceFallback);
  const [coronaPulse, setCoronaPulse] = useState(0);
  const [liveEpochMs, setLiveEpochMs] = useState<number>(Date.now());

  // Aditya-L1 Interactive State
  const [adityaViewMode, setAdityaViewMode] = useState<'VELC_CORONA' | 'L1_HALO_3D'>('L1_HALO_3D');

  // Chandrayaan-3 Interactive State
  const [ch3ViewMode, setCh3ViewMode] = useState<'SURFACE_3D' | 'TRAJECTORY' | 'CHASTE_PROFILE'>('SURFACE_3D');
  const [ch3ThrustersActive, setCh3ThrustersActive] = useState<boolean>(true);
  const [ch3LaserScanner, setCh3LaserScanner] = useState<boolean>(true);
  const [selectedCh3WaypointIdx, setSelectedCh3WaypointIdx] = useState<number>(4);
  const [ch3LaserScanPulse, setCh3LaserScanPulse] = useState<number>(0);

  // Pragyan Traverse Waypoints (ISRO Official Traverse at Shiv Shakti Point)
  const PRAGYAN_WAYPOINTS = [
    { id: 'WP1', distM: 0.0, label: 'RAMP ROLLOUT', desc: 'Lander ramp egress & roll onto South Pole soil', x: 220, y: 200, scienceResult: 'Mobility nominal, 6-wheel rocker-bogie deployed' },
    { id: 'WP2', distM: 12.5, label: 'FIRST TURN & TRACKS', desc: 'Initial maneuver imprinting ISRO & Ashoka emblem on soil', x: 285, y: 218, scienceResult: 'NavCam stereo calibrated, wheel slippage < 1.8%' },
    { id: 'WP3', distM: 34.8, label: 'APXS & LIBS TARGET', desc: 'Laser breakdown spectroscopy on polar surface boulder', x: 360, y: 198, scienceResult: 'Definitive Sulfur (S), Fe, Ti, Al, Ca, Si elemental detection' },
    { id: 'WP4', distM: 68.2, label: 'CRATER HAZARD DIVERT', desc: 'Autonomous detour around 4-meter diameter crater rim', x: 435, y: 232, scienceResult: 'Obstacle avoidance verified with 3.2m safety clearance' },
    { id: 'WP5', distM: 101.4, label: 'FINAL HIBERNATION PARK', desc: 'Solar array oriented toward next sunrise at Shiv Shakti', x: 520, y: 210, scienceResult: '101.4m cumulative traverse completed; battery charged' },
  ];

  const activeWaypoint = PRAGYAN_WAYPOINTS[selectedCh3WaypointIdx] || PRAGYAN_WAYPOINTS[4];
  const roverDistance = ch3Data?.rover_pragyan_distance_traversed_m ?? 101.4;

  // JWST Interactive State
  const [jwstViewMode, setJwstViewMode] = useState<'MIRROR_OPTICS' | 'SUNSHIELD_L2' | 'DEEP_FIELD_IR'>('MIRROR_OPTICS');
  const [selectedHexSegment, setSelectedHexSegment] = useState<HexMirrorSegment>(JWST_HEX_SEGMENTS[0]);
  const [jwstRayAnimation, setJwstRayAnimation] = useState<number>(0);
  const [infraredWavelengthUm, setInfraredWavelengthUm] = useState<number>(4.4);
  const [sunshieldActiveLayer, setSunshieldActiveLayer] = useState<number>(1);

  // Fetch specialized deep-space telemetry
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aditya, ch3, jwst] = await Promise.all([
          api.getAdityaL1DeepSpace(),
          api.getChandrayaan3DeepSpace(),
          api.getJWSTDeepSpace(),
        ]);
        setAdityaData(aditya);
        setCh3Data(ch3);
        setJwstData(jwst);
      } catch {
        // Fallback to active simulated state
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Continuous high-precision live simulation clock based on real epoch seconds
  useEffect(() => {
    const cInterval = setInterval(() => {
      const now = Date.now();
      setLiveEpochMs(now);
      const sec = now / 1000;
      setCoronaPulse((sec * 12) % 360);
      setJwstRayAnimation((sec * 30) % 100);
      setCh3LaserScanPulse((sec * 45) % 100);
    }, 50);
    return () => clearInterval(cInterval);
  }, []);

  // Helper function to create SVG hexagon points
  const getHexPoints = (cx: number, cy: number, r: number = 24) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <section id="deep-space" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-400/20 bg-purple-400/5 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <Sparkles size={13} className="text-purple-400 animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-purple-400 uppercase font-bold">
              MULTI-BODY INTERPLANETARY &amp; LAGRANGE TELEMETRY
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            DEEP-SPACE EXPLORER
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed">
            Specialized astrodynamics consoles &amp; interactive visualizers for Sun-Earth L1 Halo Orbit (Aditya-L1), Lunar South Pole (Chandrayaan-3), and Sun-Earth L2 (JWST) with light-time radio latency modeling.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* MISSION SELECTOR TABS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'chandrayaan', label: 'CHANDRAYAAN-3 (LUNAR SOUTH POLE)', icon: Moon, color: '#f59e0b', tag: 'SHIV SHAKTI POINT' },
              { id: 'jwst', label: 'JWST (SUN-EARTH L2 INFRARED)', icon: Sparkles, color: '#ec4899', tag: '1.5M km ANTI-SUN' },
              { id: 'aditya', label: 'ADITYA-L1 (SUN-EARTH L1)', icon: Sun, color: '#fbbf24', tag: '1.5M km SUNWARD' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-400 text-star-white shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-purple-400/40'
                  }`}
                >
                  <Icon size={15} style={{ color: tab.color }} />
                  <span>{tab.label}</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-[9px] font-mono text-star-white/60">
                    {tab.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content Panes */}
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* TAB 1: CHANDRAYAAN-3 LUNAR SOUTH POLE & INTERACTIVE VISUALIZER */}
          {/* ============================================================== */}
          {activeTab === 'chandrayaan' && (
            <motion.div
              key="chandrayaan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Console: High-Fidelity Interactive Visualizer */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col">
                {/* Console Header */}
                <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Moon size={22} className="text-amber-500 animate-pulse" />
                    <div>
                      <span className="font-space text-xs sm:text-sm tracking-widest text-star-white uppercase block font-bold">
                        SHIV SHAKTI POINT // CHANDRAYAAN-3 DEEP SPACE VISUALIZER
                      </span>
                      <span className="font-space text-[10px] text-amber-400/80">
                        {ch3Data?.landing_site ?? 'SHIV SHAKTI POINT [69.373° S, 32.319° E]'} // POLAR REGOLITH TELEMETRY
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/30">
                    <Radio size={13} className="text-amber-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-star-white">
                      RADIO DELAY: <strong className="text-amber-400">{ch3Data?.light_time_delay_sec ?? 1.28}s</strong> ({Math.round(ch3Data?.distance_from_earth_km ?? 384400).toLocaleString()} km)
                    </span>
                  </div>
                </div>

                {/* Sub-View Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'SURFACE_3D', label: 'LUNAR SURFACE & ROVER 3D', icon: Crosshair },
                      { id: 'TRAJECTORY', label: 'EARTH-MOON TRAJECTORY', icon: Orbit },
                      { id: 'CHASTE_PROFILE', label: 'CHASTE THERMAL GRADIENT', icon: Thermometer },
                    ].map((btn) => {
                      const Icon = btn.icon;
                      const isSel = ch3ViewMode === btn.id;
                      return (
                        <button
                          type="button"
                          key={btn.id}
                          onClick={() => setCh3ViewMode(btn.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-space tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                              : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white'
                          }`}
                        >
                          <Icon size={13} />
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Surface Controls */}
                  {ch3ViewMode === 'SURFACE_3D' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCh3ThrustersActive(!ch3ThrustersActive)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                          ch3ThrustersActive
                            ? 'bg-orange-500/20 border-orange-400 text-orange-300'
                            : 'bg-black/40 border-white/10 text-muted-gray'
                        }`}
                      >
                        <Flame size={12} className={ch3ThrustersActive ? 'text-orange-400 animate-pulse' : ''} />
                        <span>THRUSTERS: {ch3ThrustersActive ? 'ON (800N)' : 'IDLE'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCh3LaserScanner(!ch3LaserScanner)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                          ch3LaserScanner
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-black/40 border-white/10 text-muted-gray'
                        }`}
                      >
                        <Radar size={12} className={ch3LaserScanner ? 'text-emerald-400 animate-spin' : ''} />
                        <span>LHDAC LASER: {ch3LaserScanner ? 'SWEEPING' : 'OFF'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 1: 3D-STYLED LUNAR SOUTH POLE & PRAGYAN ROVER SVG */}
                {/* ------------------------------------------------------------- */}
                {ch3ViewMode === 'SURFACE_3D' && (
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] w-full bg-[#05060d] rounded-2xl overflow-hidden border border-glass-border/60 flex items-center justify-center select-none shadow-inner">
                      <svg viewBox="0 0 640 360" className="w-full h-full">
                        <defs>
                          {/* Space Sky Gradient */}
                          <linearGradient id="lunarSky" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#020308" />
                            <stop offset="60%" stopColor="#080c16" />
                            <stop offset="100%" stopColor="#141824" />
                          </linearGradient>

                          {/* Lunar Mountain Gradient */}
                          <linearGradient id="craterRim" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#2b3240" />
                            <stop offset="50%" stopColor="#1e2330" />
                            <stop offset="100%" stopColor="#0e121a" />
                          </linearGradient>

                          {/* Lunar Ground Gradient */}
                          <linearGradient id="lunarGround" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#252a36" />
                            <stop offset="30%" stopColor="#1a1e28" />
                            <stop offset="100%" stopColor="#0d0f15" />
                          </linearGradient>

                          {/* Gold Lander Hull MLI Gradient */}
                          <linearGradient id="goldMli" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fde047" />
                            <stop offset="30%" stopColor="#f59e0b" />
                            <stop offset="70%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#78350f" />
                          </linearGradient>

                          {/* Thruster Flame Gradient */}
                          <linearGradient id="thrustFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.7" />
                            <stop offset="70%" stopColor="#f97316" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                          </linearGradient>

                          {/* Laser Scan Conical Mesh */}
                          <radialGradient id="laserMesh" cx="50%" cy="0%" r="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                            <stop offset="60%" stopColor="#10b981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Deep Space Sky */}
                        <rect width="640" height="360" fill="url(#lunarSky)" />

                        {/* Stars in lunar sky */}
                        {[
                          { x: 30, y: 30, r: 1 }, { x: 75, y: 70, r: 1.2 }, { x: 140, y: 25, r: 0.8 },
                          { x: 190, y: 80, r: 1 }, { x: 280, y: 40, r: 1.5 }, { x: 350, y: 20, r: 0.9 },
                          { x: 420, y: 65, r: 1.1 }, { x: 510, y: 35, r: 1.3 }, { x: 590, y: 75, r: 1 },
                        ].map((st, i) => (
                          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#e2e8f0" opacity="0.8" />
                        ))}

                        {/* Photorealistic 3D Earth in sky */}
                        <g transform="translate(85, 55)">
                          <circle r="22" fill="none" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="3.5" />
                          <circle r="20" fill="none" stroke="rgba(147, 197, 253, 0.7)" strokeWidth="1.5" />
                          <circle r="19" fill="#1e3a8a" />
                          <path d="M -9 -7 Q -3 -13 5 -9 Q 11 -3 7 7 Q -1 13 -11 7 Z" fill="#15803d" opacity="0.9" />
                          <path d="M -2 -3 L 2 5 L -4 6 Z" fill="#ca8a04" opacity="0.85" />
                          <path d="M 6 -11 Q 12 -9 11 -3 Q 6 1 4 -6 Z" fill="#166534" opacity="0.9" />
                          <path d="M -12 -5 Q -4 -9 8 -3 Q 12 4 4 10 Q -6 6 -12 2 Z" fill="#ffffff" opacity="0.6" />
                          <path d="M -6 4 Q 2 8 9 5" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.75" />
                          <path d="M 0 -19 A 19 19 0 0 1 0 19 Q 8 0 0 -19 Z" fill="#020617" opacity="0.65" />
                          <circle cx="5" cy="-2" r="0.6" fill="#fef08a" opacity="0.9" />
                          <circle cx="8" cy="4" r="0.8" fill="#fde047" opacity="0.8" />
                          <circle r="19" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.8" />
                          <text x="0" y="28" fill="#93c5fd" fontSize="7" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                            EARTH // DSN LINK
                          </text>
                        </g>

                        {/* Top Clean HUD Bar */}
                        <g transform="translate(180, 20)">
                          <rect width="440" height="24" rx="6" fill="rgba(0,0,0,0.8)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
                          <circle cx="14" cy="12" r="4" fill="#10b981" className="animate-pulse" />
                          <text x="26" y="15" fill="#f8fafc" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                            SHIV SHAKTI POINT // 69.373° S, 32.319° E // TELEMETRY LINK LOCKED
                          </text>
                          <text x="425" y="15" fill="#f59e0b" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="end">
                            TOTAL TRAVERSE: {roverDistance}m
                          </text>
                        </g>

                        {/* Distant Lunar South Pole Crater Ridges */}
                        <path
                          d="M 0 170 Q 80 140 160 160 T 320 145 T 480 155 T 640 140 L 640 220 L 0 220 Z"
                          fill="url(#craterRim)"
                          opacity="0.9"
                        />
                        <path
                          d="M 0 185 Q 120 165 240 180 T 460 170 T 640 185 L 640 360 L 0 360 Z"
                          fill="url(#lunarGround)"
                        />

                        {/* Regolith Craters */}
                        <ellipse cx="290" cy="270" rx="35" ry="12" fill="#08090e" stroke="#2a3040" strokeWidth="1" />
                        <ellipse cx="540" cy="290" rx="55" ry="16" fill="#08090e" stroke="#2a3040" strokeWidth="1" />
                        <ellipse cx="400" cy="325" rx="26" ry="7" fill="#08090e" stroke="#2a3040" strokeWidth="1" />

                        {/* SHIV SHAKTI POINT Lunar Ground Target & Non-Colliding Callout */}
                        <g>
                          {/* Concentric Ground Landing Locus directly under Vikram Footpads */}
                          <g transform="translate(150, 192)">
                            <ellipse cx="0" cy="0" rx="42" ry="7" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" opacity="0.8" />
                            <ellipse cx="0" cy="0" rx="20" ry="3.5" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth="1.2" />
                            <circle cx="0" cy="0" r="3" fill="#f59e0b" />
                            <circle cx="0" cy="0" r="8" fill="none" stroke="#f59e0b" strokeWidth="0.8" className="animate-ping" opacity="0.6" />
                          </g>

                          {/* Leader Line to Dedicated Non-Colliding Callout Badge */}
                          <polyline
                            points="150,192 105,224 50,224"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.2"
                            strokeDasharray="2,2"
                          />
                          <circle cx="105" cy="224" r="2" fill="#f59e0b" />

                          {/* Dedicated Shiv Shakti Point Badge */}
                          <g transform="translate(50, 224)">
                            <rect x="-42" y="-12" width="84" height="24" rx="5" fill="rgba(2,6,23,0.95)" stroke="#f59e0b" strokeWidth="1.2" />
                            <text x="0" y="-2" fill="#fcd34d" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                              SHIV SHAKTI POINT
                            </text>
                            <text x="0" y="7.5" fill="#94a3b8" fontSize="5.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" textAnchor="middle">
                              69.373° S, 32.319° E
                            </text>
                          </g>
                        </g>

                        {/* --------------------------------------------------------- */}
                        {/* VIKRAM LANDER GRAPHICAL MODEL */}
                        {/* --------------------------------------------------------- */}
                        <g transform="translate(150, 145)">
                          {/* LHDAC Laser Hazard Scan Cone */}
                          {ch3LaserScanner && (
                            <polygon
                              points="0,25 -55,100 55,100"
                              fill="url(#laserMesh)"
                              stroke="#10b981"
                              strokeWidth="0.8"
                              strokeDasharray="4,4"
                            />
                          )}

                          {/* Throttleable 800N Thruster Exhaust Plumes */}
                          {ch3ThrustersActive && (
                            <g>
                              <polygon points="-16,20 -19,42 -12,42" fill="url(#thrustFlame)" className="animate-pulse" />
                              <polygon points="-5,20 -7,46 -2,46" fill="url(#thrustFlame)" className="animate-pulse" />
                              <polygon points="5,20 2,46 7,46" fill="url(#thrustFlame)" className="animate-pulse" />
                              <polygon points="16,20 12,42 19,42" fill="url(#thrustFlame)" className="animate-pulse" />
                            </g>
                          )}

                          {/* 4 Shock-Absorbing Landing Legs */}
                          <line x1="-20" y1="12" x2="-40" y2="44" stroke="#94a3b8" strokeWidth="2.2" />
                          <line x1="-40" y1="44" x2="-48" y2="46" stroke="#64748b" strokeWidth="2.5" />
                          <circle cx="-44" cy="45" r="2.5" fill="#cbd5e1" />

                          <line x1="20" y1="12" x2="40" y2="44" stroke="#94a3b8" strokeWidth="2.2" />
                          <line x1="40" y1="44" x2="48" y2="46" stroke="#64748b" strokeWidth="2.5" />
                          <circle cx="44" cy="45" r="2.5" fill="#cbd5e1" />

                          {/* Central Octagonal Lander Hull */}
                          <polygon
                            points="-22,-14 22,-14 28,12 -28,12"
                            fill="url(#goldMli)"
                            stroke="#fbbf24"
                            strokeWidth="1.2"
                          />

                          {/* Top Avionics Deck & Solar Panels */}
                          <rect x="-24" y="-20" width="48" height="6" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                          <line x1="-22" y1="-24" x2="-22" y2="-20" stroke="#38bdf8" strokeWidth="1.2" />
                          <line x1="22" y1="-24" x2="22" y2="-20" stroke="#38bdf8" strokeWidth="1.2" />
                          <rect x="-28" y="-27" width="56" height="3.5" rx="1" fill="#0284c7" stroke="#bae6fd" strokeWidth="0.8" />

                          {/* High-Gain Deep Space Antenna */}
                          <line x1="-10" y1="-20" x2="-24" y2="-38" stroke="#e2e8f0" strokeWidth="1.2" />
                          <path d="M -30 -44 A 8 8 0 0 1 -18 -34" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                          <circle cx="-24" cy="-38" r="1.2" fill="#f59e0b" />

                          {/* Deployed Pragyan Rover Ramp extending directly toward WP1 */}
                          <line x1="16" y1="12" x2="65" y2="52" stroke="#64748b" strokeWidth="2.2" strokeDasharray="3,2" />

                          {/* Vikram Lander Label */}
                          <text x="0" y="2" fill="#0f172a" fontSize="6.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                            VIKRAM
                          </text>
                        </g>

                        {/* --------------------------------------------------------- */}
                        {/* AUTHENTIC PRAGYAN ROVER TRAVERSE PATH & TRACKS */}
                        {/* --------------------------------------------------------- */}
                        {/* Wheel Tracks connecting all 5 waypoints */}
                        <path
                          d="M 215 197 L 220 200 L 285 218 L 360 198 L 435 232 L 520 210"
                          fill="none"
                          stroke="#0a0e1a"
                          strokeWidth="3.5"
                          strokeDasharray="2,2"
                        />
                        <path
                          d="M 215 197 L 220 200 L 285 218 L 360 198 L 435 232 L 520 210"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.2"
                          strokeDasharray="4,3"
                          opacity="0.75"
                        />

                        {/* Interactive Waypoint Nodes along Traverse */}
                        {PRAGYAN_WAYPOINTS.map((wp, idx) => {
                          const isSel = idx === selectedCh3WaypointIdx;
                          return (
                            <g
                              key={wp.id}
                              transform={`translate(${wp.x}, ${wp.y})`}
                              className="cursor-pointer"
                              onClick={() => setSelectedCh3WaypointIdx(idx)}
                            >
                              <circle
                                r={isSel ? 7 : 4}
                                fill={isSel ? '#f59e0b' : '#1e293b'}
                                stroke={isSel ? '#ffffff' : '#f59e0b'}
                                strokeWidth={isSel ? 2 : 1}
                              />
                              {isSel && (
                                <circle r={14} fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" opacity="0.6" />
                              )}
                              <text
                                x="0"
                                y={idx % 2 === 0 ? -10 : 18}
                                fill={isSel ? '#ffffff' : '#94a3b8'}
                                fontSize="7"
                                fontFamily="'Space Grotesk', sans-serif"
                                fontWeight={isSel ? 'bold' : 'normal'}
                                textAnchor="middle"
                              >
                                {wp.distM}m
                              </text>
                            </g>
                          );
                        })}

                        {/* --------------------------------------------------------- */}
                        {/* PRAGYAN ROVER 6-WHEEL MODEL AT ACTIVE WAYPOINT */}
                        {/* --------------------------------------------------------- */}
                        <g transform={`translate(${activeWaypoint.x}, ${activeWaypoint.y - 10})`}>
                          {/* Rover Body Gold MLI */}
                          <rect x="-14" y="-5" width="28" height="12" rx="2" fill="url(#goldMli)" stroke="#fbbf24" strokeWidth="1" />

                          {/* Solar Panel Wing angled towards Sun */}
                          <polygon points="-12,-5 12,-5 16,-16 -8,-16" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />

                          {/* NavCam Mast */}
                          <line x1="6" y1="-5" x2="8" y2="-18" stroke="#e2e8f0" strokeWidth="1.2" />
                          <circle cx="8" cy="-18" r="1.8" fill="#10b981" />

                          {/* 6 Rocker-Bogie Wheels */}
                          {[-12, -1, 10].map((wx, idx) => (
                            <g key={idx} transform={`translate(${wx}, 9)`}>
                              <circle r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
                              <circle r="1.5" fill="#475569" />
                            </g>
                          ))}

                          {/* LIBS Laser pulse firing at surface rock */}
                          <line x1="8" y1="-18" x2="45" y2="12" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2" className="animate-pulse" />
                          <circle cx="45" cy="12" r="5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                          <circle cx="45" cy="12" r="1.5" fill="#10b981" className="animate-ping" />

                          {/* Pragyan Active Callout Tag */}
                          <rect x="-35" y="-32" width="70" height="12" rx="3" fill="rgba(0,0,0,0.85)" stroke="#38bdf8" strokeWidth="0.8" />
                          <text x="0" y="-23" fill="#38bdf8" fontSize="6.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                            PRAGYAN [{activeWaypoint.distM}m]
                          </text>
                        </g>
                      </svg>
                    </div>

                    {/* Interactive Pragyan Traverse Waypoint Strip */}
                    <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
                      {PRAGYAN_WAYPOINTS.map((wp, idx) => {
                        const isSel = idx === selectedCh3WaypointIdx;
                        return (
                          <button
                            type="button"
                            key={wp.id}
                            onClick={() => setSelectedCh3WaypointIdx(idx)}
                            className={`px-3 py-1.5 rounded-xl text-left border shrink-0 transition-all cursor-pointer ${
                              isSel
                                ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                : 'bg-black/40 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <span className="text-[9px] font-mono text-amber-400 font-bold block">{wp.distM}m: {wp.label}</span>
                            <span className="text-[8px] text-muted-gray block">{wp.scienceResult.slice(0, 32)}...</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 2: EARTH-MOON TRAJECTORY & INSERTION SVG */}
                {/* ------------------------------------------------------------- */}
                {ch3ViewMode === 'TRAJECTORY' && (
                  <div className="relative aspect-[16/9] w-full bg-[#05060f] rounded-2xl overflow-hidden border border-glass-border/60 flex items-center justify-center">
                    <svg viewBox="0 0 600 340" className="w-full h-full">
                      {/* Photorealistic 3D Earth with parking orbit & multi-burn loops */}
                      <g transform="translate(100, 170)">
                        <circle r="38" fill="none" stroke="rgba(96, 165, 250, 0.3)" strokeWidth="5" />
                        <circle r="34" fill="none" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="1.5" />
                        <circle r="32" fill="#1e3a8a" />
                        <path d="M -16 -12 Q -6 -22 10 -15 Q 20 -5 12 12 Q -2 22 -20 12 Z" fill="#15803d" opacity="0.9" />
                        <path d="M -4 -6 L 4 8 L -7 10 Z" fill="#ca8a04" opacity="0.85" />
                        <path d="M 10 -18 Q 20 -15 18 -5 Q 10 2 6 -10 Z" fill="#166534" opacity="0.9" />
                        <path d="M -20 -8 Q -7 -15 14 -5 Q 20 6 6 16 Q -10 10 -20 3 Z" fill="#ffffff" opacity="0.55" />
                        <path d="M -10 6 Q 3 13 15 8" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.7" />
                        <path d="M 0 -32 A 32 32 0 0 1 0 32 Q 14 0 0 -32 Z" fill="#020617" opacity="0.65" />
                        <circle cx="8" cy="-4" r="1.1" fill="#fef08a" opacity="0.9" />
                        <circle cx="14" cy="6" r="1.3" fill="#fde047" opacity="0.8" />
                        <circle r="32" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                        <circle r="46" fill="none" stroke="rgba(96, 165, 250, 0.45)" strokeDasharray="3,3" />
                        <ellipse rx="70" ry="34" fill="none" stroke="rgba(96, 165, 250, 0.35)" strokeDasharray="2,2" transform="rotate(-15)" />
                        <ellipse rx="95" ry="46" fill="none" stroke="rgba(96, 165, 250, 0.35)" strokeDasharray="2,2" transform="rotate(-15)" />
                        
                        <text x="0" y="5" fill="#ffffff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          EARTH
                        </text>
                        <text x="0" y="52" fill="#93c5fd" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                          5x Earth-Bound Burns
                        </text>
                      </g>

                      {/* Trans-Lunar Injection (TLI) Trajectory Arc */}
                      <path
                        d="M 175 140 C 250 80, 360 90, 470 150"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="6,4"
                      />

                      {/* Spacecraft Beacon traveling across TLI */}
                      <circle cx="310" cy="108" r="5" fill="#f59e0b" className="animate-pulse" />
                      <circle cx="310" cy="108" r="12" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
                      <text x="310" y="90" fill="#fcd34d" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        TLI TRANSFER ARC (10.2 km/s)
                      </text>

                      {/* Moon with Lunar Orbit Insertion (LOI) Loops */}
                      <g transform="translate(490, 170)">
                        <circle r="22" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
                        <ellipse rx="55" ry="30" fill="none" stroke="rgba(245, 158, 11, 0.6)" strokeDasharray="3,3" transform="rotate(25)" />
                        <circle r="34" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        <text x="0" y="4" fill="#ffffff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          MOON
                        </text>
                        <text x="0" y="42" fill="#cbd5e1" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                          100km Circular Orbit
                        </text>
                      </g>

                      {/* Trajectory Phase Milestones */}
                      <g transform="translate(20, 290)">
                        <rect width="560" height="34" rx="8" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.1)" />
                        <text x="20" y="21" fill="#94a3b8" fontSize="8.5" fontFamily="'Space Grotesk', sans-serif">
                          1. Launch &amp; EBN (July 14) → 2. TLI (Aug 1) → 3. Lunar Insertion (Aug 5) → 4. Touchdown (Aug 23, 18:04 IST)
                        </text>
                      </g>
                    </svg>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 3: CHASTE REGOLITH THERMAL PROFILE */}
                {/* ------------------------------------------------------------- */}
                {ch3ViewMode === 'CHASTE_PROFILE' && (
                  <div className="p-5 rounded-2xl bg-[#080a14] border border-glass-border/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-space text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                        <Thermometer size={14} />
                        <span>CHASTE THERMAL PROBE PENETRATION PROFILE (0 to -10 cm DEPTH)</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                        ΔT = {((ch3Data?.chaste_surface_temp_c ?? 50.4) - (ch3Data?.chaste_subsurface_10cm_temp_c ?? -10.2)).toFixed(1)}°C EXTREME GRADIENT
                      </span>
                    </div>

                    {/* Gradient Bars */}
                    <div className="space-y-2.5">
                      {[
                        { depth: 'Surface Regolith (0 cm)', temp: `+${(ch3Data?.chaste_surface_temp_c ?? 50.4).toFixed(1)} °C`, val: ch3Data?.chaste_surface_temp_c ?? 50.4, color: '#f59e0b', desc: 'Direct sunlit polar regolith' },
                        { depth: 'Sub-surface (-2 cm)', temp: '+32.0 °C', val: 32.0, color: '#fbbf24', desc: 'Rapid vacuum thermal insulation' },
                        { depth: 'Sub-surface (-4 cm)', temp: '+14.5 °C', val: 14.5, color: '#38bdf8', desc: 'Sharp conductivity drop-off' },
                        { depth: 'Sub-surface (-6 cm)', temp: '+2.0 °C', val: 2.0, color: '#63c7ff', desc: 'Near-freezing transition zone' },
                        { depth: 'Sub-surface (-8 cm)', temp: '-4.8 °C', val: -4.8, color: '#00d4ff', desc: 'Sub-zero cryo-boundary' },
                        { depth: 'Deep Lunar Ice Bed (-10 cm)', temp: `${(ch3Data?.chaste_subsurface_10cm_temp_c ?? -10.2).toFixed(1)} °C`, val: ch3Data?.chaste_subsurface_10cm_temp_c ?? -10.2, color: '#a855f7', desc: 'Permanent subsurface frost layer' },
                      ].map((row, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs font-space">
                          <div className="w-52">
                            <span className="text-[11px] text-star-white font-semibold block">{row.depth}</span>
                            <span className="text-[9px] text-muted-gray">{row.desc}</span>
                          </div>
                          <div className="flex-1 bg-black/60 rounded-full h-3.5 overflow-hidden border border-white/10 flex">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.max(12, ((row.val + 20) / 80) * 100)}%`,
                                backgroundColor: row.color,
                              }}
                            />
                          </div>
                          <span className="w-20 text-right font-mono font-bold text-sm" style={{ color: row.color }}>
                            {row.temp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subsystem Telemetry Grid */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">ROVER TRAVERSED:</span>
                    <span className="font-mono text-sm font-bold text-amber-400">{roverDistance} meters</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">ILSA SEISMICITY:</span>
                    <span className="font-mono text-sm font-bold text-cyan-glow">{ch3Data?.ilsa_seismic_events_24h ?? 3} Lunar Events</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">RAMBHA PLASMA:</span>
                    <span className="font-mono text-sm font-bold text-purple-400">{(ch3Data?.rambha_plasma_density_cm3 ?? 10500).toLocaleString()} / cm³</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">BATTERY CHARGE:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{ch3Data?.battery_charge_pct ?? 98.5}% (Solar Array)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: APXS Spectrometry & Mission Highlights */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                    <span className="font-space text-xs tracking-wider uppercase font-bold text-amber-500">
                      APXS MINERAL SPECTROMETRY
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      SHIV SHAKTI ROCKS
                    </span>
                  </div>

                  <div className="space-y-3 font-space text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">ELEMENTAL CONCENTRATION (APXS + LIBS)</span>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(
                          ch3Data?.apxs_elemental_abundances ?? {
                            'Silicon (Si)': 21.4,
                            'Aluminum (Al)': 14.8,
                            'Calcium (Ca)': 9.6,
                            'Iron (Fe)': 8.2,
                            'Magnesium (Mg)': 6.8,
                            'Titanium (Ti)': 2.1,
                            'Sulfur (S)': 0.34,
                            'Oxygen (O)': 44.2,
                          }
                        ).map(([el, pct], idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-space-navy/50 border border-white/5 flex justify-between">
                            <span className="text-[10px] text-star-white/80">{el}</span>
                            <span className="font-mono text-[10px] font-bold text-cyan-glow">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block">CONFIRMED DISCOVERY</span>
                      <p className="font-inter text-star-white/90 text-xs leading-relaxed">
                        Definitive presence of <strong>Sulfur (S)</strong> confirmed on lunar polar surface via laser-induced breakdown spectroscopy (LIBS), shedding light on lunar formation vulcanism.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: NASA/ESA/CSA JWST (SUN-EARTH L2 INFRARED OBSERVATORY) */}
          {/* ============================================================== */}
          {activeTab === 'jwst' && (
            <motion.div
              key="jwst"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Console: JWST Primary Honeycomb Mirror & Optical Ray Tracing */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-pink-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(236,72,153,0.15)] flex flex-col">
                {/* Console Header */}
                <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Sparkles size={22} className="text-pink-500 animate-pulse" />
                    <div>
                      <span className="font-space text-xs sm:text-sm tracking-widest text-star-white uppercase block font-bold">
                        JAMES WEBB SPACE TELESCOPE // DEEP SPACE EXPLORER
                      </span>
                      <span className="font-space text-[10px] text-pink-400/80">
                        ORBIT: SUN-EARTH L2 HALO (1.502M km ANTI-SUNWARD) // 6.5m PRIMARY MIRROR
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-pink-500/30">
                    <Radio size={13} className="text-pink-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-star-white">
                      RADIO DELAY: <strong className="text-pink-400">5.02s</strong> (1.5M km)
                    </span>
                  </div>
                </div>

                {/* Sub-View Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'MIRROR_OPTICS', label: '18-SEGMENT GOLD MIRROR', icon: Crosshair },
                      { id: 'SUNSHIELD_L2', label: '5-LAYER SUNSHIELD & L2', icon: Shield },
                      { id: 'DEEP_FIELD_IR', label: 'INFRARED WAVELENGTH SCAN', icon: Eye },
                    ].map((btn) => {
                      const Icon = btn.icon;
                      const isSel = jwstViewMode === btn.id;
                      return (
                        <button
                          type="button"
                          key={btn.id}
                          onClick={() => setJwstViewMode(btn.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-space tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-pink-500/25 border-pink-400 text-pink-300 font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                              : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white'
                          }`}
                        >
                          <Icon size={13} />
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {jwstViewMode === 'DEEP_FIELD_IR' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-pink-400 font-bold">
                        λ = {infraredWavelengthUm.toFixed(1)} µm
                      </span>
                      <input
                        id="jwst-infrared-wavelength-slider"
                        name="jwstInfraredWavelength"
                        type="range"
                        min="0.6"
                        max="28.0"
                        step="0.2"
                        value={infraredWavelengthUm}
                        onChange={(e) => setInfraredWavelengthUm(parseFloat(e.target.value))}
                        className="w-28 accent-pink-400 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 1: 18-SEGMENT GOLD HONEYCOMB PRIMARY MIRROR ARRAY */}
                {/* ------------------------------------------------------------- */}
                {jwstViewMode === 'MIRROR_OPTICS' && (
                  <div className="relative aspect-[16/9] w-full bg-[#05020a] rounded-2xl overflow-hidden border border-glass-border/60 flex items-center justify-center select-none shadow-inner">
                    <svg viewBox="0 0 600 340" className="w-full h-full">
                      <defs>
                        {/* Gold mirror segment gradient */}
                        <linearGradient id="hexGold" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="40%" stopColor="#f59e0b" />
                          <stop offset="80%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#92400e" />
                        </linearGradient>

                        {/* Highlighted mirror segment gradient */}
                        <linearGradient id="hexGoldActive" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="30%" stopColor="#fbbf24" />
                          <stop offset="70%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#be185d" />
                        </linearGradient>

                        {/* Incoming Cosmic Ray Gradient */}
                        <linearGradient id="cosmicRay" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>

                      {/* Space star background */}
                      <rect width="600" height="340" fill="#040108" />

                      {/* Animated Incoming Cosmic Infrared Photon Streams */}
                      {[
                        { x1: 50, y1: 40, x2: 210, y2: 120 },
                        { x1: 80, y1: 290, x2: 210, y2: 220 },
                        { x1: 550, y1: 40, x2: 390, y2: 120 },
                        { x1: 520, y1: 290, x2: 390, y2: 220 },
                      ].map((ray, i) => (
                        <line
                          key={i}
                          x1={ray.x1}
                          y1={ray.y1}
                          x2={ray.x2}
                          y2={ray.y2}
                          stroke="url(#cosmicRay)"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                          opacity="0.6"
                        />
                      ))}

                      {/* 18 Hexagonal Mirror Segments */}
                      {JWST_HEX_SEGMENTS.map((seg) => {
                        const isSelected = selectedHexSegment.id === seg.id;
                        return (
                          <g
                            key={seg.id}
                            className="cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedHexSegment(seg)}
                          >
                            <polygon
                              points={getHexPoints(seg.cx, seg.cy, 24)}
                              fill={isSelected ? 'url(#hexGoldActive)' : 'url(#hexGold)'}
                              stroke={isSelected ? '#ec4899' : '#b45309'}
                              strokeWidth={isSelected ? '2' : '1'}
                              className={isSelected ? 'filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : ''}
                            />
                            <text
                              x={seg.cx}
                              y={seg.cy + 3}
                              fill={isSelected ? '#ffffff' : '#78350f'}
                              fontSize="8"
                              fontFamily="'Space Grotesk', sans-serif"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {seg.id}
                            </text>
                          </g>
                        );
                      })}

                      {/* Center Cassegrain Core & Aft Optics Subsystem */}
                      <polygon points={getHexPoints(300, 170, 20)} fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <circle cx="300" cy="170" r="8" fill="#1e293b" stroke="#ec4899" strokeWidth="1.2" />

                      {/* 3 Secondary Mirror Spider Support Struts */}
                      <line x1="300" y1="170" x2="300" y2="40" stroke="#94a3b8" strokeWidth="2" opacity="0.85" />
                      <line x1="300" y1="170" x2="160" y2="280" stroke="#94a3b8" strokeWidth="2" opacity="0.85" />
                      <line x1="300" y1="170" x2="440" y2="280" stroke="#94a3b8" strokeWidth="2" opacity="0.85" />

                      {/* Secondary Mirror Reflector Node */}
                      <circle cx="300" cy="170" r="14" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,3" className="animate-spin" style={{ animationDuration: '20s' }} />

                      {/* Selected Segment Actuator Inspector Callout HUD */}
                      <g transform="translate(440, 20)">
                        <rect width="145" height="74" rx="8" fill="rgba(0,0,0,0.85)" stroke="#ec4899" strokeWidth="1" />
                        <text x="10" y="18" fill="#ec4899" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                          SEGMENT: {selectedHexSegment.id} (RING {selectedHexSegment.ring})
                        </text>
                        <text x="10" y="34" fill="#e2e8f0" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif">
                          PISTON: <strong className="text-cyan-glow">{selectedHexSegment.pistonNm >= 0 ? `+${selectedHexSegment.pistonNm}` : selectedHexSegment.pistonNm} nm</strong>
                        </text>
                        <text x="10" y="48" fill="#e2e8f0" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif">
                          WAVEFRONT RMS: <strong className="text-emerald-400">{selectedHexSegment.wavefrontRmsNm} nm</strong>
                        </text>
                        <text x="10" y="62" fill="#94a3b8" fontSize="7" fontFamily="'Space Grotesk', sans-serif">
                          STATUS: {selectedHexSegment.status}
                        </text>
                      </g>
                    </svg>

                    {/* Telemetry Annotation inside Canvas */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 text-[10px] font-space text-star-white flex items-center gap-2 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      <span>OPTICAL ALIGNMENT: 18 SEGMENTS PHASED TO 50 nm RMS WAVEFRONT</span>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 2: 5-LAYER KAPTON SUNSHIELD & SUN-EARTH L2 HUD */}
                {/* ------------------------------------------------------------- */}
                {jwstViewMode === 'SUNSHIELD_L2' && (
                  <div className="p-5 rounded-2xl bg-[#090310] border border-glass-border/60 space-y-4">
                    <span className="font-space text-xs font-bold text-pink-400 uppercase flex items-center gap-1.5">
                      <Shield size={14} />
                      <span>5-LAYER KAPTON MEMBRANE THERMAL SHIELDING (+85°C → 39.8 K)</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                      {[
                        { layer: 'Layer 1 (Sun-Facing)', tempC: '+85.2 °C', tempK: '358.3 K', color: '#f97316', desc: 'Direct solar flux (1,361 W/m²)' },
                        { layer: 'Layer 2 (Reflective)', tempC: '+38.0 °C', tempK: '311.1 K', color: '#fbbf24', desc: '0.025mm Kapton with Al' },
                        { layer: 'Layer 3 (Mid Gap)', tempC: '-35.0 °C', tempK: '238.1 K', color: '#38bdf8', desc: 'Vacuum radiative dissipation' },
                        { layer: 'Layer 4 (Deep Cold)', tempC: '-170.0 °C', tempK: '103.1 K', color: '#00d4ff', desc: 'Sub-cryogenic expansion' },
                        { layer: 'Layer 5 (Mirror Side)', tempC: '-233.3 °C', tempK: '39.8 K', color: '#a855f7', desc: 'Passive primary mirror base' },
                      ].map((ly, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSunshieldActiveLayer(idx + 1)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            sunshieldActiveLayer === idx + 1
                              ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                              : 'bg-black/40 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[9px] font-space text-muted-gray uppercase block">{ly.layer}</span>
                          <span className="font-mono text-base font-bold mt-1 block" style={{ color: ly.color }}>
                            {ly.tempC}
                          </span>
                          <span className="text-[10px] font-mono text-star-white/80 block">{ly.tempK}</span>
                          <p className="text-[9px] font-inter text-star-white/60 mt-1">{ly.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* MIRI Closed-Cycle Helium Cryocooler */}
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-space text-[10px] font-bold text-purple-400 uppercase block">
                          MIRI (MID-INFRARED INSTRUMENT) CLOSED-CYCLE CRYOCOOLER
                        </span>
                        <span className="font-mono text-xs text-star-white">
                          Active temperature: <strong className="text-cyan-glow">6.40 K (-266.75 °C)</strong>
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-black/50 text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                        SUPERCONDUCTING HELIUM // OK
                      </span>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 3: DEEP FIELD INFRARED SPECTRAL COMPARISON */}
                {/* ------------------------------------------------------------- */}
                {jwstViewMode === 'DEEP_FIELD_IR' && (
                  <div className="p-5 rounded-2xl bg-[#090212] border border-glass-border/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-space text-xs font-bold text-pink-400 uppercase block">
                          SMACS 0723 ULTRA-DEEP FIELD // INFRARED DUST PIERCING
                        </span>
                        <span className="font-inter text-[11px] text-muted-gray">
                          Slider shifts observation wavelength from Visible/Near-IR (0.6 µm) to Mid-IR MIRI (28.0 µm)
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 font-mono text-xs font-bold border border-pink-500/30">
                        REDSHIFT z = {(1.2 + infraredWavelengthUm * 0.45).toFixed(1)}
                      </span>
                    </div>

                    {/* Visualizer Simulation Box */}
                    <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-black">
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-purple-950/80 via-black to-pink-950/80 transition-all duration-500"
                        style={{ filter: `hue-rotate(${infraredWavelengthUm * 10}deg) brightness(${1 + infraredWavelengthUm * 0.03})` }}
                      />

                      {/* Primordial Galaxies and Gravitational Lenses */}
                      {[
                        { x: '25%', y: '35%', s: 18, color: '#ec4899', name: 'JADES-GS-z14-0 (z=14.3)' },
                        { x: '70%', y: '60%', s: 28, color: '#f59e0b', name: 'Gravitational Arc SMACS-1' },
                        { x: '45%', y: '50%', s: 36, color: '#38bdf8', name: 'Lensed Cluster Core' },
                        { x: '80%', y: '25%', s: 14, color: '#10b981', name: 'Population III Nursery' },
                      ].map((obj, idx) => (
                        <div
                          key={idx}
                          className="absolute flex flex-col items-center justify-center transition-all duration-700"
                          style={{
                            left: obj.x,
                            top: obj.y,
                            opacity: Math.min(1, 0.4 + (infraredWavelengthUm / 10)),
                            transform: `scale(${1 + (infraredWavelengthUm / 30)})`,
                          }}
                        >
                          <div
                            className="rounded-full animate-pulse"
                            style={{
                              width: obj.s,
                              height: obj.s,
                              backgroundColor: obj.color,
                              boxShadow: `0 0 25px ${obj.color}`,
                            }}
                          />
                          <span className="text-[9px] font-mono text-star-white/80 mt-1 block drop-shadow-md">
                            {obj.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subsystem Telemetry Grid */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">POINTING JITTER:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">0.0012 mas</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">ACTIVE INSTRUMENT:</span>
                    <span className="font-mono text-xs font-bold text-pink-400 truncate block">NIRSpec Slit Mask</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">MIRI CRYOCOOLER:</span>
                    <span className="font-mono text-sm font-bold text-cyan-glow">6.40 K (-266.7°C)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">PROPELLANT RESERVE:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">&gt;24 Years</span>
                  </div>
                </div>
              </div>

              {/* Right Column: JWST Cosmic Objectives Card */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel rounded-3xl p-6 border border-pink-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                    <span className="font-space text-xs tracking-wider uppercase font-bold text-pink-400">
                      CURRENT SCIENCE EXPOSURE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-pink-500/20 text-pink-300">
                      z = 14.32 RECORD
                    </span>
                  </div>

                  <div className="space-y-3 font-space text-xs">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">ASTRONOMICAL TARGET</span>
                      <span className="text-sm font-bold text-star-white block">JADES-GS-z14-0 Deep Field</span>
                      <p className="font-inter text-star-white/80 text-[11px] leading-relaxed mt-1">
                        Detecting the earliest Population III stars and primordial galaxies formed 290 million years after the Big Bang.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">OPTICAL ALIGNMENT</span>
                      <span className="text-xs text-emerald-400 font-mono">18 Hexagonal Segments Phased to 50 nm Wavefront RMS</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-purple-400 font-bold uppercase block">L2 HALO STABILITY</span>
                        <span className="text-xs text-star-white font-mono">Station-keeping ΔV: 2.1 m/s / yr</span>
                      </div>
                      <CheckCircle2 size={18} className="text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: ADITYA-L1 SOLAR CORONAGRAPH & L1 HALO ORBIT */}
          {/* ============================================================== */}
          {activeTab === 'aditya' && (
            <motion.div
              key="aditya"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* Solar Coronagraph Visualizer Canvas */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-amber-400/30 overflow-hidden relative shadow-[0_0_60px_rgba(251,191,36,0.15)] flex flex-col">
                <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Sun size={20} className="text-amber-400 animate-spin" style={{ animationDuration: '25s' }} />
                    <div>
                      <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                        VISIBLE EMISSION LINE CORONAGRAPH (VELC) // ISRO
                      </span>
                      <span className="font-space text-[10px] text-amber-400/80">
                        TARGET: SOLAR CORONA &amp; PROMINENCE DYNAMICS // 530.3 nm [Fe XIV]
                      </span>
                    </div>
                  </div>

                  {/* Radio Light-Time Delay Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/30">
                    <Radio size={13} className="text-amber-400 animate-pulse" />
                    <span className="font-mono text-[10px] text-star-white">
                      RADIO ONE-WAY DELAY: <strong className="text-amber-400">4.98s</strong> (1.49M km)
                    </span>
                  </div>
                </div>

                {/* Sub-View Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'L1_HALO_3D', label: 'SUN-EARTH L1 ORBIT 3D', icon: Orbit },
                      { id: 'VELC_CORONA', label: 'VELC SOLAR CORONAGRAPH', icon: Sun },
                    ].map((btn) => {
                      const Icon = btn.icon;
                      const isSel = adityaViewMode === btn.id;
                      return (
                        <button
                          type="button"
                          key={btn.id}
                          onClick={() => setAdityaViewMode(btn.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-space tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                              : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white'
                          }`}
                        >
                          <Icon size={13} />
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 1: SUN-EARTH L1 HALO INTERPLANETARY 3D SYSTEM */}
                {/* ------------------------------------------------------------- */}
                {adityaViewMode === 'L1_HALO_3D' && (
                  <div className="relative aspect-[16/9] w-full bg-[#030612] rounded-2xl overflow-hidden border border-glass-border/60 flex items-center justify-center select-none shadow-2xl">
                    <svg viewBox="0 0 640 360" className="w-full h-full">
                      <defs>
                        {/* Sun Surface & Flare Radial Gradient */}
                        <radialGradient id="sunSphereGrad" cx="40%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="30%" stopColor="#fef08a" />
                          <stop offset="60%" stopColor="#f59e0b" />
                          <stop offset="85%" stopColor="#ea580c" />
                          <stop offset="100%" stopColor="#9a3412" />
                        </radialGradient>
                        <radialGradient id="sunCoronaGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                          <stop offset="45%" stopColor="#f97316" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                        </radialGradient>

                        {/* Earth Atmospheric Rayleigh Shader */}
                        <radialGradient id="adityaEarthAtmo" cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.6" />
                          <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="90%" stopColor="#1d4ed8" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="adityaEarthOcean" cx="30%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="30%" stopColor="#2563eb" />
                          <stop offset="70%" stopColor="#1e3a8a" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </radialGradient>

                        {/* Solar Wind Particle Beam */}
                        <linearGradient id="solarWindBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#fb923c" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      {/* Deep Interplanetary Starfield */}
                      <rect width="640" height="360" fill="#030612" />
                      {[
                        { x: 30, y: 40, r: 0.9 }, { x: 90, y: 310, r: 1.1 }, { x: 160, y: 60, r: 0.8 },
                        { x: 230, y: 320, r: 1.2 }, { x: 340, y: 35, r: 1.0 }, { x: 420, y: 330, r: 0.9 },
                        { x: 520, y: 50, r: 1.3 }, { x: 590, y: 300, r: 0.8 }, { x: 610, y: 80, r: 1.1 },
                      ].map((st, i) => (
                        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#f8fafc" opacity="0.7" />
                      ))}

                      {/* Sun-Earth Orbital Baseline Axis */}
                      <line x1="70" y1="180" x2="600" y2="180" stroke="rgba(255,255,255,0.12)" strokeDasharray="4,4" />
                      <text x="270" y="195" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                        SUN-EARTH INTERPLANETARY AXIS (1.000 AU = 149.6M km)
                      </text>

                      {/* Dynamic Solar Wind Plasma Stream Vectors */}
                      {[140, 160, 180, 200, 220].map((yLine, idx) => {
                        const streamOffset = ((liveEpochMs / 25 + idx * 40) % 280);
                        return (
                          <g key={idx}>
                            <line
                              x1="110"
                              y1={yLine}
                              x2="450"
                              y2={180 + (yLine - 180) * 0.4}
                              stroke="url(#solarWindBeam)"
                              strokeWidth="1.2"
                              strokeDasharray="6,8"
                              strokeDashoffset={-streamOffset}
                            />
                            {/* Fast CME particle */}
                            <circle
                              cx={110 + streamOffset * 1.2}
                              cy={yLine + (180 - yLine) * (streamOffset / 350)}
                              r="1.8"
                              fill="#fde047"
                              opacity="0.8"
                            />
                          </g>
                        );
                      })}

                      {/* ------------------------------------------------------------- */}
                      {/* SUN (Photosphere + Dynamic Coronal Flares) */}
                      {/* ------------------------------------------------------------- */}
                      <g transform="translate(60, 180)">
                        {/* Outer Solar Aura */}
                        <circle r="75" fill="url(#sunCoronaGlow)" className="animate-pulse" />
                        <circle r="48" fill="url(#sunSphereGrad)" />
                        
                        {/* Coronal prominence flares */}
                        <path d="M 40 -20 Q 55 -30 46 -5 Q 52 10 38 25" fill="none" stroke="#f97316" strokeWidth="2.5" />
                        <path d="M 35 25 Q 50 40 40 48" fill="none" stroke="#ea580c" strokeWidth="2" />
                        
                        <text x="0" y="4" fill="#ffffff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          SUN
                        </text>
                        <text x="0" y="65" fill="#fde047" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                          1.39M km Dia
                        </text>
                      </g>

                      {/* ------------------------------------------------------------- */}
                      {/* SUN-EARTH L1 LAGRANGE POINT (1.5M km Sunward of Earth) */}
                      {/* ------------------------------------------------------------- */}
                      <g transform="translate(360, 180)">
                        {/* 3D Halo Orbit Ellipse Path */}
                        <ellipse
                          rx="24"
                          ry="52"
                          fill="none"
                          stroke="rgba(251, 191, 36, 0.6)"
                          strokeWidth="1.5"
                          strokeDasharray="4,3"
                          transform="rotate(-15)"
                        />
                        
                        {/* L1 Gravitational Saddle Point Cross */}
                        <line x1="-8" y1="0" x2="8" y2="0" stroke="#f59e0b" strokeWidth="1" />
                        <line x1="0" y1="-8" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1" />
                        <circle r="3" fill="none" stroke="#f59e0b" strokeWidth="1" />
                        
                        {/* Aditya-L1 Spacecraft in Halo Orbit */}
                        {(() => {
                          const haloAngle = ((liveEpochMs / 1000) * 0.8) % (Math.PI * 2);
                          const hx = Math.cos(haloAngle) * 22;
                          const hy = Math.sin(haloAngle) * 48;
                          return (
                            <g transform={`translate(${hx}, ${hy})`}>
                              {/* Solar Array Wings */}
                              <rect x="-14" y="-3.5" width="28" height="7" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
                              {/* Central Bus */}
                              <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
                              {/* VELC Boresight Vector towards Sun */}
                              <line x1="-5" y1="0" x2="-22" y2="0" stroke="#fde047" strokeWidth="1.5" strokeDasharray="2,2" />
                              {/* Spacecraft Pulse */}
                              <circle cx="0" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" opacity="0.6" />
                              
                              <text x="0" y="-12" fill="#fde047" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                                ADITYA-L1
                              </text>
                            </g>
                          );
                        })()}

                        <text x="0" y="74" fill="#fbbf24" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          L1 HALO (1.5M km)
                        </text>
                      </g>

                      {/* ------------------------------------------------------------- */}
                      {/* PHOTOREALISTIC 3D EARTH SPHERE & MOON */}
                      {/* ------------------------------------------------------------- */}
                      <g transform="translate(480, 180)">
                        {/* Lunar Orbit Ring */}
                        <circle r="36" fill="none" stroke="rgba(203, 213, 225, 0.25)" strokeDasharray="3,3" />

                        {/* Moon in Orbit */}
                        {(() => {
                          const mAngle = ((liveEpochMs / 1000) * 0.4) % (Math.PI * 2);
                          const mx = Math.cos(mAngle) * 36;
                          const my = Math.sin(mAngle) * 36;
                          return (
                            <g transform={`translate(${mx}, ${my})`}>
                              <circle r="4.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
                              <circle r="1.5" fill="#cbd5e1" />
                            </g>
                          );
                        })()}

                        {/* Outer Atmospheric Rayleigh Scattering Glow */}
                        <circle r="26" fill="url(#adityaEarthAtmo)" />
                        <circle r="22" fill="none" stroke="rgba(147, 197, 253, 0.55)" strokeWidth="2.5" />

                        {/* 3D Ocean Sphere Base */}
                        <circle r="20" fill="url(#adityaEarthOcean)" />

                        {/* 3D Continental Landmasses (Asia, Africa, India) */}
                        <path d="M -10 -8 Q -3 -15 8 -10 Q 14 -3 9 8 Q -1 15 -12 8 Z" fill="#15803d" opacity="0.95" />
                        <path d="M -3 -4 L 3 6 L -6 7 Z" fill="#ca8a04" opacity="0.9" />
                        <path d="M 7 -14 Q 14 -11 13 -3 Q 7 2 5 -8 Z" fill="#166534" opacity="0.9" />

                        {/* Swirling 3D Cloud Cover */}
                        <path d="M -14 -6 Q -4 -11 10 -4 Q 14 5 5 12 Q -7 8 -14 3 Z" fill="#ffffff" opacity="0.6" />
                        <path d="M -8 5 Q 3 10 11 6" stroke="#ffffff" strokeWidth="1.8" fill="none" opacity="0.75" />

                        {/* 3D Curved Terminator Shadow (Day side sunlit on Left, Night on Right) */}
                        <path d="M 0 -20 A 20 20 0 0 1 0 20 Q 9 0 0 -20 Z" fill="#020617" opacity="0.72" />

                        {/* Night-Side City Lights */}
                        <circle cx="6" cy="-3" r="0.7" fill="#fef08a" opacity="0.9" />
                        <circle cx="10" cy="5" r="0.9" fill="#fde047" opacity="0.8" />

                        {/* Specular Limb Edge */}
                        <circle r="20" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />

                        <text x="0" y="32" fill="#93c5fd" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          EARTH
                        </text>
                      </g>

                      {/* ------------------------------------------------------------- */}
                      {/* SUN-EARTH L2 (JWST Space Telescope at 1.5M km Anti-Sun) */}
                      {/* ------------------------------------------------------------- */}
                      <g transform="translate(580, 180)">
                        <ellipse rx="12" ry="28" fill="none" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="1" strokeDasharray="3,2" />
                        <line x1="-5" y1="0" x2="5" y2="0" stroke="#ec4899" strokeWidth="1" />
                        <line x1="0" y1="-5" x2="0" y2="5" stroke="#ec4899" strokeWidth="1" />
                        <circle cx="0" cy="-14" r="3.5" fill="#ec4899" className="animate-pulse" />
                        
                        <text x="0" y="36" fill="#f472b6" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                          L2 (JWST)
                        </text>
                      </g>

                      {/* Bottom Distance Legend Scale */}
                      <g transform="translate(20, 315)">
                        <rect width="600" height="30" rx="6" fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.1)" />
                        <text x="15" y="19" fill="#94a3b8" fontSize="8" fontFamily="'Space Grotesk', sans-serif">
                          ISRO ADITYA-L1 TELEMETRY // VELC + SUIT + ASPEX // CONTINUOUS SUN-EARTH L1 EQUILIBRIUM
                        </text>
                      </g>
                    </svg>

                    {/* HUD Status Overlay */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-amber-400/30 text-[10px] font-space text-star-white flex items-center gap-2 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>SOLAR WIND VELOCITY: <strong className="text-amber-400">438.2 km/s</strong> // IMF Bz: <strong className="text-cyan-glow">-3.8 nT</strong></span>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUB-VIEW 2: VELC SOLAR CORONAGRAPH SVG CANVAS */}
                {/* ------------------------------------------------------------- */}
                {adityaViewMode === 'VELC_CORONA' && (
                  <div className="relative aspect-[16/9] w-full bg-[#05020c] rounded-2xl overflow-hidden border border-glass-border/60 flex items-center justify-center">
                    <svg viewBox="0 0 600 360" className="w-full h-full">
                      <defs>
                        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ffedd5" stopOpacity="1" />
                          <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.8" />
                          <stop offset="70%" stopColor="#ea580c" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                        </radialGradient>

                        <radialGradient id="coronaRays" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                          <stop offset="60%" stopColor="#f97316" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Outer Coronal Streamer Rays */}
                      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                        const rad = ((deg + coronaPulse * 0.2) * Math.PI) / 180;
                        const x2 = 300 + Math.cos(rad) * 260;
                        const y2 = 180 + Math.sin(rad) * 160;
                        return (
                          <line
                            key={deg}
                            x1="300"
                            y1="180"
                            x2={x2}
                            y2={y2}
                            stroke="url(#coronaRays)"
                            strokeWidth="24"
                            strokeLinecap="round"
                            opacity="0.5"
                          />
                        );
                      })}

                      {/* Outer Corona Aura */}
                      <circle cx="300" cy="180" r="140" fill="url(#sunGlow)" />

                      {/* Occulting Disk (VELC Artificial Eclipse Mask) */}
                      <circle cx="300" cy="180" r="65" fill="#030814" stroke="#fbbf24" strokeWidth="2" />
                      <circle cx="300" cy="180" r="62" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeDasharray="3,3" />

                      {/* Solar Magnetic Loops */}
                      <path
                        d="M 270 120 Q 300 80 330 120"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        className="animate-pulse"
                      />
                      <path
                        d="M 250 240 Q 300 280 350 240"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                      />

                      {/* Center Annotation */}
                      <text x="300" y="176" fill="#fbbf24" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        VELC OCCULTER DISK
                      </text>
                      <text x="300" y="192" fill="rgba(232, 237, 242, 0.7)" fontSize="8" fontFamily="'Inter', sans-serif" textAnchor="middle">
                        R_sun = 1.05 - 3.0 R_solar
                      </text>

                      {/* Aditya-L1 Spacecraft Node */}
                      <g transform="translate(510, 180)">
                        <circle r="7" fill="#fbbf24" className="animate-pulse" />
                        <circle r="16" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.8" />
                        <text x="-12" y="-12" fill="#fbbf24" fontSize="10" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="end">
                          ADITYA-L1 [HALO ORBIT]
                        </text>
                        <text x="-12" y="4" fill="rgba(232, 237, 242, 0.8)" fontSize="8" fontFamily="'Inter', sans-serif" textAnchor="end">
                          1.492M km from Earth
                        </text>
                      </g>
                    </svg>

                    {/* Telemetry HUD overlay in canvas */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-star-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>CME MONITOR: NO CORONAL MASS EJECTION INGRESS</span>
                    </div>
                  </div>
                )}

                {/* Subsystem Metric Sliders */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">SUIT UV FLUX:</span>
                    <span className="font-mono text-sm font-bold text-amber-400">1361.2 W/m²</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">PROTON/ALPHA RATIO:</span>
                    <span className="font-mono text-sm font-bold text-cyan-glow">4.25% (ASPEX)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">TRI-AXIAL MAG (Bz):</span>
                    <span className="font-mono text-sm font-bold text-purple-400">-3.80 nT (MAG)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">STATION KEEPING ΔV:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">2.45 m/s / yr</span>
                  </div>
                </div>
              </div>

              {/* Aditya-L1 Science Objectives Card (Right Column) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel rounded-3xl p-6 border border-amber-400/30 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                    <span className="font-space text-xs tracking-wider uppercase font-bold text-amber-400">
                      SUN-EARTH L1 LAGRANGE SCIENCE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300">
                      HALO PHASE: 142°
                    </span>
                  </div>

                  <div className="space-y-3 font-space text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">PRIMARY OBJECTIVE</span>
                      <p className="font-inter text-star-white/90 text-xs leading-relaxed">
                        Uninterrupted 24/7 view of the solar photosphere, chromosphere, and corona without Earth eclipse interruptions.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">PAYLOAD COMPLEMENT</span>
                      <ul className="text-[11px] font-inter text-star-white/80 space-y-1">
                        <li>• <strong>VELC:</strong> Visible Emission Line Coronagraph (ISRO-IIA)</li>
                        <li>• <strong>SUIT:</strong> Solar Ultraviolet Imaging Telescope (IUCAA)</li>
                        <li>• <strong>ASPEX:</strong> Solar Wind Ion Spectrometer (PRL)</li>
                        <li>• <strong>PAPA:</strong> Plasma Analyser Package for Aditya (VSSC)</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase block">HALO ORBIT STABILITY</span>
                        <span className="text-xs text-star-white font-mono">Lissajous station-keeping margin: &gt;5 years</span>
                      </div>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
