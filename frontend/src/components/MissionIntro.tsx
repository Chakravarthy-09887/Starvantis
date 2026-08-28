'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Radio, Shield, Thermometer, Zap, Navigation, Wifi, Satellite, Trash2, GitBranch, Clock, Ruler, AlertTriangle, ShieldAlert } from 'lucide-react';

const INSIDE_ITEMS = [
  { icon: Radio, label: 'Telemetry Stream Ingestion (100 Hz)', detail: 'Multi-frequency bus packets' },
  { icon: Thermometer, label: 'Thermal Loop Dissipation & MLI', detail: 'Subsystem temperature gradient monitoring' },
  { icon: Zap, label: 'Electrical Power System (28V Bus)', detail: 'Battery depth of discharge & solar array health' },
  { icon: Navigation, label: 'Attitude Determination (ADCS)', detail: 'Reaction wheels & star tracker quaternion state' },
  { icon: Wifi, label: 'X/Ka-Band Ground Communications', detail: 'Downlink SNR & telemetry packet integrity' },
  { icon: Shield, label: 'AI Anomaly Predictive Residuals', detail: 'Subsystem health drift projection model' },
];

const BEYOND_ITEMS = [
  { icon: Satellite, label: 'Constellation Orbit Tracking (LEO)', detail: 'High-precision SGP4 ephemeris state vectors' },
  { icon: Trash2, label: 'Uncooperative Space Debris Trackers', detail: 'Non-maneuverable fragmented debris cloud monitoring' },
  { icon: GitBranch, label: 'SGP4 Ephemeris Intersect Vectors', detail: 'Covariance ellipsoids & relative velocity' },
  { icon: Ruler, label: 'Sub-Kilometer Closest Approach', detail: 'Radial, in-track, cross-track miss distances' },
  { icon: Clock, label: 'Time of Closest Approach (TCA)', detail: 'Conjunction countdown timer & epoch sync' },
  { icon: AlertTriangle, label: 'Collision Probability (Pc) Assessment', detail: 'Foster-1992 2D/3D collision risk computation' },
];

export default function MissionIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="mission" className="section-spacing relative overflow-hidden py-24 md:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Main heading */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-glow/20 bg-space-navy/60 mb-4 shadow-[0_0_15px_rgba(99,199,255,0.15)]">
            <span className="font-space text-xs tracking-[0.3em] text-cyan-glow uppercase font-semibold">
              The Dual Mission Intelligence Paradigm
            </span>
          </div>
          <h2 className="font-space text-3xl md:text-5xl lg:text-6xl font-extralight tracking-wide text-star-white">
            The Spacecraft Is Only
          </h2>
          <h2 className="font-space text-3xl md:text-5xl lg:text-6xl font-extralight tracking-wide text-cyan-glow mt-1 text-glow">
            Half the Story.
          </h2>
          <p className="font-inter text-sm md:text-base text-star-white/60 mt-5 max-w-3xl mx-auto leading-relaxed font-light">
            Starvantis continuously monitors internal spacecraft health and subsystem degradation while simultaneously modeling the hostile orbital environment around it.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-5"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* Enhanced Spacious Two Columns Grid (Generous Column Spacing) */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-stretch relative">
          {/* Subtle Vertical Center Divider */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-[85%] bg-gradient-to-b from-transparent via-cyan-glow/25 to-transparent pointer-events-none" />

          {/* Column 1: Inside the Spacecraft */}
          <motion.div
            className="rounded-3xl p-7 md:p-10 border border-cyan-glow/20 bg-[#060c14]/90 shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: -35 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-8 border-b border-cyan-glow/15 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-glow animate-pulse shadow-[0_0_10px_#63c7ff]" />
                  <h3 className="font-space text-sm md:text-base tracking-[0.25em] text-cyan-glow uppercase font-bold">
                    Inside the Spacecraft
                  </h3>
                </div>
                <span className="text-[10px] font-space px-2.5 py-0.5 rounded bg-cyan-glow/10 border border-cyan-glow/25 text-cyan-glow">
                  HEALTH ENGINE
                </span>
              </div>

              {/* Items List with Generous Vertical Spacing */}
              <div className="space-y-5">
                {INSIDE_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="p-3.5 rounded-2xl border border-cyan-glow/10 bg-space-navy/40 hover:border-cyan-glow/30 transition-all flex items-start gap-4 group"
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.07 }}
                  >
                    <div className="p-2 rounded-xl border border-cyan-glow/20 bg-cyan-glow/10 group-hover:border-cyan-glow/50 transition-all shrink-0 mt-0.5">
                      <item.icon size={18} className="text-cyan-glow" />
                    </div>
                    <div>
                      <h4 className="font-inter text-sm md:text-base text-star-white font-medium group-hover:text-cyan-glow transition-colors">
                        {item.label}
                      </h4>
                      <p className="font-inter text-xs text-star-white/50 mt-0.5 font-light">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-cyan-glow/10 flex items-center justify-between text-xs font-space text-star-white/40">
              <span>STATUS: SENSOR STREAM ONLINE</span>
              <span className="text-cyan-glow font-medium">98.4% NOMINAL</span>
            </div>
          </motion.div>

          {/* Column 2: Beyond the Spacecraft */}
          <motion.div
            className="rounded-3xl p-7 md:p-10 border border-amber-500/20 bg-[#060c14]/90 shadow-[0_0_40px_rgba(4,18,34,0.7)] flex flex-col justify-between"
            initial={{ opacity: 0, x: 35 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-8 border-b border-amber-500/15 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" />
                  <h3 className="font-space text-sm md:text-base tracking-[0.25em] text-amber-400 uppercase font-bold">
                    Beyond the Spacecraft
                  </h3>
                </div>
                <span className="text-[10px] font-space px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">
                  THREAT RADAR
                </span>
              </div>

              {/* Items List with Generous Vertical Spacing */}
              <div className="space-y-5">
                {BEYOND_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="p-3.5 rounded-2xl border border-amber-500/10 bg-space-navy/40 hover:border-amber-500/30 transition-all flex items-start gap-4 group"
                    initial={{ opacity: 0, x: 16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.07 }}
                  >
                    <div className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/10 group-hover:border-amber-500/50 transition-all shrink-0 mt-0.5">
                      <item.icon size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-inter text-sm md:text-base text-star-white font-medium group-hover:text-amber-400 transition-colors">
                        {item.label}
                      </h4>
                      <p className="font-inter text-xs text-star-white/50 mt-0.5 font-light">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-amber-500/10 flex items-center justify-between text-xs font-space text-star-white/40">
              <span>ACTIVE DEBRIS OBJECTS: 128</span>
              <span className="text-amber-400 font-medium">CONJUNCTIONS: 2 CRITICAL</span>
            </div>
          </motion.div>
        </div>

        {/* Section Prototype Disclaimer Footer */}
        <div className="mt-12 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md text-[10px] font-space text-star-white/40 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            <span>EDUCATIONAL PROTOTYPE — NOT YET CERTIFIED FOR OPERATIONAL GUIDANCE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
