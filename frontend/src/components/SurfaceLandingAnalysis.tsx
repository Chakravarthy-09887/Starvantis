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

            {/* TOPOGRAPHIC MAP SVG CANVAS */}
            <div className="relative aspect-[16/10] w-full bg-[#040814] rounded-2xl overflow-hidden border border-glass-border/50">
              <svg viewBox="0 0 640 400" className="w-full h-full">
                <defs>
                  {/* LiDAR Slope Gradient */}
                  <linearGradient id="lidarSlopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#052e16" />
                    <stop offset="30%" stopColor="#065f46" />
                    <stop offset="65%" stopColor="#854d0e" />
                    <stop offset="90%" stopColor="#991b1b" />
                  </linearGradient>

                  {/* Optical Crater Texture Pattern */}
                  <radialGradient id="craterShade" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#0f172a" stopOpacity="0.95" />
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

                {/* Simulated Topographic Elevation Contours */}
                <g fill="none" stroke={reconViewMode === 'LIDAR_DEM' ? '#10b981' : '#475569'} strokeWidth="1.2" opacity="0.6">
                  <path d="M 40 280 Q 180 200, 320 280 T 600 280" />
                  <path d="M 60 250 Q 200 170, 340 250 T 580 250" />
                  <path d="M 90 220 Q 230 140, 370 220 T 550 220" />
                  <path d="M 120 190 Q 260 110, 400 190 T 520 190" />
                  <path d="M 160 160 Q 300 80, 440 160 T 480 160" />
                </g>

                {/* Craters with Shadows */}
                {[
                  { cx: 180, cy: 120, r: 42 },
                  { cx: 460, cy: 140, r: 60 },
                  { cx: 340, cy: 300, r: 35 },
                  { cx: 120, cy: 320, r: 25 },
                  { cx: 530, cy: 290, r: 48 },
                ].map((crater, i) => (
                  <g key={i}>
                    <circle cx={crater.cx} cy={crater.cy} r={crater.r} fill="url(#craterShade)" stroke="#334155" strokeWidth="1.5" />
                    <circle cx={crater.cx} cy={crater.cy} r={crater.r * 0.4} fill="#020617" opacity="0.8" />
                  </g>
                ))}

                {/* Landing Sites Interactive Markers */}
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
                      {/* Landing Ellipse (4km x 2.4km) */}
                      <ellipse
                        rx={isSel ? 44 : 28}
                        ry={isSel ? 26 : 18}
                        fill={isSel ? `${site.color}25` : 'none'}
                        stroke={site.color}
                        strokeWidth={isSel ? 2 : 1.2}
                        strokeDasharray={isSel ? 'none' : '4,3'}
                        className={isSel ? 'animate-pulse' : ''}
                      />

                      {/* Center Touchdown Crosshair */}
                      <circle r={isSel ? 6 : 4} fill={site.color} />
                      <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="1" />

                      {/* Non-overlapping HUD Label */}
                      <g transform="translate(16, -14)">
                        <rect
                          x="0"
                          y="0"
                          width={site.name.length * 5.8 + 16}
                          height="22"
                          rx="4"
                          fill="rgba(4, 18, 34, 0.92)"
                          stroke={isSel ? site.color : '#475569'}
                          strokeWidth="1"
                        />
                        <text
                          x="8"
                          y="14"
                          fill={isSel ? '#ffffff' : 'rgba(232, 237, 242, 0.8)'}
                          fontSize="8.5"
                          fontFamily="'Space Grotesk', sans-serif"
                          fontWeight={isSel ? 'bold' : 'normal'}
                        >
                          {site.name.split(' ')[0]} ({site.slopeDeg}°)
                        </text>
                      </g>
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
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Map View Mode Tag Overlay */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 border border-white/10 font-space text-[10px] text-star-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ACTIVE MODE: {reconViewMode}</span>
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
