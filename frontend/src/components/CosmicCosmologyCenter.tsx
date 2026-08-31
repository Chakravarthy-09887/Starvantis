'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Globe2,
  Orbit,
  Sparkles,
  Layers,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Maximize2,
  Search,
  ExternalLink,
  Flame,
  Info,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

// SOLAR SYSTEM PLANETARY DATA
interface PlanetData {
  id: string;
  name: string;
  type: string;
  distAU: number;
  radiusKm: number;
  orbitalPeriodDays: number;
  orbitRadiusCanvas: number;
  orbitSpeed: number;
  color: string;
  surfaceTemp: string;
  gravity: string;
  moons: number;
  atmosphere: string;
  summary: string;
  discovery: string;
  missions: string;
}

const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    distAU: 0.39,
    radiusKm: 2439.7,
    orbitalPeriodDays: 88,
    orbitRadiusCanvas: 38,
    orbitSpeed: 0.04,
    color: '#a3a3a3',
    surfaceTemp: '-180°C to +430°C',
    gravity: '3.7 m/s² (0.38g)',
    moons: 0,
    atmosphere: 'Trace exosphere (Oxygen, Sodium, Hydrogen)',
    summary: 'Smallest planet and closest to the Sun. Surface is heavily cratered, resembling Earth’s Moon with extreme diurnal temperature swings.',
    discovery: 'Known since antiquity (Recorded by Sumerians ~3000 BCE)',
    missions: 'Mariner 10, MESSENGER, BepiColombo',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    distAU: 0.72,
    radiusKm: 6051.8,
    orbitalPeriodDays: 224.7,
    orbitRadiusCanvas: 62,
    orbitSpeed: 0.028,
    color: '#eab308',
    surfaceTemp: '+465°C (Runaway Greenhouse)',
    gravity: '8.87 m/s² (0.90g)',
    moons: 0,
    atmosphere: '96.5% Carbon Dioxide, 3.5% Nitrogen, Sulfuric Acid clouds',
    summary: 'Hottest planet in the Solar System due to dense greenhouse atmosphere with 92 bars surface pressure. Rotates retrograde (clockwise).',
    discovery: 'Known since antiquity (Named after goddess of beauty)',
    missions: 'Venera series, Magellan, Akatsuki, DAVINCI+, EnVision',
  },
  {
    id: 'earth',
    name: 'Earth & Moon',
    type: 'Terrestrial Habitable World',
    distAU: 1.0,
    radiusKm: 6371.0,
    orbitalPeriodDays: 365.25,
    orbitRadiusCanvas: 88,
    orbitSpeed: 0.02,
    color: '#38bdf8',
    surfaceTemp: '-88°C to +58°C (Mean: +15°C)',
    gravity: '9.807 m/s² (1.0g)',
    moons: 1,
    atmosphere: '78% Nitrogen, 21% Oxygen, 0.9% Argon, 0.04% CO₂',
    summary: 'Only known astronomical body harboring life and liquid surface oceans. Protected by dynamic magnetosphere and nitrogen-oxygen shield.',
    discovery: 'Origin of humanity',
    missions: 'Constellation of thousands of Earth Observation satellites',
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    distAU: 1.52,
    radiusKm: 3389.5,
    orbitalPeriodDays: 687,
    orbitRadiusCanvas: 118,
    orbitSpeed: 0.015,
    color: '#ef4444',
    surfaceTemp: '-140°C to +20°C (Mean: -63°C)',
    gravity: '3.72 m/s² (0.38g)',
    moons: 2,
    atmosphere: '95% Carbon Dioxide, 2.6% Nitrogen, 1.9% Argon',
    summary: 'The Red Planet, home to Olympus Mons (tallest planetary volcano at 21.9 km) and Valles Marineris canyon system. Evidence of ancient rivers.',
    discovery: 'Known since antiquity',
    missions: 'Viking, Curiosity, Perseverance, Mangalyaan (MOM), Tianwen-1',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    distAU: 5.2,
    radiusKm: 69911,
    orbitalPeriodDays: 4333,
    orbitRadiusCanvas: 156,
    orbitSpeed: 0.009,
    color: '#fb923c',
    surfaceTemp: '-110°C (Cloud top level)',
    gravity: '24.79 m/s² (2.53g)',
    moons: 95,
    atmosphere: '90% Hydrogen, 10% Helium, trace Methane and Ammonia',
    summary: 'Largest planet in the solar system (2.5x mass of all other planets combined). Great Red Spot is a persistent anticyclonic storm older than 350 years.',
    discovery: 'Known since antiquity; Moons discovered by Galileo (1610)',
    missions: 'Pioneer, Voyager 1 & 2, Galileo, Juno, JUICE, Europa Clipper',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant (Ring System)',
    distAU: 9.58,
    radiusKm: 58232,
    orbitalPeriodDays: 10759,
    orbitRadiusCanvas: 198,
    orbitSpeed: 0.006,
    color: '#facc15',
    surfaceTemp: '-140°C',
    gravity: '10.44 m/s² (1.06g)',
    moons: 146,
    atmosphere: '96% Hydrogen, 3% Helium, 0.4% Methane',
    summary: 'Famous for its extensive and brilliant ring system made of billions of ice and rock particles. Ocean moon Enceladus harbors active subsurface geysers.',
    discovery: 'Known since antiquity; Rings resolved by Huygens (1655)',
    missions: 'Pioneer 11, Voyager 1 & 2, Cassini-Huygens, Dragonfly',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    distAU: 19.22,
    radiusKm: 25362,
    orbitalPeriodDays: 30687,
    orbitRadiusCanvas: 238,
    orbitSpeed: 0.004,
    color: '#2dd4bf',
    surfaceTemp: '-224°C (Coldest atmosphere)',
    gravity: '8.69 m/s² (0.89g)',
    moons: 28,
    atmosphere: '83% Hydrogen, 15% Helium, 2% Methane (gives cyan tint)',
    summary: 'Tilted on its side with an axial tilt of 97.77°, rotating retrograde. Its mantle consists of a dense, hot fluid of water, ammonia, and methane ice.',
    discovery: 'Discovered by William Herschel in 1781',
    missions: 'Voyager 2 (1986 Flyby)',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    distAU: 30.05,
    radiusKm: 24622,
    orbitalPeriodDays: 60190,
    orbitRadiusCanvas: 278,
    orbitSpeed: 0.003,
    color: '#3b82f6',
    surfaceTemp: '-218°C',
    gravity: '11.15 m/s² (1.14g)',
    moons: 16,
    atmosphere: '80% Hydrogen, 19% Helium, 1.5% Methane',
    summary: 'Most distant major planet, featuring supersonic winds exceeding 2,100 km/h. Moon Triton has nitrogen geysers and orbits retrograde.',
    discovery: 'Discovered by Johann Galle & Urbain Le Verrier in 1846 via math',
    missions: 'Voyager 2 (1989 Flyby)',
  },
];

// ASTROPHYSICS FACT ENCYCLOPEDIA
interface SpaceFact {
  id: string;
  category: 'RELATIVITY' | 'EXOPLANETS' | 'COMPACT_OBJECTS' | 'COSMOLOGY' | 'JWST_DISCOVERIES';
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  scientificReference: string;
  color: string;
}

const SPACE_FACTS: SpaceFact[] = [
  {
    id: 'FACT-TIME-DILATION',
    category: 'RELATIVITY',
    title: 'Gravitational Time Dilation & Black Holes',
    metric: '1 hr = 7 yrs',
    metricLabel: 'Miller’s Planet (r = 1.1 Rs)',
    description: 'In Einstein’s General Relativity, intense gravitational potential slows down proper time. Near the event horizon of a supermassive black hole like Gargantua, time passes exponentially slower relative to distant observers.',
    scientificReference: 'Einstein Field Equations: G_μν + Λg_μν = (8πG/c⁴) T_μν; Kip Thorne gravitational lensing model.',
    color: '#f59e0b',
  },
  {
    id: 'FACT-NEUTRON-MAGNETAR',
    category: 'COMPACT_OBJECTS',
    title: 'Magnetars: Cosmic Magnetic Titans',
    metric: '10¹¹ Tesla',
    metricLabel: 'Magnetic Field Strength',
    description: 'Magnetars are ultra-dense neutron stars with magnetic fields strong enough to dissolve atomic electron orbitals into thin needles from 1,000 km away. Crust starquakes trigger massive gamma-ray giant flares.',
    scientificReference: 'Soft Gamma Repeaters (SGR 1806-20 giant flare); Relativistic QED vacuum polarization.',
    color: '#ef4444',
  },
  {
    id: 'FACT-CMB-RELIC',
    category: 'COSMOLOGY',
    title: 'Cosmic Microwave Background (CMB)',
    metric: '2.725 Kelvin',
    metricLabel: 'Relic Big Bang Radiation',
    description: 'The afterglow of the Big Bang emitted 380,000 years after creation during recombination. The blackbody thermal spectrum fills all space with pristine photon isotropy with 10⁻⁵ temperature fluctuations.',
    scientificReference: 'Planck / WMAP satellites; Sachs-Wolfe effect; Baryon Acoustic Oscillations (BAO).',
    color: '#00d4ff',
  },
  {
    id: 'FACT-DARK-ENERGY',
    category: 'COSMOLOGY',
    title: 'Dark Energy & Cosmic Acceleration',
    metric: '68.3% & 26.8%',
    metricLabel: 'Dark Energy & Dark Matter Composition',
    description: 'Ordinary baryonic matter (stars, planets, atoms) accounts for less than 5% of the universe. Dark Energy acts as a cosmological constant driving accelerated metric expansion of spacetime.',
    scientificReference: 'Type Ia Supernovae standard candles (Perlmutter, Schmidt, Riess 1998 Nobel Prize).',
    color: '#a855f7',
  },
  {
    id: 'FACT-JWST-EARLY-UNIVERSE',
    category: 'JWST_DISCOVERIES',
    title: 'JWST Early Galaxy Formation Discovery',
    metric: 'z = 14.32',
    metricLabel: 'JADES-GS-z14-0 (290M yrs post-Big Bang)',
    description: 'James Webb Space Telescope discovered luminous, massive galaxies existing only 290–330 million years after the Big Bang, challenging traditional hierarchical galaxy assembly models.',
    scientificReference: 'JWST NIRCam / NIRSpec JADES Survey; Lyman-break spectroscopy.',
    color: '#10b981',
  },
  {
    id: 'FACT-EXOPLANET-TRAPPIST',
    category: 'EXOPLANETS',
    title: 'TRAPPIST-1 Seven Earth-Sized Worlds',
    metric: '3 In Habitable Zone',
    metricLabel: 'TRAPPIST-1e, f, g (Liquid Water Candidates)',
    description: 'An ultra-cool red dwarf star 40 light-years away hosting 7 resonant rocky planets. TRAPPIST-1e is considered one of the highest-priority exoplanets for atmospheric biosignature detection.',
    scientificReference: 'Spitzer / JWST Transmission Spectroscopy; Atmospheric escape & M-dwarf stellar flares.',
    color: '#38bdf8',
  },
];

export default function CosmicCosmologyCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  // Main Section Tabs: SOLAR_SYSTEM, BLACK_HOLE_3D, ASTRO_FACTS
  const [activeTab, setActiveTab] = useState<'SOLAR_SYSTEM' | 'BLACK_HOLE_3D' | 'ASTRO_FACTS'>('SOLAR_SYSTEM');

  // Solar System State
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');
  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState<number>(1);
  const [isOrbitPaused, setIsOrbitPaused] = useState<boolean>(false);
  const solarCanvasRef = useRef<HTMLCanvasElement>(null);

  // Black Hole Simulator State (Interstellar Gargantua)
  const [bhMassSolar, setBhMassSolar] = useState<number>(100000000); // 100 million solar masses (Gargantua scale)
  const [observerDistRs, setObserverDistRs] = useState<number>(1.1); // Distance in Schwarzschild radii
  const [accretionSpin, setAccretionSpin] = useState<number>(0.998); // Kerr dimensionless spin parameter
  const bhCanvasRef = useRef<HTMLCanvasElement>(null);

  // Space Facts State
  const [factSearch, setFactSearch] = useState<string>('');
  const [selectedFactCategory, setSelectedFactCategory] = useState<string>('ALL');

  const selectedPlanet = PLANETS.find((p) => p.id === selectedPlanetId) || PLANETS[2];

  // -------------------------------------------------------------
  // 1. SOLAR SYSTEM 3D ORRERY CANVAS ANIMATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'SOLAR_SYSTEM') return;
    const canvas = solarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const angleOffsets = PLANETS.map((p) => Math.random() * Math.PI * 2);

    const render = () => {
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Starfield dots in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 123) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 321) * 0.5 + 0.5) * h;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // Draw Central Sun
      const sunGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 26);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fde047');
      sunGrad.addColorStop(0.7, '#ea580c');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Scale factor to fit all 8 planets within canvas
      const scale = Math.min(w, h) / 620;

      // Draw Planetary Orbits & Planets
      PLANETS.forEach((planet, idx) => {
        const r = planet.orbitRadiusCanvas * scale;
        const isSelected = planet.id === selectedPlanetId;

        // Orbit ellipse line
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isSelected ? 1.5 : 0.8;
        if (!isSelected) ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Update angle
        if (!isOrbitPaused) {
          angleOffsets[idx] += planet.orbitSpeed * orbitSpeedMultiplier * 0.4;
        }
        const a = angleOffsets[idx];
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;

        // Planet body size
        const pSize = Math.max(3.0, (Math.log10(planet.radiusKm) - 2.5) * 4.5 * scale);

        // Planet glow if selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, pSize + 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Planet fill
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = planet.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Saturn's Ring System
        if (planet.id === 'saturn') {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(0.4);
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 2.2, pSize * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        // Earth's Moon
        if (planet.id === 'earth') {
          const moonAngle = a * 12;
          const mx = px + Math.cos(moonAngle) * 9 * scale;
          const my = py + Math.sin(moonAngle) * 9 * scale;
          ctx.beginPath();
          ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.fill();
        }

        // Label on hover/selected
        if (isSelected) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold 10px 'Space Grotesk', sans-serif`;
          ctx.fillText(planet.name, px + 8, py - 6);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, selectedPlanetId, orbitSpeedMultiplier, isOrbitPaused]);

  // -------------------------------------------------------------
  // 2. INTERSTELLAR GARGANTUA BLACK HOLE 3D SIMULATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'BLACK_HOLE_3D') return;
    const canvas = bhCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const renderBH = () => {
      time += 0.02;
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space black backdrop with warped stars
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, w, h);

      const bhRadius = Math.min(w, h) * 0.18; // Event horizon radius

      // 1. Warped Background Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 60; i++) {
        const angle = i * 0.3 + Math.sin(i);
        const dist = bhRadius * 1.6 + (i % 10) * 18;
        const sx = cx + Math.cos(angle + time * 0.05) * dist;
        const sy = cy + Math.sin(angle + time * 0.05) * dist * 0.7;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }

      // 2. Gravitational Lensing: Top Arc of the Accretion Disk (Bent light over the black hole)
      ctx.save();
      ctx.translate(cx, cy);

      // Top warped disk halo (Light from back of accretion disk bent over event horizon)
      const topHaloGrad = ctx.createLinearGradient(-bhRadius * 1.8, -bhRadius * 1.5, bhRadius * 1.8, 0);
      topHaloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.9)'); // Approaching blueshifted/brighter side
      topHaloGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.8)');
      topHaloGrad.addColorStop(1, 'rgba(220, 38, 38, 0.35)'); // Receding redshifted/dimmer side

      ctx.beginPath();
      ctx.ellipse(0, -bhRadius * 0.15, bhRadius * 1.6, bhRadius * 1.25, 0, Math.PI, 0);
      ctx.strokeStyle = topHaloGrad;
      ctx.lineWidth = bhRadius * 0.45;
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#f59e0b';
      ctx.stroke();

      // Bottom warped disk halo (Light bent under event horizon)
      const bottomHaloGrad = ctx.createLinearGradient(-bhRadius * 1.6, 0, bhRadius * 1.6, bhRadius * 1.2);
      bottomHaloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
      bottomHaloGrad.addColorStop(1, 'rgba(180, 30, 30, 0.2)');
      ctx.beginPath();
      ctx.ellipse(0, bhRadius * 0.15, bhRadius * 1.4, bhRadius * 1.0, 0, 0, Math.PI);
      ctx.strokeStyle = bottomHaloGrad;
      ctx.lineWidth = bhRadius * 0.35;
      ctx.stroke();

      // 3. Photon Sphere Ring (1.5 Rs)
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 1.08, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.0;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();

      // 4. Primary Horizontal Accretion Disk (Front Plane)
      const diskGrad = ctx.createLinearGradient(-bhRadius * 2.8, 0, bhRadius * 2.8, 0);
      diskGrad.addColorStop(0, '#ffffff'); // Approaching Doppler-beamed core
      diskGrad.addColorStop(0.2, '#fef08a');
      diskGrad.addColorStop(0.5, '#f59e0b');
      diskGrad.addColorStop(0.85, '#dc2626');
      diskGrad.addColorStop(1, 'rgba(120, 20, 20, 0.3)');

      ctx.beginPath();
      ctx.ellipse(0, 0, bhRadius * 2.7, bhRadius * 0.48, -0.08, 0, Math.PI * 2);
      ctx.strokeStyle = diskGrad;
      ctx.lineWidth = bhRadius * 0.42;
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#f59e0b';
      ctx.stroke();

      // 5. Central Pitch-Black Event Horizon (The Shadow)
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(renderBH);
    };

    animId = requestAnimationFrame(renderBH);
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  // Gravitational Time Dilation Calculation (Relativistic metric near Kerr BH)
  const timeDilationFactor = useMemo(() => {
    const r = Math.max(1.001, observerDistRs);
    const factor = Math.sqrt(1 - 1 / r);
    return factor > 0 ? (1 / factor).toFixed(2) : '∞ (INFINITE AT HORIZON)';
  }, [observerDistRs]);

  // Schwarzschild radius in kilometers (Rs = 2GM / c^2 = 2.95 km * M_solar)
  const schwarzschildRadiusKm = useMemo(() => {
    return (2.953 * bhMassSolar).toLocaleString();
  }, [bhMassSolar]);

  // Filtered Facts
  const filteredFacts = useMemo(() => {
    return SPACE_FACTS.filter((f) => {
      const matchSearch =
        f.title.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(factSearch.toLowerCase());
      const matchCat = selectedFactCategory === 'ALL' || f.category === selectedFactCategory;
      return matchSearch && matchCat;
    });
  }, [factSearch, selectedFactCategory]);

  return (
    <section id="cosmic-explorer" className="section-spacing relative overflow-hidden py-16 md:py-24" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 mb-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Orbit size={14} className="text-purple-400 animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.25em] text-purple-400 uppercase font-bold">
              REALISTIC COSMOLOGY, 3D SOLAR SYSTEM &amp; RELATIVISTIC ASTROPHYSICS
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-star-white">
            COSMIC EXPLORER &amp; ASTROPHYSICS
          </h2>
          <p className="font-inter text-xs sm:text-sm text-muted-gray mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Interactive 3D Solar System Orrery, Interstellar Gargantua-style relativistic black hole simulator, and comprehensive astrophysical knowledge matrix.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* MAIN MODULE SELECTOR TABS */}
          <div className="mt-7 inline-flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/10 gap-1.5">
            {[
              { id: 'SOLAR_SYSTEM', label: '3D SOLAR SYSTEM ORRERY', icon: Globe2 },
              { id: 'BLACK_HOLE_3D', label: 'GARGANTUA BLACK HOLE 3D', icon: Flame },
              { id: 'ASTRO_FACTS', label: 'ASTROPHYSICAL ENCYCLOPEDIA', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl font-space text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    isSel
                      ? 'bg-purple-500/25 border border-purple-400 text-star-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                      : 'text-muted-gray hover:text-star-white border border-transparent'
                  }`}
                >
                  <Icon size={14} className={isSel ? 'text-purple-400' : 'text-muted-gray'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ------------------------------------------------------------- */}
        {/* MODULE 1: INTERACTIVE 3D SOLAR SYSTEM ORRERY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'SOLAR_SYSTEM' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* 3D Canvas Box (Left 8 Cols) */}
            <motion.div
              className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border overflow-hidden relative shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/70 pb-4 mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <Globe2 size={18} className="text-cyan-glow animate-pulse shrink-0" />
                  <div>
                    <span className="font-space text-xs sm:text-sm tracking-wider text-star-white uppercase block font-bold">
                      HELIOCENTRIC ORBITAL PROPAGATION
                    </span>
                    <span className="font-space text-[10px] text-muted-gray">
                      REAL-TIME KEPLERIAN DYNAMICS // 8 PLANETARY ORBITS
                    </span>
                  </div>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOrbitPaused(!isOrbitPaused)}
                    className="p-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-glow text-star-white cursor-pointer"
                  >
                    {isOrbitPaused ? <Play size={13} /> : <Pause size={13} />}
                  </button>

                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                    {[0.5, 1, 5, 20].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setOrbitSpeedMultiplier(s)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          orbitSpeedMultiplier === s ? 'bg-cyan-glow/20 text-cyan-glow font-bold' : 'text-muted-gray'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orrery Canvas */}
              <div className="relative aspect-[16/10] w-full bg-[#02050f] rounded-2xl overflow-hidden border border-glass-border/50">
                <canvas ref={solarCanvasRef} className="w-full h-full block" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-star-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
                  <span>SUN + 8 PLANETARY ORBITS</span>
                </div>
              </div>

              {/* Planetary Selector Chips */}
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PLANETS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelectedPlanetId(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-space tracking-wider border cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${
                      p.id === selectedPlanetId
                        ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold shadow-[0_0_12px_rgba(99,199,255,0.3)]'
                        : 'bg-black/60 border-white/10 text-star-white/70 hover:text-star-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Planet Details Card (Right 4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              <motion.div
                className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-glow/30 box-glow relative overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                  <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-cyan-glow">
                    PLANETARY METRICS // {selectedPlanet.name.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-glow/15 text-cyan-glow font-bold">
                    {selectedPlanet.type}
                  </span>
                </div>

                <div className="space-y-3 font-space text-xs">
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Distance from Sun:</span>
                    <span className="font-mono text-star-white font-bold">{selectedPlanet.distAU} AU</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Equatorial Radius:</span>
                    <span className="font-mono text-star-white font-bold">{selectedPlanet.radiusKm.toLocaleString()} km</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Orbital Period:</span>
                    <span className="font-mono text-cyan-glow font-bold">{selectedPlanet.orbitalPeriodDays} Earth Days</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Surface Gravity (g):</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedPlanet.gravity}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Surface Temperature:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedPlanet.surfaceTemp}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Known Natural Moons:</span>
                    <span className="font-mono text-purple-400 font-bold">{selectedPlanet.moons} Moons</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-glass-border space-y-2 text-xs">
                  <span className="font-space text-[10px] uppercase font-bold text-star-white block">
                    ATMOSPHERE &amp; EXPLORATION:
                  </span>
                  <p className="font-inter text-[11px] text-star-white/80 leading-relaxed">
                    {selectedPlanet.summary}
                  </p>
                  <p className="font-inter text-[10px] text-muted-gray">
                    <strong className="text-cyan-glow">Missions:</strong> {selectedPlanet.missions}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 2: INTERSTELLAR GARGANTUA BLACK HOLE 3D SIMULATOR */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'BLACK_HOLE_3D' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Relativistic Black Hole Simulation (Left 8 Cols) */}
            <motion.div
              className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 border border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/70 pb-4 mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <Flame size={18} className="text-amber-400 animate-pulse shrink-0" />
                  <div>
                    <span className="font-space text-xs sm:text-sm tracking-wider text-star-white uppercase block font-bold">
                      GARGANTUA KERR BLACK HOLE // RELATIVISTIC LIGHT LENSING
                    </span>
                    <span className="font-space text-[10px] text-muted-gray">
                      EINSTEIN-THORNE EQUATIONS // GRAVITATIONAL DOPPLER BEAMING
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-space text-[10px] font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <Activity size={12} />
                  <span>KERR SPIN a* = {accretionSpin}</span>
                </span>
              </div>

              {/* Black Hole Canvas */}
              <div className="relative aspect-[16/10] w-full bg-[#010206] rounded-2xl overflow-hidden border border-glass-border/50">
                <canvas ref={bhCanvasRef} className="w-full h-full block" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-amber-300 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>ACCRETION DISK &amp; PHOTON SPHERE (1.5 Rs)</span>
                </div>
              </div>

              {/* Interactive Astrodynamics Sliders */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-space">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Observer Distance (r / Rs):</span>
                    <span className="font-mono text-amber-400 font-bold">{observerDistRs} Rs</span>
                  </div>
                  <input
                    type="range"
                    min="1.01"
                    max="10.0"
                    step="0.05"
                    value={observerDistRs}
                    onChange={(e) => setObserverDistRs(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Black Hole Mass (M☉):</span>
                    <span className="font-mono text-cyan-glow font-bold">{bhMassSolar.toLocaleString()} M☉</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="500000000"
                    step="5000000"
                    value={bhMassSolar}
                    onChange={(e) => setBhMassSolar(parseFloat(e.target.value))}
                    className="w-full accent-cyan-glow cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>

            {/* Relativistic Time Dilation Card (Right 4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              <motion.div
                className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-400/30 box-glow relative overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                  <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>GRAVITATIONAL TIME DILATION</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Δt′ = Δt √(1 - Rs/r)
                  </span>
                </div>

                <div className="space-y-3 font-space text-xs">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">
                      TIME SLOWDOWN FACTOR:
                    </span>
                    <span className="font-mono text-xl font-bold text-star-white block">
                      {timeDilationFactor}x Slower
                    </span>
                    <span className="text-[10px] font-inter text-star-white/80 block">
                      1 Hour at this orbit = <strong className="text-amber-300">{(parseFloat(timeDilationFactor) / 24).toFixed(1)} Earth Days</strong>
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Schwarzschild Radius (Rs):</span>
                    <span className="font-mono text-cyan-glow font-bold">{schwarzschildRadiusKm} km</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Photon Sphere Orbit:</span>
                    <span className="font-mono text-star-white font-bold">1.50 Rs</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">ISCO Stable Orbit:</span>
                    <span className="font-mono text-emerald-400 font-bold">1.24 Rs (Prograde Kerr)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-glass-border space-y-2 text-xs">
                  <span className="font-space text-[10px] uppercase font-bold text-star-white block">
                    INTERSTELLAR (2014) ASTROPHYSICS NOTE:
                  </span>
                  <p className="font-inter text-[11px] text-star-white/80 leading-relaxed">
                    Visualized with authentic gravitational lensing: light emitted by the accretion disk behind the black hole is bent upwards and downwards into an overarching halo around the shadow.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 3: ASTROPHYSICAL FACT ENCYCLOPEDIA */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ASTRO_FACTS' && (
          <div className="space-y-6">
            {/* Search & Category Filter Bar */}
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-glass-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray" />
                <input
                  type="text"
                  value={factSearch}
                  onChange={(e) => setFactSearch(e.target.value)}
                  placeholder="Search space facts (Relativity, Exoplanets, JWST, Dark Energy, Magnetars)..."
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs font-inter text-star-white placeholder:text-muted-gray/60 focus:outline-none focus:border-purple-400/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['ALL', 'RELATIVITY', 'EXOPLANETS', 'COMPACT_OBJECTS', 'COSMOLOGY', 'JWST_DISCOVERIES'].map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setSelectedFactCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-space tracking-wider border cursor-pointer shrink-0 transition-all ${
                      selectedFactCategory === cat
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                        : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Fact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border hover:border-purple-400/40 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                        {fact.category}
                      </span>
                      <span className="text-[10px] font-mono text-muted-gray">{fact.id}</span>
                    </div>

                    <h3 className="font-space text-sm font-bold text-star-white">{fact.title}</h3>

                    <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-0.5">
                      <span className="font-mono text-base font-bold text-purple-400 block">{fact.metric}</span>
                      <span className="text-[9px] font-space text-muted-gray uppercase block">{fact.metricLabel}</span>
                    </div>

                    <p className="font-inter text-xs text-star-white/80 leading-relaxed">
                      {fact.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[9px] font-mono text-muted-gray block truncate">
                      Ref: {fact.scientificReference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
