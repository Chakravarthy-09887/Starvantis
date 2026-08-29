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
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import {
  api,
  AdityaL1DeepSpaceData,
  Chandrayaan3DeepSpaceData,
  JWSTDeepSpaceData,
} from '../lib/api';

export default function DeepSpaceExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { formatMissionTime } = useMission();

  const [activeTab, setActiveTab] = useState<'aditya' | 'chandrayaan' | 'jwst'>('aditya');
  const [adityaData, setAdityaData] = useState<AdityaL1DeepSpaceData | null>(null);
  const [ch3Data, setCh3Data] = useState<Chandrayaan3DeepSpaceData | null>(null);
  const [jwstData, setJwstData] = useState<JWSTDeepSpaceData | null>(null);
  const [coronaPulse, setCoronaPulse] = useState(0);

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

  // Solar flare animation loop
  useEffect(() => {
    const cInterval = setInterval(() => {
      setCoronaPulse((p) => (p + 1) % 360);
    }, 40);
    return () => clearInterval(cInterval);
  }, []);

  return (
    <section id="deep-space" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-400/20 bg-purple-400/5 mb-4">
            <Sparkles size={13} className="text-purple-400 animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-purple-400 uppercase font-bold">
              MULTI-BODY INTERPLANETARY &amp; LAGRANGE TELEMETRY
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            DEEP-SPACE EXPLORER
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            Specialized astrodynamics consoles for Sun-Earth L1 Halo Orbit (Aditya-L1), Lunar South Pole (Chandrayaan-3), and Sun-Earth L2 (JWST) with light-time radio latency modeling.
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
              { id: 'aditya', label: 'ADITYA-L1 (SUN-EARTH L1)', icon: Sun, color: '#fbbf24', tag: '1.5M km SUNWARD' },
              { id: 'chandrayaan', label: 'CHANDRAYAAN-3 (LUNAR SOUTH POLE)', icon: Moon, color: '#f59e0b', tag: 'SHIV SHAKTI POINT' },
              { id: 'jwst', label: 'JWST (SUN-EARTH L2 INFRARED)', icon: Sparkles, color: '#ec4899', tag: '1.5M km ANTI-SUN' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <div
                  role="button"
                  tabIndex={0}
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
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content Panes */}
        <AnimatePresence mode="wait">
          {/* TAB 1: ADITYA-L1 SOLAR CORONAGRAPH & L1 HALO ORBIT */}
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
                      RADIO ONE-WAY DELAY: <strong className="text-amber-400">4.98s</strong>
                    </span>
                  </div>
                </div>

                {/* Simulated Solar Corona Visualizer SVG */}
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

          {/* TAB 2: CHANDRAYAAN-3 LUNAR SOUTH POLE & SHIV SHAKTI POINT */}
          {activeTab === 'chandrayaan' && (
            <motion.div
              key="chandrayaan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* Lunar Surface Topography & ChaSTE Thermal Gradient */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col">
                <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Moon size={20} className="text-amber-500" />
                    <div>
                      <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                        SHIV SHAKTI POINT // CHANDRAYAAN-3 LUNAR RECONNAISSANCE
                      </span>
                      <span className="font-space text-[10px] text-amber-400/80">
                        COORDINATES: 69.373° S, 32.319° E // POLAR REGOLITH THERMOPHYSICS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/30">
                    <Radio size={13} className="text-amber-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-star-white">
                      RADIO ONE-WAY DELAY: <strong className="text-amber-400">1.28s</strong>
                    </span>
                  </div>
                </div>

                {/* ChaSTE Regolith Thermal Gradient Chart */}
                <div className="p-4 rounded-2xl bg-[#080a14] border border-glass-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                      <Thermometer size={14} />
                      <span>CHASTE THERMAL PROBE PENETRATION PROFILE (0 to -10 cm DEPTH)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ΔT = 60.6°C GRADIENT
                    </span>
                  </div>

                  {/* Gradient Bars */}
                  <div className="space-y-2">
                    {[
                      { depth: 'Surface Regolith (0 cm)', temp: '+50.4 °C', val: 50.4, color: '#f59e0b' },
                      { depth: 'Sub-surface (-2 cm)', temp: '+32.0 °C', val: 32.0, color: '#fbbf24' },
                      { depth: 'Sub-surface (-4 cm)', temp: '+14.5 °C', val: 14.5, color: '#38bdf8' },
                      { depth: 'Sub-surface (-6 cm)', temp: '+2.0 °C', val: 2.0, color: '#63c7ff' },
                      { depth: 'Sub-surface (-8 cm)', temp: '-4.8 °C', val: -4.8, color: '#00d4ff' },
                      { depth: 'Deep Lunar Ice Bed (-10 cm)', temp: '-10.2 °C', val: -10.2, color: '#a855f7' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-space">
                        <span className="w-44 text-[10px] text-star-white/70 truncate">{row.depth}</span>
                        <div className="flex-1 bg-black/60 rounded-full h-3 overflow-hidden border border-white/10 flex">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(10, ((row.val + 20) / 80) * 100)}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono font-bold" style={{ color: row.color }}>
                          {row.temp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* APXS Elemental Abundances */}
                <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="font-space text-xs font-bold text-star-white flex items-center gap-1.5 uppercase">
                    <Activity size={14} className="text-cyan-glow" />
                    <span>APXS SPECTROMETER ELEMENTAL CONCENTRATIONS (SHIV SHAKTI POINT)</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                    {[
                      { el: 'Silicon (Si)', pct: '21.4%' },
                      { el: 'Aluminum (Al)', pct: '14.8%' },
                      { el: 'Calcium (Ca)', pct: '9.6%' },
                      { el: 'Iron (Fe)', pct: '8.2%' },
                      { el: 'Magnesium (Mg)', pct: '6.8%' },
                      { el: 'Titanium (Ti)', pct: '2.1%' },
                      { el: 'Sulfur (S)', pct: '0.34%' },
                    ].map((e, i) => (
                      <div key={i} className="p-2 rounded-xl bg-space-navy/50 border border-white/10 text-center">
                        <span className="text-[9px] font-space text-muted-gray block truncate">{e.el}</span>
                        <span className="font-mono text-xs font-bold text-cyan-glow mt-0.5 block">{e.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pragyan Rover & Lander Status (Right Column) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                    <span className="font-space text-xs tracking-wider uppercase font-bold text-amber-500">
                      VIKRAM &amp; PRAGYAN MISSION
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      TOUCHDOWN SUCCESS
                    </span>
                  </div>

                  <div className="space-y-3 font-space text-xs">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-gray uppercase block font-semibold">ROVER TRAVERSED</span>
                        <span className="text-lg font-bold text-amber-400 font-mono">101.4 meters</span>
                      </div>
                      <TrendingUp size={18} className="text-amber-400" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-gray uppercase block font-semibold">ILSA SEISMIC EVENTS</span>
                        <span className="text-lg font-bold text-cyan-glow font-mono">3 Events Logged</span>
                      </div>
                      <Activity size={18} className="text-cyan-glow" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-gray uppercase block font-semibold">RAMBHA-LP PLASMA</span>
                        <span className="text-lg font-bold text-purple-400 font-mono">1.05 × 10⁴ / cm³</span>
                      </div>
                      <Zap size={18} className="text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: NASA/ESA/CSA JWST (SUN-EARTH L2 INFRARED OBSERVATORY) */}
          {activeTab === 'jwst' && (
            <motion.div
              key="jwst"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* JWST 5-Layer Sunshield Thermal Balance HUD */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-pink-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(236,72,153,0.15)] flex flex-col">
                <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-pink-500" />
                    <div>
                      <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                        JAMES WEBB SPACE TELESCOPE // L2 CRYOGENIC THERMAL HUD
                      </span>
                      <span className="font-space text-[10px] text-pink-400/80">
                        ORBIT: SUN-EARTH L2 LAGRANGE (1.502M km ANTI-SUNWARD) // NIRSPEC &amp; MIRI
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-pink-500/30">
                    <Radio size={13} className="text-pink-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-star-white">
                      RADIO ONE-WAY DELAY: <strong className="text-pink-400">5.02s</strong>
                    </span>
                  </div>
                </div>

                {/* 5-Layer Kapton Sunshield Thermal Gradient Visualizer */}
                <div className="p-4 rounded-2xl bg-[#090310] border border-glass-border/60 space-y-4">
                  <span className="font-space text-xs font-bold text-pink-400 uppercase flex items-center gap-1.5">
                    <Thermometer size={14} />
                    <span>5-LAYER KAPTON SUNSHIELD EXTREME THERMAL DELTA (+85°C → 40 K)</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hot Side Facing Sun */}
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
                      <span className="text-[10px] font-space text-orange-400 font-bold uppercase block">
                        ☀️ SUN-FACING HOT SIDE
                      </span>
                      <span className="font-mono text-3xl font-bold text-orange-400 block">
                        +85.2 °C
                      </span>
                      <p className="text-[11px] font-inter text-star-white/70">
                        Layer 1 Kapton directly absorbs solar irradiance (1,361 W/m²).
                      </p>
                    </div>

                    {/* Cold Side Facing Deep Space */}
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                      <span className="text-[10px] font-space text-cyan-400 font-bold uppercase block">
                        🌌 DEEP-SPACE CRYOGENIC COLD SIDE
                      </span>
                      <span className="font-mono text-3xl font-bold text-cyan-400 block">
                        39.8 K (-233.3 °C)
                      </span>
                      <p className="text-[11px] font-inter text-star-white/70">
                        Primary Beryllium gold-coated mirror array cooled for deep infrared sensitivity.
                      </p>
                    </div>
                  </div>

                  {/* MIRI Helium Loop Cryocooler */}
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-space text-[10px] font-bold text-purple-400 uppercase block">
                        MIRI (MID-INFRARED INSTRUMENT) CLOSED-CYCLE CRYOCOOLER
                      </span>
                      <span className="font-mono text-xs text-star-white">Active temperature: <strong className="text-cyan-glow">6.40 K (-266.75 °C)</strong></span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-black/50 text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                      SUPERCONDUCTING HELIUM // OK
                    </span>
                  </div>
                </div>

                {/* Pointing & Active Observation Metrics */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">POINTING JITTER:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">0.0012 milliarcsec</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">ACTIVE INSTRUMENT:</span>
                    <span className="font-mono text-xs font-bold text-pink-400 truncate block">NIRSpec Slit Mask</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-space text-muted-gray uppercase block">STATION KEEPING LIFE:</span>
                    <span className="font-mono text-sm font-bold text-cyan-glow">&gt;24 Years Propellant</span>
                  </div>
                </div>
              </div>

              {/* JWST Target Observation Card (Right Column) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel rounded-3xl p-6 border border-pink-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                    <span className="font-space text-xs tracking-wider uppercase font-bold text-pink-400">
                      CURRENT EXPOSURE TARGET
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-pink-500/20 text-pink-300">
                      z = 11.4 REDSHIFT
                    </span>
                  </div>

                  <div className="space-y-3 font-space text-xs">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">ASTRONOMICAL TARGET</span>
                      <span className="text-sm font-bold text-star-white block">COSMOS-Web Ultra-Deep Field</span>
                      <p className="font-inter text-star-white/80 text-[11px] leading-relaxed mt-1">
                        Detecting the earliest Population III stars and primordial galaxies formed 300 million years after the Big Bang.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-muted-gray text-[10px] uppercase font-semibold block">OPTICAL ALIGNMENT</span>
                      <span className="text-xs text-emerald-400 font-mono">18 Hexagonal Segments Phased to 50 nm Wavefront RMS</span>
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
