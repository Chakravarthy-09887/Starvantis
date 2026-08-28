'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mountain, MapPin, AlertTriangle, CheckCircle2, Shield, Scan, Satellite, Layers, Compass, Sparkles } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES } from '../lib/satellites';

interface LandingSite {
  id: string;
  name: string;
  body: string;
  coords: string;
  score: number;
  hazard: 'LOW' | 'MEDIUM' | 'HIGH';
  slope: string;
  boulders: string;
  illumination: string;
  confidence: string;
  color: string;
  x: number; // percentage on map
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
    score: 98.4,
    hazard: 'LOW',
    slope: '1.4° (Well within 12° limit)',
    boulders: '0.01 / m² (Clear flat regolith)',
    illumination: '94% (Sunlit polar rim)',
    confidence: '99.2% (CH-3 Orbiter OHRC verified)',
    color: '#10b981',
    x: 52,
    y: 78,
    missionContext: 'Site of historic Chandrayaan-3 soft touchdown. Validated by Orbiter High Resolution Camera (OHRC 0.25m ground resolution).',
    mitigationProtocol: 'Autonomous Lander Hazard Detection & Avoidance Camera (LHDAC) scanned 200m grid prior to terminal touchdown.',
  },
  {
    id: 'SITE-MANZINUS',
    name: 'MANZINUS C CRATER RIM',
    body: 'Moon (South Pole Highland)',
    coords: '70.85° S, 22.80° E',
    score: 84.6,
    hazard: 'MEDIUM',
    slope: '5.2°',
    boulders: '0.08 / m²',
    illumination: '86%',
    confidence: '95.4%',
    color: '#f59e0b',
    x: 35,
    y: 84,
    missionContext: 'Secondary lunar highland landing candidate with moderate micro-cratering along ridge lines.',
    mitigationProtocol: 'Laser Doppler Velocimeter (LDV) 3-axis compensation for local slope variations.',
  },
  {
    id: 'SITE-JEZERO',
    name: 'JEZERO CRATER DELTA [MARS]',
    body: 'Mars (Interplanetary Mission)',
    coords: '18.38° N, 77.58° E',
    score: 91.2,
    hazard: 'LOW',
    slope: '2.1°',
    boulders: '0.04 / m²',
    illumination: '88%',
    confidence: '98.1%',
    color: '#00d4ff',
    x: 44,
    y: 36,
    missionContext: 'Ancient lacustrine river delta offering stable landing surface with fine-grained clay deposits.',
    mitigationProtocol: 'Terrain Relative Navigation (TRN) with closed-loop skycrane retro-thrust profile.',
  },
  {
    id: 'SITE-SYRTIS',
    name: 'SYRTIS MAJOR VOLCANIC RIDGE',
    body: 'Mars (Rough Terrain)',
    coords: '8.40° N, 69.50° E',
    score: 58.0,
    hazard: 'HIGH',
    slope: '9.8° (Exceeds Limit)',
    boulders: '0.42 / m² (High Rock Density)',
    illumination: '62%',
    confidence: '90.2%',
    color: '#ff3b3b',
    x: 24,
    y: 48,
    missionContext: 'High-risk volcanic basalt field with elevated boulder distribution and steep escarpments.',
    mitigationProtocol: 'Mandatory autonomous divert to backup landing ellipse > 15 km away.',
  },
];

export default function SurfaceLandingAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [selectedSite, setSelectedSite] = useState<LandingSite>(CANDIDATE_SITES[0]);
  const { selectedSatelliteId } = useMission();

  const activeSat = FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  return (
    <section id="surface-analysis" className="section-spacing relative overflow-hidden py-20" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <Mountain size={14} className="text-cyan-glow" />
            <span className="font-space text-xs tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Autonomous Planetary Surface &amp; Site Analysis
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-star-white">
            SURFACE TOPOGRAPHY &amp; LANDING SITE RECON
          </h2>
          <p className="font-inter text-xs md:text-sm text-star-white/60 mt-3 max-w-2xl mx-auto font-light leading-relaxed">
            Real-time orbital satellite reconnaissance mapping sub-meter topographic slope, boulder hazards, and autonomous safe landing corridors.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* Surface Map + Candidate Site Cards */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Topographic Surface Map Canvas (8 cols) */}
          <motion.div
            className="lg:col-span-8 glass-panel rounded-3xl p-6 md:p-8 border border-glass-border relative overflow-hidden flex flex-col justify-between shadow-[0_0_50px_rgba(4,18,34,0.9)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Scan size={16} className="text-cyan-glow animate-pulse" />
                <span className="font-space text-xs tracking-widest text-star-white uppercase font-bold">
                  SATELLITE RECON RECONNAISSANCE GRID [{activeSat.name.split(' ')[0]}]
                </span>
              </div>
              <span className="font-space text-[10px] text-cyan-glow font-bold">
                RESOLUTION: 0.25M / PIXEL • ELEVATION ACCURACY: ±0.15M
              </span>
            </div>

            {/* Simulated Topographic Map Visual */}
            <div className="relative aspect-[16/10] w-full bg-[#050e1a] rounded-2xl overflow-hidden border border-glass-border/70 p-4">
              {/* Contour Grid Rings */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 600 380">
                  <path d="M 50 190 Q 200 40 400 90 T 550 240" fill="none" stroke="#00d4ff" strokeWidth="1" />
                  <path d="M 80 240 Q 240 90 420 150 T 520 310" fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="3,4" />
                  <path d="M 30 110 Q 180 280 380 210 T 570 120" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
                  <circle cx="312" cy="296" r="60" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="4,3" />
                  <circle cx="312" cy="296" r="100" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                </svg>
              </div>

              {/* Interactive Candidate Site Markers */}
              {CANDIDATE_SITES.map((site) => {
                const isSelected = selectedSite.id === site.id;
                return (
                  <div role="button" tabIndex={0} key={site.id}
                    
                    
                    onClick={() => setSelectedSite(site)}
                    style={{ left: `${site.x}%`, top: `${site.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center"
                        style={{
                          borderColor: site.color,
                          backgroundColor: isSelected ? site.color : 'rgba(0,0,0,0.7)',
                          transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                          boxShadow: isSelected ? `0 0 20px ${site.color}` : 'none',
                        }}
                      >
                        <MapPin size={10} className={isSelected ? 'text-black' : 'text-star-white'} />
                      </div>
                      {isSelected && (
                        <div
                          className="absolute w-8 h-8 rounded-full border animate-ping"
                          style={{ borderColor: site.color }}
                        />
                      )}
                    </div>
                    <span
                      className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-space px-2 py-0.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-black/90 text-star-white font-bold border-cyan-glow shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                          : 'bg-black/60 text-star-white/60 border-transparent group-hover:border-white/20'
                      }`}
                    >
                      {site.name.split(' [')[0]}
                    </span>
                  </div>
                );
              })}

              {/* Bottom Map Legend */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-space text-star-white/70 bg-black/70 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Safe (&lt; 5° Slope)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Moderate</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-alert-critical" />
                    <span>Hazard Exceeded</span>
                  </span>
                </div>
                <span className="text-cyan-glow font-bold">CLICK SITES TO INSPECT</span>
              </div>
            </div>

            {/* Quick Candidate Site Selectors */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              {CANDIDATE_SITES.map((site) => (
                <div role="button" tabIndex={0} key={site.id}
                  
                  
                  onClick={() => setSelectedSite(site)}
                  className={`px-3.5 py-2 rounded-xl text-[10px] font-space tracking-wider border whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    selectedSite.id === site.id
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                      : 'glass-panel border-glass-border text-muted-gray hover:text-star-white'
                  }`}
                >
                  <MapPin size={12} style={{ color: site.color }} />
                  <span>{site.name}</span>
                  <span className="font-bold" style={{ color: site.color }}>
                    {site.score}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Selected Site Recon Analytics (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              key={selectedSite.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-3xl p-6 border border-glass-border space-y-4 shadow-[0_0_40px_rgba(4,18,34,0.8)]"
            >
              <div className="flex items-start justify-between border-b border-glass-border pb-3">
                <div>
                  <span className="font-space text-[10px] tracking-[0.25em] text-cyan-glow uppercase font-bold">
                    LANDING SITE PROFILE
                  </span>
                  <h3 className="font-space text-base md:text-lg text-star-white font-bold mt-1">
                    {selectedSite.name}
                  </h3>
                  <span className="font-inter text-xs text-star-white/60">{selectedSite.body}</span>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-space tracking-wider uppercase font-bold border"
                  style={{
                    backgroundColor: `${selectedSite.color}20`,
                    borderColor: `${selectedSite.color}40`,
                    color: selectedSite.color,
                  }}
                >
                  {selectedSite.hazard} HAZARD
                </span>
              </div>

              {/* Key Recon Parameters */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">SURFACE SLOPE</span>
                  <span className="font-space text-star-white font-bold mt-0.5 block">{selectedSite.slope}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">BOULDER DENSITY</span>
                  <span className="font-space text-star-white font-bold mt-0.5 block">{selectedSite.boulders}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">SOLAR ILLUMINATION</span>
                  <span className="font-space text-star-white font-bold mt-0.5 block">{selectedSite.illumination}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-cyan-glow/20">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">SAFETY SCORE</span>
                  <span className="font-space text-base font-bold mt-0.5 block" style={{ color: selectedSite.color }}>
                    {selectedSite.score} / 100
                  </span>
                </div>
              </div>

              {/* Context Description */}
              <div className="p-3.5 rounded-2xl bg-space-navy/70 border border-glass-border space-y-1">
                <span className="font-space text-[10px] text-cyan-glow uppercase font-bold block">
                  ORBITAL SATELLITE RECON CONTEXT:
                </span>
                <p className="font-inter text-xs text-star-white/80 leading-relaxed">
                  {selectedSite.missionContext}
                </p>
              </div>

              {/* Mitigation Protocol */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <span className="font-space text-[10px] text-emerald-400 uppercase font-bold block flex items-center gap-1.5">
                  <Shield size={12} />
                  SAFETY &amp; MITIGATION PROTOCOL:
                </span>
                <p className="font-inter text-xs text-star-white/90 leading-relaxed">
                  {selectedSite.mitigationProtocol}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
