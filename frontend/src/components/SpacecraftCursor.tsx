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
  type: 'ion' | 'spark' | 'stardust' | 'dust';
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

    // Only enable on pointer-enabled desktop systems
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
      roll: 0,
      speed: 0,
      opacity: 1.0,
      scale: 1.0,
    };

    let isMouseDown = false;
    let currentMode: SpacecraftMode = 'cruise';

    const particles: ExhaustParticle[] = [];
    const ripples: ClickRipple[] = [];

    const evaluateTarget = (target: EventTarget | null): SpacecraftMode => {
      if (!target || !(target instanceof HTMLElement)) return 'cruise';

      if (target.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer')) {
        return 'interactive';
      }
      if (target.closest('#cyber-defense, #alerts, [data-threat="true"]')) {
        return 'threat';
      }
      if (target.closest('#cosmic-explorer, #anomaly-center, #satellite-inspector, #telemetry, #deep-space')) {
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
          ? '#10b981'
          : currentMode === 'landing'
          ? '#f59e0b'
          : currentMode === 'interactive'
          ? '#38bdf8'
          : '#00d4ff';

      if (ripples.length < 5) {
        ripples.push({
          x: mouse.x,
          y: mouse.y,
          radius: 5,
          maxRadius: 46,
          alpha: 0.9,
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
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

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
        glow: 'rgba(255, 59, 59, 0.6)',
        engine: '#ff2200',
        hullBase: '#25080b',
        core: '#fff0f0',
      },
      interactive: {
        primary: '#38bdf8',
        secondary: '#a5f3fc',
        glow: 'rgba(56, 189, 248, 0.65)',
        engine: '#67e8f9',
        hullBase: '#0c2236',
        core: '#ffffff',
      },
      science: {
        primary: '#10b981',
        secondary: '#34d399',
        glow: 'rgba(16, 185, 129, 0.55)',
        engine: '#059669',
        hullBase: '#052219',
        core: '#ecfdf5',
      },
      landing: {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.6)',
        engine: '#ea580c',
        hullBase: '#271705',
        core: '#fffbeb',
      },
    };

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.035;
      ctx.clearRect(0, 0, width, height);

      if (!mouse.active) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth 120 FPS high-refresh rate physics interpolation
      const dx = mouse.x - ship.x;
      const dy = mouse.y - ship.y;

      ship.vx = dx * 0.48;
      ship.vy = dy * 0.48;

      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.speed = Math.hypot(ship.vx, ship.vy);

      // Dynamic orientation & banking angle
      if (ship.speed > 0.4) {
        ship.targetAngle = Math.atan2(ship.vy, ship.vx) + Math.PI / 2;
      } else {
        ship.targetAngle = -Math.PI / 2 + Math.sin(time * 1.2) * 0.05;
      }

      let angleDiff = ship.targetAngle - ship.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      ship.angle += angleDiff * 0.38;

      // 3D Banking roll based on turn rate
      ship.roll = Math.max(-0.45, Math.min(0.45, angleDiff * 1.8));

      const targetOpacity = isMouseDown ? 0.32 : 0.95;
      ship.opacity += (targetOpacity - ship.opacity) * 0.32;

      const targetScale = isMouseDown ? 0.88 : currentMode === 'interactive' ? 1.22 : 1.0;
      ship.scale += (targetScale - ship.scale) * 0.28;

      const theme = MODE_THEMES[currentMode];

      // -------------------------------------------------------------
      // 1. UNIQUE MODE-SPECIFIC ENGINE PARTICLE SPAWNING
      // -------------------------------------------------------------
      if (particles.length < 28) {
        // Dual Nacelle Thruster Offsets
        const leftEngineX = Math.sin(ship.angle) * 11 + Math.cos(ship.angle) * 6;
        const leftEngineY = -Math.cos(ship.angle) * 11 + Math.sin(ship.angle) * 6;
        const rightEngineX = Math.sin(ship.angle) * 11 - Math.cos(ship.angle) * 6;
        const rightEngineY = -Math.cos(ship.angle) * 11 - Math.sin(ship.angle) * 6;

        const pSpeed = Math.random() * (ship.speed * 0.3 + 2.4) + 1.4;

        if (currentMode === 'threat') {
          // Threat Mode: Overcharged Plasma Sparks
          particles.push({
            x: ship.x + (Math.random() < 0.5 ? leftEngineX : rightEngineX),
            y: ship.y + (Math.random() < 0.5 ? leftEngineY : rightEngineY),
            vx: Math.sin(ship.angle + Math.PI + (Math.random() - 0.5) * 0.8) * pSpeed * 1.3,
            vy: -Math.cos(ship.angle + Math.PI + (Math.random() - 0.5) * 0.8) * pSpeed * 1.3,
            size: Math.random() * 2.8 + 1.2,
            alpha: 0.9,
            maxLife: 8,
            life: 0,
            color: Math.random() < 0.4 ? '#ffffff' : theme.engine,
            type: 'spark',
          });
        } else if (currentMode === 'science') {
          // Science Mode: Quantum Emerald Stardust
          particles.push({
            x: ship.x + (Math.random() - 0.5) * 16,
            y: ship.y + (Math.random() - 0.5) * 16,
            vx: Math.sin(ship.angle + Math.PI) * pSpeed * 0.6,
            vy: -Math.cos(ship.angle + Math.PI) * pSpeed * 0.6,
            size: Math.random() * 2.2 + 0.8,
            alpha: 0.8,
            maxLife: 14,
            life: 0,
            color: Math.random() < 0.3 ? '#ecfdf5' : theme.primary,
            type: 'stardust',
          });
        } else if (currentMode === 'landing') {
          // Landing Mode: Regolith Dust Scatter
          particles.push({
            x: ship.x + leftEngineX,
            y: ship.y + leftEngineY,
            vx: Math.sin(ship.angle + Math.PI + 0.3) * pSpeed,
            vy: -Math.cos(ship.angle + Math.PI + 0.3) * pSpeed,
            size: Math.random() * 3.0 + 1.0,
            alpha: 0.85,
            maxLife: 10,
            life: 0,
            color: '#f59e0b',
            type: 'dust',
          });
          particles.push({
            x: ship.x + rightEngineX,
            y: ship.y + rightEngineY,
            vx: Math.sin(ship.angle + Math.PI - 0.3) * pSpeed,
            vy: -Math.cos(ship.angle + Math.PI - 0.3) * pSpeed,
            size: Math.random() * 3.0 + 1.0,
            alpha: 0.85,
            maxLife: 10,
            life: 0,
            color: '#fbbf24',
            type: 'dust',
          });
        } else {
          // Cruise / Interactive: Dual Ion Streams
          particles.push({
            x: ship.x + leftEngineX,
            y: ship.y + leftEngineY,
            vx: Math.sin(ship.angle + Math.PI) * pSpeed,
            vy: -Math.cos(ship.angle + Math.PI) * pSpeed,
            size: Math.random() * 2.2 + 1.0,
            alpha: 0.85,
            maxLife: 10,
            life: 0,
            color: theme.engine,
            type: 'ion',
          });
          particles.push({
            x: ship.x + rightEngineX,
            y: ship.y + rightEngineY,
            vx: Math.sin(ship.angle + Math.PI) * pSpeed,
            vy: -Math.cos(ship.angle + Math.PI) * pSpeed,
            size: Math.random() * 2.2 + 1.0,
            alpha: 0.85,
            maxLife: 10,
            life: 0,
            color: theme.primary,
            type: 'ion',
          });
        }
      }

      // -------------------------------------------------------------
      // 2. RENDER EXHAUST PARTICLES
      // -------------------------------------------------------------
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
        ctx.shadowBlur = p.type === 'spark' ? 10 : 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 3. RENDER QUANTUM CLICK RIPPLES
      // -------------------------------------------------------------
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
        ctx.shadowBlur = 12;
        ctx.shadowColor = rip.color;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 4. RENDER SPACECRAFT HULL WITH 3D BANKING ROLL
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.scale(ship.scale * (1 - Math.abs(ship.roll) * 0.15), ship.scale);
      ctx.globalAlpha = ship.opacity;

      // A. Ambient Neon Aura Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
      glowGrad.addColorStop(0, theme.glow);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // B. Fuselage Vector Geometry
      ctx.beginPath();
      ctx.moveTo(0, -18); // Nose cone
      ctx.lineTo(11 + ship.roll * 3, 10);  // Right wing
      ctx.lineTo(6, 12);
      ctx.lineTo(3, 8);
      ctx.lineTo(0, 11);
      ctx.lineTo(-3, 8);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-11 + ship.roll * 3, 10); // Left wing
      ctx.closePath();

      const hullGrad = ctx.createLinearGradient(0, -18, 0, 12);
      hullGrad.addColorStop(0, '#ffffff');
      hullGrad.addColorStop(0.35, theme.secondary);
      hullGrad.addColorStop(1, theme.hullBase);
      ctx.fillStyle = hullGrad;
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // C. Cockpit Canopy Core
      ctx.beginPath();
      ctx.ellipse(0, -4, 2.4, 5.0, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme.core;
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // D. Twin Thruster Plumes
      const flameLength = 6 + ship.speed * 1.6;
      ctx.fillStyle = theme.engine;
      // Left Thruster
      ctx.beginPath();
      ctx.moveTo(-5, 9);
      ctx.lineTo(-3.5, 9 + flameLength);
      ctx.lineTo(-2, 9);
      ctx.closePath();
      ctx.fill();
      // Right Thruster
      ctx.beginPath();
      ctx.moveTo(2, 9);
      ctx.lineTo(3.5, 9 + flameLength);
      ctx.lineTo(5, 9);
      ctx.closePath();
      ctx.fill();

      // -------------------------------------------------------------
      // 5. UNIQUE COLOR & MODE VISUAL OVERLAYS
      // -------------------------------------------------------------
      // Mode: Interactive - Holographic Targeting Brackets
      if (currentMode === 'interactive') {
        const bs = 22;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-bs, -bs + 6); ctx.lineTo(-bs, -bs); ctx.lineTo(-bs + 6, -bs);
        ctx.moveTo(bs - 6, -bs); ctx.lineTo(bs, -bs); ctx.lineTo(bs, -bs + 6);
        ctx.moveTo(-bs, bs - 6); ctx.lineTo(-bs, bs); ctx.lineTo(-bs + 6, bs);
        ctx.moveTo(bs - 6, bs); ctx.lineTo(bs, bs); ctx.lineTo(bs, bs - 6);
        ctx.stroke();
      }

      // Mode: Threat - Red Plasma Shield & Alert Pips
      if (currentMode === 'threat') {
        ctx.strokeStyle = `rgba(255, 59, 59, ${0.5 + Math.sin(time * 8) * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Mode: Science / Cosmic - Dual Orbiting Nanobots & Radar Arc Sweep
      if (currentMode === 'science') {
        const satAngle = time * 3.0;
        const s1x = Math.cos(satAngle) * 20;
        const s1y = Math.sin(satAngle) * 20;
        const s2x = Math.cos(satAngle + Math.PI) * 20;
        const s2y = Math.sin(satAngle + Math.PI) * 20;

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(s1x, s1y, 2, 0, Math.PI * 2);
        ctx.arc(s2x, s2y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Sensor sweep arc
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, -18, 16, -0.4, 0.4);
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
