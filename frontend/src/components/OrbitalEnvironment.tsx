'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Eye, Info, Layers, Compass, Globe2, Satellite, ShieldAlert } from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

interface OrbitalEnvironmentObject {
  id: string;
  name: string;
  type: 'satellite' | 'debris';
  radius: number;
  speed: number;
  angle: number;
  inclination: number;
  altitude: string;
  velocity: string;
  status: string;
  color: string;
  agency?: string;
}

const ORBITAL_OBJECTS: OrbitalEnvironmentObject[] = [
  { id: 'SENTINEL-6A', name: 'SENTINEL-6A [MICHAEL-FREILICH]', type: 'satellite', radius: 170, speed: 0.008, angle: 0.4, inclination: 0.25, altitude: '1,336 km LEO', velocity: '7.20 km/s', status: 'RADAR ALTIMETRY // EPS RISK', color: '#63c7ff', agency: 'NASA / ESA' },
  { id: 'CHANDRAYAAN-3', name: 'CHANDRAYAAN-3 [PRASHAST]', type: 'satellite', radius: 140, speed: 0.007, angle: 0.2, inclination: 0.9, altitude: '100 km LPO', velocity: '1.63 km/s', status: 'LUNAR RECON // NOMINAL', color: '#f59e0b', agency: 'ISRO' },
  { id: 'ADITYA-L1', name: 'ADITYA-L1 [SURYA-VEDH]', type: 'satellite', radius: 260, speed: 0.003, angle: 1.2, inclination: 0.15, altitude: '1.5M km L1', velocity: '0.28 km/s', status: 'SOLAR CORONA OBSERVATORY', color: '#fbbf24', agency: 'ISRO' },
  { id: 'EOS-04', name: 'EOS-04 / RISAT-1A [SAR-BHARAT]', type: 'satellite', radius: 165, speed: 0.0085, angle: 2.4, inclination: 0.65, altitude: '529 km SSO', velocity: '7.60 km/s', status: 'RADAR SURVEILLANCE // ACTIVE', color: '#38bdf8', agency: 'ISRO' },
  { id: 'CARTOSAT-3', name: 'CARTOSAT-3 [NAVDARSHAK-3]', type: 'satellite', radius: 155, speed: 0.009, angle: 3.8, inclination: 0.62, altitude: '505 km SSO', velocity: '7.62 km/s', status: 'OPTICAL CARTOGRAPHY // NOMINAL', color: '#10b981', agency: 'ISRO' },
  { id: 'GAGANYAAN-G1', name: 'GAGANYAAN-G1 [VYOM-ORBITER]', type: 'satellite', radius: 130, speed: 0.010, angle: 4.6, inclination: 0.35, altitude: '400 km LEO', velocity: '7.67 km/s', status: 'CREW MODULE TEST // NOMINAL', color: '#ef4444', agency: 'ISRO' },
  { id: 'STARLINK-4012', name: 'STARLINK-4012 [LASER-CROSSLINK]', type: 'satellite', radius: 145, speed: 0.0095, angle: 1.8, inclination: 0.53, altitude: '550 km LEO', velocity: '7.59 km/s', status: 'LASER CROSSLINK // NOMINAL', color: '#10b981', agency: 'SpaceX' },
  { id: 'NOAA-20', name: 'NOAA-20 [MET-SENTINEL]', type: 'satellite', radius: 180, speed: 0.0078, angle: 5.2, inclination: 0.98, altitude: '824 km SSO', velocity: '7.44 km/s', status: 'HYPERSPECTRAL // DEGRADED', color: '#f59e0b', agency: 'NOAA / NASA' },
  { id: 'JWST', name: 'JWST [JAMES-WEBB-DEEP-SPACE]', type: 'satellite', radius: 280, speed: 0.0025, angle: 3.1, inclination: 0.12, altitude: '1.5M km L2', velocity: '0.22 km/s', status: 'DEEP SPACE INFRARED // NOMINAL', color: '#ec4899', agency: 'NASA / ESA / CSA' },
  { id: 'LANDSAT-9', name: 'LANDSAT-9 [THERMAL-SENTINEL]', type: 'satellite', radius: 175, speed: 0.0082, angle: 4.1, inclination: 0.98, altitude: '705 km SSO', velocity: '7.50 km/s', status: 'MULTISPECTRAL & THERMAL // OK', color: '#a855f7', agency: 'USGS / NASA' },
  { id: 'deb-3842', name: 'DEBRIS #3842 [COSMOS 2251]', type: 'debris', radius: 172, speed: -0.009, angle: 2.1, inclination: 0.38, altitude: '549 km LEO', velocity: '7.62 km/s', status: 'CRITICAL CONJUNCTION CANDIDATE', color: '#ff3b3b' },
  { id: 'deb-4982', name: 'DEBRIS #4982 [COSMOS 1408 ASAT]', type: 'debris', radius: 167, speed: -0.008, angle: 5.1, inclination: 0.72, altitude: '531 km LEO', velocity: '7.61 km/s', status: 'TRACKED HIGH-INCLINATION DEBRIS', color: '#ff8c00' },
  { id: 'deb-1904', name: 'DEBRIS #1904 [FENGYUN 1C]', type: 'debris', radius: 195, speed: 0.011, angle: 4.8, inclination: -0.6, altitude: '582 km LEO', velocity: '7.56 km/s', status: 'TRACKED HYPERVELOCITY DEBRIS', color: '#ff8c00' },
];

export default function OrbitalEnvironment() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId } = useMission();

  const [selectedObj, setSelectedObj] = useState<OrbitalEnvironmentObject>(ORBITAL_OBJECTS[0]);
  const [rotation, setRotation] = useState({ x: 0.25, y: 0.6 });
  const [zoom, setZoom] = useState(1.05);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Sync selected satellite when changed in other tabs
  useEffect(() => {
    const match = ORBITAL_OBJECTS.find((o) => o.id === selectedSatelliteId);
    if (match) setSelectedObj(match);
  }, [selectedSatelliteId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 800;
      canvas.height = rect.height * window.devicePixelRatio || 520;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      time += 1;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      // RAISED CENTER Y: shift globe upward so the entire globe and lower orbit rings are fully visible!
      const centerY = height * 0.44;

      ctx.clearRect(0, 0, width, height);

      // Deep space ambient radial aura
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 280 * zoom);
      glowGrad.addColorStop(0, 'rgba(0, 50, 100, 0.28)');
      glowGrad.addColorStop(0.5, 'rgba(0, 20, 60, 0.10)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Earth Core dimensions
      const earthRadius = 78 * zoom;

      // Outer Ionosphere & Exosphere glow rims
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius + 16 * zoom, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius + 7 * zoom, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.45)';
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();

      // Earth spherical gradient
      const earthGrad = ctx.createRadialGradient(
        centerX - 25 * zoom,
        centerY - 25 * zoom,
        10 * zoom,
        centerX,
        centerY,
        earthRadius
      );
      earthGrad.addColorStop(0, '#0e3a63');
      earthGrad.addColorStop(0.4, '#08213b');
      earthGrad.addColorStop(0.8, '#041122');
      earthGrad.addColorStop(1, '#02060f');
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Earth Rotating Latitude & Longitude Geodesic Grid
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      const earthRot = time * 0.003 + rotation.y;
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.14)';
      ctx.lineWidth = 1;

      for (let lat = -60; lat <= 60; lat += 30) {
        const yOffset = (lat / 90) * earthRadius;
        const rAtLat = Math.sqrt(Math.max(0, earthRadius * earthRadius - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + yOffset, rAtLat, rAtLat * 0.35, rotation.x, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 4) {
        const curLon = lon + earthRot;
        const xOffset = Math.sin(curLon) * earthRadius;
        ctx.beginPath();
        ctx.ellipse(centerX + xOffset * 0.7, centerY, Math.abs(Math.cos(curLon)) * earthRadius, earthRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Orbit Trajectories & Active Satellites / Debris
      ORBITAL_OBJECTS.forEach((obj) => {
        const curAngle = obj.angle + time * obj.speed;
        const r = obj.radius * zoom;
        const inc = obj.inclination + rotation.x;

        // Draw orbital trajectory ellipse
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r, r * 0.42, inc, 0, Math.PI * 2);
        ctx.strokeStyle =
          obj.id === selectedObj?.id
            ? 'rgba(0, 212, 255, 0.55)'
            : obj.type === 'satellite'
            ? 'rgba(0, 212, 255, 0.16)'
            : 'rgba(255, 140, 0, 0.16)';
        if (obj.id === 'deb-3842' || obj.id === 'deb-4982') ctx.strokeStyle = 'rgba(255, 59, 59, 0.4)';
        ctx.lineWidth = obj.id === selectedObj?.id ? 2 : 1;
        if (obj.type === 'debris') ctx.setLineDash([4, 5]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate node coordinate along rotated 3D ellipse
        const objX = centerX + Math.cos(curAngle) * r * Math.cos(inc) - Math.sin(curAngle) * r * 0.42 * Math.sin(inc);
        const objY = centerY + Math.cos(curAngle) * r * Math.sin(inc) + Math.sin(curAngle) * r * 0.42 * Math.cos(inc);

        const isSelected = selectedObj?.id === obj.id;

        // Draw Object Node
        ctx.save();
        ctx.beginPath();
        ctx.arc(objX, objY, isSelected ? 6 : obj.type === 'satellite' ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.shadowColor = obj.color;
        ctx.fill();

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(objX, objY, 12, 0, Math.PI * 2);
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Object Label
        ctx.font = isSelected ? 'bold 11px "Space Grotesk", sans-serif' : '9px "Space Grotesk", sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(obj.name.split(' ')[0], objX + 8, objY - 4);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [rotation, zoom, selectedObj]);

  // Mouse drag handlers for orbit rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = (e.clientX - lastMousePosRef.current.x) * 0.005;
    const dy = (e.clientY - lastMousePosRef.current.y) * 0.005;
    setRotation((prev) => ({
      x: Math.max(-0.8, Math.min(0.8, prev.x + dy)),
      y: prev.y + dx,
    }));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <section id="orbital-env" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <Globe2 size={13} className="text-cyan-glow animate-spin" style={{ animationDuration: '12s' }} />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              Real-Time Orbital Situational Awareness
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            ORBITAL ENVIRONMENT &amp; SGP4 RADAR
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Interactive 3D orbital space situational awareness. Drag to orbit, zoom, and select Indian and international assets to inspect live ephemeris vectors.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* 3D Orbit Viewport with HUD Controls */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Main 3D Canvas (Cleanly Framed & Raised) */}
          <div className="lg:col-span-8 relative glass-panel rounded-3xl overflow-hidden border border-glass-border shadow-[0_0_60px_rgba(0,212,255,0.08)]">
            <div className="aspect-[16/11] w-full min-h-[460px] relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {/* HUD Overlay Top-Left */}
              <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 bg-black/60 px-3.5 py-2 rounded-xl border border-glass-border backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
                  <span className="font-space text-[10px] tracking-[0.25em] text-cyan-glow uppercase font-bold">
                    3D SGP4 RADAR TRACKER
                  </span>
                </div>
                <span className="font-space text-[9px] text-muted-gray">
                  FOV: 120° • INCLINATION: {(rotation.x * 57.3).toFixed(1)}° • AZIMUTH: {(rotation.y * 57.3).toFixed(1)}°
                </span>
              </div>

              {/* HUD Zoom Controls Top-Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div role="button" tabIndex={0} onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                  className="w-8 h-8 rounded-lg glass-panel border border-cyan-glow/30 text-xs font-space text-cyan-glow hover:bg-cyan-glow/20 flex items-center justify-center transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  +
                </div>
                <div role="button" tabIndex={0} onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
                  className="w-8 h-8 rounded-lg glass-panel border border-cyan-glow/30 text-xs font-space text-cyan-glow hover:bg-cyan-glow/20 flex items-center justify-center transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </div>
              </div>
            </div>

            {/* Bottom Floating Object Selector Bar (Neatly Docked) */}
            <div className="p-3 bg-space-navy/90 border-t border-glass-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
              {ORBITAL_OBJECTS.map((obj) => {
                const isSelected = selectedObj.id === obj.id;
                return (
                  <div role="button" tabIndex={0} key={obj.id}
                    onClick={() => {
                      setSelectedObj(obj);
                      if (obj.type === 'satellite') setSelectedSatelliteId(obj.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-space tracking-wider border whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_15px_rgba(0,212,255,0.3)] font-bold'
                        : 'glass-panel border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: obj.color }} />
                    <span>{obj.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Object Details Panel (Right Column) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              key={selectedObj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-6 border border-glass-border space-y-4 shadow-[0_0_40px_rgba(4,18,34,0.8)]"
            >
              <div className="flex items-start justify-between border-b border-glass-border pb-4">
                <div>
                  <span className="font-space text-[10px] tracking-[0.25em] text-cyan-glow uppercase font-bold">
                    {selectedObj.agency ? `${selectedObj.agency} • ` : ''}EPHEMERIS TELEMETRY
                  </span>
                  <h3 className="font-space text-base md:text-lg text-star-white font-bold mt-1">{selectedObj.name}</h3>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[9px] font-space tracking-wider border font-bold"
                  style={{
                    borderColor: `${selectedObj.color}40`,
                    backgroundColor: `${selectedObj.color}15`,
                    color: selectedObj.color,
                  }}
                >
                  {selectedObj.type.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="glass-panel p-3 rounded-xl border border-glass-border/50">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">Altitude</span>
                  <span className="font-space text-star-white text-sm font-bold mt-0.5 block">{selectedObj.altitude}</span>
                </div>
                <div className="glass-panel p-3 rounded-xl border border-glass-border/50">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">Orbital Velocity</span>
                  <span className="font-space text-star-white text-sm font-bold mt-0.5 block">{selectedObj.velocity}</span>
                </div>
                <div className="glass-panel p-3 rounded-xl border border-glass-border/50">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">Orbital Inclination</span>
                  <span className="font-space text-star-white text-sm font-bold mt-0.5 block">{(selectedObj.inclination * 57.3).toFixed(2)}°</span>
                </div>
                <div className="glass-panel p-3 rounded-xl border border-glass-border/50">
                  <span className="font-inter text-[10px] text-muted-gray uppercase block">Threat Category</span>
                  <span className="font-space text-sm font-bold mt-0.5 block" style={{ color: selectedObj.color }}>
                    {selectedObj.type === 'debris' ? 'CRITICAL DEBRIS' : 'ACTIVE PAYLOAD'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-navy/70 border border-glass-border">
                <div className="flex items-center gap-2 mb-1.5">
                  <Info size={13} className="text-cyan-glow" />
                  <span className="font-space text-[10px] tracking-wider text-star-white uppercase font-bold">
                    Mission Vector Diagnostics
                  </span>
                </div>
                <p className="font-inter text-xs text-star-white/80 leading-relaxed">
                  {selectedObj.status}. Continuous SGP4 state vector telemetry propagated with gravitational J2-J4 harmonic perturbations.
                </p>
              </div>
            </motion.div>

            {/* Quick Stats Banner */}
            <div className="glass-panel rounded-3xl p-5 border border-glass-border flex items-center justify-between text-center">
              <div>
                <span className="font-space text-2xl text-cyan-glow font-bold block">{ORBITAL_OBJECTS.length}</span>
                <span className="font-inter text-[10px] text-muted-gray uppercase tracking-wider">Monitored Assets</span>
              </div>
              <div className="w-px h-8 bg-glass-border" />
              <div>
                <span className="font-space text-2xl text-orange-400 font-bold block">3</span>
                <span className="font-inter text-[10px] text-muted-gray uppercase tracking-wider">Conjunction Alerts</span>
              </div>
              <div className="w-px h-8 bg-glass-border" />
              <div>
                <span className="font-space text-2xl text-emerald-400 font-bold block">100%</span>
                <span className="font-inter text-[10px] text-muted-gray uppercase tracking-wider">Radar Precision</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
