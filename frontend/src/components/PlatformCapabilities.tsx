'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Brain, Box, Globe, Crosshair, Gauge, ArrowUpRight } from 'lucide-react';

const CAPABILITIES = [
  {
    num: '01',
    title: 'TELEMETRY INTELLIGENCE',
    desc: 'High-frequency telemetry stream ingestion with automated calibration, dynamic range bounds, and drift detection across power, thermal, and attitude subsystems.',
    icon: Activity,
    color: '#00d4ff',
    stats: '100k+ samples/sec',
  },
  {
    num: '02',
    title: 'AI ANOMALY DETECTION',
    desc: 'Deep transformer neural networks isolating sub-threshold multi-variate signal correlations to predict hardware failures hours before hard alarms trigger.',
    icon: Brain,
    color: '#ff3b3b',
    stats: '99.4% precision',
  },
  {
    num: '03',
    title: 'DIGITAL TWIN',
    desc: 'Real-time cyber-physical virtual spacecraft mirroring internal components, power states, battery thermal dissipation, and structural integrity in 3D.',
    icon: Box,
    color: '#40e8ff',
    stats: '42ms sync latency',
  },
  {
    num: '04',
    title: 'ORBITAL INTELLIGENCE',
    desc: 'Comprehensive low Earth orbit situational tracking fusing SGP4 ephemerides, radar observations, and space debris conjunction risk analytics.',
    icon: Globe,
    color: '#ff8c00',
    stats: '10,000+ objects tracked',
  },
  {
    num: '05',
    title: 'CONJUNCTION ANALYSIS',
    desc: 'Sub-kilometer closest-approach miss distance calculation with time-of-closest-approach (TCA) forecasting and optimal avoidance burn maneuver computation.',
    icon: Crosshair,
    color: '#ffd700',
    stats: '7.2 km TCA alert',
  },
  {
    num: '06',
    title: 'MISSION RISK FUSION',
    desc: 'Proprietary fusion architecture correlating internal spacecraft subsystem degradation with external orbital collision threats into a single explainable score.',
    icon: Gauge,
    color: '#00d4ff',
    stats: 'Unified 0-100 score',
  },
];

export default function PlatformCapabilities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  return (
    <section id="capabilities" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase">
              Core Aerospace Intelligence Stack
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            PLATFORM CAPABILITIES
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Six pillars of autonomous space mission resilience engineered for commercial constellations and defense orbital assets.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* 6 Capabilities Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.num}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i, duration: 0.7 }}
                className="glass-panel rounded-3xl p-8 border border-glass-border hover:border-cyan-glow/40 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Glow Accent Top Right */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: `${cap.color}20` }}
                />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-space text-3xl font-light text-star-white/30 group-hover:text-cyan-glow transition-colors">
                      {cap.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl glass-panel border border-glass-border flex items-center justify-center group-hover:border-cyan-glow/50 transition-colors">
                      <Icon size={20} style={{ color: cap.color }} />
                    </div>
                  </div>

                  <h3 className="font-space text-lg text-star-white font-medium tracking-wide mb-3 group-hover:text-cyan-glow transition-colors">
                    {cap.title}
                  </h3>

                  <p className="font-inter text-xs md:text-sm text-muted-gray leading-relaxed mb-6">
                    {cap.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-glass-border/60 flex items-center justify-between">
                  <span className="font-space text-[11px] text-cyan-glow/80">{cap.stats}</span>
                  <ArrowUpRight size={16} className="text-muted-gray group-hover:text-cyan-glow group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
