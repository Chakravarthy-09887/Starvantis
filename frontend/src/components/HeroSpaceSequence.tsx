'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarvantisWordmark from './StarvantisWordmark';
import StarvantisLogo from './StarvantisLogo';
import { Activity, ShieldAlert, Orbit, ArrowRight, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';

const TOTAL_FRAMES = 370;
const FRAME_PREFIX = '/images/hero/';

function getFramePath(index: number): string {
  const num = String(index + 1).padStart(4, '0');
  return `${FRAME_PREFIX}${num}.jpg`;
}

// Cinematic narrative beats during flight
const STORY_BEATS = [
  { start: 0.2, end: 1.8, text: 'Every mission begins with a signal.' },
  { start: 2.0, end: 3.6, text: 'Inside the spacecraft: Telemetry, power & thermal flux.' },
  { start: 3.8, end: 5.2, text: 'Risk accelerates beyond the spacecraft.' },
  { start: 5.4, end: 6.8, text: 'Approaching event horizon…' },
];

const SEQUENCE_DURATION = 7.5;
const TITLE_REVEAL_START = 4.8;

// The 3 rotating dynamic sentences requested by user
const DYNAMIC_SLOGANS = [
  "See Every Threat. Protect Every Mission.",
  "Intelligence from orbit to landing.",
  "Integrated platform for your all-in-one space operations."
];

export default function HeroSpaceSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const loadedCountRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);

  const [phase, setPhase] = useState<'loading' | 'playing' | 'revealed'>('loading');
  const [loadPercent, setLoadPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [sloganIndex, setSloganIndex] = useState(0);

  // Preload frames
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loaded++;
        loadedCountRef.current = loaded;
        setLoadPercent(Math.round((loaded / TOTAL_FRAMES) * 100));

        if (i === 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        if (loaded >= Math.floor(TOTAL_FRAMES * 0.6) && phase === 'loading') {
          setPhase('playing');
        }
      };
      images[i] = img;
    }

    imagesRef.current = images;
    return () => { imagesRef.current = []; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    const img = imagesRef.current[clamped];
    if (!img || !img.complete) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    currentFrameRef.current = clamped;
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      renderFrame(currentFrameRef.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [renderFrame]);

  // Automatic playback loop
  useEffect(() => {
    if (phase !== 'playing') return;

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) { startTimeRef.current = now; }
      const t = (now - startTimeRef.current) / 1000;
      setElapsed(t);

      if (t < SEQUENCE_DURATION) {
        const linearProgress = t / SEQUENCE_DURATION;
        const eased = linearProgress < 0.5
          ? 2 * linearProgress * linearProgress
          : 1 - Math.pow(-2 * linearProgress + 2, 2) / 2;

        const frameIdx = Math.round(eased * (TOTAL_FRAMES - 1));
        renderFrame(frameIdx);
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        renderFrame(TOTAL_FRAMES - 1);
        setPhase('revealed');
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, renderFrame]);

  // Rotate through the 3 moving sentences sequentially after title reveal
  useEffect(() => {
    if (phase !== 'revealed' && elapsed < TITLE_REVEAL_START + 1.5) return;
    const interval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % DYNAMIC_SLOGANS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [phase, elapsed]);

  const getStoryOpacity = (beat: typeof STORY_BEATS[0]) => {
    if (phase !== 'playing') return 0;
    const mid = (beat.start + beat.end) / 2;
    const fadeIn = Math.max(0, Math.min(1, (elapsed - beat.start) / (mid - beat.start)));
    const fadeOut = Math.max(0, Math.min(1, (beat.end - elapsed) / (beat.end - mid)));
    return Math.min(fadeIn, fadeOut);
  };

  const isTitleRevealed = elapsed >= TITLE_REVEAL_START || phase === 'revealed';
  const titleAlpha = phase === 'revealed'
    ? 1
    : Math.max(0, Math.min(1, (elapsed - TITLE_REVEAL_START) / 1.6));

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ background: '#05070B' }}>
      {/* Sequence Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Deep Space Vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: isTitleRevealed
            ? 'radial-gradient(circle at center, rgba(5,7,11,0.5) 0%, rgba(5,7,11,0.96) 75%)'
            : 'linear-gradient(to bottom, rgba(5,7,11,0.3) 0%, transparent 40%, rgba(5,7,11,0.75) 100%)',
        }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
            style={{ background: '#05070B' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <StarvantisLogo size={48} glow={true} className="mb-6" />
            <div className="w-48 h-px bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${loadPercent}%`,
                  background: 'linear-gradient(90deg, #63C7FF, #ffffff)',
                }}
              />
            </div>
            <span className="font-space text-xs tracking-[0.3em] text-muted-gray uppercase">
              INITIALIZING MISSION — {loadPercent}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narrative Story Beats */}
      {!isTitleRevealed && STORY_BEATS.map((beat, i) => {
        const opacity = getStoryOpacity(beat);
        if (opacity <= 0.01) return null;
        return (
          <div
            key={i}
            className="absolute inset-0 flex items-end justify-center pb-24 md:pb-32 pointer-events-none z-10 px-4"
            style={{ opacity }}
          >
            <div className="px-6 py-3 rounded-xl border border-cyan-glow/15 bg-space-navy/80 backdrop-blur-md">
              <p className="font-space text-sm md:text-base lg:text-lg tracking-[0.2em] text-star-white/90 font-light text-center">
                {beat.text}
              </p>
            </div>
          </div>
        );
      })}

      {/* TITLE REVEAL & SEQUENTIAL MOVING WORDS */}
      {isTitleRevealed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-4 md:px-8 max-w-6xl mx-auto"
          style={{
            opacity: titleAlpha,
            transform: `scale(${0.96 + titleAlpha * 0.04})`,
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
        >
          {/* Insignia & Category Badge */}
          <div className="flex flex-col items-center mb-5 md:mb-6">
            <StarvantisLogo size={52} glow={true} className="mb-3" />
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-glow/25 bg-space-navy/80 backdrop-blur-md shadow-[0_0_20px_rgba(99,199,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
              <span className="font-space text-[11px] md:text-xs tracking-[0.35em] text-cyan-glow uppercase font-semibold">
                AEROSPACE MISSION INTELLIGENCE
              </span>
            </div>
          </div>

          {/* STARVANTIS Wordmark (Perfect Center Alignment on Mobile & Desktop) */}
          <div className="w-[94vw] md:w-[84vw] lg:w-[72vw] max-w-[1150px] my-2 md:my-3 mx-auto flex items-center justify-center text-center">
            <StarvantisWordmark animate={true} glowIntensity={2.0} />
          </div>

          {/* DYNAMIC MOVING WORDS ANIMATION: Rotating 3 Slogans One by One */}
          <div className="mt-6 md:mt-8 flex flex-col items-center text-center space-y-4 max-w-3xl min-h-[90px]">
            <div className="h-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sloganIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1"
                >
                  <h2 className="font-space text-base sm:text-xl md:text-2xl lg:text-3xl text-star-white tracking-[0.1em] sm:tracking-[0.16em] md:tracking-[0.22em] font-light uppercase text-glow leading-relaxed max-w-2xl px-2">
                    &ldquo;{DYNAMIC_SLOGANS[sloganIndex]}&rdquo;
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slogan Progress Indicator Dots */}
            <div className="flex items-center gap-2">
              {DYNAMIC_SLOGANS.map((_, i) => (
                <div role="button" tabIndex={0} key={i}
                  onClick={() => setSloganIndex(i)}
                  className={`h-1 rounded-full transition-all duration-500 pointer-events-auto cursor-pointer ${
                    sloganIndex === i ? 'w-8 bg-cyan-glow shadow-[0_0_10px_#63c7ff]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`View slogan ${i + 1}`}
                />
              ))}
            </div>

            {/* Action Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5 md:gap-5 pointer-events-auto">
              <a
                href="#digital-twin"
                className="px-5 md:px-6 py-2.5 rounded-xl font-space text-xs md:text-sm font-semibold tracking-widest uppercase border border-cyan-glow/35 text-star-white hover:border-cyan-glow hover:bg-cyan-glow/20 hover:shadow-[0_0_25px_rgba(99,199,255,0.35)] transition-all flex items-center gap-2.5 bg-space-navy/70 backdrop-blur-md"
              >
                <Activity size={16} className="text-cyan-glow" />
                <span>SPACECRAFT HEALTH</span>
              </a>

              <a
                href="#orbital"
                className="px-5 md:px-6 py-2.5 rounded-xl font-space text-xs md:text-sm font-semibold tracking-widest uppercase border border-slate-700 text-star-white hover:border-cyan-glow hover:bg-cyan-glow/20 hover:shadow-[0_0_25px_rgba(99,199,255,0.35)] transition-all flex items-center gap-2.5 bg-space-navy/70 backdrop-blur-md"
              >
                <Orbit size={16} className="text-cyan-glow" />
                <span>ORBITAL THREAT</span>
              </a>

              <a
                href="#alerts"
                className="px-5 md:px-6 py-2.5 rounded-xl font-space text-xs md:text-sm font-semibold tracking-widest uppercase border border-slate-700 text-star-white hover:border-alert-critical hover:bg-alert-critical/20 hover:shadow-[0_0_25px_rgba(255,59,59,0.35)] transition-all flex items-center gap-2.5 bg-space-navy/70 backdrop-blur-md"
              >
                <ShieldAlert size={16} className="text-alert-critical" />
                <span>ACTIVE ALERTS</span>
              </a>

              <a
                href="#satellite-inspector"
                className="px-6 md:px-7 py-2.5 rounded-xl font-space text-xs md:text-sm font-semibold tracking-widest uppercase border border-cyan-glow/50 text-star-white hover:bg-cyan-glow/30 hover:shadow-[0_0_30px_rgba(99,199,255,0.5)] transition-all flex items-center gap-2.5 bg-cyan-glow/15 backdrop-blur-md"
              >
                <span>COMMAND DECK</span>
                <ArrowRight size={16} className="text-cyan-glow" />
              </a>
            </div>
          </div>

          {/* Section Prototype Disclaimer Banner */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-black/70 backdrop-blur-md text-[9px] font-space text-star-white/40 uppercase tracking-widest pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            <span>EDUCATIONAL PROTOTYPE — NOT CERTIFIED FOR OPERATIONAL FLIGHT GUIDANCE</span>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-auto">
            <ChevronDown size={15} className="text-cyan-glow/60 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
