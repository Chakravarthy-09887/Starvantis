'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ExhaustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

type SpacecraftMode = 'cruise' | 'threat' | 'interactive' | 'science' | 'landing';

export default function SpacecraftCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    // Only run on fine-pointer devices (desktop mice / trackpads)
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const mouse = { x: width / 2, y: height / 2, active: false };
    const ship = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      speed: 0,
      opacity: 1.0,
      scale: 1.0,
    };

    let isMouseDown = false;
    let currentMode: SpacecraftMode = 'cruise';

    const particles: ExhaustParticle[] = [];
    const ripples: ClickRipple[] = [];

    // Lightweight target evaluator directly from event without forced reflow
    const evaluateTarget = (target: EventTarget | null): SpacecraftMode => {
      if (!target || !(target instanceof HTMLElement)) return 'cruise';

      if (target.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer')) {
        return 'interactive';
      }
      if (target.closest('#cyber-defense, #alerts, [data-threat="true"]')) {
        return 'threat';
      }
      if (target.closest('#anomaly-center, #satellite-inspector, #telemetry, #cosmic-explorer')) {
        return 'science';
      }
      if (target.closest('#landing, #edl, #surface, #topography')) {
        return 'landing';
      }
      return 'cruise';
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      currentMode = evaluateTarget(e.target);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const rippleColor =
        currentMode === 'threat'
          ? '#ff3b3b'
          : currentMode === 'science'
          ? '#00ffcc'
          : currentMode === 'landing'
          ? '#f59e0b'
          : '#00d4ff';

      if (ripples.length < 6) {
        ripples.push({
          x: mouse.x,
          y: mouse.y,
          radius: 6,
          maxRadius: 48,
          alpha: 0.85,
          color: rippleColor,
        });
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleMouseEnter = () => {
      mouse.active = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    const MODE_THEMES = {
      cruise: {
        primary: '#00d4ff',
        secondary: '#63c7ff',
        glow: 'rgba(0, 212, 255, 0.45)',
        engine: '#00f0ff',
        hullBase: '#0b1928',
        core: '#ffffff',
      },
      threat: {
        primary: '#ff3b3b',
        secondary: '#ff7373',
        glow: 'rgba(255, 59, 59, 0.55)',
        engine: '#ff2200',
        hullBase: '#25080b',
        core: '#fff0f0',
      },
      interactive: {
        primary: '#38bdf8',
        secondary: '#a5f3fc',
        glow: 'rgba(56, 189, 248, 0.6)',
        engine: '#67e8f9',
        hullBase: '#0c2236',
        core: '#ffffff',
      },
      science: {
        primary: '#10b981',
        secondary: '#34d399',
        glow: 'rgba(16, 185, 129, 0.5)',
        engine: '#059669',
        hullBase: '#052219',
        core: '#ecfdf5',
      },
      landing: {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.55)',
        engine: '#ea580c',
        hullBase: '#271705',
        core: '#fffbeb',
      },
    };

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      if (!mouse.active) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Fast, responsive position tracking with zero lag
      const dx = mouse.x - ship.x;
      const dy = mouse.y - ship.y;

      ship.vx = dx * 0.45;
      ship.vy = dy * 0.45;

      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.speed = Math.hypot(ship.vx, ship.vy);

      if (ship.speed > 0.4) {
        ship.targetAngle = Math.atan2(ship.vy, ship.vx) + Math.PI / 2;
      } else {
        ship.targetAngle = -Math.PI / 2 + Math.sin(time * 0.9) * 0.06;
      }

      let angleDiff = ship.targetAngle - ship.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      ship.angle += angleDiff * 0.35;

      const targetOpacity = isMouseDown ? 0.35 : 0.95;
      ship.opacity += (targetOpacity - ship.opacity) * 0.3;

      const targetScale = isMouseDown ? 0.88 : currentMode === 'interactive' ? 1.18 : 1.0;
      ship.scale += (targetScale - ship.scale) * 0.25;

      const theme = MODE_THEMES[currentMode];

      // Spawn thruster particles (capped to 25 to prevent memory churn)
      if (particles.length < 22) {
        const engineOffsetX = Math.sin(ship.angle) * 12;
        const engineOffsetY = -Math.cos(ship.angle) * 12;
        const spread = (Math.random() - 0.5) * 0.4;
        const pSpeed = Math.random() * (ship.speed * 0.3 + 2.0) + 1.2;

        particles.push({
          x: ship.x + engineOffsetX,
          y: ship.y + engineOffsetY,
          vx: Math.sin(ship.angle + Math.PI + spread) * pSpeed,
          vy: -Math.cos(ship.angle + Math.PI + spread) * pSpeed,
          size: Math.random() * 2.5 + 1.0,
          alpha: (isMouseDown ? 0.2 : 0.8) * (Math.random() * 0.4 + 0.6),
          maxLife: 10,
          life: 0,
          color: Math.random() < 0.4 ? theme.engine : theme.primary,
        });
      }

      // Render Exhaust Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - lifeRatio);

        if (lifeRatio >= 1 || currentAlpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
        ctx.restore();
      }

      // Render Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 2.8;
        rip.alpha *= 0.90;

        if (rip.alpha <= 0.02 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = rip.alpha;
        ctx.stroke();
        ctx.restore();
      }

      // Render Spacecraft Hull
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.scale(ship.scale, ship.scale);
      ctx.globalAlpha = ship.opacity;

      // Fuselage
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(11, 10);
      ctx.lineTo(6, 12);
      ctx.lineTo(3, 8);
      ctx.lineTo(0, 11);
      ctx.lineTo(-3, 8);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-11, 10);
      ctx.closePath();

      const hullGrad = ctx.createLinearGradient(0, -18, 0, 12);
      hullGrad.addColorStop(0, '#ffffff');
      hullGrad.addColorStop(0.4, theme.secondary);
      hullGrad.addColorStop(1, theme.hullBase);
      ctx.fillStyle = hullGrad;
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Cockpit Core
      ctx.beginPath();
      ctx.ellipse(0, -4, 2.4, 5.0, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme.core;
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Thruster Flame
      const flameLength = 7 + ship.speed * 1.5;
      ctx.beginPath();
      ctx.moveTo(-2.5, 9);
      ctx.lineTo(0, 9 + flameLength);
      ctx.lineTo(2.5, 9);
      ctx.closePath();
      ctx.fillStyle = theme.engine;
      ctx.fill();

      // Interactive Mode Reticle
      if (currentMode === 'interactive') {
        const bs = 20;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(-bs, -bs + 5);
        ctx.lineTo(-bs, -bs);
        ctx.lineTo(-bs + 5, -bs);
        ctx.moveTo(bs - 5, -bs);
        ctx.lineTo(bs, -bs);
        ctx.lineTo(bs, -bs + 5);
        ctx.moveTo(-bs, bs - 5);
        ctx.lineTo(-bs, bs);
        ctx.lineTo(-bs + 5, bs);
        ctx.moveTo(bs - 5, bs);
        ctx.lineTo(bs, bs);
        ctx.lineTo(bs, bs - 5);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isClient]);

  if (!isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-screen h-screen"
      style={{
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    />
  );
}
