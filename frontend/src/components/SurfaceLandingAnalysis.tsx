'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Mountain,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Scan,
  Compass,
  Layers,
  Sparkles,
  Zap,
  Target,
  Maximize2,
  Sliders,
  Radio,
} from 'lucide-react';

interface LandingSite {
  id: string;
  name: string;
  body: string;
  coords: string;
  elevation: string;
  score: number;
  hazard: 'LOW' | 'MEDIUM' | 'HIGH';
  slope: string;
  slopeDeg: number;
  boulders: string;
  illumination: string;
  waterIceProbability: string;
  confidence: string;
  color: string;
  x: number;
  y: number;
  missionContext: string;
  mitigationProtocol: string;
}

const CANDIDATE_SITES: LandingSite[] = [
  {
    id: 'SITE-SHIV-SHAKTI',
    name: 'SHIV SHAKTI POINT [LUNAR SOUTH POLE]',
    body: 'Moon (South Pole 69.37° S)',
    coords: '69.373° S, 32.319° E',
    elevation: '-1.42 km (Highland Basin)',
    score: 98.4,
    hazard: 'LOW',
    slope: '1.4° (Well within 12° limit)',
    slopeDeg: 1.4,
    boulders: '0.01 / m² (Clear flat regolith)',
    illumination: '94% (Sunlit polar rim)',
    waterIceProbability: '78.5% (Nearby cold trap regolith)',
    confidence: '99.2% (CH-3 Orbiter OHRC verified)',
    color: '#10b981',
    x: 52,
    y: 76,
    missionContext: 'Site of historic Chandrayaan-3 soft touchdown. Validated by Orbiter High Resolution Camera (OHRC 0.25m ground resolution).',
    mitigationProtocol: 'Autonomous Lander Hazard Detection & Avoidance Camera (LHDAC) scanned 200m grid prior to terminal touchdown.',
  },
  {
    id: 'SITE-MALAPERT',
    name: 'MALAPERT MOUNTAIN PEAK [LUNAR SOUTH POLE]',
    body: 'Moon (Ultra-Highland Peak)',
    coords: '85.90° S, 0.00° E',
    elevation: '+5.0 km (High Peak of Eternal Light)',
    score: 94.2,
    hazard: 'LOW',
    slope: '2.8° (Flat ridge plateau)',
    slopeDeg: 2.8,
    boulders: '0.03 / m²',
    illumination: '98% (Continuous solar illumination)',
    waterIceProbability: '88.0% (Adjacent permanently shadowed crater)',
    confidence: '98.5% (LRO LOLA Laser Altimeter)',
    color: '#00d4ff',
    x: 48,
    y: 88,
    missionContext: 'Prime Artemis & Lunar Base landing site candidate offering 340+ days of uninterrupted solar energy.',
    mitigationProtocol: 'Laser Altimeter closed-loop terrain relative navigation with precision lateral thrust compensation.',
  },
  {
    id: 'SITE-SHACKLETON',
    name: 'SHACKLETON CRATER RIM [COLD TRAP]',
    body: 'Moon (True South Pole)',
    coords: '89.90° S, 0.00° E',
    elevation: '+1.2 km (Rim Crest)',
    score: 88.5,
    hazard: 'MEDIUM',
    slope: '6.4° (Steep rim boundary)',
    slopeDeg: 6.4,
    boulders: '0.12 / m²',
    illumination: '91%',
    waterIceProbability: '96.4% (Deep crater floor ice volatiles)',
    confidence: '96.1%',
    color: '#f59e0b',
    x: 50,
    y: 93,
    missionContext: 'Direct rim of permanently shadowed region (PSR) holding billion-year-old water ice and organic volatiles.',
    mitigationProtocol: 'Multi-beam LiDAR rangefinder guidance to prevent rim slope overshoot into crater interior.',
  },
  {
    id: 'SITE-JEZERO',
    name: 'JEZERO CRATER DELTA [MARS]',
    body: 'Mars (Interplanetary Mission)',
    coords: '18.38° N, 77.58° E',
    elevation: '-2.5 km (Ancient Lakebed)',
    score: 91.2,
    hazard: 'LOW',
    slope: '2.1°',
    slopeDeg: 2.1,
    boulders: '0.04 / m²',
    illumination: '88%',
    waterIceProbability: '62.0% (Hydrated smectite clays)',
    confidence: '98.1%',
    color: '#38bdf8',
    x: 44,
    y: 36,
    missionContext: 'Ancient lacustrine river delta offering stable landing surface with rich astrobiological core sample targets.',
    mitigationProtocol: 'Terrain Relative Navigation (TRN) with closed-loop skycrane retro-thrust profile.',
  },
  {
    id: 'SITE-SYRTIS',
    name: 'SYRTIS MAJOR VOLCANIC ESCARPMENT',
    body: 'Mars (Rough Basalt Terrain)',
    coords: '8.40° N, 69.50° E',
    elevation: '+1.8 km (Volcanic Caldera)',
    score: 54.0,
    hazard: 'HIGH',
    slope: '14.2° (Exceeds 12° Lander Tip-over Limit)',
    slopeDeg: 14.2,
    boulders: '0.45 / m² (High Boulder Field)',
    illumination: '65%',
    waterIceProbability: '12.0%',
    confidence: '91.0%',
    color: '#ff3b3b',
    x: 24,
    y: 48,
    missionContext: 'High-risk volcanic basalt field with extensive escarpments, lava tubes, and steep slopes exceeding structural tip-over safety margins.',
    mitigationProtocol: 'Mandatory autonomous divert: Terminal guidance commands divert burn to secondary landing ellipse > 18 km away.',
  },
];

export default function SurfaceLandingAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [selectedSiteId, setSelectedSiteId] = useState<string>('SITE-SHIV-SHAKTI');
  const [reconViewMode, setReconViewMode] = useState<'LIDAR_DEM' | 'OPTICAL_OHRC' | 'CONTOUR_3D'>('LIDAR_DEM');
  const [laserScanActive, setLaserScanActive] = useState<boolean>(true);

  const selectedSite = CANDIDATE_SITES.find((s) => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  return (
    <section id="surface" className="section-spacing relative overflow-hidden py-16 md:py-24" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Mountain size={14} className="text-amber-400 animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.25em] text-amber-400 uppercase font-bold">
              PLANETARY SURFACE TOPOGRAPHY &amp; AUTONOMOUS LANDING SITE RECONNAISSANCE
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-star-white">
            SURFACE TOPOGRAPHY &amp; LANDING RECON
          </h2>
          <p className="font-inter text-xs sm:text-sm text-muted-gray mt-2.5 max-w-2xl mx-auto leading-relaxed">
            High-resolution LiDAR Digital Elevation Models (DEM), 0.25m OHRC optical imagery, boulder hazard density maps, and autonomous landing ellipse safety criteria.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* VIEW MODE SELECTOR */}
          <div className="mt-7 inline-flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/10 gap-1.5">
            {[
              { id: 'LIDAR_DEM', label: 'LIDAR DEM SLOPE HEATMAP', icon: Mountain },
              { id: 'OPTICAL_OHRC', label: 'OHRC 0.25M OPTICAL RECON', icon: Scan },
              { id: 'CONTOUR_3D', label: '3D CONTOUR &amp; LASER SCAN', icon: Layers },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSel = reconViewMode === mode.id;
              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setReconViewMode(mode.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-space text-[10px] sm:text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSel
                      ? 'bg-amber-500/20 border border-amber-400 text-star-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-muted-gray hover:text-star-white border border-transparent'
                  }`}
                >
                  <Icon size={13} className={isSel ? 'text-amber-400' : 'text-muted-gray'} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* MAIN RECONNAISSANCE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Topographic Map Canvas (Left 8 Cols) */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border overflow-hidden relative shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/70 pb-4 mb-4 gap-2">
              <div className="flex items-center gap-3">
                <Mountain size={18} className="text-amber-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-space text-xs sm:text-sm tracking-wider text-star-white uppercase block font-bold">
                    {selectedSite.name}
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    COORDINATES: {selectedSite.coords} {'//'} ELEVATION: {selectedSite.elevation}
                  </span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full font-space text-[10px] font-bold border flex items-center gap-1.5 self-start sm:self-auto ${
                  selectedSite.hazard === 'LOW'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : selectedSite.hazard === 'MEDIUM'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-red-500/15 border-red-500/30 text-red-400'
                }`}
              >
                {selectedSite.hazard === 'LOW' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                <span>{selectedSite.hazard} HAZARD // SCORE {selectedSite.score}%</span>
              </span>
            </div>

            {/* TOPOGRAPHIC MAP SVG CANVAS WITH INDIVIDUALIZED ENVIRONMENTS */}
            <div className="relative aspect-[16/10] w-full bg-[#030612] rounded-2xl overflow-hidden border border-glass-border/60 shadow-2xl select-none">
              <svg viewBox="0 0 640 400" className="w-full h-full">
                <defs>
                  {/* LiDAR Slope Heatmap Gradients */}
                  <linearGradient id="lidarSlopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#052e16" />
                    <stop offset="30%" stopColor="#065f46" />
                    <stop offset="65%" stopColor="#854d0e" />
                    <stop offset="90%" stopColor="#991b1b" />
                  </linearGradient>

                  {/* Mars Jezero Delta Gradient */}
                  <linearGradient id="jezeroDeltaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="40%" stopColor="#7c2d12" />
                    <stop offset="75%" stopColor="#c2410c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>

                  {/* Volcanic Basalt Gradient */}
                  <linearGradient id="syrtisVolcanoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a0404" />
                    <stop offset="40%" stopColor="#450a0a" />
                    <stop offset="80%" stopColor="#7f1d1d" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>

                  {/* Malapert Solar Illumination Gradient */}
                  <radialGradient id="eternalLightGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                    <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                  </radialGradient>

                  {/* Cold Trap Ice Deposit Shimmer */}
                  <radialGradient id="coldTrapIce" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
                  </radialGradient>

                  {/* Regolith Crater Shading */}
                  <radialGradient id="craterShade" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#334155" stopOpacity="0.9" />
                    <stop offset="65%" stopColor="#0f172a" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                </defs>

                {/* Grid Overlay */}
                {[50, 100, 150, 200, 250, 300, 350].map((y) => (
                  <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                ))}
                {[80, 160, 240, 320, 400, 480, 560].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                ))}

                {/* ------------------------------------------------------------- */}
                {/* MODE 1: LIDAR DEM SLOPE HEATMAP OVERLAY */}
                {/* ------------------------------------------------------------- */}
                {reconViewMode === 'LIDAR_DEM' && (
                  <g>
                    {/* DEM False-Color Elevation Slope Matrix */}
                    <rect width="640" height="400" fill="url(#lidarSlopeGrad)" opacity="0.35" />
                    
                    {/* Iso-Elevation Contour Lines with Elevation Markers */}
                    {[80, 140, 200, 260, 320].map((cy, idx) => (
                      <g key={idx} fill="none" stroke="#10b981" strokeWidth="1.2" opacity="0.65">
                        <path d={`M 20 ${cy} Q 180 ${cy - 40} 340 ${cy + 15} T 620 ${cy - 10}`} />
                        <text x="35" y={cy - 4} fill="#10b981" fontSize="7" fontFamily="'Space Grotesk', sans-serif">
                          {(parseFloat(selectedSite.elevation) + idx * 0.3).toFixed(2)} km
                        </text>
                      </g>
                    ))}

                    {/* Slope Hazard Zones (< 5° Safe Green, 5-12° Warning Amber, >12° Critical Red) */}
                    <circle cx="210" cy="140" r="42" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,2" />
                    <circle cx="490" cy="160" r="50" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3,2" />
                    <circle cx="330" cy="270" r="60" fill="none" stroke="#10b981" strokeWidth="2" />
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 2: OHRC 0.25M HIGH-RESOLUTION OPTICAL RECON */}
                {/* ------------------------------------------------------------- */}
                {reconViewMode === 'OPTICAL_OHRC' && (
                  <g>
                    {/* Optical Monochromatic Regolith Surface Texture */}
                    <rect width="640" height="400" fill="#0b0f19" />

                    {/* High-Contrast Crater Shadows & Ejecta Blankets */}
                    <ellipse cx="210" cy="140" rx="36" ry="24" fill="#020408" stroke="#cbd5e1" strokeWidth="1.5" />
                    <ellipse cx="490" cy="160" rx="48" ry="32" fill="#020408" stroke="#cbd5e1" strokeWidth="1.5" />
                    <ellipse cx="330" cy="300" rx="28" ry="18" fill="#020408" stroke="#94a3b8" strokeWidth="1" />

                    {/* AI Autonomous Boulder Detection Bounding Boxes */}
                    {[
                      { x: 180, y: 120, w: 22, h: 22, tag: 'B-01: 0.18m (SAFE)', ok: true },
                      { x: 260, y: 220, w: 28, h: 28, tag: 'B-02: 0.24m (SAFE)', ok: true },
                      { x: 460, y: 130, w: 42, h: 42, tag: 'B-03: 0.85m (HAZARD)', ok: false },
                      { x: 380, y: 240, w: 18, h: 18, tag: 'B-04: 0.12m (SAFE)', ok: true },
                    ].map((b, i) => (
                      <g key={i}>
                        <rect
                          x={b.x}
                          y={b.y}
                          width={b.w}
                          height={b.h}
                          fill={b.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.25)'}
                          stroke={b.ok ? '#10b981' : '#ef4444'}
                          strokeWidth="1.2"
                          rx="2"
                        />
                        <text
                          x={b.x}
                          y={b.y - 4}
                          fill={b.ok ? '#10b981' : '#ef4444'}
                          fontSize="7"
                          fontFamily="'Space Grotesk', sans-serif"
                          fontWeight="bold"
                        >
                          {b.tag}
                        </text>
                      </g>
                    ))}

                    {/* Camera Focal Reticle */}
                    <circle cx="320" cy="200" r="70" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="6,4" />
                    <line x1="320" y1="110" x2="320" y2="290" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                    <line x1="230" y1="200" x2="410" y2="200" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 3: 3D CONTOUR WIREFRAME PERSPECTIVE & LASER SCAN */}
                {/* ------------------------------------------------------------- */}
                {reconViewMode === 'CONTOUR_3D' && (
                  <g>
                    {/* 3D Perspective Wireframe Mesh */}
                    <g fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.55">
                      {[100, 140, 180, 220, 260, 300, 340, 380].map((yLine, idx) => (
                        <path
                          key={idx}
                          d={`M 20 ${yLine} C 180 ${yLine - 25 * Math.sin(idx)}, 360 ${yLine + 20 * Math.cos(idx)}, 620 ${yLine}`}
                        />
                      ))}
                      {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((xLine, idx) => (
                        <line
                          key={idx}
                          x1={xLine}
                          y1="60"
                          x2={xLine + (xLine - 320) * 0.15}
                          y2="380"
                        />
                      ))}
                    </g>

                    {/* Dynamic 3D Laser Altimeter Grid Sweep */}
                    <rect
                      x="220"
                      y="140"
                      width="200"
                      height="120"
                      rx="8"
                      fill="rgba(0, 212, 255, 0.12)"
                      stroke="#00d4ff"
                      strokeWidth="1.5"
                      strokeDasharray="5,3"
                    />
                    <text x="320" y="195" fill="#00d4ff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                      4.0 KM x 2.4 KM LANDING ENVELOPE
                    </text>
                    <text x="320" y="210" fill="#38bdf8" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                      MEAN SLOPE: {selectedSite.slope}
                    </text>
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* INDIVIDUALIZED ENVIRONMENT BACKDROPS */}
                {/* ------------------------------------------------------------- */}
                {selectedSite.id === 'SITE-SHIV-SHAKTI' && (
                  <g>
                    {/* Soft highland regolith hills */}
                    <path d="M 0 260 Q 140 180 320 250 T 640 230 L 640 400 L 0 400 Z" fill="#0f172a" opacity="0.6" />
                    <path d="M 0 310 Q 180 260 360 300 T 640 280 L 640 400 L 0 400 Z" fill="#1e293b" opacity="0.7" />
                    <g transform="translate(332, 304)">
                      <circle r="14" fill="#10b981" opacity="0.25" className="animate-ping" />
                      <circle r="6" fill="#10b981" />
                      <rect x="8" y="-18" width="135" height="24" rx="4" fill="#041222" stroke="#10b981" strokeWidth="1" />
                      <text x="14" y="-3" fill="#10b981" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        VIKRAM TOUCHDOWN LOCUS
                      </text>
                    </g>
                  </g>
                )}

                {selectedSite.id === 'SITE-MALAPERT' && (
                  <g>
                    <polygon points="120,400 310,90 480,400" fill="url(#eternalLightGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                    <g transform="translate(307, 352)">
                      <circle r="12" fill="#00d4ff" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#00d4ff" />
                      <rect x="8" y="-18" width="145" height="24" rx="4" fill="#041222" stroke="#00d4ff" strokeWidth="1" />
                      <text x="14" y="-3" fill="#00d4ff" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        ARTEMIS BASE RIDGE (+5.0 km)
                      </text>
                    </g>
                  </g>
                )}

                {selectedSite.id === 'SITE-SHACKLETON' && (
                  <g>
                    <ellipse cx="320" cy="220" rx="260" ry="150" fill="#000000" stroke="#f59e0b" strokeWidth="2" opacity="0.7" />
                    <ellipse cx="320" cy="220" rx="180" ry="100" fill="url(#coldTrapIce)" stroke="#0284c7" strokeWidth="1.5" />
                    <g transform="translate(320, 372)">
                      <circle r="14" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#f59e0b" />
                      <rect x="8" y="-18" width="150" height="24" rx="4" fill="#041222" stroke="#f59e0b" strokeWidth="1" />
                      <text x="14" y="-3" fill="#f59e0b" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        PERMANENT COLD TRAP RIM
                      </text>
                    </g>
                  </g>
                )}

                {selectedSite.id === 'SITE-JEZERO' && (
                  <g>
                    <path d="M 120 40 Q 280 180 320 280 T 520 380 L 120 380 Z" fill="url(#jezeroDeltaGrad)" opacity="0.75" />
                    <g transform="translate(281, 144)">
                      <circle r="14" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#38bdf8" />
                      <rect x="8" y="-18" width="145" height="24" rx="4" fill="#041222" stroke="#38bdf8" strokeWidth="1" />
                      <text x="14" y="-3" fill="#38bdf8" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        JEZERO ALLUVIAL DELTA FAN
                      </text>
                    </g>
                  </g>
                )}

                {selectedSite.id === 'SITE-SYRTIS' && (
                  <g>
                    <ellipse cx="320" cy="200" rx="250" ry="140" fill="url(#syrtisVolcanoGrad)" stroke="#ff3b3b" strokeWidth="2" opacity="0.8" />
                    {/* Autonomous Divert Vector Arrow */}
                    <line x1="153" y1="192" x2="380" y2="80" stroke="#ff3b3b" strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
                    <g transform="translate(153, 192)">
                      <circle r="16" fill="#ff3b3b" opacity="0.35" className="animate-ping" />
                      <circle r="6" fill="#ff3b3b" />
                      <rect x="8" y="-18" width="155" height="24" rx="4" fill="#041222" stroke="#ff3b3b" strokeWidth="1.2" />
                      <text x="14" y="-3" fill="#ff3b3b" fontSize="9" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold">
                        14.2° SLOPE // DIVERT MANDATORY
                      </text>
                    </g>
                  </g>
                )}

                {/* Candidate Landing Site Ellipse Markers */}
                {CANDIDATE_SITES.map((site) => {
                  const px = (site.x / 100) * 640;
                  const py = (site.y / 100) * 400;
                  const isSel = site.id === selectedSiteId;

                  return (
                    <g
                      key={site.id}
                      transform={`translate(${px}, ${py})`}
                      onClick={() => setSelectedSiteId(site.id)}
                      className="cursor-pointer"
                    >
                      {/* Landing Ellipse */}
                      <ellipse
                        rx={isSel ? 44 : 26}
                        ry={isSel ? 26 : 16}
                        fill={isSel ? `${site.color}25` : 'none'}
                        stroke={site.color}
                        strokeWidth={isSel ? 2.2 : 1.2}
                        strokeDasharray={isSel ? 'none' : '4,3'}
                        className={isSel ? 'animate-pulse' : ''}
                      />
                      <circle r={isSel ? 6 : 4} fill={site.color} />
                      <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="1" />
                    </g>
                  );
                })}

                {/* Laser Altimeter Scan Beam Simulation */}
                {laserScanActive && (
                  <line
                    x1="0"
                    y1="200"
                    x2="640"
                    y2="200"
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeDasharray="6,4"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Map View Mode Tag Overlay */}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 font-space text-[10px] text-star-white font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ENVIRONMENT: {selectedSite.name.split(' [')[0]}</span>
              </div>
            </div>

            {/* Quick Candidate Site Selector Pills */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CANDIDATE_SITES.map((site) => (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-space tracking-wider border cursor-pointer shrink-0 transition-all ${
                    site.id === selectedSiteId
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-black/60 border-white/10 text-star-white/70 hover:text-star-white hover:border-amber-400/40'
                  }`}
                >
                  {site.name.split(' ')[0]} ({site.score}%)
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column (Lander Hazard Diagnostics & Safety Criteria) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Site Topography & Hazards Metrics */}
            <motion.div
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-400/30 box-glow relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-amber-400">
                  LANDER TOUCHDOWN SAFETY CRITERIA
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {selectedSite.confidence}
                </span>
              </div>

              <div className="space-y-3 font-space text-xs">
                {/* Surface Slope */}
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Surface Slope Gradient:</span>
                  <span className={`font-mono font-bold ${selectedSite.slopeDeg <= 5 ? 'text-emerald-400' : selectedSite.slopeDeg <= 12 ? 'text-amber-400' : 'text-red-400'}`}>
                    {selectedSite.slope}
                  </span>
                </div>

                {/* Boulder Density */}
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Boulder Density (&gt;0.5m):</span>
                  <span className="font-mono text-star-white font-bold">{selectedSite.boulders}</span>
                </div>

                {/* Solar Illumination */}
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Solar Power Illumination:</span>
                  <span className="font-mono text-cyan-glow font-bold">{selectedSite.illumination}</span>
                </div>

                {/* Water Ice Probability */}
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Volatiles / Water Ice Index:</span>
                  <span className="font-mono text-purple-400 font-bold">{selectedSite.waterIceProbability}</span>
                </div>
              </div>
            </motion.div>

            {/* Mission Context & Hazard Avoidance Protocol */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-3 text-xs">
              <span className="font-space text-xs tracking-wider uppercase font-bold text-star-white block border-b border-glass-border pb-2">
                MISSION GEOLOGY CONTEXT
              </span>
              <p className="font-inter text-star-white/80 leading-relaxed">
                {selectedSite.missionContext}
              </p>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-space text-amber-400 font-bold uppercase block">
                  AUTONOMOUS MITIGATION GUIDANCE:
                </span>
                <p className="font-inter text-[11px] text-star-white/90 leading-tight">
                  {selectedSite.mitigationProtocol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
