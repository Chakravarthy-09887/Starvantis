'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Network, ArrowRight, CheckCircle2 } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: '1', title: 'TELEMETRY', desc: 'Raw RF downlinks & sensor telemetry ingest' },
  { id: '2', title: 'VALIDATION', desc: 'Frame CRC check, timestamp sync & calibration' },
  { id: '3', title: 'TIME-SERIES DATA', desc: 'High-throughput TimescaleDB storage & caching' },
  { id: '4', title: 'AI ANOMALY', desc: 'Transformer-based multi-signal residual detector' },
  { id: '5', title: 'ORBITAL ANALYSIS', desc: 'SGP4 ephemeris & conjunction radar fusion' },
  { id: '6', title: 'MISSION RISK FUSION', desc: 'Cross-domain operational risk score synthesis' },
  { id: '7', title: 'ALERT ENGINE', desc: 'Threshold triggers & priority notification queue' },
  { id: '8', title: 'MISSION CONTROL', desc: 'Real-time situational HUD & maneuver console' },
];

export default function DataFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="data-pipeline" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <Network size={13} className="text-cyan-glow" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase">
              End-to-End Processing Architecture
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            DATA FLOW PIPELINE
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            From raw satellite RF downlink packets to explainable mission-risk decisions in under 250 milliseconds.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* Pipeline Stage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive = activeStep === idx;
            const isPassed = activeStep > idx;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
                  isActive
                    ? 'border-cyan-glow bg-cyan-glow/15 shadow-[0_0_25px_rgba(0,212,255,0.25)] scale-[1.02]'
                    : isPassed
                    ? 'border-glass-border bg-white/[0.02]'
                    : 'border-glass-border/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-space text-xs font-bold text-cyan-glow">0{stage.id}</span>
                    {isActive ? (
                      <div className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
                    ) : isPassed ? (
                      <CheckCircle2 size={13} className="text-cyan-glow/60" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-gray/40" />
                    )}
                  </div>
                  <h4 className="font-space text-sm font-medium text-star-white tracking-wide mb-1.5">
                    {stage.title}
                  </h4>
                  <p className="font-inter text-xs text-muted-gray leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-glass-border/40 flex items-center justify-between text-[10px] font-space text-muted-gray">
                  <span>STAGE {idx + 1} / 8</span>
                  <span className={isActive ? 'text-cyan-glow' : ''}>{isActive ? 'PROCESSING...' : 'READY'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
