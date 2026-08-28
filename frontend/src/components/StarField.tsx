'use client';

import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  starCount?: number;
}

export default function StarField({ starCount = 340 }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spectral stellar color palette
    const STAR_COLORS = [
      '#ffffff', // Pure white core
      '#e0f2fe', // Ice blue
      '#63c7ff', // Cyan shimmer
      '#bae6fd', // Pale stellar blue
      '#fef08a', // Gentle golden star
      '#c4b5fd', // Soft violet accent
    ];

    // Generate non-interactive, slightly shining stars
    const stars = Array.from({ length: starCount }, () => {
      const isBright = Math.random() < 0.25;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: isBright ? Math.random() * 1.8 + 1.2 : Math.random() * 1.1 + 0.4,
        baseAlpha: isBright ? Math.random() * 0.4 + 0.5 : Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        hasGlow: isBright,
      };
    });

    // Shooting stars
    const shootingStars: Array<{
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    }> = [];

    const spawnShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * window.innerWidth * 0.85,
          y: Math.random() * window.innerHeight * 0.45,
          len: Math.random() * 110 + 60,
          speed: Math.random() * 8 + 12,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 0.9,
          active: true,
        });
      }
    };

    let frame = 0;
    let animId: number;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // 1. Soft Cosmic Nebula Clouds
      const grad1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.6);
      grad1.addColorStop(0, 'rgba(14, 42, 71, 0.22)');
      grad1.addColorStop(0.5, 'rgba(8, 25, 44, 0.10)');
      grad1.addColorStop(1, 'rgba(5, 7, 11, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      const grad2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.55);
      grad2.addColorStop(0, 'rgba(20, 50, 85, 0.20)');
      grad2.addColorStop(0.6, 'rgba(8, 20, 36, 0.08)');
      grad2.addColorStop(1, 'rgba(5, 7, 11, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // 2. Stars with Slight Shining Twinkle
      stars.forEach((star) => {
        // Continuous gentle breathing twinkle formula
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinklePhase) * 0.45 + 0.55;
        const currentAlpha = star.baseAlpha * twinkle;

        // Subtle outer shining aura for brighter stars
        if (star.hasGlow) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha * 0.25;
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // 3. Occasional Shooting Stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        if (!ss.active) continue;

        const endX = ss.x + Math.cos(ss.angle) * ss.len;
        const endY = ss.y + Math.sin(ss.angle) * ss.len;

        const streak = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
        streak.addColorStop(0, 'rgba(99, 199, 255, 0)');
        streak.addColorStop(0.7, `rgba(224, 242, 254, ${ss.opacity * 0.6})`);
        streak.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = streak;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.02;

        if (ss.opacity <= 0 || ss.x > w || ss.y > h) {
          shootingStars.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
