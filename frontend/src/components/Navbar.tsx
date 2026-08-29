'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Orbit, Wifi, Database, Clock, ChevronDown, Check, Globe } from 'lucide-react';
import StarvantisLogo from './StarvantisLogo';
import { useMission, TIMEZONE_OPTIONS, MissionTimezone } from '../context/MissionContext';

const NAV_LINKS = [
  { label: 'Mission', href: '#mission' },
  { label: 'Overview', href: '#overview' },
  { label: 'Primary Control', href: '#satellite-inspector' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'Space Weather', href: '#space-weather' },
  { label: 'Orbital Risk', href: '#orbital' },
  { label: 'Alerts', href: '#alerts' },
  { label: 'Admin', href: '#admin' },
  { label: 'Technology', href: '#technology' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const activeTz = timezoneOptions.find((t) => t.code === timezone) || timezoneOptions[0];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-space-black/90 border-b border-cyan-glow/8 backdrop-blur-xl'
            : 'bg-gradient-to-b from-space-black/70 via-space-black/30 to-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <StarvantisLogo size={30} glow={true} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-space text-xs md:text-sm font-light tracking-[0.3em] text-star-white/90 group-hover:text-star-white transition-colors">
                STARVANTIS
              </span>
              <span className="font-inter text-[8px] text-muted-gray tracking-[0.2em] uppercase font-light hidden sm:block">
                Aerospace Intelligence
              </span>
            </div>
          </a>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-space text-[11px] tracking-[0.2em] text-star-white/60 hover:text-cyan-glow transition-all uppercase font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Badges, Timezone Selector & Live Status */}
          <div className="hidden md:flex items-center gap-3">
            {/* Mission Timezone Selector & Live Clock */}
            <div className="relative" ref={tzDropdownRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setTzDropdownOpen(!tzDropdownOpen)}
                className="px-3 py-1.5 rounded-lg border border-cyan-glow/20 bg-space-navy/40 hover:bg-space-navy/70 hover:border-cyan-glow/40 transition-all flex items-center gap-2 cursor-pointer group shadow-[0_0_12px_rgba(99,199,255,0.08)]"
                title="Change Mission Epoch Timezone (UTC, IST, EST, PST, JST)"
              >
                <Clock size={12} className="text-cyan-glow animate-pulse" />
                <span className="font-mono text-[11px] text-star-white font-medium tracking-wider">
                  {currentClock || `${activeTz.code}`}
                </span>
                <ChevronDown size={11} className={`text-muted-gray transition-transform duration-300 ${tzDropdownOpen ? 'rotate-180 text-cyan-glow' : ''}`} />
              </div>

              {/* Timezone Dropdown Menu */}
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

            {/* Live WebSocket Status Badge */}
            <div
              className={`px-3 py-1.5 rounded-full border text-[10px] font-space tracking-wider uppercase flex items-center gap-1.5 transition-all ${
                wsConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              }`}
              title={wsConnected ? 'Connected to FastAPI Live Telemetry WebSocket' : 'Connecting to WebSocket...'}
            >
              <Wifi size={11} className={wsConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'} />
              <span className="font-semibold">{wsConnected ? 'LIVE WS (1Hz)' : 'CONNECTING WS'}</span>
            </div>

            {/* TimescaleDB Badge */}
            <div
              className="px-2.5 py-1.5 rounded-full border border-glass-border/40 bg-space-navy/30 text-muted-gray text-[9px] font-space tracking-wider uppercase flex items-center gap-1.5 hidden xl:flex"
              title="PostgreSQL on Render with TimescaleDB time-series hypertables"
            >
              <Database size={10} className="text-cyan-glow/70" />
              <span>POSTGRESQL CLOUD</span>
            </div>

            <a
              href="#satellite-inspector"
              className="px-3.5 py-1.5 rounded-md border border-cyan-glow/25 bg-cyan-glow/10 hover:bg-cyan-glow/20 text-star-white font-space text-[10px] tracking-[0.15em] uppercase transition-all flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(99,199,255,0.2)]"
            >
              <Orbit size={12} className="text-cyan-glow animate-spin" style={{ animationDuration: '10s' }} />
              <span>Command Deck</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-star-white/60 hover:text-star-white transition-colors p-2 cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-space-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StarvantisLogo size={56} className="mb-4" />
            <span className="font-space text-lg font-light tracking-[0.3em] text-star-white/90">STARVANTIS</span>

            {/* Mobile Timezone Selector */}
            <div className="w-full max-w-xs bg-space-navy/50 rounded-xl p-3 border border-cyan-glow/20 flex flex-col gap-2">
              <span className="text-[10px] font-space tracking-wider uppercase text-cyan-glow flex items-center gap-1.5">
                <Clock size={11} /> Timezone: {activeTz.label} ({currentClock})
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {timezoneOptions.map((opt) => (
                  <div
                    key={opt.code}
                    role="button"
                    tabIndex={0}
                    onClick={() => setTimezone(opt.code)}
                    className={`px-2 py-1 text-center rounded text-[10px] font-space font-medium cursor-pointer transition-colors ${
                      opt.code === timezone ? 'bg-cyan-glow text-space-black font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {opt.code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 my-4">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-space text-sm tracking-[0.2em] text-star-white/50 hover:text-star-white transition-colors uppercase font-light"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            <a
              href="#satellite-inspector"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2.5 rounded-md border border-cyan-glow/30 bg-cyan-glow/15 text-star-white font-space text-xs tracking-[0.15em] uppercase mt-4 font-bold shadow-[0_0_20px_rgba(99,199,255,0.25)]"
            >
              Enter Primary Mission Control
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
