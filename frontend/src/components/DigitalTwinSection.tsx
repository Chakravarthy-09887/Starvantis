'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wifi, Zap, Camera, Thermometer, ZoomIn, ZoomOut, Cpu, RotateCcw, Satellite, Radio } from 'lucide-react';
import Image from 'next/image';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import { useMission } from '../context/MissionContext';

export default function DigitalTwinSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { selectedSatelliteId, setSelectedSatelliteId, liveTelemetry } = useMission();

  const [zoom, setZoom] = useState(1);
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

  // Tailored subsystems for active satellite
  const subsystems = [
    {
      id: 'antenna',
      label: 'Telemetry Antenna (TT&C)',
      icon: Wifi,
      status: `Downlink ${activeSat.signal}`,
      color: '#63C7FF',
      zoom: 2.2,
      pan: { x: 12, y: -45 },
      desc: `High-gain steerable reflector tracking ${activeSat.groundStation.split(' ')[0]} ground station link.`,
    },
    {
      id: 'solar',
      label: 'Solar Arrays (EPS)',
      icon: Zap,
      status: `${liveSolar} Generation`,
      color: '#63C7FF',
      zoom: 1.8,
      pan: { x: -60, y: 0 },
      desc: 'Multi-junction gallium arsenide photovoltaic wings with automated solar-vector tracking.',
    },
    {
      id: 'payload',
      label: 'Primary Mission Payload',
      icon: Camera,
      status: activeSat.role.split('&')[0].trim(),
      color: '#10b981',
      zoom: 2.4,
      pan: { x: -18, y: 35 },
      desc: `${activeSat.type} calibrated for continuous mission duty cycle.`,
    },
    {
      id: 'battery',
      label: 'Power Storage & Thermal Bay',
      icon: Thermometer,
      status: `${liveTemp} (${liveVolt})`,
      color: parseFloat(liveTemp) > 35 ? '#ff3b3b' : '#38bdf8',
      zoom: 2.5,
      pan: { x: 0, y: 15 },
      desc: `Solid-state battery cell bay monitored against thermodynamic equilibrium baselines.`,
    },
  ];

  const activeSub = subsystems.find((s) => s.id === activeSubId) || null;

  const handleSubClick = (sub: typeof subsystems[0]) => {
    setActiveSubId(sub.id);
    setZoom(sub.zoom);
  };

  const resetView = () => {
    setActiveSubId(null);
    setZoom(1);
  };

  return (
    <section id="digital-twin" className="section-spacing relative overflow-hidden py-20 md:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-glow/20 bg-space-navy/60 mb-3.5 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <Cpu size={14} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.3em] text-cyan-glow uppercase font-light">
              Holographic 3D Spacecraft CAD Virtualization
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-star-white">
            THE DIGITAL TWIN
          </h2>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-cyan-glow mt-1 text-glow">
            OF YOUR MISSION.
          </h2>
          <p className="font-inter text-xs md:text-sm text-star-white/50 mt-3 max-w-xl mx-auto leading-relaxed font-light">
            Interactive holographic digital twin synchronized with real-time spacecraft sensor streams. Select any fleet asset to inspect subsystem telemetry probes.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <div role="button" tabIndex={0} key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white shadow-[0_0_18px_rgba(99,199,255,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/50 border-glass-border text-muted-gray hover:text-star-white hover:border-cyan-glow/40'
                  }`}
                >
                  <Satellite size={12} className={isSelected ? 'text-cyan-glow' : 'text-muted-gray'} />
                  <span>{sat.code}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${sat.status === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Spacecraft Stage Frame */}
        <div className="relative max-w-5xl mx-auto aspect-[16/10] md:aspect-[16/9] rounded-3xl p-4 md:p-6 border border-cyan-glow/20 bg-[#060c14]/95 shadow-[0_0_60px_rgba(99,199,255,0.15)] overflow-hidden flex flex-col justify-between backdrop-blur-2xl">
          {/* Top HUD */}
          <div className="flex items-center justify-between border-b border-cyan-glow/15 pb-3 z-20 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-space text-xs md:text-sm font-semibold text-star-white uppercase tracking-wider">
                ASSET: {activeSat.name}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-space tracking-wider bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-medium">
                TWIN: 1:1 SYNC
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-space text-xs text-star-white/60 font-light mr-2">MAG: {zoom.toFixed(1)}x</span>
              <div role="button" tabIndex={0} onClick={() => setZoom((z) => Math.min(3.0, z + 0.3))}
                className="p-1.5 rounded-lg border border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/15 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </div>
              <div role="button" tabIndex={0} onClick={() => setZoom((z) => Math.max(1.0, z - 0.3))}
                className="p-1.5 rounded-lg border border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/15 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </div>
              <div role="button" tabIndex={0} onClick={resetView}
                className="px-3 py-1 rounded-lg border border-cyan-glow/20 text-xs font-space text-star-white/60 hover:text-star-white hover:bg-cyan-glow/10 transition-all flex items-center gap-1 cursor-pointer">
                <RotateCcw size={12} />
                <span>Reset</span>
              </div>
            </div>
          </div>

          {/* Holographic Satellite CAD Model with Scroll-to-Zoom */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-black my-2 border border-cyan-glow/15 cursor-crosshair"
            onWheel={(e) => {
              e.preventDefault();
              setZoom((z) => Number(Math.min(2.5, Math.max(0.7, z + (e.deltaY < 0 ? 0.15 : -0.15))).toFixed(2)));
            }}
          >
            {/* Luminous cyan galaxy aura backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,199,255,0.12)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />

            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              animate={{
                scale: zoom,
                x: activeSub ? activeSub.pan.x * 2.5 : 0,
                y: activeSub ? activeSub.pan.y * 2.5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 85, damping: 18 }}
            >
              <img
                src={activeSat.image || '/images/digital-satellite.jpg'}
                alt={`${activeSat.name} Holographic Digital Twin Satellite`}
                className="w-full h-full max-h-[420px] object-contain object-center filter drop-shadow-[0_0_35px_rgba(99,199,255,0.4)] pointer-events-none select-none"
              />

              {/* Interactive Telemetry Reticles */}
              {/* Antenna Pin */}
              <div
                className="absolute top-[32%] right-[44%] cursor-pointer group z-30"
                onClick={() => handleSubClick(subsystems[0])}
              >
                <div className="w-4 h-4 rounded-full border border-cyan-glow bg-cyan-glow/40 animate-ping absolute" />
                <div className="w-4 h-4 rounded-full border-2 border-white bg-cyan-glow relative shadow-[0_0_12px_#63c7ff]" />
                <div className="absolute -top-7 -left-12 px-2 py-0.5 rounded bg-black/85 border border-cyan-glow/40 text-[9px] font-space text-cyan-glow whitespace-nowrap opacity-90 group-hover:opacity-100">
                  TT&amp;C Link ({activeSat.signal})
                </div>
              </div>

              {/* Solar Array Left Pin */}
              <div
                className="absolute top-[30%] left-[22%] cursor-pointer group z-30"
                onClick={() => handleSubClick(subsystems[1])}
              >
                <div className="w-3.5 h-3.5 rounded-full border border-cyan-glow bg-cyan-glow relative shadow-[0_0_10px_#63c7ff]" />
                <div className="absolute -top-6 -left-8 px-2 py-0.5 rounded bg-black/85 border border-cyan-glow/30 text-[9px] font-space text-cyan-glow whitespace-nowrap">
                  GaAs Solar Wing ({liveSolar})
                </div>
              </div>

              {/* Payload Lens Pin */}
              <div
                className="absolute bottom-[36%] left-[44%] cursor-pointer group z-30"
                onClick={() => handleSubClick(subsystems[2])}
              >
                <div className="w-3.5 h-3.5 rounded-full border border-emerald-400 bg-emerald-400 relative shadow-[0_0_10px_#10b981]" />
                <div className="absolute -bottom-6 -left-10 px-2 py-0.5 rounded bg-black/85 border border-emerald-400/40 text-[9px] font-space text-emerald-400 whitespace-nowrap">
                  Payload Sensors
                </div>
              </div>

              {/* Battery Bay Pin */}
              <div
                className="absolute top-[48%] left-[48%] cursor-pointer group z-30"
                onClick={() => handleSubClick(subsystems[3])}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border relative ${
                    parseFloat(liveTemp) > 35
                      ? 'border-alert-critical bg-alert-critical animate-pulse shadow-[0_0_12px_#ff3b3b]'
                      : 'border-cyan-glow bg-cyan-glow shadow-[0_0_10px_#00d4ff]'
                  }`}
                />
                <div
                  className={`absolute -top-6 -left-10 px-2 py-0.5 rounded bg-black/85 border text-[9px] font-space whitespace-nowrap font-bold ${
                    parseFloat(liveTemp) > 35
                      ? 'border-alert-critical/50 text-alert-critical'
                      : 'border-cyan-glow/40 text-cyan-glow'
                  }`}
                >
                  EPS Battery ({liveTemp})
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Subsystem Quick Selector Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 z-20 pt-2 border-t border-cyan-glow/15">
            {subsystems.map((sub) => {
              const Icon = sub.icon;
              const isCur = activeSubId === sub.id;
              return (
                <div role="button" tabIndex={0} key={sub.id}
                  onClick={() => handleSubClick(sub)}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between text-left cursor-pointer ${
                    isCur
                      ? 'border-cyan-glow bg-cyan-glow/20 shadow-[0_0_20px_rgba(99,199,255,0.3)]'
                      : 'border-cyan-glow/15 hover:border-cyan-glow/35 bg-space-navy/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} style={{ color: sub.color }} />
                    <div>
                      <span className="font-space text-xs font-semibold text-star-white block truncate">{sub.label}</span>
                      <span className="font-space text-[10px]" style={{ color: sub.color }}>{sub.status}</span>
                    </div>
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
