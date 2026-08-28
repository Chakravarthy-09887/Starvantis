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

    // Disable only on strict touch-only devices without pointer
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
    window.addEventListener('resize', handleResize);

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

    // Evaluate spacecraft nature based on hovered DOM element
    const evaluateMode = (target: HTMLElement | null): SpacecraftMode => {
      if (!target) return 'cruise';

      // 1. Interactive Button / Link / Input Lock
      const isInteractive = !!target.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer');
      if (isInteractive) return 'interactive';

      // 2. Critical Alert & Conjunction Threat Section
      const isThreat = !!target.closest(
        '#alerts, #orbital, [data-threat="true"], .border-alert-critical, .bg-alert-critical, .text-alert-critical'
      );
      if (isThreat) return 'threat';

      // 3. AI Anomaly & Telemetry Digital Twin Mode
      const isScience = !!target.closest(
        '#anomaly-center, #satellite-inspector, #digital-twin, #telemetry, #risk, #admin'
      );
      if (isScience) return 'science';

      // 4. Planetary Surface & EDL Landing Mode
      const isLanding = !!target.closest('#landing, #edl, #surface, #topography');
      if (isLanding) return 'landing';

      return 'cruise';
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      currentMode = evaluateMode(target || (e.target as HTMLElement | null));
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn kinetic quantum warp ripple wave on click
      const rippleColor =
        currentMode === 'threat'
          ? '#ff3b3b'
          : currentMode === 'science'
          ? '#00ffcc'
          : currentMode === 'landing'
          ? '#f59e0b'
          : '#00d4ff';

      ripples.push({
        x: mouse.x,
        y: mouse.y,
        radius: 6,
        maxRadius: 56,
        alpha: 0.9,
        color: rippleColor,
      });
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

    // Color Palette per Mode
    const MODE_THEMES = {
      cruise: {
        primary: '#00d4ff',
        secondary: '#63c7ff',
        glow: 'rgba(0, 212, 255, 0.55)',
        engine: '#00f0ff',
        hullTop: '#ffffff',
        hullBase: '#0b1928',
        core: '#ffffff',
      },
      threat: {
        primary: '#ff3b3b',
        secondary: '#ff7373',
        glow: 'rgba(255, 59, 59, 0.65)',
        engine: '#ff2200',
        hullTop: '#ffffff',
        hullBase: '#25080b',
        core: '#fff0f0',
      },
      interactive: {
        primary: '#38bdf8',
        secondary: '#a5f3fc',
        glow: 'rgba(56, 189, 248, 0.7)',
        engine: '#67e8f9',
        hullTop: '#ffffff',
        hullBase: '#0c2236',
        core: '#ffffff',
      },
      science: {
        primary: '#10b981',
        secondary: '#34d399',
        glow: 'rgba(16, 185, 129, 0.6)',
        engine: '#059669',
        hullTop: '#ffffff',
        hullBase: '#052219',
        core: '#ecfdf5',
      },
      landing: {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.65)',
        engine: '#ea580c',
        hullTop: '#ffffff',
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

      // Smooth position easing (Damped follow)
      const dx = mouse.x - ship.x;
      const dy = mouse.y - ship.y;

      ship.vx += dx * 0.22;
      ship.vy += dy * 0.22;
      ship.vx *= 0.64;
      ship.vy *= 0.64;

      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.speed = Math.hypot(ship.vx, ship.vy);

      // Dynamic flight orientation angle
      if (ship.speed > 0.3) {
        ship.targetAngle = Math.atan2(ship.vy, ship.vx) + Math.PI / 2;
      } else {
        // Idle orbital attitude bobbing
        ship.targetAngle = -Math.PI / 2 + Math.sin(time * 0.9) * 0.08;
      }

      // Shortest angle interpolation
      let angleDiff = ship.targetAngle - ship.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      ship.angle += angleDiff * 0.24;

      // TRANSLUCENCY EFFECT:
      // When clicking / mouse down in contents, ship becomes translucent (0.32 opacity) so contents beneath are fully readable!
      const targetOpacity = isMouseDown ? 0.32 : 0.98;
      ship.opacity += (targetOpacity - ship.opacity) * 0.28;

      // Scale on hover & click
      const targetScale = isMouseDown ? 0.88 : currentMode === 'interactive' ? 1.25 : 1.0;
      ship.scale += (targetScale - ship.scale) * 0.22;

      const theme = MODE_THEMES[currentMode];

      // 1. ION THRUSTER PARTICLES
      const engineOffsetX = Math.sin(ship.angle) * 14;
      const engineOffsetY = -Math.cos(ship.angle) * 14;

      const spawnCount = ship.speed > 2 ? 3 : 1;
      for (let i = 0; i < spawnCount; i++) {
        const spread = (Math.random() - 0.5) * 0.5;
        const pSpeed = Math.random() * (ship.speed * 0.4 + 2.8) + 1.5;
        particles.push({
          x: ship.x + engineOffsetX + (Math.random() - 0.5) * 3,
          y: ship.y + engineOffsetY + (Math.random() - 0.5) * 3,
          vx: Math.sin(ship.angle + Math.PI + spread) * pSpeed,
          vy: -Math.cos(ship.angle + Math.PI + spread) * pSpeed,
          size: Math.random() * 3.0 + 1.2,
          alpha: (isMouseDown ? 0.25 : 0.85) * (Math.random() * 0.4 + 0.6),
          maxLife: Math.random() * 14 + 8,
          life: 0,
          color: Math.random() < 0.4 ? theme.engine : theme.primary,
        });
      }

      // 2. RENDER EXHAUST PARTICLES
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - lifeRatio);
        const currentSize = p.size * (1 - lifeRatio * 0.6);

        if (lifeRatio >= 1 || currentAlpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // 3. RENDER QUANTUM WARP RIPPLES
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 3.2;
        rip.alpha *= 0.90;

        if (rip.alpha <= 0.02 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = rip.alpha;
        ctx.shadowBlur = 14;
        ctx.shadowColor = rip.color;
        ctx.stroke();

        // Inner concentric high-energy pulse
        if (rip.radius > 10) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = rip.alpha * 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. RENDER SPACECRAFT HULL (ALWAYS ON TOP OF CONTENT)
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.scale(ship.scale, ship.scale);
      ctx.globalAlpha = ship.opacity;

      // A. Ambient Neon Engine Aura Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
      glowGrad.addColorStop(0, theme.glow);
      glowGrad.addColorStop(0.7, theme.glow);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();

      // B. Spacecraft Hull Vector Paths (Aerodynamic Delta Interceptor)
      ctx.shadowBlur = isMouseDown ? 6 : 16;
      ctx.shadowColor = theme.primary;

      // 1. Delta-Wing Fuselage
      ctx.beginPath();
      ctx.moveTo(0, -19); // Nose cone
      ctx.lineTo(12, 11);  // Right wingtip
      ctx.lineTo(7, 13);   // Right inner nacelle
      ctx.lineTo(3.5, 9);  // Right thruster bay
      ctx.lineTo(0, 12);   // Center engine nozzle
      ctx.lineTo(-3.5, 9); // Left thruster bay
      ctx.lineTo(-7, 13);  // Left inner nacelle
      ctx.lineTo(-12, 11); // Left wingtip
      ctx.closePath();

      // Hull Fill (Translucent with solid neon edge when clicking)
      const hullGrad = ctx.createLinearGradient(0, -19, 0, 13);
      if (isMouseDown) {
        hullGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        hullGrad.addColorStop(0.4, theme.secondary + '40');
        hullGrad.addColorStop(1, 'rgba(8, 23, 38, 0.35)');
      } else {
        hullGrad.addColorStop(0, '#ffffff');
        hullGrad.addColorStop(0.35, theme.secondary);
        hullGrad.addColorStop(0.85, theme.hullBase);
        hullGrad.addColorStop(1, '#050a10');
      }
      ctx.fillStyle = hullGrad;
      ctx.fill();

      // Sharp High-Contrast Border
      ctx.lineWidth = isMouseDown ? 1.6 : 1.4;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();

      // 2. Cockpit / Sensor Dome
      ctx.beginPath();
      ctx.ellipse(0, -5, 2.8, 6.0, 0, 0, Math.PI * 2);
      ctx.fillStyle = isMouseDown ? 'rgba(255, 255, 255, 0.5)' : theme.core;
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 3. Solar Panel / Wing Thermal Armor Panels
      ctx.beginPath();
      ctx.moveTo(4.5, -2);
      ctx.lineTo(9, 8);
      ctx.lineTo(5.5, 9);
      ctx.closePath();
      ctx.fillStyle = theme.primary + (isMouseDown ? '25' : '65');
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-4.5, -2);
      ctx.lineTo(-9, 8);
      ctx.lineTo(-5.5, 9);
      ctx.closePath();
      ctx.fillStyle = theme.primary + (isMouseDown ? '25' : '65');
      ctx.fill();

      // 4. Wingtip Navigational Strobe Beacons
      const strobeAlpha = Math.sin(time * 7) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(12, 11, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 180, ${strobeAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-12, 11, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 60, 60, ${strobeAlpha})`;
      ctx.fill();

      // 5. Thruster Flame Plume
      const flameLength = (isMouseDown ? 5 : 9) + ship.speed * 2.4 + Math.sin(time * 20) * 3;
      const flameGrad = ctx.createLinearGradient(0, 9, 0, 9 + flameLength);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, theme.engine);
      flameGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(-3, 10);
      ctx.lineTo(0, 10 + flameLength);
      ctx.lineTo(3, 10);
      ctx.closePath();
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // C. Mode-Specific Overlays:
      // Mode 1: Interactive Target Lock HUD Brackets
      if (currentMode === 'interactive') {
        const bracketSize = 24 + Math.sin(time * 4) * 2;
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = theme.primary;
        ctx.shadowBlur = 12;
        ctx.shadowColor = theme.primary;

        // Top-Left bracket
        ctx.beginPath();
        ctx.moveTo(-bracketSize, -bracketSize + 7);
        ctx.lineTo(-bracketSize, -bracketSize);
        ctx.lineTo(-bracketSize + 7, -bracketSize);
        ctx.stroke();

        // Top-Right bracket
        ctx.beginPath();
        ctx.moveTo(bracketSize - 7, -bracketSize);
        ctx.lineTo(bracketSize, -bracketSize);
        ctx.lineTo(bracketSize, -bracketSize + 7);
        ctx.stroke();

        // Bottom-Left bracket
        ctx.beginPath();
        ctx.moveTo(-bracketSize, bracketSize - 7);
        ctx.lineTo(-bracketSize, bracketSize);
        ctx.lineTo(-bracketSize + 7, bracketSize);
        ctx.stroke();

        // Bottom-Right bracket
        ctx.beginPath();
        ctx.moveTo(bracketSize - 7, bracketSize);
        ctx.lineTo(bracketSize, bracketSize);
        ctx.lineTo(bracketSize, bracketSize - 7);
        ctx.stroke();

        // Center Target Crosshair Pips
        ctx.beginPath();
        ctx.arc(0, -19, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Mode 2: Threat Tactical Vector Shield
      if (currentMode === 'threat') {
        ctx.strokeStyle = `rgba(255, 59, 59, ${0.5 + Math.sin(time * 8) * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Mode 3: Science Sensor Radar Arc Sweep
      if (currentMode === 'science') {
        const sweepAngle = (time * 3.5) % (Math.PI * 0.8) - Math.PI * 0.4;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -19, 18, sweepAngle - 0.35, sweepAngle + 0.35);
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
        zIndex: 2147483647, // Maximum 32-bit integer z-index in all modern browsers
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    />
  );
}
