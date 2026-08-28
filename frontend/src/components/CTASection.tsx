'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [hovered, setHovered] = useState(false);

  return (
    <section className="section-spacing relative overflow-hidden py-28 md:py-36 bg-[#020509]" ref={containerRef}>
      {/* Background Orbital Constellation Backdrop */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        {/* Background Radial Glow */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,199,255,0.12)_0%,rgba(2,5,9,0.95)_75%)] blur-2xl" />

        {/* Orbit Ring 1: Outer GEO Equatorial Orbit */}
        <motion.div
          className="absolute w-[680px] h-[680px] md:w-[880px] md:h-[880px] rounded-full border border-cyan-glow/15"
          animate={{ rotate: 360, scale: hovered ? 1.04 : 1 }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
            scale: { duration: 0.8 },
          }}
        >
          {/* Orbiting Satellite Node */}
          <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rounded-full bg-cyan-glow shadow-[0_0_15px_#00d4ff] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
        </motion.div>

        {/* Orbit Ring 2: Inclined Polar SSO Orbit (Rotated Ellipse) */}
        <motion.div
          className="absolute w-[480px] h-[320px] md:w-[700px] md:h-[400px] rounded-[50%] border border-dashed border-emerald-400/25"
          style={{ transform: 'rotate(-32deg)' }}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1.5 left-1/4 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
          </motion.div>
        </motion.div>

        {/* Orbit Ring 3: Deep Space Transfer Orbit (Opposite Tilt) */}
        <motion.div
          className="absolute w-[380px] h-[240px] md:w-[560px] md:h-[300px] rounded-[50%] border border-cyan-glow/20"
          style={{ transform: 'rotate(28deg)' }}
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -bottom-1.5 right-1/4 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b]" />
          </motion.div>
        </motion.div>

        {/* Center Orbital Core Reticle */}
        <div className="absolute w-[200px] h-[200px] rounded-full border border-dotted border-cyan-glow/25 flex items-center justify-center">
          <div className="w-[100px] h-[100px] rounded-full border border-cyan-glow/20 animate-ping" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      {/* Top & Bottom Ephemeris Badges (Safe Edge Boundaries) */}
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative z-10 pointer-events-none mb-6">
        <span className="text-[10px] font-space text-cyan-glow/40 tracking-widest hidden sm:inline-block">
          SGP4 // ORBITAL INCLINATION 51.64°
        </span>
        <span className="text-[10px] font-space text-emerald-400/40 tracking-widest hidden sm:inline-block">
          CONSTELLATION LEO • 50 Hz TELEMETRY
        </span>
      </div>

      {/* Strict Aligned Center Column Card */}
      <div className="max-w-3xl mx-auto relative z-10 px-4 md:px-6">
        <motion.div
          className="p-8 md:p-14 rounded-3xl border border-cyan-glow/20 bg-black/60 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center flex flex-col items-center justify-center space-y-6"
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-glow/25 bg-space-navy/90 shadow-[0_0_20px_rgba(99,199,255,0.15)]">
            <Sparkles size={13} className="text-cyan-glow animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.35em] text-cyan-glow uppercase font-semibold">
              Operational Fleet Access
            </span>
          </div>

          {/* Heading with crisp spacing & leading */}
          <div className="space-y-3 w-full">
            <h2 className="font-space text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-star-white leading-tight">
              SEE THE WHOLE PICTURE.
            </h2>
            <p className="font-space text-base sm:text-lg md:text-xl text-cyan-glow tracking-[0.2em] md:tracking-[0.25em] uppercase font-light leading-snug">
              ENTER STARVANTIS MISSION CONTROL
            </p>
          </div>

          {/* Description Paragraph */}
          <p className="font-inter text-xs sm:text-sm text-star-white/70 max-w-lg mx-auto leading-relaxed font-light">
            Experience next-generation aerospace telemetry fusion, AI anomaly prediction, and automated orbital threat protection across your entire constellation.
          </p>

          {/* Animated Horizon Accent Line */}
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent my-2"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Interactive Button */}
          <div className="pt-2">
            <a
              href="#satellite-inspector"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="group inline-flex items-center gap-4 px-8 py-4 rounded-full border border-cyan-glow/50 bg-cyan-glow/15 hover:bg-cyan-glow/25 text-star-white font-space text-xs md:text-sm tracking-[0.3em] uppercase transition-all duration-500 shadow-[0_0_35px_rgba(0,212,255,0.25)] hover:shadow-[0_0_60px_rgba(0,212,255,0.5)] cursor-pointer"
            >
              <span>ENTER MISSION CONTROL</span>
              <ArrowRight size={16} className="text-cyan-glow group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
