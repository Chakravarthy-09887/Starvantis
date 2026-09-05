'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Layers, Server, Database, Brain, Cpu, Radio, Shield, Container } from 'lucide-react';

const ARCHITECTURE_LAYERS = [
  {
    layer: 'PRESENTATION & VISUALIZATION',
    icon: Layers,
    items: [
      { name: 'React 18 / Next.js 14', role: 'Server-side rendered mission dashboard & edge routing' },
      { name: 'Three.js / WebGL', role: 'Hardware-accelerated 3D orbital & digital twin CAD rendering' },
      { name: 'Tailwind CSS / Canvas', role: 'High-precision aerospace telemetry HUD styling' },
    ],
  },
  {
    layer: 'INTELLIGENCE & ML INFERENCE',
    icon: Brain,
    items: [
      { name: 'PyTorch / Transformers', role: 'Multi-variate time-series telemetry anomaly detection' },
      { name: 'scikit-learn', role: 'Kalman filtering & probabilistic collision prediction (Pc)' },
      { name: 'FastAPI / Python Async', role: 'Microsecond ephemeris propagation & telemetry endpoints' },
    ],
  },
  {
    layer: 'DATA STORAGE & TELEMETRY STREAMING',
    icon: Database,
    items: [
      { name: 'TimescaleDB / PostgreSQL', role: 'High-throughput petabyte time-series telemetry storage' },
      { name: 'Redis Streams / PubSub', role: 'In-memory telemetry caching & real-time message bus' },
      { name: 'WebSockets / gRPC', role: 'Sub-50ms bidirectional mission control streaming' },
    ],
  },
  {
    layer: 'INFRASTRUCTURE & ORCHESTRATION',
    icon: Container,
    items: [
      { name: 'Docker / Kubernetes', role: 'Containerized ground station & edge node orchestration' },
      { name: 'TypeScript Strict', role: 'Zero-runtime-error aerospace command validation' },
      { name: 'SGP4 / Astrodynamics SDK', role: 'High-fidelity two-line element orbit propagations' },
    ],
  },
];

export default function TechnologyStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  return (
    <section id="technology" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-4">
            <Cpu size={15} className="text-cyan-glow" />
            <span className="font-space text-[11px] tracking-[0.3em] text-cyan-glow uppercase">
              Aerospace Software Engineering
            </span>
          </div>
          <h2 className="font-space text-3xl md:text-5xl lg:text-6xl font-light tracking-wide text-star-white">
            TECHNOLOGY STACK
          </h2>
          <p className="font-inter text-sm md:text-base text-muted-gray mt-4 max-w-2xl mx-auto leading-relaxed">
            Modular engineering architecture designed for mission-critical reliability, sub-second telemetry ingestion, and continuous ML inference.
          </p>
          <motion.div
            className="w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-5"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* 4 Architectural Layers */}
        <div className="grid md:grid-cols-2 gap-8">
          {ARCHITECTURE_LAYERS.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.layer}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 * idx, duration: 0.7 }}
                className="glass-panel rounded-3xl p-8 md:p-10 border border-glass-border space-y-7"
              >
                <div className="flex items-center gap-4 border-b border-glass-border pb-5">
                  <div className="w-11 h-11 rounded-xl glass-panel border border-cyan-glow/30 flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-cyan-glow" />
                  </div>
                  <div>
                    <span className="font-space text-[10px] text-cyan-glow tracking-[0.25em] uppercase block mb-0.5">LAYER 0{idx + 1}</span>
                    <h3 className="font-space text-base md:text-lg font-semibold text-star-white leading-tight">{layer.layer}</h3>
                  </div>
                </div>

                <div className="space-y-5">
                  {layer.items.map((item) => (
                    <div key={item.name} className="glass-panel p-5 rounded-xl border border-glass-border/40 space-y-2">
                      <span className="font-space text-sm md:text-base font-semibold text-star-white block text-glow">
                        {item.name}
                      </span>
                      <p className="font-inter text-sm text-muted-gray leading-relaxed">
                        {item.role}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
