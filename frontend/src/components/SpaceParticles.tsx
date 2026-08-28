'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  width: number;
  height: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

// Deterministic pseudo-random generator to guarantee 100% identical SSR & Client hydration
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999.1234) * 10000;
  return x - Math.floor(x);
}

export default function SpaceParticles({ count = 30 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.25 }} />;
  }

  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    width: Number((pseudoRandom(i * 1.1 + 1) * 2 + 0.5).toFixed(2)),
    height: Number((pseudoRandom(i * 2.3 + 2) * 2 + 0.5).toFixed(2)),
    left: Number((pseudoRandom(i * 3.7 + 3) * 100).toFixed(2)),
    top: Number((pseudoRandom(i * 4.9 + 4) * 100).toFixed(2)),
    delay: Number((pseudoRandom(i * 5.3 + 5) * 8).toFixed(2)),
    duration: Number((6 + pseudoRandom(i * 6.7 + 6) * 8).toFixed(2)),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.25 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            background: 'rgba(99, 199, 255, 0.4)',
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
