'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  letterIndex: number;
  settled: boolean;
}

interface ParticleTitleRevealProps {
  progress: number;
  onRevealComplete?: () => void;
}

// Coordinate contours matching STARVANTIS with full, clear 'I'
const LETTER_COORDS = [
  // S (0)
  [
    [40, 20], [60, 20], [80, 20], [90, 30], [80, 45], [55, 52], [40, 65], [40, 80], [60, 88], [80, 88], [95, 80]
  ],
  // T (1)
  [
    [120, 20], [140, 20], [160, 20], [180, 20], [150, 20], [150, 35], [150, 52], [150, 70], [150, 88]
  ],
  // A (2)
  [
    [200, 88], [200, 54], [215, 20], [230, 20], [245, 20], [260, 54], [260, 88]
  ],
  // R (3)
  [
    [280, 88], [280, 54], [280, 20], [305, 20], [325, 30], [325, 45], [305, 55], [280, 55], [305, 70], [325, 88]
  ],
  // V (4)
  [
    [345, 20], [360, 54], [375, 88], [390, 54], [405, 20]
  ],
  // A (5) — Highlighted 'A' next to 'V'
  [
    [425, 88], [425, 54], [440, 20], [455, 20], [470, 20], [485, 54], [485, 88]
  ],
  // N (6)
  [
    [505, 88], [505, 54], [505, 20], [525, 54], [545, 88], [545, 54], [545, 20]
  ],
  // T (7)
  [
    [565, 20], [585, 20], [605, 20], [625, 20], [595, 20], [595, 35], [595, 52], [595, 70], [595, 88]
  ],
  // I (8) — Full Prominent Letter I with Top and Bottom Bars
  [
    [640, 20], [650, 20], [660, 20],
    [650, 32], [650, 44], [650, 56], [650, 68], [650, 80],
    [640, 88], [650, 88], [660, 88]
  ],
  // S (9)
  [
    [680, 20], [700, 20], [720, 20], [730, 30], [720, 45], [695, 52], [680, 65], [680, 80], [700, 88], [720, 88], [735, 80]
  ],
];

export default function ParticleTitleReveal({ progress, onRevealComplete }: ParticleTitleRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 200 });
  const revealCalledRef = useRef(false);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const scaleX = width / 780;
    const scaleY = height / 110;

    LETTER_COORDS.forEach((points, letterIdx) => {
      points.forEach(([px, py]) => {
        for (let i = 0; i < 15; i++) {
          const targetX = px * scaleX + (Math.random() - 0.5) * 4 * scaleX;
          const targetY = py * scaleY + (Math.random() - 0.5) * 4 * scaleY;
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            targetX,
            targetY,
            originX: Math.random() * width,
            originY: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 1.2 + Math.random() * 1.8,
            alpha: 0,
            targetAlpha: 0.75 + Math.random() * 0.25,
            letterIndex: letterIdx,
            settled: false,
          });
        }
      });
    });

    particlesRef.current = particles;
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      setDimensions({ width: w * dpr, height: h * dpr });
      initParticles(w * dpr, h * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  // Main Draw & Step update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initializedRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const revealProgress = Math.max(0, Math.min(1, (progress - 0.55) / 0.25));
    const particles = particlesRef.current;
    const totalLetters = LETTER_COORDS.length;

    particles.forEach((p) => {
      const letterThreshold = p.letterIndex / totalLetters;
      const letterProgress = Math.max(0, Math.min(1, (revealProgress - letterThreshold * 0.6) / 0.4));

      if (letterProgress > 0) {
        const ease = letterProgress * letterProgress;
        p.x += (p.targetX - p.x) * ease * 0.25;
        p.y += (p.targetY - p.y) * ease * 0.25;
        p.alpha += (p.targetAlpha - p.alpha) * ease * 0.2;

        if (Math.abs(p.x - p.targetX) < 1.5 && Math.abs(p.y - p.targetY) < 1.5) {
          p.settled = true;
        }
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, Math.min(0.25, p.alpha + (Math.random() - 0.5) * 0.02));

        if (p.x < 0) p.x = dimensions.width;
        if (p.x > dimensions.width) p.x = 0;
        if (p.y < 0) p.y = dimensions.height;
        if (p.y > dimensions.height) p.y = 0;
      }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      if (p.alpha <= 0.01) return;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.settled
        ? `rgba(255, 255, 255, ${p.alpha})`
        : `rgba(99, 199, 255, ${p.alpha * 0.8})`;
      ctx.fill();

      if (p.settled) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 199, 255, ${p.alpha * 0.25})`;
        ctx.fill();
      }
    });

    if (revealProgress >= 0.95 && !revealCalledRef.current) {
      revealCalledRef.current = true;
      onRevealComplete?.();
    }
  }, [progress, dimensions, onRevealComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    />
  );
}
