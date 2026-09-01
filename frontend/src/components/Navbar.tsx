'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Orbit,
  Wifi,
  Database,
  Clock,
  ChevronDown,
  Check,
  Globe,
  Radio,
  Shield,
  Activity,
  Sun,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
} from 'lucide-react';
import StarvantisLogo from './StarvantisLogo';
import { useMission } from '../context/MissionContext';

// Primary quick links shown on wider desktop screens
const PRIMARY_QUICK_LINKS = [
  { label: 'Mission', href: '#mission' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'Space Weather', href: '#space-weather' },
  { label: 'Orbital Risk', href: '#orbital' },
  { label: 'Deep Space', href: '#deep-space' },
  { label: 'Cosmic 3D', href: '#cosmic-explorer' },
  { label: 'Ground Stations', href: '#ground-stations' },
  { label: 'Cyber Defense', href: '#cyber-defense' },
];

// All categorized navigation sections in the 3-dash bar menu drawer
const CATEGORIZED_NAV = [
  {
    category: 'FLEET & PRIMARY CONTROL',
    items: [
      { label: 'Mission Architecture', href: '#mission', icon: Orbit, desc: 'Constellation telemetry & system status' },
      { label: 'Constellation Overview', href: '#overview', icon: Layers, desc: 'Real-time multi-satellite fleet' },
      { label: 'Primary Command Deck', href: '#satellite-inspector', icon: Compass, desc: 'Telemetry inspector & thruster vectoring' },
      { label: 'Live Telemetry Streams', href: '#telemetry', icon: Activity, desc: 'High-frequency bus & orbital charts' },
    ],
  },
  {
    category: 'SPACE ENVIRONMENT & RISK',
    items: [
      { label: 'Space Weather & SAA Matrix', href: '#space-weather', icon: Sun, desc: 'NOAA Kp-index, solar wind & SAA radiation' },
      { label: '3D Conjunction Sandbox', href: '#orbital', icon: Sparkles, desc: 'Foster-1992 TCA simulator & CAM thruster evasion' },
      { label: 'Mission Risk Center', href: '#risk-center', icon: Activity, desc: 'Fused AI risk index & impact probabilities' },
      { label: 'Active Alerts & Siren', href: '#alerts', icon: Radio, desc: 'Autonomous anomaly alarms & acknowledgment' },
    ],
  },
  {
    category: 'DEEP-SPACE, COSMOLOGY & GROUND NETWORK',
    items: [
      { label: 'Cosmic 3D & Black Hole', href: '#cosmic-explorer', icon: Globe, desc: '3D Solar System Orrery, Interstellar Gargantua & Facts' },
      { label: 'Deep-Space Explorer', href: '#deep-space', icon: Sparkles, desc: 'Aditya-L1 (L1 Halo), Chandrayaan-3 & JWST (L2)' },
      { label: 'Lunar EDL Simulation', href: '#landing-descent', icon: Orbit, desc: 'Rough braking & failure-proof hazard avoidance' },
      { label: 'Planetary Reconnaissance', href: '#surface-analysis', icon: Compass, desc: 'Shiv Shakti Point & Lunar South Pole radar' },
      { label: 'Ground Stations & DSN', href: '#ground-stations', icon: Radio, desc: 'ISTRAC, Goldstone & Svalbard RF Doppler links' },
    ],
  },
  {
    category: 'CYBER-DEFENSE & INFRASTRUCTURE',
    items: [
      { label: 'Spacecraft Cyber-Defense', href: '#cyber-defense', icon: Shield, desc: 'CCSDS SDLS AES-256, GNSS RAIM & crypto firewall' },
      { label: 'Access Control & Audit Trail', href: '#admin', icon: Shield, desc: 'Role-based authorization & operator logs' },
      { label: 'Data Flow Pipeline', href: '#data-pipeline', icon: Database, desc: 'Kafka/FastAPI/TimescaleDB ingestion pipeline' },
      { label: 'Technology Stack', href: '#technology', icon: Layers, desc: 'Astrodynamics & deep-space software suite' },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);
  const tzDropdownRef = useRef<HTMLDivElement>(null);

  const { wsConnected, timezone, setTimezone, timezoneOptions, currentClock } = useMission();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close timezone dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (tzDropdownRef.current && !tzDropdownRef.current.contains(e.target as Node)) {
        setTzDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  const activeTz = timezoneOptions.find((t) => t.code === timezone) || timezoneOptions[0];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-space-black/90 border-b border-cyan-glow/10 backdrop-blur-xl'
            : 'bg-gradient-to-b from-space-black/80 via-space-black/40 to-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <StarvantisLogo size={28} glow={true} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-space text-xs md:text-sm font-light tracking-[0.25em] text-star-white/95 group-hover:text-star-white transition-colors">
                STARVANTIS
              </span>
              <span className="font-inter text-[8px] text-muted-gray tracking-[0.2em] uppercase font-light hidden sm:block">
                Aerospace Intelligence
              </span>
            </div>
          </a>

          {/* Primary Quick Links (Desktop Wide) */}
          <div className="hidden xl:flex items-center gap-5">
            {PRIMARY_QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-space text-[11px] tracking-[0.15em] text-star-white/70 hover:text-cyan-glow transition-all uppercase font-medium hover:scale-105"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Elements: Timezone Selector, Live WebSocket & 3-Dash Menu Bar */}
          <div className="flex items-center gap-2.5">
            {/* Mission Timezone Epoch Selector */}
            <div className="relative hidden sm:block" ref={tzDropdownRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setTzDropdownOpen(!tzDropdownOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-cyan-glow/20 bg-space-navy/50 hover:bg-space-navy/80 hover:border-cyan-glow/40 transition-all flex items-center gap-2 cursor-pointer group shadow-[0_0_12px_rgba(99,199,255,0.08)]"
                title="Select Mission Timezone Epoch"
              >
                <Clock size={12} className="text-cyan-glow animate-pulse" />
                <span className="font-mono text-[11px] text-star-white font-medium tracking-wider" suppressHydrationWarning>
                  {currentClock || `${activeTz.code}`}
                </span>
                <ChevronDown
                  size={11}
                  className={`text-muted-gray transition-transform duration-300 ${
                    tzDropdownOpen ? 'rotate-180 text-cyan-glow' : ''
                  }`}
                />
              </div>

              {/* Timezone Dropdown */}
              <AnimatePresence>
                {tzDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-cyan-glow/30 bg-space-black/95 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(99,199,255,0.15)] py-2 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-glass-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-space tracking-wider uppercase text-cyan-glow font-bold">
                        <Globe size={11} />
                        <span>Mission Epoch Timezone</span>
                      </div>
                      <span className="text-[9px] text-muted-gray font-mono">{activeTz.utcOffset}</span>
                    </div>

                    <div className="py-1">
                      {timezoneOptions.map((opt) => {
                        const isSelected = opt.code === timezone;
                        return (
                          <div
                            key={opt.code}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setTimezone(opt.code);
                              setTzDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-glow/15 text-cyan-glow font-bold border-l-2 border-cyan-glow'
                                : 'text-star-white/70 hover:bg-space-navy/60 hover:text-star-white'
                            }`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-space font-medium tracking-wide">{opt.label}</span>
                                <span className="font-mono text-[9px] text-muted-gray bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                  {opt.utcOffset}
                                </span>
                              </div>
                              <span className="text-[9px] text-muted-gray font-inter mt-0.5 truncate max-w-[190px]">
                                {opt.center}
                              </span>
                            </div>
                            {isSelected && <Check size={13} className="text-cyan-glow flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live WebSocket & Telemetry Status Pill */}
            <div
              className="px-2.5 py-1.5 rounded-full border text-[9px] font-space tracking-wider uppercase flex items-center gap-1.5 transition-all border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
              title={wsConnected ? 'WebSocket 2-Way Real-time Stream Active' : 'Live 1Hz Keplerian Telemetry Stream Active (Auto-Syncing WS)'}
            >
              <Wifi size={11} className="animate-pulse text-emerald-400" />
              <span className="font-bold tracking-wider hidden sm:inline">{wsConnected ? 'LIVE 1Hz • WS' : 'LIVE 1Hz'}</span>
            </div>

            {/* 3-Dash Menu Bar Button (Permanent Mission Drawer Toggle) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="px-3 py-1.5 rounded-xl border border-cyan-glow/40 bg-cyan-glow/15 hover:bg-cyan-glow/25 text-star-white font-space text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_18px_rgba(99,199,255,0.25)] font-bold group"
              title="Open All Mission Navigation Sections"
            >
              {drawerOpen ? (
                <>
                  <X size={16} className="text-cyan-glow group-hover:rotate-90 transition-transform" />
                  <span className="text-[11px] uppercase">CLOSE</span>
                </>
              ) : (
                <>
                  <Menu size={16} className="text-cyan-glow group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] uppercase tracking-widest hidden sm:inline">SECTIONS</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 3-Dash Menu Bar Slide-Over Command Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex justify-end overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setDrawerOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl h-full bg-[#02050f]/95 border-l border-cyan-glow/30 p-6 md:p-8 overflow-y-auto flex flex-col justify-between shadow-[0_0_80px_rgba(0,0,0,0.95)]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between border-b border-glass-border pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <StarvantisLogo size={32} glow={true} />
                    <div>
                      <span className="font-space text-base tracking-[0.25em] text-star-white font-bold block">
                        STARVANTIS OPERATIONS
                      </span>
                      <span className="font-inter text-[10px] text-cyan-glow uppercase tracking-wider">
                        ALL 16 AEROSPACE SUBSYSTEMS &amp; MISSION CONSOLES
                      </span>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-star-white/70 hover:text-star-white transition-colors cursor-pointer border border-white/10"
                  >
                    <X size={20} />
                  </div>
                </div>

                {/* Categorized Mission Sections Grid */}
                <div className="space-y-6">
                  {CATEGORIZED_NAV.map((cat, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <span className="font-space text-[10px] tracking-[0.25em] text-cyan-glow uppercase font-bold block">
                        {cat.category}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={() => setDrawerOpen(false)}
                              className="p-3 rounded-2xl bg-space-navy/40 hover:bg-cyan-glow/15 border border-glass-border/70 hover:border-cyan-glow/50 transition-all group flex items-start gap-3"
                            >
                              <div className="p-2 rounded-xl bg-black/50 border border-white/5 text-cyan-glow group-hover:scale-110 transition-transform">
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-space text-xs text-star-white group-hover:text-cyan-glow font-bold block transition-colors">
                                  {item.label}
                                </span>
                                <span className="font-inter text-[10px] text-muted-gray leading-tight block mt-0.5">
                                  {item.desc}
                                </span>
                              </div>
                              <ArrowRight size={13} className="text-muted-gray group-hover:text-cyan-glow group-hover:translate-x-0.5 transition-all mt-1" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Status */}
              <div className="pt-6 mt-6 border-t border-glass-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-xs text-star-white/80">
                    EPOCH: {currentClock} ({timezone})
                  </span>
                </div>

                <a
                  href="#satellite-inspector"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-glow/20 hover:bg-cyan-glow/30 border border-cyan-glow/40 text-cyan-glow font-space text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(99,199,255,0.2)]"
                >
                  Enter Primary Flight Deck →
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
