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
  Eye,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface LandingSite {
  id: string;
  name: string;
  shortName: string;
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
  landingZoneDimensions: string;
  missionContext: string;
  mitigationProtocol: string;
  demFeatures: string[];
}

const CANDIDATE_SITES: LandingSite[] = [
  {
    id: 'SITE-SHIV-SHAKTI',
    name: 'SHIV SHAKTI POINT [LUNAR SOUTH POLE]',
    shortName: 'Shiv Shakti Point',
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
    landingZoneDimensions: '4.0 km x 2.4 km Safe Envelope',
    missionContext: 'Site of historic Chandrayaan-3 soft touchdown. Validated by Orbiter High Resolution Camera (OHRC 0.25m ground resolution). Flat inter-crater plain between Manzinus C and Boguslawsky M.',
    mitigationProtocol: 'Autonomous Lander Hazard Detection & Avoidance Camera (LHDAC) scanned 200m grid prior to terminal touchdown.',
    demFeatures: ['Manzinus C Crater Edge', 'Boguslawsky M Ridge', 'Smooth Polar Soil Basin'],
  },
  {
    id: 'SITE-MALAPERT',
    name: 'MALAPERT MOUNTAIN PEAK [LUNAR SOUTH POLE]',
    shortName: 'Malapert Mountain',
    body: 'Moon (Ultra-Highland Peak)',
    coords: '85.90° S, 0.00° E',
    elevation: '+5.0 km (Peak of Eternal Light)',
    score: 94.2,
    hazard: 'LOW',
    slope: '2.8° (Flat ridge plateau)',
    slopeDeg: 2.8,
    boulders: '0.03 / m²',
    illumination: '98% (Continuous solar illumination)',
    waterIceProbability: '88.0% (Adjacent permanently shadowed crater)',
    confidence: '98.5% (LRO LOLA Laser Altimeter)',
    color: '#00d4ff',
    landingZoneDimensions: '2.8 km x 1.8 km Plateau Zone',
    missionContext: 'Prime Artemis & Lunar Base landing candidate offering 340+ days of uninterrupted solar illumination atop a massive highland mountain massif.',
    mitigationProtocol: 'Laser Altimeter closed-loop terrain relative navigation with precision lateral thrust compensation.',
    demFeatures: ['Peak of Eternal Light Massif', 'Highland Solar Ridge', 'Adjacent Deep Cold Shadow'],
  },
  {
    id: 'SITE-SHACKLETON',
    name: 'SHACKLETON CRATER RIM [COLD TRAP]',
    shortName: 'Shackleton Crater',
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
    confidence: '96.1% (Multi-beam LiDAR)',
    color: '#f59e0b',
    landingZoneDimensions: '1.5 km x 1.2 km Rim Crest',
    missionContext: 'Direct rim of permanently shadowed region (PSR) holding billion-year-old water ice volatiles and organic cryo-compounds in 40 Kelvin deep shadow.',
    mitigationProtocol: 'Multi-beam LiDAR rangefinder guidance to prevent rim slope overshoot into crater interior.',
    demFeatures: ['4.2 km Deep PSR Bowl', 'Permanent Volatile Ice Deposits', 'Narrow Sunlit Rim Crest'],
  },
  {
    id: 'SITE-JEZERO',
    name: 'JEZERO CRATER DELTA [MARS]',
    shortName: 'Jezero Delta',
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
    confidence: '98.1% (HiRISE 0.3m Camera)',
    color: '#38bdf8',
    landingZoneDimensions: '7.7 km x 6.6 km Delta Fan',
    missionContext: 'Ancient lacustrine river delta offering stable landing surface with rich astrobiological core sample targets in layered mudstones.',
    mitigationProtocol: 'Terrain Relative Navigation (TRN) with closed-loop skycrane retro-thrust profile.',
    demFeatures: ['Ancient River Inlet Canyon', 'Layered Alluvial Fan Delta', 'Lacustrine Clay Floor'],
  },
  {
    id: 'SITE-SYRTIS',
    name: 'SYRTIS MAJOR VOLCANIC ESCARPMENT',
    shortName: 'Syrtis Major',
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
    landingZoneDimensions: '12.0 km Divert Corridor Required',
    missionContext: 'High-risk volcanic basalt field with extensive escarpments, lava tubes, and steep slopes exceeding structural tip-over safety margins.',
    mitigationProtocol: 'Mandatory autonomous divert: Terminal guidance commands divert burn to secondary landing ellipse > 18 km away.',
    demFeatures: ['Basalt Lava Tube Collapses', '14.2° Steep Escarpment Ridge', 'Dense Boulder Debris Field'],
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
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 w-full">
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
              PLANETARY SURFACE TOPOGRAPHY &amp; AUTONOMOUS LANDING RECONNAISSANCE
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-star-white">
            SURFACE TOPOGRAPHY &amp; LANDING RECON
          </h2>
          <p className="font-inter text-xs sm:text-sm text-muted-gray mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Isolated high-resolution spatial viewports for each candidate landing site with LiDAR Digital Elevation Models (DEM), 0.25m OHRC optical recon, and autonomous hazard avoidance.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* DEDICATED SITE SPACES SELECTOR BAR */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {CANDIDATE_SITES.map((site) => {
              const isSel = site.id === selectedSiteId;
              return (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    isSel
                      ? 'bg-amber-500/20 border-amber-400 text-star-white shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105 font-bold'
                      : 'bg-black/50 border-white/10 text-muted-gray hover:text-star-white hover:border-amber-400/40'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: site.color, boxShadow: isSel ? `0 0 8px ${site.color}` : 'none' }}
                  />
                  <span>{site.shortName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                      site.hazard === 'LOW'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : site.hazard === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {site.score}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* VIEW MODE SELECTOR */}
          <div className="mt-5 inline-flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/10 gap-1.5">
            {[
              { id: 'LIDAR_DEM', label: 'LIDAR DEM SLOPE HEATMAP', icon: Mountain },
              { id: 'OPTICAL_OHRC', label: 'OHRC 0.25M OPTICAL RECON', icon: Scan },
              { id: 'CONTOUR_3D', label: '3D CONTOUR & LASER SCAN', icon: Layers },
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
                      ? 'bg-amber-500/20 border-amber-400 text-star-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
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

        {/* MAIN DEDICATED ACTIVE SPACE VIEWPORT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-12">
          {/* Topographic Map Canvas (Left 8 Cols) */}
          <motion.div
            key={selectedSite.id}
            className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border overflow-hidden relative shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/70 pb-4 mb-4 gap-2">
              <div className="flex items-center gap-3">
                <Mountain size={20} className="text-amber-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-space text-xs sm:text-sm tracking-wider text-star-white uppercase block font-bold">
                    {selectedSite.name}
                  </span>
                  <span className="font-space text-[10px] text-muted-gray">
                    COORDINATES: {selectedSite.coords} {'//'} ELEVATION: {selectedSite.elevation}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full font-space text-[10px] font-bold border flex items-center gap-1.5 ${
                    selectedSite.hazard === 'LOW'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : selectedSite.hazard === 'MEDIUM'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                  }`}
                >
                  {selectedSite.hazard === 'LOW' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  <span>{selectedSite.hazard} HAZARD // SAFETY SCORE {selectedSite.score}%</span>
                </span>
              </div>
            </div>

            {/* TOPOGRAPHIC MAP SVG CANVAS (ISOLATED SPACE FOR THIS LANDING SITE ONLY - ZERO COLLISION) */}
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
                </defs>

                {/* Coordinate Grid Overlay */}
                {[50, 100, 150, 200, 250, 300, 350].map((y) => (
                  <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                ))}
                {[80, 160, 240, 320, 400, 480, 560].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                ))}

                {/* ------------------------------------------------------------- */}
                {/* ISOLATED ENVIRONMENT RENDERINGS (DEDICATED PER SITE) */}
                {/* ------------------------------------------------------------- */}
                
                {/* SPACE 1: SHIV SHAKTI POINT */}
                {selectedSite.id === 'SITE-SHIV-SHAKTI' && (
                  <g>
                    {/* Soft highland regolith hills */}
                    <path d="M 0 240 Q 140 160 320 230 T 640 210 L 640 400 L 0 400 Z" fill="#0f172a" opacity="0.6" />
                    <path d="M 0 290 Q 180 240 360 280 T 640 260 L 640 400 L 0 400 Z" fill="#1e293b" opacity="0.7" />
                    <ellipse cx="140" cy="270" rx="45" ry="16" fill="#08090e" stroke="#2a3040" strokeWidth="1" />
                    <ellipse cx="500" cy="300" rx="70" ry="22" fill="#08090e" stroke="#2a3040" strokeWidth="1" />
                    
                    {/* Dedicated Landing Envelope */}
                    <rect x="220" y="160" width="200" height="110" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
                    <g transform="translate(320, 215)">
                      <circle r="14" fill="#10b981" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#10b981" />
                      <rect x="-80" y="-32" width="160" height="20" rx="4" fill="#041222" stroke="#10b981" strokeWidth="1" />
                      <text x="0" y="-19" fill="#10b981" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        CH-3 TOUCHDOWN (69.373°S, 32.319°E)
                      </text>
                      <text x="0" y="32" fill="#94a3b8" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                        4.0 KM x 2.4 KM SAFE LANDING ENVELOPE
                      </text>
                    </g>
                  </g>
                )}

                {/* SPACE 2: MALAPERT MOUNTAIN PEAK */}
                {selectedSite.id === 'SITE-MALAPERT' && (
                  <g>
                    {/* Mountain Massif Wireframe & Sunlight Cone */}
                    <polygon points="120,400 320,90 520,400" fill="url(#eternalLightGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                    <path d="M 220 245 L 320 90 L 420 245 Z" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="3,3" />
                    <g transform="translate(320, 210)">
                      <circle r="14" fill="#00d4ff" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#00d4ff" />
                      <rect x="-95" y="-32" width="190" height="20" rx="4" fill="#041222" stroke="#00d4ff" strokeWidth="1" />
                      <text x="0" y="-19" fill="#00d4ff" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        ARTEMIS BASE RIDGE (+5.0 KM ELEVATION)
                      </text>
                      <text x="0" y="32" fill="#93c5fd" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                        98% CONTINUOUS SOLAR ILLUMINATION
                      </text>
                    </g>
                  </g>
                )}

                {/* SPACE 3: SHACKLETON CRATER RIM */}
                {selectedSite.id === 'SITE-SHACKLETON' && (
                  <g>
                    {/* Deep Crater Bowl & Ice volatiles */}
                    <ellipse cx="320" cy="210" rx="260" ry="145" fill="#000000" stroke="#f59e0b" strokeWidth="2" opacity="0.75" />
                    <ellipse cx="320" cy="210" rx="180" ry="95" fill="url(#coldTrapIce)" stroke="#0284c7" strokeWidth="1.5" />
                    <g transform="translate(320, 110)">
                      <circle r="14" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#f59e0b" />
                      <rect x="-90" y="-30" width="180" height="20" rx="4" fill="#041222" stroke="#f59e0b" strokeWidth="1" />
                      <text x="0" y="-17" fill="#f59e0b" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        PSR COLD TRAP RIM (89.90°S, 0.00°E)
                      </text>
                    </g>
                    <text x="320" y="215" fill="#67e8f9" fontSize="8.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                      40 KELVIN PERMANENT WATER ICE DEPOSITS (96.4%)
                    </text>
                  </g>
                )}

                {/* SPACE 4: JEZERO CRATER DELTA */}
                {selectedSite.id === 'SITE-JEZERO' && (
                  <g>
                    <path d="M 100 40 Q 280 180 320 280 T 540 380 L 100 380 Z" fill="url(#jezeroDeltaGrad)" opacity="0.75" />
                    <path d="M 180 80 Q 280 180 360 260" fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="4,2" />
                    <g transform="translate(330, 200)">
                      <circle r="14" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                      <circle r="6" fill="#38bdf8" />
                      <rect x="-85" y="-32" width="170" height="20" rx="4" fill="#041222" stroke="#38bdf8" strokeWidth="1" />
                      <text x="0" y="-19" fill="#38bdf8" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        JEZERO ALLUVIAL DELTA FAN (-2.5 KM)
                      </text>
                      <text x="0" y="32" fill="#cbd5e1" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                        7.7 KM x 6.6 KM SKYCRANE ENVELOPE
                      </text>
                    </g>
                  </g>
                )}

                {/* SPACE 5: SYRTIS MAJOR CALDERA */}
                {selectedSite.id === 'SITE-SYRTIS' && (
                  <g>
                    <ellipse cx="320" cy="200" rx="250" ry="140" fill="url(#syrtisVolcanoGrad)" stroke="#ff3b3b" strokeWidth="2" opacity="0.8" />
                    <line x1="220" y1="210" x2="440" y2="90" stroke="#ff3b3b" strokeWidth="2.5" strokeDasharray="5,3" />
                    <polygon points="440,90 425,93 432,105" fill="#ff3b3b" />
                    <g transform="translate(220, 210)">
                      <circle r="16" fill="#ff3b3b" opacity="0.35" className="animate-ping" />
                      <circle r="6" fill="#ff3b3b" />
                      <rect x="-95" y="-32" width="190" height="20" rx="4" fill="#041222" stroke="#ff3b3b" strokeWidth="1.2" />
                      <text x="0" y="-19" fill="#ff3b3b" fontSize="8" fontFamily="'Space Grotesk', sans-serif" fontWeight="bold" textAnchor="middle">
                        14.2° SLOPE // MANDATORY AUTONOMOUS DIVERT
                      </text>
                      <text x="0" y="32" fill="#fca5a5" fontSize="7.5" fontFamily="'Space Grotesk', sans-serif" textAnchor="middle">
                        RETARGETING SECONDARY BASIN (+18 KM)
                      </text>
                    </g>
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 1: LIDAR DEM SLOPE HEATMAP OVERLAY */}
                {/* ------------------------------------------------------------- */}
                {reconViewMode === 'LIDAR_DEM' && (
                  <g>
                    <rect width="640" height="400" fill="url(#lidarSlopeGrad)" opacity="0.25" />
                    {[80, 140, 200, 260, 320].map((cy, idx) => (
                      <g key={idx} fill="none" stroke="#10b981" strokeWidth="1.2" opacity="0.65">
                        <path d={`M 20 ${cy} Q 180 ${cy - 30} 340 ${cy + 15} T 620 ${cy - 10}`} />
                        <text x="35" y={cy - 4} fill="#10b981" fontSize="7" fontFamily="'Space Grotesk', sans-serif">
                          {(parseFloat(selectedSite.elevation) + idx * 0.3).toFixed(2)} km
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 2: OHRC 0.25M HIGH-RESOLUTION OPTICAL RECON */}
                {/* ------------------------------------------------------------- */}
                {reconViewMode === 'OPTICAL_OHRC' && (
                  <g>
                    {[
                      { x: 140, y: 110, w: 24, h: 24, tag: 'B-01: 0.18m (SAFE)', ok: true },
                      { x: 250, y: 220, w: 26, h: 26, tag: 'B-02: 0.22m (SAFE)', ok: true },
                      { x: 470, y: 130, w: 38, h: 38, tag: selectedSite.hazard === 'HIGH' ? 'B-03: 1.10m (CRITICAL)' : 'B-03: 0.35m (SAFE)', ok: selectedSite.hazard !== 'HIGH' },
                      { x: 380, y: 270, w: 20, h: 20, tag: 'B-04: 0.14m (SAFE)', ok: true },
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
                    <circle cx="320" cy="200" r="70" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="6,4" />
                    <line x1="320" y1="120" x2="320" y2="280" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                    <line x1="240" y1="200" x2="400" y2="200" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 3: 3D CONTOUR WIREFRAME PERSPECTIVE */}
                {/* ------------------------------------------------------------- */}
                {reconViewMode === 'CONTOUR_3D' && (
                  <g fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.6">
                    {[100, 140, 180, 220, 260, 300, 340, 380].map((yLine, idx) => (
                      <path
                        key={idx}
                        d={`M 20 ${yLine} C 180 ${yLine - 20 * Math.sin(idx)}, 360 ${yLine + 15 * Math.cos(idx)}, 620 ${yLine}`}
                      />
                    ))}
                  </g>
                )}

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
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 font-space text-[10px] text-star-white font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ACTIVE SPACE: {selectedSite.shortName}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (Lander Hazard Diagnostics & Safety Criteria) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Site Topography & Hazards Metrics */}
            <motion.div
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-400/30 box-glow relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-amber-400">
                  TOUCHDOWN SAFETY CRITERIA
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {selectedSite.confidence}
                </span>
              </div>

              <div className="space-y-2.5 font-space text-xs">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Surface Slope Gradient:</span>
                  <span className={`font-mono font-bold ${selectedSite.slopeDeg <= 5 ? 'text-emerald-400' : selectedSite.slopeDeg <= 12 ? 'text-amber-400' : 'text-red-400'}`}>
                    {selectedSite.slope}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Boulder Density (&gt;0.5m):</span>
                  <span className="font-mono text-star-white font-bold">{selectedSite.boulders}</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Solar Power Illumination:</span>
                  <span className="font-mono text-cyan-glow font-bold">{selectedSite.illumination}</span>
                </div>

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

        {/* MULTI-SITE DEDICATED SPATIAL MATRIX (ALL SITES IN SEPARATE DEDICATED CARDS) */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-amber-400" />
              <span className="font-space text-xs md:text-sm font-bold tracking-wider text-star-white uppercase">
                ALL CANDIDATE LANDING SPACES // SEPARATE ENVIRONMENT RECON
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-gray">5 DEDICATED SPATIAL VIEWPORTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CANDIDATE_SITES.map((site) => {
              const isSelected = site.id === selectedSiteId;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'glass-panel border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]'
                      : 'glass-panel border-glass-border hover:border-amber-400/30 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-muted-gray uppercase block">{site.body.split(' ')[0]}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                          site.hazard === 'LOW'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : site.hazard === 'MEDIUM'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            : 'bg-red-500/15 border-red-500/30 text-red-300'
                        }`}
                      >
                        {site.score}%
                      </span>
                    </div>

                    <span className="font-space text-xs font-bold text-star-white block leading-tight">
                      {site.shortName}
                    </span>

                    <span className="font-mono text-[10px] text-star-white/60 block">
                      Slope: <strong className={site.slopeDeg <= 5 ? 'text-emerald-400' : site.slopeDeg <= 12 ? 'text-amber-400' : 'text-red-400'}>{site.slope.split(' ')[0]}</strong>
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-space text-amber-400 font-bold flex items-center gap-1">
                      <span>INSPECT SPACE</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
