'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Zap,
  Camera,
  Thermometer,
  ZoomIn,
  ZoomOut,
  Cpu,
  RotateCcw,
  Satellite,
  Radio,
  Compass,
  Flame,
  ShieldCheck,
  ChevronRight,
  Crosshair,
  Info,
  Layers,
  Activity,
} from 'lucide-react';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function DigitalTwinSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry } = useMission();

  const [zoom, setZoom] = useState(1.0);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const liveTemp =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.temp
      ? liveTelemetry.temp
      : `${activeSat.telemetryMetrics.batteryTemp.current}°C`;

  const liveVolt =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.battery_voltage
      ? liveTelemetry.battery_voltage
      : activeSat.batteryVoltage;

  const liveSolar =
    selectedSatelliteId === 'SENTINEL-6A' && liveTelemetry.solar_power
      ? liveTelemetry.solar_power
      : activeSat.solarPower;

  // Fully tailored, individualized subsystem definitions with exact percentage origins for pixel-perfect zoom
  const subsystems = [
    {
      id: 'antenna',
      label: 'TT&C High-Gain Reflector',
      icon: Wifi,
      status: `Downlink ${activeSat.signal}`,
      color: '#00d4ff',
      zoom: 2.3,
      originX: 68,
      originY: 28,
      desc: `High-gain steerable microwave reflector tracking ${activeSat.groundStation} ground station link.`,
      details: [
        { key: 'Downlink Frequency', val: '8.45 GHz (X/Ka Band)' },
        { key: 'Carrier Signal SNR', val: `${activeSat.telemetryMetrics.commsSnr.current} dB` },
        { key: 'Bit Error Rate (BER)', val: '< 1.0e-9 (FEC Viterbi)' },
        { key: 'Antenna Gimbal Look', val: 'AZ 142.8° / EL +38.2°' },
      ],
    },
    {
      id: 'solar',
      label: 'GaAs Solar Array Wings (EPS)',
      icon: Zap,
      status: `${liveSolar} Generation`,
      color: '#63c7ff',
      zoom: 2.0,
      originX: 24,
      originY: 28,
      desc: 'Articulated triple-junction gallium arsenide photovoltaic panels with autonomous solar vector tracking.',
      details: [
        { key: 'Array Electrical Output', val: `${liveSolar}` },
        { key: 'Sun Vector Angle', val: '88.4° Nadir Normal' },
        { key: 'Wing Conversion Eff.', val: '31.2% BOL (GaAs)' },
        { key: 'SADA Drive Status', val: 'CONTINUOUS ROTATION' },
      ],
    },
    {
      id: 'payload',
      label: 'Mission Primary Payload',
      icon: Camera,
      status: activeSat.role.split('&')[0].trim(),
      color: '#10b981',
      zoom: 2.4,
      originX: 46,
      originY: 62,
      desc: `${activeSat.name} scientific sensor package operating on 100% continuous duty cycle.`,
      details: [
        { key: 'Payload Instrument', val: activeSat.type },
        { key: 'Operating Mode', val: '100% Science Active' },
        { key: 'Sensor CCD Temperature', val: '-18.4 °C (Cryocooled)' },
        { key: 'Direct Data Downlink', val: '320 Mbps Stream' },
      ],
    },
    {
      id: 'battery',
      label: 'Power Storage & Thermal Bay',
      icon: Thermometer,
      status: `${liveTemp} (${liveVolt})`,
      color: parseFloat(liveTemp) > 35 ? '#ff3b3b' : '#38bdf8',
      zoom: 2.5,
      originX: 50,
      originY: 50,
      desc: `Solid-state Li-ion cell matrix and heat pipe radiators maintaining thermodynamic equilibrium.`,
      details: [
        { key: 'Main 28V Power Bus', val: `${liveVolt}` },
        { key: 'Battery Cell Temperature', val: `${liveTemp}` },
        { key: 'State of Charge (SOC)', val: '94.8% Nominal' },
        { key: 'Thermal Radiator Loop', val: 'Active Loop #1 (Closed)' },
      ],
    },
    {
      id: 'adcs',
      label: 'ADCS Reaction Wheels & Stars',
      icon: Compass,
      status: '3-Axis Locked',
      color: '#fbbf24',
      zoom: 2.3,
      originX: 62,
      originY: 58,
      desc: 'High-precision star tracker optical heads and reaction wheels ensuring sub-arcsecond pointing stability.',
      details: [
        { key: '3-Axis Pointing Jitter', val: `${activeSat.telemetryMetrics.attitudeError.current}°` },
        { key: 'Reaction Wheel Torques', val: 'RW-1: 12.4 mNm, RW-2: 8.2 mNm' },
        { key: 'Star Catalog Head Lock', val: '18 Stars Tracked (Fine Lock)' },
        { key: 'Kalman Filter Gyro Drift', val: '0.002 °/hr' },
      ],
    },
    {
      id: 'thruster',
      label: 'RCS Hydrazine Propulsion Pod',
      icon: Flame,
      status: 'Standby Ready',
      color: '#f87171',
      zoom: 2.4,
      originX: 50,
      originY: 22,
      desc: 'Monopropellant hydrazine reaction control thrusters for orbit station-keeping and collision avoidance burns.',
      details: [
        { key: 'Hydrazine Propellant Mass', val: '48.2 kg N2H4 Reserve' },
        { key: 'Chamber Pressure', val: '18.4 bar Nominal' },
        { key: 'Total Delta-V Margin', val: '142.5 m/s Available' },
        { key: 'Thruster Valve Heaters', val: 'NOMINAL (+18.2 °C)' },
      ],
    },
  ];

  const cadContainerRef = useRef<HTMLDivElement>(null);

  // Safe non-passive wheel event listener
  useEffect(() => {
    const el = cadContainerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Number(Math.min(3.0, Math.max(0.7, z + (e.deltaY < 0 ? 0.15 : -0.15))).toFixed(2)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const activeSub = subsystems.find((s) => s.id === activeSubId) || null;

  const handleSubClick = (sub: (typeof subsystems)[0]) => {
    if (activeSubId === sub.id) {
      resetView();
    } else {
      setActiveSubId(sub.id);
      setZoom(sub.zoom);
    }
  };

  const resetView = () => {
    setActiveSubId(null);
    setZoom(1.0);
  };

  return (
    <section
      id="digital-twin"
      className="section-spacing relative overflow-hidden py-16 md:py-24 w-full flex flex-col items-center justify-center"
      ref={ref}
    >
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 flex flex-col items-center justify-center">
        {/* Title */}
        <motion.div
          className="text-center mb-8 md:mb-10 w-full flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-space-navy/60 mb-3 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <Cpu size={14} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.25em] text-cyan-glow uppercase font-light">
              Holographic 3D Spacecraft CAD Virtualization
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-extralight tracking-wide text-star-white text-center">
            THE DIGITAL TWIN
          </h2>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-extralight tracking-wide text-cyan-glow mt-1 text-glow text-center">
            OF YOUR MISSION.
          </h2>
          <p className="font-inter text-xs sm:text-sm text-star-white/60 mt-3 max-w-xl mx-auto leading-relaxed font-light text-center">
            Interactive holographic digital twin synchronized with real-time spacecraft sensor streams. Click any component below or on the 3D model to zoom directly into that component and inspect telemetry diagnostics.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-2 mx-auto">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={sat.id}
                  onClick={() => {
                    setSelectedSatelliteId(sat.id);
                    resetView();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_18px_rgba(99,199,255,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/50 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={12} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.code}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sat.status === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Spacecraft Stage Frame - Perfectly Centered in Viewport */}
        <div className="relative w-full max-w-5xl mx-auto rounded-3xl p-4 sm:p-6 border border-cyan-glow/25 bg-[#060c14]/95 shadow-[0_0_70px_rgba(99,199,255,0.18)] overflow-hidden flex flex-col justify-between backdrop-blur-2xl">
          {/* Top HUD */}
          <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-3 z-20 flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-space text-xs sm:text-sm font-bold text-star-white uppercase tracking-wider">
                ASSET: {activeSat.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-space tracking-wider bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-semibold">
                DIGITAL TWIN 1:1 SYNC
              </span>
              {activeSub && (
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-space tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Crosshair size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
                  TARGET: {activeSub.label.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-space text-[10px] sm:text-xs text-star-white/60 font-mono mr-1 sm:mr-2">
                MAG: {activeSub ? activeSub.zoom.toFixed(1) : zoom.toFixed(1)}x
              </span>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setZoom((z) => Math.min(3.0, z + 0.2))}
                className="p-1 sm:p-1.5 rounded-lg border border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/15 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
                className="p-1 sm:p-1.5 rounded-lg border border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/15 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={resetView}
                className="px-2.5 py-1 rounded-lg border border-cyan-glow/20 text-[10px] sm:text-xs font-space text-star-white/70 hover:text-star-white hover:bg-cyan-glow/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset View</span>
              </div>
            </div>
          </div>

          {/* Holographic Satellite CAD Model Viewport with Direct Targeted Click-Zoom */}
          <div
            ref={cadContainerRef}
            className="relative w-full h-[340px] sm:h-[420px] md:h-[460px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#030712] my-3 border border-cyan-glow/20 shadow-[inset_0_0_50px_rgba(99,199,255,0.12)] cursor-crosshair mx-auto select-none"
          >
            {/* Luminous cyan galaxy aura backdrop & scanlines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,199,255,0.18)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,212,255,0.03)_51%)] bg-[length:100%_4px] pointer-events-none" />

            {/* Concentric Coordinate Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] rounded-full border border-cyan-glow/20 border-dashed animate-spin" style={{ animationDuration: '80s' }} />
              <div className="w-[420px] h-[420px] rounded-full border border-cyan-glow/10 border-dotted" />
            </div>

            {/* Precision Focal Zoom Layer with Dynamic Origin Alignment */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center mx-auto"
              style={{
                transformOrigin: activeSub ? `${activeSub.originX}% ${activeSub.originY}%` : '50% 50%',
              }}
              animate={{
                scale: activeSub ? activeSub.zoom : zoom,
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            >
              <img
                src={activeSat.image || '/images/digital-satellite.jpg'}
                alt={`${activeSat.name} Holographic Digital Twin Satellite`}
                className="w-full h-full max-h-[380px] object-contain object-center filter drop-shadow-[0_0_40px_rgba(99,199,255,0.5)] pointer-events-none select-none mx-auto block"
              />

              {/* Interactive Subsystem Telemetry Reticle Hotspots */}
              {/* 1. TT&C Antenna Pin (Right Upper Dish) */}
              <div
                className="absolute top-[28%] left-[68%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 p-2"
                onClick={() => handleSubClick(subsystems[0])}
              >
                <div className={`w-5 h-5 rounded-full border border-cyan-glow bg-cyan-glow/40 absolute ${activeSubId === 'antenna' ? 'animate-ping' : ''}`} />
                <div className="w-5 h-5 rounded-full border-2 border-white bg-cyan-glow relative shadow-[0_0_15px_#63c7ff] flex items-center justify-center">
                  <Wifi size={10} className="text-black" />
                </div>
                <div className="absolute -top-7 -left-12 px-2.5 py-0.5 rounded-lg bg-black/90 border border-cyan-glow/50 text-[10px] font-space text-cyan-glow whitespace-nowrap shadow-lg group-hover:scale-105 transition-transform">
                  TT&amp;C Dish ({activeSat.signal})
                </div>
              </div>

              {/* 2. GaAs Solar Array Wing (Left Wing) */}
              <div
                className="absolute top-[28%] left-[24%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 p-2"
                onClick={() => handleSubClick(subsystems[1])}
              >
                <div className={`w-4 h-4 rounded-full border border-cyan-glow bg-cyan-glow relative shadow-[0_0_12px_#63c7ff] ${activeSubId === 'solar' ? 'animate-ping' : 'animate-pulse'}`} />
                <div className="absolute -top-7 -left-8 px-2.5 py-0.5 rounded-lg bg-black/90 border border-cyan-glow/40 text-[10px] font-space text-cyan-glow whitespace-nowrap shadow-lg group-hover:scale-105 transition-transform">
                  GaAs Solar ({liveSolar})
                </div>
              </div>

              {/* 3. Primary Payload Sensor Lens (Lower Center-Left) */}
              <div
                className="absolute top-[62%] left-[46%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 p-2"
                onClick={() => handleSubClick(subsystems[2])}
              >
                <div className={`w-4 h-4 rounded-full border border-emerald-400 bg-emerald-400 relative shadow-[0_0_12px_#10b981] ${activeSubId === 'payload' ? 'animate-ping' : 'animate-pulse'}`} />
                <div className="absolute -bottom-7 -left-10 px-2.5 py-0.5 rounded-lg bg-black/90 border border-emerald-400/50 text-[10px] font-space text-emerald-400 whitespace-nowrap shadow-lg group-hover:scale-105 transition-transform">
                  Payload Imager
                </div>
              </div>

              {/* 4. Battery & Thermal Storage Bay (Center Core) */}
              <div
                className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 p-2"
                onClick={() => handleSubClick(subsystems[3])}
              >
                <div
                  className={`w-4 h-4 rounded-full border relative ${
                    parseFloat(liveTemp) > 35
                      ? 'border-alert-critical bg-alert-critical animate-pulse shadow-[0_0_15px_#ff3b3b]'
                      : 'border-cyan-glow bg-cyan-glow shadow-[0_0_12px_#00d4ff]'
                  }`}
                />
                <div
                  className={`absolute -top-7 -left-10 px-2.5 py-0.5 rounded-lg bg-black/90 border text-[10px] font-space whitespace-nowrap font-bold shadow-lg group-hover:scale-105 transition-transform ${
                    parseFloat(liveTemp) > 35
                      ? 'border-alert-critical/60 text-alert-critical'
                      : 'border-cyan-glow/50 text-cyan-glow'
                  }`}
                >
                  EPS Battery ({liveTemp})
                </div>
              </div>

              {/* 5. ADCS Star Tracker (Lower Right) */}
              <div
                className="absolute top-[58%] left-[62%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 p-2"
                onClick={() => handleSubClick(subsystems[4])}
              >
                <div className="w-4 h-4 rounded-full border border-amber-400 bg-amber-400 relative shadow-[0_0_12px_#fbbf24]" />
                <div className="absolute -top-7 -left-10 px-2.5 py-0.5 rounded-lg bg-black/90 border border-amber-400/50 text-[10px] font-space text-amber-300 whitespace-nowrap shadow-lg group-hover:scale-105 transition-transform">
                  ADCS Gyro/Stars
                </div>
              </div>

              {/* 6. Thruster Pod (Top Center) */}
              <div
                className="absolute top-[22%] left-[50%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 p-2"
                onClick={() => handleSubClick(subsystems[5])}
              >
                <div className="w-3.5 h-3.5 rounded-full border border-rose-400 bg-rose-500 relative shadow-[0_0_12px_#f43f5e]" />
                <div className="absolute -top-7 -left-10 px-2.5 py-0.5 rounded-lg bg-black/90 border border-rose-500/50 text-[10px] font-space text-rose-300 whitespace-nowrap shadow-lg group-hover:scale-105 transition-transform">
                  RCS Thrusters
                </div>
              </div>
            </motion.div>

            {/* IN-VIEWPORT REAL-TIME COMPONENT DIAGNOSTICS FLYOUT HUD */}
            <AnimatePresence>
              {activeSub && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-4 right-4 max-w-xs w-full bg-[#030914]/95 border border-cyan-glow/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-xl z-30 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded-lg border"
                        style={{
                          backgroundColor: `${activeSub.color}20`,
                          borderColor: `${activeSub.color}40`,
                          color: activeSub.color,
                        }}
                      >
                        <activeSub.icon size={15} />
                      </div>
                      <div>
                        <h4 className="font-space text-xs font-bold text-star-white">{activeSub.label}</h4>
                        <span className="font-space text-[10px] block" style={{ color: activeSub.color }}>
                          {activeSub.status}
                        </span>
                      </div>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={resetView}
                      className="text-star-white/60 hover:text-star-white p-1 cursor-pointer text-xs font-space"
                    >
                      ✕
                    </div>
                  </div>

                  <p className="font-inter text-[11px] text-star-white/80 leading-relaxed">
                    {activeSub.desc}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {activeSub.details.map((d) => (
                      <div key={d.key} className="flex items-center justify-between text-[10px] font-space py-1 px-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-star-white/60">{d.key}:</span>
                        <span className="text-cyan-glow font-bold font-mono">{d.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] font-space text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck size={12} /> TELEMETRY NOMINAL
                    </span>
                    <button
                      onClick={resetView}
                      className="px-2.5 py-1 rounded-lg bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow text-[10px] font-space hover:bg-cyan-glow/30 transition-colors font-bold"
                    >
                      Reset Zoom
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Subsystem Quick Selector Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 z-20 pt-3 border-t border-cyan-glow/15 w-full mx-auto">
            {subsystems.map((sub) => {
              const Icon = sub.icon;
              const isCur = activeSubId === sub.id;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={sub.id}
                  onClick={() => handleSubClick(sub)}
                  className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 cursor-pointer select-none ${
                    isCur
                      ? 'border-cyan-glow bg-cyan-glow/20 shadow-[0_0_20px_rgba(99,199,255,0.3)] ring-1 ring-cyan-glow/50'
                      : 'border-cyan-glow/15 hover:border-cyan-glow/35 bg-space-navy/40 hover:bg-space-navy/60'
                  }`}
                >
                  <Icon size={16} style={{ color: sub.color }} className="shrink-0" />
                  <div className="min-w-0">
                    <span className="font-space text-[11px] font-semibold text-star-white block truncate">
                      {sub.label.split(' ')[0]}
                    </span>
                    <span className="font-space text-[9px] block truncate font-mono" style={{ color: sub.color }}>
                      {sub.status}
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
