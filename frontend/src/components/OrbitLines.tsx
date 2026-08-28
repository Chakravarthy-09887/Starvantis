'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface OrbitLinesProps {
  variant?: 'default' | 'grid' | 'transition';
  label?: string;
}

export default function OrbitLines({ variant = 'default', label }: OrbitLinesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-40px' });

  if (variant === 'grid') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.03 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 199, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 199, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full py-6 my-2 overflow-hidden flex items-center justify-center pointer-events-none">
      {/* Background Gradient Line */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/20 to-transparent" />

      {/* Kinetic Animated Laser Wavefront */}
      <motion.div
        className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-glow to-transparent"
        initial={{ width: '0%', opacity: 0 }}
        animate={isInView ? { width: ['0%', '100%', '0%'], opacity: [0, 0.8, 0], x: ['-50%', '0%', '50%'] } : {}}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '40%' }}
      />

      {/* Center Holographic Coordinate Reticle */}
      <motion.div
        className="relative z-10 flex items-center gap-3 px-4 py-1 rounded-full bg-[#05070B]/90 border border-cyan-glow/20 backdrop-blur-md shadow-[0_0_15px_rgba(0,212,255,0.15)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse" />
        <span className="font-space text-[9px] tracking-[0.3em] text-cyan-glow uppercase font-semibold">
          {label || 'ORBITAL VECTOR TRANSITION // SYS-SYNC'}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse" />
      </motion.div>
    </div>
  );
}
