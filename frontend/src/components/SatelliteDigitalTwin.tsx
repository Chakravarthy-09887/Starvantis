'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Orbit,
  Calendar,
  ShieldAlert,
  FileText,
  Settings,
  Bell,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Wifi,
  Compass,
  Radio,
  Clock,
  Zap,
  Thermometer,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Satellite as SatelliteIcon,
  ChevronRight,
  Download,
  AlertTriangle,
  Flame,
  Check,
  Cpu,
  Globe,
  Crosshair,
  Camera,
  Gauge,
  Sliders,
  Navigation,
} from 'lucide-react';

import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

interface LiveOscilloscopeWaveProps {
  stroke: string;
  freq?: number;
  amp?: number;
  speed?: number;
  baselineY?: number;
  className?: string;
}

const LiveOscilloscopeWave = React.memo(function LiveOscilloscopeWave({
  stroke,
  freq = 0.045,
  amp = 5.5,
  speed = 1.0,
  baselineY = 15,
  className = '',
}: LiveOscilloscopeWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let animId: number;
    let phase = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      phase += dt * 3.2 * speed;

      let path = `M 0 ${(baselineY + Math.sin(phase) * amp).toFixed(1)}`;
      for (let x = 6; x <= 200; x += 6) {
        const y = baselineY + Math.sin(x * freq + phase) * amp;
        path += ` L ${x} ${y.toFixed(1)}`;
      }

      if (pathRef.current) {
        pathRef.current.setAttribute('d', path);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [freq, amp, speed, baselineY]);

  return (
    <svg className="w-full h-8 mt-0.5 overflow-visible" viewBox="0 0 200 30" preserveAspectRatio="none">
      <path
        ref={pathRef}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 6px ${stroke})`,
        }}
        className={className}
      />
    </svg>
  );
});

export default function SatelliteDigitalTwin() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry, alerts, ackAlert, formatMissionTime, currentClock, timezone } = useMission();

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Telemetry' | 'Orbits' | 'Events' | 'Alerts' | 'Reports' | 'Settings'>('Dashboard');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const cadCanvasRef = useRef<HTMLDivElement>(null);

  // Safe non-passive wheel zoom listener
  useEffect(() => {
    const el = cadCanvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel((z) => Number(Math.min(2.5, Math.max(0.6, z + (e.deltaY < 0 ? 0.15 : -0.15))).toFixed(2)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const selectedSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Merge live calibrated telemetry pulse
  const activeSat: SatelliteFleetDefinition = useMemo(() => ({
    ...selectedSat,
    batteryVoltage: liveTelemetry.battery_voltage || selectedSat.batteryVoltage,
    solarPower: liveTelemetry.solar_power || selectedSat.solarPower,
    temp: liveTelemetry.temp || selectedSat.temp,
    lat: liveTelemetry.lat || selectedSat.lat,
    lng: liveTelemetry.lng || selectedSat.lng,
    altitude: selectedSat.altitude,
    velocity: liveTelemetry.velocity || selectedSat.velocity,
    roll: liveTelemetry.roll || selectedSat.roll,
    pitch: liveTelemetry.pitch || selectedSat.pitch,
    yaw: liveTelemetry.yaw || selectedSat.yaw,
    health: liveTelemetry.health ?? selectedSat.health,
  }), [selectedSat, liveTelemetry]);

  // Stable calibrated numeric telemetry dynamics
  const voltVal = liveTelemetry.battery_voltage
    ? parseFloat(liveTelemetry.battery_voltage.replace(/[^\d.-]/g, '')) || parseFloat(selectedSat.batteryVoltage) || 28.4
    : parseFloat(selectedSat.batteryVoltage) || 28.4;

  const powerVal = liveTelemetry.solar_power
    ? parseFloat(liveTelemetry.solar_power.replace(/[^\d.-]/g, '')) || parseFloat(selectedSat.solarPower) || 2.10
    : parseFloat(selectedSat.solarPower) || 2.10;

  const tempVal = liveTelemetry.temp
    ? parseFloat(liveTelemetry.temp.replace(/[^\d.-]/g, '')) || parseFloat(selectedSat.temp) || 22.0
    : parseFloat(selectedSat.temp) || 22.0;

  const rollVal = liveTelemetry.roll
    ? parseFloat(liveTelemetry.roll.replace(/[+°]/g, '')) || 0.035
    : 0.035;

  const pitchVal = liveTelemetry.pitch
    ? parseFloat(liveTelemetry.pitch.replace(/[+°]/g, '')) || -0.028
    : -0.028;

  const yawVal = liveTelemetry.yaw
    ? parseFloat(liveTelemetry.yaw.replace(/[+°]/g, '')) || 142.5
    : 142.5;

  // Interactive component configs with 3D pan/zoom offsets and deep live telemetry
  const missionComponents = useMemo(() => [
    {
      id: 'solar',
      name: 'GaAs Solar Array Wings',
      tag: 'EPS / SADA',
      icon: Zap,
      color: '#63c7ff',
      zoom: 2.0,
      pan: { x: -45, y: 0 },
      status: `${powerVal.toFixed(2)} kW Generation`,
      desc: 'Articulated triple-junction gallium arsenide photovoltaic arrays with automated solar vector nadir tracking.',
      metrics: [
        { label: 'Array Generation', value: `${powerVal.toFixed(2)} kW` },
        { label: 'Nadir Sun Angle', value: '88.4° Optimal' },
        { label: 'String Voltage', value: `${voltVal.toFixed(2)} V` },
        { label: 'Wing Mechanism', value: 'SADA LOCK' },
      ],
    },
    {
      id: 'antenna',
      name: 'TT&C High-Gain Reflector',
      tag: 'RF / COMMS',
      icon: Wifi,
      color: '#10b981',
      zoom: 2.3,
      pan: { x: 25, y: -35 },
      status: `Carrier ${activeSat.signal}`,
      desc: `High-gain steerable microwave reflector maintaining telemetry downlink with ${activeSat.groundStation}.`,
      metrics: [
        { label: 'Primary Station', value: activeSat.groundStation.split(' ')[0] },
        { label: 'Carrier Lock', value: activeSat.signal },
        { label: 'Doppler Offset', value: '+12.4 kHz' },
        { label: 'Bit Error Rate', value: '< 1.0e-9 Nominal' },
      ],
    },
    {
      id: 'payload',
      name: 'Primary Science Payload',
      tag: 'INSTRUMENT',
      icon: Camera,
      color: '#f59e0b',
      zoom: 2.4,
      pan: { x: -15, y: 35 },
      status: activeSat.type,
      desc: `${activeSat.name} mission scientific optical/radar sensor package configured for continuous duty.`,
      metrics: [
        { label: 'Instrument Class', value: activeSat.type },
        { label: 'Science Mode', value: '100% Active Duty' },
        { label: 'Sensor Cryo Temp', value: '-18.4 °C' },
        { label: 'Downlink Pipeline', value: '320 Mbps Direct' },
      ],
    },
    {
      id: 'battery',
      name: 'EPS Battery & Thermal Loop',
      tag: 'POWER / THERM',
      icon: Thermometer,
      color: '#00d4ff',
      zoom: 2.5,
      pan: { x: 0, y: 15 },
      status: `${tempVal.toFixed(1)} °C (${voltVal.toFixed(2)} V)`,
      desc: 'Solid-state battery cell matrix and thermal radiator heat pipes balancing orbital sun/eclipse cycles.',
      metrics: [
        { label: 'Regulated Power Bus', value: `${voltVal.toFixed(2)} V` },
        { label: 'Cell Pack Temp', value: `${tempVal.toFixed(1)} °C` },
        { label: 'State of Charge', value: '94.8% Nominal' },
        { label: 'Thermal Circuit', value: 'Active Loop #1' },
      ],
    },
    {
      id: 'adcs',
      name: 'ADCS Reaction Wheels & Stars',
      tag: 'ATTITUDE / ADCS',
      icon: Compass,
      color: '#a78bfa',
      zoom: 2.2,
      pan: { x: 35, y: 18 },
      status: '3-Axis Lock',
      desc: 'Autonomous attitude determination and control subsystem with star trackers and momentum exchange wheels.',
      metrics: [
        { label: 'Yaw / Pitch / Roll', value: `${yawVal.toFixed(1)}° / ${pitchVal.toFixed(2)}° / ${rollVal.toFixed(2)}°` },
        { label: 'RW-1 Torque', value: '12.4 mNm' },
        { label: 'RW-2 Torque', value: '8.2 mNm' },
        { label: 'Optical Star Lock', value: '18 Stars Tracked' },
      ],
    },
  ], [activeSat, powerVal, voltVal, tempVal, yawVal, pitchVal, rollVal]);

  const activeComponent = missionComponents.find((c) => c.id === selectedComponentId) || null;

  const handleComponentSelect = (comp: typeof missionComponents[0]) => {
    if (selectedComponentId === comp.id) {
      setSelectedComponentId(null);
      setZoomLevel(1.0);
    } else {
      setSelectedComponentId(comp.id);
      setZoomLevel(comp.zoom);
    }
  };

  const resetCadView = () => {
    setSelectedComponentId(null);
    setZoomLevel(1.0);
  };

  const altKm = selectedSat.altitudeKm || 1336;

  // Safe, verified linear altitude formatter
  const formatAltitude = (km: number, altStr?: string) => {
    if (km >= 1000000) {
      return `${(km / 1000000).toFixed(2)}M km (${km.toLocaleString()} km)`;
    } else if (km >= 10000) {
      return `${km.toLocaleString()} km (GEO)`;
    } else if (km <= 200) {
      return `${km.toFixed(1)} km (Lunar Orbit)`;
    } else {
      return `${km.toLocaleString()} km (LEO)`;
    }
  };

  const satelliteAlerts = alerts.filter(
    (a) => a.asset.includes(activeSat.id) || a.asset.includes(activeSat.code) || activeSat.id === 'SENTINEL-6A'
  );

  return (
    <section id="satellite-inspector" className="section-spacing relative overflow-hidden py-12 md:py-20 w-full flex flex-col items-center justify-center" ref={containerRef}>
      <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-4 md:px-6 flex flex-col items-center">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-8 md:mb-10 w-full flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/25 bg-space-navy/70 mb-3 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <Radio size={14} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-xs tracking-[0.25em] text-cyan-glow uppercase font-semibold">
              Fleet Telemetry &amp; Orbital Digital Twin
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-star-white text-center">
            PRIMARY MISSION CONTROL
          </h2>
          <p className="font-inter text-xs sm:text-sm text-star-white/70 mt-2 max-w-2xl mx-auto font-light leading-relaxed text-center px-2">
            Multi-satellite fleet command deck. Select any active constellation asset below to inspect its unique 3D digital twin model, stable attitude orientation, and linear telemetry data.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE FLEET SELECTOR BAR */}
          <div className="mt-6 md:mt-8 w-full max-w-6xl mx-auto">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 px-1 sm:justify-center sm:flex-wrap scrollbar-thin">
              {FLEET_SATELLITES.map((sat) => {
                const isSelected = sat.id === activeSat.id;
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={sat.id}
                    onClick={() => setSelectedSatelliteId(sat.id)}
                    className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 cursor-pointer flex-shrink-0 select-none ${
                      isSelected
                        ? 'bg-cyan-glow/20 border-cyan-glow shadow-[0_0_20px_rgba(99,199,255,0.4)] scale-105 font-bold'
                        : 'bg-space-navy/50 border-cyan-glow/15 hover:border-cyan-glow/40 hover:bg-space-navy/80 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-black/50 border border-cyan-glow/20">
                      <SatelliteIcon size={14} className={isSelected ? 'text-cyan-glow' : 'text-star-white/60'} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-space text-xs font-bold text-star-white whitespace-nowrap">{sat.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${sat.status === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      </div>
                      <span className="font-inter text-[10px] text-star-white/60 block truncate max-w-[140px]">
                        {sat.agency} • {sat.health}% Health
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* MAIN DASHBOARD FRAME */}
        <motion.div
          className="rounded-2xl sm:rounded-3xl border border-cyan-glow/25 bg-[#060c14]/95 shadow-[0_0_80px_rgba(4,18,34,0.95)] overflow-hidden backdrop-blur-2xl w-full max-w-7xl mx-auto"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* 1. TOP HEADER BAR */}
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-cyan-glow/15 bg-space-navy/80 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/35 text-cyan-glow shadow-[0_0_15px_rgba(99,199,255,0.25)] flex-shrink-0">
                <Orbit size={20} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-space text-sm sm:text-base md:text-lg font-bold text-star-white tracking-wider">
                    {activeSat.name}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-space tracking-wider border font-semibold ${
                    activeSat.status === 'OPERATIONAL'
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSat.status === 'OPERATIONAL' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {activeSat.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-space tracking-wider bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-bold uppercase">
                    {activeSat.agency} // {activeSat.orbitType}
                  </span>
                </div>
                <span className="font-space text-[10px] sm:text-xs text-cyan-glow/80 tracking-widest uppercase block font-medium mt-0.5">
                  {activeSat.type.toUpperCase()} • MISSION CONTROL
                </span>
              </div>
            </div>

            {/* Top Right Controls & Navigation Tabs */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-space flex-wrap w-full sm:w-auto justify-between sm:justify-end">
              {/* Integrated Horizontal Navigation Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-cyan-glow/20 overflow-x-auto scrollbar-none max-w-full">
                {[
                  { name: 'Dashboard', icon: LayoutDashboard },
                  { name: 'Telemetry', icon: Activity },
                  { name: 'Orbits', icon: Orbit },
                  { name: 'Events', icon: Calendar },
                  { name: 'Alerts', icon: ShieldAlert },
                  { name: 'Reports', icon: FileText },
                  { name: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.name;
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={item.name}
                      onClick={() => setActiveTab(item.name as any)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-space transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-cyan-glow/20 border border-cyan-glow/50 text-cyan-glow font-bold shadow-[0_0_12px_rgba(99,199,255,0.3)]'
                          : 'text-star-white/60 hover:text-star-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={13} />
                      <span className="hidden md:inline">{item.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Mission Clock with Timezone */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-glow/25 text-star-white font-mono text-xs shadow-[0_0_10px_rgba(99,199,255,0.1)] flex-shrink-0">
                <Clock size={13} className="text-cyan-glow animate-pulse" />
                <span className="tracking-wider font-semibold" suppressHydrationWarning>{currentClock}</span>
              </div>
            </div>
          </div>

          {/* 2. MAIN DASHBOARD BODY (3-COLUMN RESPONSIVE LAYOUT) */}
          {activeTab === 'Dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 w-full">
              {/* LEFT HUD PANELS (3 cols) */}
              <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-cyan-glow/10 bg-[#050b12]/80 p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                {/* SATELLITE STATUS CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold">
                      SPACECRAFT SPECS
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-space bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {activeSat.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-space">
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Asset ID</span>
                      <span className="text-star-white font-bold font-mono">{activeSat.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Agency</span>
                      <span className="text-cyan-glow font-bold">{activeSat.agency}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Regime</span>
                      <span className="text-star-white/90 font-medium">{activeSat.orbitType}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Mission Altitude</span>
                      <span className="text-cyan-glow font-bold font-mono">{formatAltitude(altKm, activeSat.altitude)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Inclination</span>
                      <span className="text-star-white font-bold font-mono">{activeSat.inclination}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Velocity</span>
                      <span className="text-emerald-400 font-bold font-mono">{activeSat.velocity}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Launch Date</span>
                      <span className="text-star-white/80 font-mono">{activeSat.launchDate}</span>
                    </div>
                  </div>
                </div>

                {/* SYSTEM HEALTH CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold">
                      SUBSYSTEM HEALTH
                    </span>
                    <span className="text-[10px] font-space text-emerald-400 font-bold">ALL NOMINAL</span>
                  </div>

                  <div className="flex items-center justify-center py-1">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(99,199,255,0.12)" strokeWidth="7" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={activeSat.health > 95 ? '#10b981' : '#f59e0b'}
                          strokeWidth="7"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 * (1 - activeSat.health / 100)}
                          strokeLinecap="round"
                          fill="none"
                          className="filter drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-space text-lg sm:text-xl font-bold text-star-white">{activeSat.health}%</span>
                        <span className={`font-space text-[8px] uppercase tracking-widest font-bold ${activeSat.health > 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {activeSat.health > 95 ? 'HEALTHY' : 'DEGRADED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-space">
                    {[
                      { label: 'EPS Power Bus', status: `${voltVal.toFixed(2)} V`, color: 'text-cyan-glow', pct: 98 },
                      { label: 'Thermal Loop', status: `${tempVal.toFixed(1)} °C`, color: 'text-amber-400', pct: 94 },
                      { label: 'TT&C Carrier', status: activeSat.signal, color: 'text-emerald-400', pct: 99 },
                      { label: 'ADCS Attitude', status: '3-AXIS LOCKED', color: 'text-cyan-glow', pct: 97 },
                      { label: 'Payload System', status: 'OPERATIONAL', color: 'text-emerald-400', pct: 99 },
                    ].map((sub) => (
                      <div key={sub.label} className="p-1.5 rounded-lg bg-black/25 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-star-white/70 font-medium">{sub.label}</span>
                          <span className={`font-bold font-mono ${sub.color}`}>{sub.status}</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-cyan-glow" style={{ width: `${sub.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AVIONICS & ATTITUDE ACTUATION SUMMARY WIDGET */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-1.5">
                    <span className="font-space text-[11px] tracking-wider text-cyan-glow uppercase font-bold">
                      AOCS &amp; POWER METRICS
                    </span>
                    <span className="text-[9px] font-space text-emerald-400 font-mono font-bold">STAR-TRACKER: LOCK</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-space">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Reaction Wheel #1</span>
                      <span className="text-cyan-glow font-bold font-mono">12.4 mNm</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Reaction Wheel #2</span>
                      <span className="text-cyan-glow font-bold font-mono">8.2 mNm</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Solar Array Tilt</span>
                      <span className="text-emerald-400 font-bold font-mono">98.4° Nadir</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Star Sensor Head</span>
                      <span className="text-emerald-400 font-bold font-mono">18 Stars Tracked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER 3D HOLOGRAPHIC CAD VIEWPORT */}
              <div className="lg:col-span-6 p-3 sm:p-5 md:p-6 flex flex-col justify-between relative bg-black/90 min-h-[500px] sm:min-h-[560px] md:min-h-[600px]">
                {/* Top Viewport HUD Overlay */}
                <div className="flex items-center justify-between z-20 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-space tracking-wider uppercase bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow font-bold">
                      3D DIGITAL TWIN • {activeSat.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-space bg-space-navy/80 border border-glass-border text-emerald-400 font-bold">
                      {activeSat.orbitType}
                    </span>
                    {activeComponent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-space bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping" />
                        TARGET: {activeComponent.name.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Compass Heading Reticle */}
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-cyan-glow/30 flex items-center justify-center bg-black/60 shadow-[0_0_12px_rgba(99,199,255,0.2)] shrink-0">
                    <Compass
                      size={18}
                      className="text-cyan-glow"
                      style={{ transform: `rotate(${yawVal.toFixed(1)}deg)` }}
                    />
                    <span className="absolute -top-1 text-[7px] font-bold text-red-400">N</span>
                  </div>
                </div>

                {/* 3D Holographic Rendering Canvas with Scroll-to-Zoom & Click-to-Inspect */}
                <div
                  ref={cadCanvasRef}
                  className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#030712] my-2 border border-cyan-glow/30 shadow-[inset_0_0_40px_rgba(99,199,255,0.15)] group cursor-crosshair select-none"
                >
                  {/* Cyber Hologram Radial Aura & Scanline Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,199,255,0.22)_0%,rgba(3,7,18,0.95)_75%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,212,255,0.04)_51%)] bg-[length:100%_4px] pointer-events-none" />

                  {/* Concentric SGP4 Radar & Range Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border border-cyan-glow/25 border-dashed animate-spin" style={{ animationDuration: '60s' }} />
                    <div className="w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border border-cyan-glow/20 border-dashed animate-spin" style={{ animationDuration: '90s', animationDirection: 'reverse' }} />
                    <div className="w-[440px] h-[440px] sm:w-[500px] sm:h-[500px] rounded-full border border-cyan-glow/15 border-dotted" />
                  </div>

                  {/* High-Resolution Unique Satellite Hologram Model with Spring Zoom/Pan */}
                  <div
                    className="relative w-full h-full flex items-center justify-center mx-auto transition-transform duration-500 ease-out"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${activeComponent ? activeComponent.pan.x : 0}px, ${activeComponent ? activeComponent.pan.y : 0}px)`,
                    }}
                  >
                    <img
                      src={activeSat.image || '/images/satellites/sentinel6a.jpg'}
                      alt={`${activeSat.name} 3D Digital Twin`}
                      className="max-h-[300px] sm:max-h-[360px] w-auto max-w-[85%] object-contain object-center filter drop-shadow-[0_0_35px_rgba(99,199,255,0.6)] select-none pointer-events-none mx-auto block"
                    />

                    {/* Subsystem Telemetry Interactive Callouts */}
                    {/* 1. Solar Array Pin */}
                    <div
                      className="absolute top-[25%] left-[18%] z-30 pointer-events-auto cursor-pointer group p-2"
                      onClick={() => handleComponentSelect(missionComponents[0])}
                    >
                      <div className="w-4 h-4 rounded-full border border-cyan-glow bg-cyan-glow relative shadow-[0_0_12px_#63c7ff] animate-pulse" />
                      <div className="absolute -top-7 -left-10 px-2 py-0.5 rounded bg-black/90 border border-cyan-glow/40 text-[9px] font-space text-cyan-glow whitespace-nowrap shadow-md group-hover:scale-105 transition-transform">
                        GaAs Solar: {powerVal.toFixed(2)} kW
                      </div>
                    </div>

                    {/* 2. TT&C Reflector Antenna Pin */}
                    <div
                      className="absolute top-[28%] right-[18%] z-30 pointer-events-auto cursor-pointer group p-2"
                      onClick={() => handleComponentSelect(missionComponents[1])}
                    >
                      <div className="w-4 h-4 rounded-full border border-emerald-400 bg-emerald-400 relative shadow-[0_0_12px_#10b981] animate-pulse" />
                      <div className="absolute -top-7 -right-6 px-2 py-0.5 rounded bg-black/90 border border-emerald-400/40 text-[9px] font-space text-emerald-400 whitespace-nowrap shadow-md group-hover:scale-105 transition-transform">
                        TT&amp;C Link ({activeSat.signal})
                      </div>
                    </div>

                    {/* 3. Primary Payload Sensor Pin */}
                    <div
                      className="absolute bottom-[30%] left-[45%] z-30 pointer-events-auto cursor-pointer group p-2"
                      onClick={() => handleComponentSelect(missionComponents[2])}
                    >
                      <div className="w-4 h-4 rounded-full border border-amber-400 bg-amber-400 relative shadow-[0_0_12px_#f59e0b] animate-pulse" />
                      <div className="absolute -bottom-7 -left-8 px-2 py-0.5 rounded bg-black/90 border border-amber-400/40 text-[9px] font-space text-amber-400 whitespace-nowrap shadow-md group-hover:scale-105 transition-transform">
                        Payload Sensor // Active
                      </div>
                    </div>

                    {/* 4. Power EPS Bus Pin */}
                    <div
                      className="absolute top-[48%] left-[48%] z-30 pointer-events-auto cursor-pointer group p-2"
                      onClick={() => handleComponentSelect(missionComponents[3])}
                    >
                      <div className="w-4 h-4 rounded-full border border-cyan-glow bg-cyan-glow relative shadow-[0_0_12px_#00d4ff]" />
                      <div className="absolute -top-7 -left-6 px-2 py-0.5 rounded bg-black/90 border border-cyan-glow/40 text-[9px] font-space text-cyan-glow whitespace-nowrap shadow-md group-hover:scale-105 transition-transform">
                        EPS Bus: {voltVal.toFixed(2)} V
                      </div>
                    </div>

                    {/* 5. ADCS Star Tracker Pin */}
                    <div
                      className="absolute bottom-[38%] right-[28%] z-30 pointer-events-auto cursor-pointer group p-2"
                      onClick={() => handleComponentSelect(missionComponents[4])}
                    >
                      <div className="w-4 h-4 rounded-full border border-purple-400 bg-purple-400 relative shadow-[0_0_12px_#c084fc]" />
                      <div className="absolute -top-7 -left-8 px-2 py-0.5 rounded bg-black/90 border border-purple-400/40 text-[9px] font-space text-purple-300 whitespace-nowrap shadow-md group-hover:scale-105 transition-transform">
                        ADCS Tracker
                      </div>
                    </div>
                  </div>

                  {/* Corner HUD Overlays */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/70 border border-cyan-glow/20 text-[9px] sm:text-[10px] font-space text-cyan-glow pointer-events-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>TRACK: SGP4 // SYNCHRONIZED</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/70 border border-cyan-glow/20 text-[9px] sm:text-[10px] font-space text-emerald-400 pointer-events-none font-bold">
                    CARRIER: LOCKED
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/70 border border-cyan-glow/20 text-[9px] sm:text-[10px] font-space text-star-white/80 pointer-events-none font-mono">
                    VEL: {activeSat.velocity}
                  </div>

                  {/* IN-VIEWPORT REAL-TIME COMPONENT DIAGNOSTICS FLYOUT HUD */}
                  <AnimatePresence>
                    {activeComponent && (
                      <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-4 right-4 max-w-[280px] w-full bg-[#030914]/95 border border-cyan-glow/40 rounded-2xl p-3.5 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-xl z-30 space-y-2.5 pointer-events-auto"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="p-1.5 rounded-lg border"
                              style={{
                                backgroundColor: `${activeComponent.color}20`,
                                borderColor: `${activeComponent.color}40`,
                                color: activeComponent.color,
                              }}
                            >
                              <activeComponent.icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-space text-xs font-bold text-star-white truncate">{activeComponent.name}</h4>
                              <span className="font-space text-[10px] block truncate font-mono" style={{ color: activeComponent.color }}>
                                {activeComponent.status}
                              </span>
                            </div>
                          </div>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={resetCadView}
                            className="text-star-white/60 hover:text-star-white p-1 cursor-pointer text-xs font-space"
                          >
                            ✕
                          </div>
                        </div>

                        <p className="font-inter text-[10px] text-star-white/80 leading-relaxed">
                          {activeComponent.desc}
                        </p>

                        <div className="space-y-1 pt-0.5">
                          {activeComponent.metrics.map((m) => (
                            <div key={m.label} className="flex items-center justify-between text-[10px] font-space py-0.5 px-2 rounded bg-black/40 border border-white/5">
                              <span className="text-star-white/60">{m.label}:</span>
                              <span className="text-cyan-glow font-bold font-mono">{m.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-space text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck size={11} /> NOMINAL
                          </span>
                          <button
                            onClick={resetCadView}
                            className="px-2 py-0.5 rounded bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow text-[9px] font-space hover:bg-cyan-glow/30 transition-colors font-bold"
                          >
                            Reset Zoom
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Interactive Subsystem Quick Selector Bar & Zoom Controls */}
                <div className="space-y-2 pt-2 border-t border-cyan-glow/10 z-20">
                  {/* Subsystem Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {missionComponents.map((comp) => {
                      const Icon = comp.icon;
                      const isCur = selectedComponentId === comp.id;
                      return (
                        <div
                          role="button"
                          tabIndex={0}
                          key={comp.id}
                          onClick={() => handleComponentSelect(comp)}
                          className={`px-2 py-1.5 rounded-xl border text-[10px] font-space transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                            isCur
                              ? 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow font-bold shadow-[0_0_12px_rgba(99,199,255,0.3)]'
                              : 'bg-black/40 border-white/10 text-star-white/70 hover:text-star-white hover:border-cyan-glow/30'
                          }`}
                        >
                          <Icon size={12} style={{ color: comp.color }} className="shrink-0" />
                          <span className="truncate">{comp.name.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Zoom Controls & Magnitude Readout */}
                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                        className="p-1.5 sm:p-2 rounded-xl bg-space-navy/80 border border-cyan-glow/20 hover:border-cyan-glow/50 text-cyan-glow transition-all cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn size={14} />
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                        className="p-1.5 sm:p-2 rounded-xl bg-space-navy/80 border border-cyan-glow/20 hover:border-cyan-glow/50 text-cyan-glow transition-all cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut size={14} />
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={resetCadView}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-space-navy/80 border border-cyan-glow/20 hover:border-cyan-glow/50 text-star-white/80 hover:text-star-white font-space text-xs transition-all cursor-pointer"
                      >
                        Reset View
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-space text-star-white/70 font-mono">
                        MAG: {zoomLevel.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT HUD PANELS (3 cols) */}
              <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-cyan-glow/10 bg-[#050b12]/80 p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                {/* OBJECT TELEMETRY CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block">
                      ORBITAL COORDINATES
                    </span>
                    <h4 className="font-space text-sm font-bold text-star-white mt-0.5">
                      {activeSat.name}
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs font-space">
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Mission Role</span>
                      <span className="text-star-white font-medium truncate max-w-[140px]">{activeSat.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Altitude AGL</span>
                      <span className="text-cyan-glow font-bold font-mono">{formatAltitude(altKm, activeSat.altitude)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Latitude</span>
                      <span className="text-cyan-glow font-bold font-mono">{activeSat.lat}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Longitude</span>
                      <span className="text-cyan-glow font-bold font-mono">{activeSat.lng}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Inclination</span>
                      <span className="text-star-white font-bold font-mono">{activeSat.inclination}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Orbital Velocity</span>
                      <span className="text-emerald-400 font-bold font-mono">{activeSat.velocity}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-glow/10 flex items-center justify-between">
                    <div>
                      <span className="font-space text-[10px] text-star-white/60 uppercase tracking-widest block">
                        OPERATIONAL STATUS
                      </span>
                      <span className="font-space text-xs text-emerald-400 font-bold block mt-0.5">
                        ● {activeSat.status}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-space bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-bold">
                      SGP4 SYNC
                    </span>
                  </div>
                </div>

                {/* TRACKING & DSN INFO CARD */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-4 space-y-3">
                  <div className="border-b border-cyan-glow/10 pb-2.5">
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold">
                      GROUND TRACKING
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-space">
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Primary Station</span>
                      <span className="text-star-white font-medium text-right truncate max-w-[140px]">{activeSat.groundStation}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Carrier Link</span>
                      <span className="text-emerald-400 font-bold font-mono">{activeSat.signal}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Last Contact</span>
                      <span className="text-star-white/80 font-medium font-mono" suppressHydrationWarning>{formatMissionTime(new Date(Date.now() - 480000), 'hms')}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-star-white/60 font-medium">Next AOS Pass</span>
                      <span className="text-cyan-glow font-semibold font-mono" suppressHydrationWarning>{formatMissionTime(new Date(Date.now() + 1620000), 'hms')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-glow/10 text-center">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-black/50 border border-cyan-glow/20">
                      <span className="font-space text-[9px] sm:text-[10px] text-star-white/60 uppercase block font-semibold">TRACKED</span>
                      <span className="font-space text-lg sm:text-xl font-bold text-cyan-glow">{activeSat.trackedObjects}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-black/50 border border-alert-critical/30">
                      <span className="font-space text-[9px] sm:text-[10px] text-alert-critical uppercase block font-semibold">ALERTS</span>
                      <span className="font-space text-lg sm:text-xl font-bold text-alert-critical">{activeSat.activeAlerts}</span>
                    </div>
                  </div>
                </div>

                {/* GROUND LINK VECTOR & DOPPLER METRICS WIDGET */}
                <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/50 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-1.5">
                    <span className="font-space text-[11px] tracking-wider text-cyan-glow uppercase font-bold">
                      RF LINK &amp; DOPPLER VECTOR
                    </span>
                    <span className="text-[9px] font-space text-emerald-400 font-mono font-bold">X-BAND 8.4 GHz</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-space">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Antenna Azimuth</span>
                      <span className="text-cyan-glow font-bold font-mono">142.8° SE</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Elevation Look</span>
                      <span className="text-cyan-glow font-bold font-mono">38.4° AGL</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Doppler Offset</span>
                      <span className="text-emerald-400 font-bold font-mono">+12.4 kHz</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-star-white/60 block uppercase">Bit Error Rate</span>
                      <span className="text-emerald-400 font-bold font-mono">&lt; 1.0e-9 (FEC)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DEDICATED SECONDARY VIEWPORTS */
            <div className="p-4 sm:p-6 md:p-8 space-y-6 min-h-[500px] w-full">
              {activeTab === 'Telemetry' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-space text-base sm:text-lg font-bold text-star-white">
                        LIVE TELEMETRY STREAM DIAGNOSTICS // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-star-white/70">
                        Direct sensor ingestion from {activeSat.groundStation} via TimescaleDB Hypertable
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-cyan-glow/20 space-y-2">
                      <div className="flex justify-between font-space text-xs">
                        <span className="text-star-white/60">Power Bus (28V)</span>
                        <span className="text-cyan-glow font-bold font-mono">{voltVal.toFixed(2)} V</span>
                      </div>
                      <LiveOscilloscopeWave stroke="#00d4ff" freq={0.045} amp={6.0} speed={1.2} />
                      <span className="text-[10px] text-star-white/60 font-inter block">Variance: ±0.02V (Optimal Regulated Bus)</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-cyan-glow/20 space-y-2">
                      <div className="flex justify-between font-space text-xs">
                        <span className="text-star-white/60">Solar Generation</span>
                        <span className="text-emerald-400 font-bold font-mono">{powerVal.toFixed(2)} kW</span>
                      </div>
                      <LiveOscilloscopeWave stroke="#10b981" freq={0.038} amp={6.5} speed={1.0} />
                      <span className="text-[10px] text-star-white/60 font-inter block">Multi-junction GaAs solar efficiency 98.4%</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-cyan-glow/20 space-y-2">
                      <div className="flex justify-between font-space text-xs">
                        <span className="text-star-white/60">Thermodynamic Temp</span>
                        <span className="text-amber-400 font-bold font-mono">{tempVal.toFixed(1)} °C</span>
                      </div>
                      <LiveOscilloscopeWave stroke="#f59e0b" freq={0.028} amp={5.0} speed={0.8} />
                      <span className="text-[10px] text-star-white/60 font-inter block">Radiator louvers active at equilibrium</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Orbits' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-space text-base sm:text-lg font-bold text-star-white">
                        SGP4 ORBITAL EPHEMERIS &amp; RADAR TRACK // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-star-white/70">
                        NORAD Two-Line Element (TLE) high-order ephemeris propagation, ground track vector, and AOS radar footprint
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-cyan-glow/25 bg-[#030814] aspect-[16/8] min-h-[320px] relative flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(4,18,34,0.95)]">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.2" />
                          <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                      {/* Range Circles */}
                      <circle cx="400" cy="200" r="160" fill="none" stroke="rgba(99,199,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
                      <circle cx="400" cy="200" r="110" fill="none" stroke="rgba(99,199,255,0.22)" strokeWidth="1" />
                      <circle cx="400" cy="200" r="60" fill="none" stroke="rgba(99,199,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
                      {/* Crosshairs */}
                      <line x1="150" y1="200" x2="650" y2="200" stroke="rgba(99,199,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="400" y1="50" x2="400" y2="350" stroke="rgba(99,199,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
                      {/* Elliptical Ground Track Orbit */}
                      <ellipse cx="400" cy="200" rx="280" ry="110" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.5" />
                      {/* Satellite Node on Orbit */}
                      <g transform={`translate(${400 + Math.cos((yawVal * Math.PI) / 180) * 280}, ${200 + Math.sin((yawVal * Math.PI) / 180) * 110})`}>
                        <circle cx="0" cy="0" r="8" fill="#00d4ff" className="animate-pulse" filter="drop-shadow(0 0 10px #00d4ff)" />
                        <circle cx="0" cy="0" r="18" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="2,2" />
                        <text x="14" y="4" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
                          {activeSat.code}
                        </text>
                      </g>
                    </svg>

                    <div className="absolute top-3 left-4 px-3 py-1 rounded-xl bg-black/80 border border-cyan-glow/30 text-[10px] font-space text-cyan-glow font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>SGP4 TLE EPHEMERIS PROPAGATOR ACTIVE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-space">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-star-white/60 text-[10px] uppercase block">Orbital Regime</span>
                      <span className="text-star-white font-bold text-sm mt-1 block">{activeSat.orbitType}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-star-white/60 text-[10px] uppercase block">Mean Altitude</span>
                      <span className="text-cyan-glow font-bold text-sm mt-1 block font-mono">{formatAltitude(altKm, activeSat.altitude)}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-star-white/60 text-[10px] uppercase block">Orbital Inclination</span>
                      <span className="text-star-white font-bold text-sm mt-1 block font-mono">{activeSat.inclination}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border">
                      <span className="text-star-white/60 text-[10px] uppercase block">Orbital Velocity</span>
                      <span className="text-emerald-400 font-bold text-sm mt-1 block font-mono">{activeSat.velocity}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-space text-base sm:text-lg font-bold text-star-white">
                        MISSION EVENT LOG &amp; MANEUVER TIMELINE // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-star-white/70">
                        Historical and scheduled orbital events, delta-V burns, and payload operation cycles
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { time: formatMissionTime(new Date(Date.now() - 3600000), 'hms'), type: 'AUTONOMOUS MITIGATION', desc: 'Battery Bay 3 Shunt Regulator auto-activated in response to thermal elevation', status: 'EXECUTED', color: '#ff3b3b' },
                      { time: formatMissionTime(new Date(Date.now() - 7200000), 'hms'), type: 'GROUND HANDOFF', desc: `Telemetry tracking established with ${activeSat.groundStation}`, status: 'SUCCESS', color: '#10b981' },
                      { time: formatMissionTime(new Date(Date.now() - 14400000), 'hms'), type: 'ORBIT PROPAGATION', desc: 'SGP4 orbital state vector refreshed from Space-Track TLE catalogue', status: 'SYNCHRONIZED', color: '#00d4ff' },
                      { time: formatMissionTime(new Date(Date.now() - 21600000), 'hms'), type: 'ECLIPSE INGRESS', desc: 'Spacecraft entered umbral shadow, battery discharge curve initiated', status: 'NOMINAL', color: '#f59e0b' },
                    ].map((ev, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ev.color }} />
                          <div>
                            <span className="font-space text-xs font-bold text-star-white block">{ev.type}</span>
                            <span className="font-inter text-xs text-star-white/70">{ev.desc}</span>
                          </div>
                        </div>
                        <span className="font-space text-xs text-star-white/80 font-mono" suppressHydrationWarning>{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Alerts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-space text-base sm:text-lg font-bold text-star-white">
                        ACTIVE SUBSYSTEM ALERTS // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-star-white/70">
                        Active critical and elevated telemetry deviations requiring operator attention
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="space-y-3">
                    {satelliteAlerts.length > 0 ? (
                      satelliteAlerts.map((alt) => (
                        <div key={alt.id} className="p-4 rounded-2xl bg-[#140507]/90 border border-alert-critical/40 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-space font-bold uppercase bg-alert-critical/20 text-alert-critical border border-alert-critical/30">
                              {alt.severity} • {alt.id}
                            </span>
                            <span className="font-space text-xs text-star-white/60 font-mono">{alt.timestamp}</span>
                          </div>
                          <h5 className="font-space text-sm font-bold text-star-white">{alt.title}</h5>
                          <p className="font-inter text-xs text-star-white/80 leading-relaxed">{alt.description}</p>
                          <div className="flex justify-end pt-1">
                            {alt.acknowledged ? (
                              <span className="text-xs font-space text-cyan-glow flex items-center gap-1 font-bold">
                                <CheckCircle2 size={14} /> ACKNOWLEDGED
                              </span>
                            ) : (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => ackAlert(alt.id, 'Commander Vance')}
                                className="px-4 py-1.5 rounded-xl bg-alert-critical/30 border border-alert-critical text-alert-critical hover:bg-alert-critical/40 text-xs font-space font-bold uppercase cursor-pointer"
                              >
                                Acknowledge Threat
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 rounded-2xl bg-space-navy/30 border border-glass-border text-center space-y-2">
                        <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
                        <h5 className="font-space text-sm font-bold text-star-white">ALL SYSTEMS NOMINAL</h5>
                        <p className="font-inter text-xs text-star-white/60">No active alerts for this spacecraft asset.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Reports' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-space text-base sm:text-lg font-bold text-star-white">
                        MISSION READINESS &amp; HEALTH REPORT // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-star-white/70">
                        Consolidated engineering audit and power/thermal margin certification
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-2">
                      <span className="font-space text-[10px] text-star-white/60 uppercase block font-semibold">OVERALL HEALTH SCORE</span>
                      <span className="font-space text-2xl font-bold text-emerald-400">{activeSat.health} / 100</span>
                      <p className="font-inter text-[11px] text-star-white/70">Meets all primary mission operational margins</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-2">
                      <span className="font-space text-[10px] text-star-white/60 uppercase block font-semibold">THERMAL STABILITY MARGIN</span>
                      <span className="font-space text-2xl font-bold text-cyan-glow">+8.4°C Reserve</span>
                      <p className="font-inter text-[11px] text-star-white/70">Radiator louvers operational at optimal duty cycle</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-2">
                      <span className="font-space text-[10px] text-star-white/60 uppercase block font-semibold">ORBITAL CONJUNCTION INDEX</span>
                      <span className="font-space text-2xl font-bold text-amber-400">Pc 1.84e-4</span>
                      <p className="font-inter text-[11px] text-star-white/70">Evasion delta-V burn pre-calculated</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-space text-base sm:text-lg font-bold text-star-white">
                        MISSION CONTROL CONFIGURATION // {activeSat.name}
                      </h4>
                      <p className="font-inter text-xs text-star-white/70">
                        Telemetry sampling frequency, TimescaleDB retention, and SGP4 propagation tolerances
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveTab('Dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow text-xs font-space font-bold cursor-pointer hover:bg-cyan-glow/25"
                    >
                      ← Return to Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-space">
                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-3">
                      <span className="font-space text-xs font-bold text-cyan-glow uppercase block">
                        TELEMETRY INGESTION FREQUENCY
                      </span>
                      <div className="flex items-center gap-2">
                        {['1 Hz', '10 Hz', '50 Hz (Live)'].map((freq, i) => (
                          <div
                            role="button"
                            tabIndex={0}
                            key={freq}
                            className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                              i === 2 ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold' : 'bg-black/40 border-glass-border text-star-white/60'
                            }`}
                          >
                            {freq}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-space-navy/50 border border-glass-border space-y-3">
                      <span className="font-space text-xs font-bold text-cyan-glow uppercase block">
                        TIMESCALE HYPERTABLE RETENTION
                      </span>
                      <div className="flex items-center gap-2">
                        {['30 Days', '90 Days', '365 Days (Full)'].map((ret, i) => (
                          <div
                            role="button"
                            tabIndex={0}
                            key={ret}
                            className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                              i === 2 ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold' : 'bg-black/40 border-glass-border text-star-white/60'
                            }`}
                          >
                            {ret}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. BOTTOM TELEMETRY GRID (ANIMATED, LIVELY & STABLE VERIFIED DATA) */}
          <div className="border-t border-cyan-glow/15 bg-[#04080e]/95 p-4 sm:p-5 md:p-6 space-y-5 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* CARD 1: ORBIT OVERVIEW (ANIMATED 3D ROTATING ORBIT GLOBE) */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block mb-0.5">
                      ORBIT OVERVIEW
                    </span>
                    <span className="font-space text-xs text-star-white/80 font-medium">{activeSat.orbitType}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="relative aspect-[4/3] w-full flex items-center justify-center my-1">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-900 via-blue-600 to-cyan-400 shadow-[0_0_25px_rgba(99,199,255,0.4)] relative">
                    {/* Continuous Smooth 3D Orbit Ring */}
                    <div className="absolute inset-0 -m-4 rounded-full border border-dashed border-cyan-glow/70 animate-spin" style={{ animationDuration: '14s' }}>
                      {/* Orbiting Satellite Marker */}
                      <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#63c7ff]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-space text-star-white/70 font-medium pt-1 border-t border-white/5">
                  <span>ALTITUDE: <strong className="text-cyan-glow font-mono font-bold">{formatAltitude(altKm, activeSat.altitude)}</strong></span>
                  <span className="text-emerald-400 font-bold font-mono">SGP4 STABLE</span>
                </div>
              </div>

              {/* CARD 2: TELEMETRY FEED WAVEFORMS (CONTINUOUS 60FPS FLOWING OSCILLOSCOPE) */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block">
                    TELEMETRY FEED
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-space text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE 60Hz
                  </span>
                </div>

                {/* Battery Voltage */}
                <div>
                  <div className="flex justify-between text-xs font-space">
                    <span className="text-star-white/70 font-medium">EPS Battery Bus</span>
                    <span className="text-cyan-glow font-bold font-mono">{voltVal.toFixed(2)} V</span>
                  </div>
                  <LiveOscilloscopeWave stroke={activeSat.waveColor || '#00d4ff'} freq={0.045} amp={5.5} speed={1.2} />
                </div>

                {/* Solar Array Power */}
                <div>
                  <div className="flex justify-between text-xs font-space">
                    <span className="text-star-white/70 font-medium">GaAs Solar Array</span>
                    <span className="text-emerald-400 font-bold font-mono">{powerVal.toFixed(2)} kW</span>
                  </div>
                  <LiveOscilloscopeWave stroke="#10b981" freq={0.038} amp={6.5} speed={1.0} />
                </div>

                {/* Onboard Temp */}
                <div>
                  <div className="flex justify-between text-xs font-space">
                    <span className="text-star-white/70 font-medium">Thermodynamic Temp</span>
                    <span className="text-amber-400 font-bold font-mono">{tempVal.toFixed(1)} °C</span>
                  </div>
                  <LiveOscilloscopeWave stroke="#f59e0b" freq={0.028} amp={4.5} speed={0.8} />
                </div>
              </div>

              {/* CARD 3: ATTITUDE & ORIENTATION (REALISTIC FLIGHT DECK WITH LIVE GYRO-STABILIZATION INSTRUMENTS) */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-2">
                  <div>
                    <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block mb-0.5">
                      ATTITUDE &amp; ORIENTATION
                    </span>
                    <span className="font-space text-[10px] text-star-white/60 block">3-AXIS GYRO-STABILIZATION MATRIX</span>
                  </div>
                  <span className="text-[9px] font-space text-cyan-glow font-bold bg-cyan-glow/15 px-2 py-0.5 rounded border border-cyan-glow/30">
                    ADCS LOCKED
                  </span>
                </div>

                {/* 3 Dedicated Animated AOCS Flight Attitude Dials (Roll, Pitch, Yaw) */}
                <div className="grid grid-cols-3 gap-2 py-1 text-center">
                  {/* ROLL (Bank Artificial Horizon Dial) */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-glow/20 flex flex-col items-center justify-between shadow-inner">
                    <span className="font-space text-[10px] text-cyan-glow font-bold uppercase tracking-wider">ROLL</span>
                    <div className="relative w-12 h-12 my-1.5 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-dashed border-cyan-glow/40" />
                      {/* Fixed horizon reference ticks */}
                      <div className="absolute left-1 w-1.5 h-[1px] bg-cyan-glow/80" />
                      <div className="absolute right-1 w-1.5 h-[1px] bg-cyan-glow/80" />
                      {/* Bank Artificial Horizon Bar */}
                      <div
                        className="w-8 h-1 bg-gradient-to-r from-cyan-glow/30 via-cyan-glow to-cyan-glow/30 rounded-full shadow-[0_0_8px_#00d4ff] transition-transform duration-500 ease-out"
                        style={{ transform: `rotate(${(rollVal * 25).toFixed(1)}deg)` }}
                      />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow absolute shadow-[0_0_6px_#00d4ff]" />
                    </div>
                    <span className="font-mono text-xs font-bold text-star-white">
                      {rollVal >= 0 ? '+' : ''}{rollVal.toFixed(2)}°
                    </span>
                    <span className="text-[8px] font-space text-emerald-400 font-semibold uppercase mt-0.5">NOMINAL</span>
                  </div>

                  {/* PITCH (Elevation Ladder Dial) */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20 flex flex-col items-center justify-between shadow-inner">
                    <span className="font-space text-[10px] text-emerald-400 font-bold uppercase tracking-wider">PITCH</span>
                    <div className="relative w-12 h-12 my-1.5 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/40" />
                      {/* Pitch Ladder Indicator (Translates Vertically) */}
                      <div
                        className="flex flex-col items-center justify-center gap-1 transition-transform duration-500 ease-out"
                        style={{ transform: `translateY(${(-pitchVal * 18).toFixed(1)}px)` }}
                      >
                        <div className="w-4 h-[1px] bg-emerald-400/50" />
                        <div className="w-7 h-[1.5px] bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                        <div className="w-4 h-[1px] bg-emerald-400/50" />
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute shadow-[0_0_6px_#10b981]" />
                    </div>
                    <span className="font-mono text-xs font-bold text-star-white">
                      {pitchVal >= 0 ? '+' : ''}{pitchVal.toFixed(2)}°
                    </span>
                    <span className="text-[8px] font-space text-emerald-400 font-semibold uppercase mt-0.5">LOCKED</span>
                  </div>

                  {/* YAW (Azimuth Compass Rose Dial) */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20 flex flex-col items-center justify-between shadow-inner">
                    <span className="font-space text-[10px] text-amber-400 font-bold uppercase tracking-wider">YAW</span>
                    <div className="relative w-12 h-12 my-1.5 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/40" />
                      {/* Cardinal markers */}
                      <span className="absolute top-0.5 text-[6px] font-bold text-amber-300">N</span>
                      <span className="absolute bottom-0.5 text-[6px] font-bold text-amber-300/60">S</span>
                      {/* Azimuth Rotating Pointer */}
                      <div
                        className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
                        style={{ transform: `rotate(${(yawVal % 360).toFixed(1)}deg)` }}
                      >
                        <div className="w-1 h-3.5 bg-amber-400 rounded-t-full absolute top-1 shadow-[0_0_8px_#f59e0b]" />
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                    </div>
                    <span className="font-mono text-xs font-bold text-star-white">
                      {(yawVal % 360).toFixed(1)}°
                    </span>
                    <span className="text-[8px] font-space text-amber-400 font-semibold uppercase mt-0.5">TRACK</span>
                  </div>
                </div>

                {/* Pointing Jitter & ADCS Subsystem Metric */}
                <div className="flex items-center justify-between text-[11px] font-space pt-1.5 border-t border-white/5">
                  <span className="text-star-white/60">Pointing Jitter</span>
                  <span className="text-emerald-400 font-bold font-mono animate-pulse">&lt; 0.0038°/s RMS</span>
                </div>
              </div>

              {/* CARD 4: SUBSYSTEM POWER & THERMAL CONSUMPTION */}
              <div className="rounded-2xl border border-cyan-glow/15 bg-space-navy/40 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-glow/10 pb-2">
                  <span className="font-space text-xs tracking-[0.2em] text-cyan-glow uppercase font-bold block">
                    SUBSYSTEM CONSUMPTION
                  </span>
                  <span className="text-[10px] font-space text-star-white/60 font-mono">EPS 100%</span>
                </div>

                <div className="space-y-2.5 text-xs font-space">
                  {[
                    { label: 'Payload Radar / Instruments', pct: 65, color: '#00d4ff' },
                    { label: 'Comms / TT&C Carrier', pct: 20, color: '#10b981' },
                    { label: 'Thermodynamic Loops', pct: 10, color: '#f59e0b' },
                    { label: 'AOCS Wheel Actuators', pct: 5, color: '#a855f7' },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-star-white/75 font-medium">{c.label}</span>
                        <span className="text-star-white font-bold font-mono">{c.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
