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
  Sun,
  Shield,
  Eye,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

// SOLAR SYSTEM CELESTIAL OBJECTS (SUN + 8 PLANETS)
interface CelestialObjectData {
  id: string;
  name: string;
  category: 'STAR' | 'TERRESTRIAL' | 'GAS_GIANT' | 'ICE_GIANT';
  type: string;
  distAU: number;
  radiusKm: number;
  massKg: string;
  orbitalPeriodDays: number;
  orbitRadiusCanvas: number;
  orbitSpeed: number;
  color: string;
  surfaceTemp: string;
  coreTemp: string;
  gravity: string;
  escapeVelocity: string;
  dayLength: string;
  moons: number;
  atmosphere: string;
  internalStructure: string;
  summary: string;
  discovery: string;
  missions: string;
  specialFeature: string;
}

const CELESTIAL_OBJECTS: CelestialObjectData[] = [
  {
    id: 'sun',
    name: 'The Sun (Sol)',
    category: 'STAR',
    type: 'G2V Main-Sequence Yellow Dwarf Star',
    distAU: 0.0,
    radiusKm: 696340,
    massKg: '1.989 × 10³⁰ kg (333,000x Earth)',
    orbitalPeriodDays: 0,
    orbitRadiusCanvas: 0,
    orbitSpeed: 0,
    color: '#facc15',
    surfaceTemp: '5,500°C (Photosphere)',
    coreTemp: '15,000,000°C (Thermonuclear Fusion)',
    gravity: '274.0 m/s² (28.0g)',
    escapeVelocity: '617.7 km/s',
    dayLength: '25–35 Earth Days (Differential Rotation)',
    moons: 8,
    atmosphere: '73.46% Hydrogen, 24.85% Helium, trace Oxygen/Carbon',
    internalStructure: 'Thermonuclear Core ➔ Radiative Zone ➔ Convective Zone ➔ Photosphere ➔ Corona',
    summary: 'The central powerhouse of the Solar System containing 99.86% of its total mass. Converts 600 million tons of hydrogen into helium every second via proton-proton nuclear fusion.',
    discovery: 'Center of Solar System proven by Copernicus & Galileo',
    missions: 'Parker Solar Probe, SOHO, SDO, Aditya-L1, Solar Orbiter',
    specialFeature: 'Coronal Mass Ejections (CMEs) accelerate solar wind plasma to >800 km/s, driving space weather storms.',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    category: 'TERRESTRIAL',
    type: 'Terrestrial Metalliferous World',
    distAU: 0.39,
    radiusKm: 2439.7,
    massKg: '3.301 × 10²³ kg (0.055x Earth)',
    orbitalPeriodDays: 88,
    orbitRadiusCanvas: 36,
    orbitSpeed: 0.045,
    color: '#a3a3a3',
    surfaceTemp: '-180°C to +430°C',
    coreTemp: '1,500°C (Molten Metallic Core)',
    gravity: '3.70 m/s² (0.38g)',
    escapeVelocity: '4.25 km/s',
    dayLength: '58.6 Earth Days (3:2 Spin-Orbit Resonance)',
    moons: 0,
    atmosphere: 'Ultra-thin exosphere (Oxygen, Sodium, Hydrogen, Potassium)',
    internalStructure: 'Massive Iron Core (85% of planet radius) ➔ Thin Silicate Mantle ➔ Crust',
    summary: 'Smallest planet and closest to the Sun. Surface is heavily cratered with giant lobate scarps indicating planetary contraction as its immense iron core cooled.',
    discovery: 'Recorded by Sumerian astronomers ~3000 BCE',
    missions: 'Mariner 10, MESSENGER, BepiColombo',
    specialFeature: 'Experiences the highest diurnal temperature swing in the solar system (610°C delta).',
  },
  {
    id: 'venus',
    name: 'Venus',
    category: 'TERRESTRIAL',
    type: 'Terrestrial Super-Greenhouse Planet',
    distAU: 0.72,
    radiusKm: 6051.8,
    massKg: '4.867 × 10²⁴ kg (0.815x Earth)',
    orbitalPeriodDays: 224.7,
    orbitRadiusCanvas: 60,
    orbitSpeed: 0.032,
    color: '#eab308',
    surfaceTemp: '+465°C (Constant Day & Night)',
    coreTemp: '2,800°C',
    gravity: '8.87 m/s² (0.90g)',
    escapeVelocity: '10.36 km/s',
    dayLength: '243 Earth Days (Retrograde Rotation)',
    moons: 0,
    atmosphere: '96.5% Carbon Dioxide, 3.5% Nitrogen, Sulfuric Acid aerosol clouds',
    internalStructure: 'Metallic Iron-Nickel Core ➔ Rocky Silicate Mantle ➔ Basaltic Crust',
    summary: 'Earth’s toxic twin with a runaway greenhouse effect generating 92 bars of surface atmospheric pressure (equivalent to 900m under Earth’s ocean).',
    discovery: 'Known since antiquity; Named after goddess of beauty',
    missions: 'Venera series, Magellan, Akatsuki, DAVINCI, VERITAS, EnVision',
    specialFeature: 'Rotates backwards (retrograde) slower than its orbital year: a Venusian day is longer than its year!',
  },
  {
    id: 'earth',
    name: 'Earth & The Moon',
    category: 'TERRESTRIAL',
    type: 'Terrestrial Ocean Biosphere',
    distAU: 1.0,
    radiusKm: 6371.0,
    massKg: '5.972 × 10²⁴ kg',
    orbitalPeriodDays: 365.25,
    orbitRadiusCanvas: 86,
    orbitSpeed: 0.024,
    color: '#38bdf8',
    surfaceTemp: '-88°C to +58°C (Mean: +15°C)',
    coreTemp: '5,400°C (Inner Solid Iron Core)',
    gravity: '9.807 m/s² (1.00g)',
    escapeVelocity: '11.18 km/s',
    dayLength: '23h 56m 04s (Sidereal Day)',
    moons: 1,
    atmosphere: '78.08% Nitrogen, 20.95% Oxygen, 0.93% Argon, 0.04% CO₂',
    internalStructure: 'Solid Iron Inner Core ➔ Liquid Outer Core (Dynamo) ➔ Mantle ➔ Crust',
    summary: 'The cradle of known life with active plate tectonics, liquid water surface oceans, and a robust magnetosphere protecting the biosphere from lethal cosmic rays.',
    discovery: 'Origin of humanity',
    missions: 'Constellation of Earth Observation & Crewed Space Stations (ISS, Tiangong)',
    specialFeature: 'Tidally locked Moon stabilizes Earth’s 23.5° obliquity, preserving stable seasonal climates for billions of years.',
  },
  {
    id: 'mars',
    name: 'Mars',
    category: 'TERRESTRIAL',
    type: 'Terrestrial Desiccated Desert World',
    distAU: 1.52,
    radiusKm: 3389.5,
    massKg: '6.417 × 10²³ kg (0.107x Earth)',
    orbitalPeriodDays: 687,
    orbitRadiusCanvas: 114,
    orbitSpeed: 0.018,
    color: '#ef4444',
    surfaceTemp: '-140°C to +20°C (Mean: -63°C)',
    coreTemp: '1,900°C (Partially Molten Core)',
    gravity: '3.72 m/s² (0.38g)',
    escapeVelocity: '5.03 km/s',
    dayLength: '24h 37m 22s (1 Sol)',
    moons: 2,
    atmosphere: '95.32% Carbon Dioxide, 2.6% Nitrogen, 1.9% Argon',
    internalStructure: 'Iron-Nickel-Sulfur Core ➔ Silicate Mantle ➔ Basaltic/Iron-Oxide Crust',
    summary: 'The Red Planet, colored by ferric oxide regolith. Features Olympus Mons (tallest shield volcano at 21.9 km) and Valles Marineris (4,000 km grand canyon).',
    discovery: 'Known since antiquity; Named after god of war',
    missions: 'Viking, Pathfinder, Spirit & Opportunity, Curiosity, Perseverance, Mangalyaan',
    specialFeature: 'Abundant subsurface water ice deposits discovered across mid-latitudes and polar dry-ice caps.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    category: 'GAS_GIANT',
    type: 'Jovian Gas Giant',
    distAU: 5.2,
    radiusKm: 69911,
    massKg: '1.898 × 10²⁷ kg (317.8x Earth)',
    orbitalPeriodDays: 4333,
    orbitRadiusCanvas: 152,
    orbitSpeed: 0.011,
    color: '#fb923c',
    surfaceTemp: '-110°C (1-bar cloud level)',
    coreTemp: '24,000°C (Liquid Metallic Hydrogen)',
    gravity: '24.79 m/s² (2.53g)',
    escapeVelocity: '59.5 km/s',
    dayLength: '9h 55m (Fastest rotation in Solar System)',
    moons: 95,
    atmosphere: '89.8% Hydrogen, 10.2% Helium, trace Methane/Ammonia',
    internalStructure: 'Dense Rocky Core ➔ Metallic Liquid Hydrogen ➔ Molecular Hydrogen ➔ Cloud Deck',
    summary: 'The king of planets, containing more mass than all other planets combined. Its massive magnetic field is 20,000 times stronger than Earth’s.',
    discovery: 'Galilean moons discovered by Galileo Galilei in 1610',
    missions: 'Pioneer, Voyager 1 & 2, Galileo, Juno, JUICE, Europa Clipper',
    specialFeature: 'Great Red Spot is a persistent anticyclonic storm larger than Earth that has raged for over 350 years.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    category: 'GAS_GIANT',
    type: 'Jovian Ringed Gas Giant',
    distAU: 9.58,
    radiusKm: 58232,
    massKg: '5.683 × 10²⁶ kg (95.2x Earth)',
    orbitalPeriodDays: 10759,
    orbitRadiusCanvas: 194,
    orbitSpeed: 0.007,
    color: '#facc15',
    surfaceTemp: '-140°C',
    coreTemp: '11,700°C',
    gravity: '10.44 m/s² (1.06g)',
    escapeVelocity: '35.5 km/s',
    dayLength: '10h 33m',
    moons: 146,
    atmosphere: '96.3% Hydrogen, 3.25% Helium, trace Methane',
    internalStructure: 'Rock-Iron Core ➔ Liquid Metallic Hydrogen ➔ Liquid Molecular Hydrogen ➔ Atmosphere',
    summary: 'Spectacular ringed world made of billions of water-ice boulders spanning 282,000 km wide but only 10 meters thick on average. Average density is lower than water!',
    discovery: 'Rings resolved by Christiaan Huygens in 1655',
    missions: 'Pioneer 11, Voyager 1 & 2, Cassini-Huygens, Dragonfly',
    specialFeature: 'Moon Enceladus ejects water geysers from a global subsurface ocean containing organic prebiotic chemistry.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    category: 'ICE_GIANT',
    type: 'Tilted Ice Giant',
    distAU: 19.22,
    radiusKm: 25362,
    massKg: '8.681 × 10²⁵ kg (14.5x Earth)',
    orbitalPeriodDays: 30687,
    orbitRadiusCanvas: 236,
    orbitSpeed: 0.005,
    color: '#2dd4bf',
    surfaceTemp: '-224°C (Coldest atmospheric record)',
    coreTemp: '4,700°C',
    gravity: '8.69 m/s² (0.89g)',
    escapeVelocity: '21.3 km/s',
    dayLength: '17h 14m (Retrograde with 97.8° tilt)',
    moons: 28,
    atmosphere: '82.5% Hydrogen, 15.2% Helium, 2.3% Methane (cyan absorption)',
    internalStructure: 'Silicate Core ➔ Hot Dense Water-Ammonia-Methane Ice Mantle ➔ Hydrogen-Helium Envelope',
    summary: 'The sideways planet with an extreme axial tilt of 97.77°, likely knocked over by a giant protoplanetary impact billions of years ago.',
    discovery: 'Discovered by William Herschel in 1781 using optical telescope',
    missions: 'Voyager 2 (1986 Flyby)',
    specialFeature: 'Experiences extreme 42-year long polar days and 42-year long polar nights.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    category: 'ICE_GIANT',
    type: 'Dynamic Deep-Blue Ice Giant',
    distAU: 30.05,
    radiusKm: 24622,
    massKg: '1.024 × 10²⁶ kg (17.1x Earth)',
    orbitalPeriodDays: 60190,
    orbitRadiusCanvas: 276,
    orbitSpeed: 0.0035,
    color: '#3b82f6',
    surfaceTemp: '-218°C',
    coreTemp: '5,100°C',
    gravity: '11.15 m/s² (1.14g)',
    escapeVelocity: '23.5 km/s',
    dayLength: '16h 06m',
    moons: 16,
    atmosphere: '80.0% Hydrogen, 19.0% Helium, 1.5% Methane',
    internalStructure: 'Rocky Nickel-Iron Core ➔ Supercritical Fluid Water-Ammonia Mantle ➔ Atmosphere',
    summary: 'Most distant major planet, featuring the fastest supersonic atmospheric winds in the Solar System exceeding 2,100 km/h and dark anticyclonic vortex storms.',
    discovery: 'Discovered in 1846 by Johann Galle via mathematical predictions by Urbain Le Verrier',
    missions: 'Voyager 2 (1989 Flyby)',
    specialFeature: 'Moon Triton orbits retrograde, has active cryogenic nitrogen geysers, and is a captured Kuiper Belt object.',
  },
];

// ASTROPHYSICS FACT ENCYCLOPEDIA WITH INFOGRAPHICS
interface SpaceFact {
  id: string;
  category: 'RELATIVITY' | 'EXOPLANETS' | 'COMPACT_OBJECTS' | 'COSMOLOGY' | 'JWST_DISCOVERIES';
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  scientificReference: string;
  breakdown: string;
  color: string;
}

const SPACE_FACTS: SpaceFact[] = [
  {
    id: 'FACT-TIME-DILATION',
    category: 'RELATIVITY',
    title: 'Gravitational Time Dilation & Black Holes',
    metric: '1 hr = 7 yrs',
    metricLabel: 'Miller’s Planet (r = 1.1 Rs near Gargantua)',
    description: 'In Einstein’s General Relativity, deep gravitational potential wells slow down the progression of proper time. Near the event horizon of a supermassive Kerr black hole, time passes exponentially slower relative to distant observers.',
    scientificReference: 'Einstein Field Equations: G_μν + Λg_μν = (8πG/c⁴) T_μν; Kip Thorne gravitational lensing model.',
    breakdown: 'Proper time ratio: dτ = dt √(1 - 2GM/rc²). At r = 1.01 Rs, a single second represents days for an outside observer.',
    color: '#f59e0b',
  },
  {
    id: 'FACT-NEUTRON-MAGNETAR',
    category: 'COMPACT_OBJECTS',
    title: 'Magnetars: Cosmic Magnetic Titans',
    metric: '10¹¹ Tesla',
    metricLabel: 'Magnetic Field Strength (10¹⁵ Gauss)',
    description: 'Magnetars are ultra-dense neutron stars with magnetic fields strong enough to dissolve atomic electron orbitals into thin needles from 1,000 km away. Crust starquakes trigger massive gamma-ray giant flares that ionize Earth’s upper atmosphere.',
    scientificReference: 'Soft Gamma Repeaters (SGR 1806-20 giant flare); Relativistic QED vacuum birefringence.',
    breakdown: 'A single teaspoon of magnetar crust weighs over 1 billion tons. Its magnetic energy density exceeds 10²⁵ J/m³.',
    color: '#ef4444',
  },
  {
    id: 'FACT-CMB-RELIC',
    category: 'COSMOLOGY',
    title: 'Cosmic Microwave Background (CMB)',
    metric: '2.725 Kelvin',
    metricLabel: 'Relic Big Bang Thermal Radiation',
    description: 'The afterglow of the Big Bang emitted 380,000 years after creation during recombination when the universe cooled below 3,000K, allowing neutral hydrogen to form and photons to decouple and free-stream across space.',
    scientificReference: 'Planck / WMAP satellites; Sachs-Wolfe effect; Baryon Acoustic Oscillations (BAO).',
    breakdown: 'The CMB fills every cubic centimeter of space with ~411 photons, preserving tiny 10⁻⁵ temperature fluctuations that seeded all galaxies.',
    color: '#00d4ff',
  },
  {
    id: 'FACT-DARK-ENERGY',
    category: 'COSMOLOGY',
    title: 'Dark Energy & Accelerated Expansion',
    metric: '68.3% & 26.8%',
    metricLabel: 'Dark Energy & Dark Matter Cosmic Share',
    description: 'Ordinary baryonic matter (stars, planets, interstellar gas, atoms) accounts for less than 4.9% of the universe. Dark Energy acts as a repulsive negative pressure driving accelerated metric expansion of space.',
    scientificReference: 'Type Ia Supernovae standard candles (Perlmutter, Schmidt, Riess 1998 Nobel Prize); Planck Collaboration.',
    breakdown: 'Cosmological Constant equation of state: w = p/ρ ≈ -1.03 ± 0.03, pointing towards eternal cosmic expansion and heat death.',
    color: '#a855f7',
  },
  {
    id: 'FACT-JWST-EARLY-UNIVERSE',
    category: 'JWST_DISCOVERIES',
    title: 'JWST High-Redshift Early Galaxies',
    metric: 'z = 14.32',
    metricLabel: 'JADES-GS-z14-0 (290M yrs post-Big Bang)',
    description: 'The James Webb Space Telescope discovered luminous, massive galaxies existing only 290–330 million years after the Big Bang, challenging traditional hierarchical galaxy assembly and dark matter halo growth models.',
    scientificReference: 'JWST NIRCam / NIRSpec JADES Survey; Lyman-break spectroscopy; Carniani et al. (2024).',
    breakdown: 'Features intense UV luminosity and substantial dust enrichment, indicating rapid early Population III star formation.',
    color: '#10b981',
  },
  {
    id: 'FACT-EXOPLANET-TRAPPIST',
    category: 'EXOPLANETS',
    title: 'TRAPPIST-1 Seven Earth-Sized Worlds',
    metric: '3 In Habitable Zone',
    metricLabel: 'TRAPPIST-1e, f, g (Liquid Water Candidates)',
    description: 'An ultra-cool red dwarf star 40 light-years away hosting 7 resonant rocky planets. TRAPPIST-1e is considered one of the highest-priority exoplanets for atmospheric biosignature (water vapor, ozone, methane) spectroscopy.',
    scientificReference: 'Spitzer / JWST Transmission Spectroscopy; Atmospheric escape & M-dwarf stellar flare dynamics.',
    breakdown: 'Planets are locked in complex Laplace orbital resonances: while planet b completes 8 orbits, c completes 5, d completes 3, and e completes 2.',
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
  const [bhMassSolar, setBhMassSolar] = useState<number>(100000000); // 100 million solar masses
  const [observerDistRs, setObserverDistRs] = useState<number>(1.1); // Distance in Schwarzschild radii
  const [accretionSpin, setAccretionSpin] = useState<number>(0.998); // Kerr dimensionless spin parameter
  const [cameraTiltAngle, setCameraTiltAngle] = useState<number>(0.15); // Camera pitch angle
  const bhCanvasRef = useRef<HTMLCanvasElement>(null);

  // Space Facts State
  const [factSearch, setFactSearch] = useState<string>('');
  const [selectedFactCategory, setSelectedFactCategory] = useState<string>('ALL');

  const selectedObject = CELESTIAL_OBJECTS.find((p) => p.id === selectedPlanetId) || CELESTIAL_OBJECTS[3];

  // -------------------------------------------------------------
  // 1. HIGH-FIDELITY SOLAR SYSTEM 3D ORRERY CANVAS ANIMATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'SOLAR_SYSTEM') return;
    const canvas = solarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const angleOffsets = CELESTIAL_OBJECTS.map((p) => Math.random() * Math.PI * 2);

    // Generate 140 static asteroid belt coordinates
    const asteroids = Array.from({ length: 140 }).map((_, i) => ({
      distOffset: Math.random() * 18 - 9,
      angleOffset: (i / 140) * Math.PI * 2 + Math.random() * 0.05,
      speed: 0.013 + Math.random() * 0.003,
      size: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.5 + 0.3,
    }));

    const render = () => {
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space backdrop
      ctx.fillStyle = '#01040d';
      ctx.fillRect(0, 0, w, h);

      // Dynamic Twinkling Background Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 147.2) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 289.4) * 0.5 + 0.5) * h;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      const scale = Math.min(w, h) / 640;

      // 1. Draw Asteroid Belt (Between Mars at 114 and Jupiter at 152)
      const asteroidBaseRadius = 133 * scale;
      asteroids.forEach((ast) => {
        if (!isOrbitPaused) {
          ast.angleOffset += ast.speed * orbitSpeedMultiplier * 0.4;
        }
        const ar = asteroidBaseRadius + ast.distOffset * scale;
        const ax = cx + Math.cos(ast.angleOffset) * ar;
        const ay = cy + Math.sin(ast.angleOffset) * ar * 0.88; // Slight 3D inclination
        ctx.beginPath();
        ctx.arc(ax, ay, ast.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(163, 163, 163, ${ast.alpha})`;
        ctx.fill();
      });

      // 2. Draw Central Sun (Clickable)
      const sunPulse = Math.sin(Date.now() * 0.003) * 2;
      const sunGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, (28 + sunPulse) * scale);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fde047');
      sunGrad.addColorStop(0.7, '#ea580c');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, (28 + sunPulse) * scale, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core Body
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Sun Selection Ring
      if (selectedPlanetId === 'sun') {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Draw Planetary Orbits & Planets
      CELESTIAL_OBJECTS.forEach((planet, idx) => {
        if (planet.id === 'sun') return;

        const r = planet.orbitRadiusCanvas * scale;
        const isSelected = planet.id === selectedPlanetId;

        // Elliptical Orbit Track with 3D perspective
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.88, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isSelected ? 1.6 : 0.8;
        if (!isSelected) ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Update angle
        if (!isOrbitPaused) {
          angleOffsets[idx] += planet.orbitSpeed * orbitSpeedMultiplier * 0.4;
        }
        const a = angleOffsets[idx];
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r * 0.88;

        const pSize = Math.max(3.5, (Math.log10(planet.radiusKm) - 2.5) * 4.5 * scale);

        // Selection Aura
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, pSize + 7, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // Planet Body
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = planet.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Saturn's Multi-Ring System with Cassini Division
        if (planet.id === 'saturn') {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(0.35);
          // Outer A Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 2.4, pSize * 0.8, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          // Inner B Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 1.7, pSize * 0.55, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();
        }

        // Jupiter's 4 Galilean Moons (Io, Europa, Ganymede, Callisto)
        if (planet.id === 'jupiter') {
          const mSpeeds = [0.08, 0.04, 0.02, 0.01];
          const mDists = [10, 14, 18, 22];
          mDists.forEach((md, mi) => {
            const ma = a * 4 + Date.now() * 0.002 * mSpeeds[mi];
            const mx = px + Math.cos(ma) * md * scale;
            const my = py + Math.sin(ma) * md * scale * 0.88;
            ctx.beginPath();
            ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = '#fde68a';
            ctx.fill();
          });
        }

        // Earth's Moon
        if (planet.id === 'earth') {
          const moonAngle = a * 12;
          const mx = px + Math.cos(moonAngle) * 9 * scale;
          const my = py + Math.sin(moonAngle) * 9 * scale;
          ctx.beginPath();
          ctx.arc(mx, my, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.fill();
        }

        // Planet Name Label
        if (isSelected) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold 10px 'Space Grotesk', sans-serif`;
          ctx.fillText(planet.name, px + 9, py - 6);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, selectedPlanetId, orbitSpeedMultiplier, isOrbitPaused]);

  // -------------------------------------------------------------
  // 2. INTERSTELLAR GARGANTUA BLACK HOLE 3D RELATIVISTIC SIMULATOR
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'BLACK_HOLE_3D') return;
    const canvas = bhCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Relativistic accretion gas particles
    const gasParticles = Array.from({ length: 180 }).map(() => ({
      radius: Math.random() * 1.8 + 1.15, // in multiples of horizon radius
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.025 + 0.015,
      size: Math.random() * 2.0 + 0.8,
      intensity: Math.random() * 0.7 + 0.3,
    }));

    const renderBH = () => {
      time += 0.02;
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Pitch black void
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, w, h);

      const bhRadius = Math.min(w, h) * 0.17; // Event horizon radius

      // 1. Einstein Warped Background Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 70; i++) {
        const baseAngle = i * 0.28;
        const dist = bhRadius * 1.5 + (i % 12) * 16;
        const sx = cx + Math.cos(baseAngle + time * 0.03) * dist;
        const sy = cy + Math.sin(baseAngle + time * 0.03) * dist * 0.65;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }

      ctx.save();
      ctx.translate(cx, cy);

      // 2. Gravitational Lensing: Top Arc of the Accretion Disk (Light bent over the black hole)
      const topHaloGrad = ctx.createLinearGradient(-bhRadius * 2.2, -bhRadius * 1.6, bhRadius * 2.2, 0);
      topHaloGrad.addColorStop(0, '#ffffff'); // Approaching blueshifted core
      topHaloGrad.addColorStop(0.2, '#fef08a');
      topHaloGrad.addColorStop(0.5, '#f59e0b');
      topHaloGrad.addColorStop(0.85, '#dc2626');
      topHaloGrad.addColorStop(1, 'rgba(120, 20, 20, 0.2)'); // Receding redshifted side

      ctx.beginPath();
      ctx.ellipse(0, -bhRadius * 0.16, bhRadius * 1.65, bhRadius * 1.3, 0, Math.PI, 0);
      ctx.strokeStyle = topHaloGrad;
      ctx.lineWidth = bhRadius * 0.48;
      ctx.shadowBlur = 45;
      ctx.shadowColor = '#f59e0b';
      ctx.stroke();

      // 3. Gravitational Lensing: Bottom Arc (Light bent beneath the event horizon)
      const bottomHaloGrad = ctx.createLinearGradient(-bhRadius * 1.8, 0, bhRadius * 1.8, bhRadius * 1.3);
      bottomHaloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
      bottomHaloGrad.addColorStop(1, 'rgba(160, 20, 20, 0.15)');
      ctx.beginPath();
      ctx.ellipse(0, bhRadius * 0.16, bhRadius * 1.45, bhRadius * 1.05, 0, 0, Math.PI);
      ctx.strokeStyle = bottomHaloGrad;
      ctx.lineWidth = bhRadius * 0.38;
      ctx.stroke();

      // 4. Kip Thorne Secondary Photon Ring (1.5 Rs)
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 1.06, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();

      // 5. Swirling Relativistic Gas Stream Particles in Accretion Disk
      gasParticles.forEach((p) => {
        p.angle += p.speed * (1 / p.radius);
        const px = Math.cos(p.angle) * (p.radius * bhRadius);
        const py = Math.sin(p.angle) * (p.radius * bhRadius) * (0.35 + cameraTiltAngle);

        // Relativistic Doppler beaming factor: Left side (cos < 0) moving towards observer
        const isApproaching = Math.sin(p.angle) > 0;
        const color = isApproaching ? '#ffffff' : '#f59e0b';

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.intensity * (isApproaching ? 0.95 : 0.4);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 6. Main Horizontal Accretion Disk (Front Plane)
      const diskGrad = ctx.createLinearGradient(-bhRadius * 3.0, 0, bhRadius * 3.0, 0);
      diskGrad.addColorStop(0, '#ffffff'); // Intense Doppler blueshift
      diskGrad.addColorStop(0.15, '#fef08a');
      diskGrad.addColorStop(0.45, '#f59e0b');
      diskGrad.addColorStop(0.8, '#dc2626');
      diskGrad.addColorStop(1, 'rgba(90, 10, 10, 0.15)');

      ctx.beginPath();
      ctx.ellipse(0, 0, bhRadius * 2.8, bhRadius * (0.45 + cameraTiltAngle), -0.05, 0, Math.PI * 2);
      ctx.strokeStyle = diskGrad;
      ctx.lineWidth = bhRadius * 0.44;
      ctx.shadowBlur = 50;
      ctx.shadowColor = '#f59e0b';
      ctx.stroke();

      // 7. Central Event Horizon (The Pitch Black Sphere Shadow)
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(renderBH);
    };

    animId = requestAnimationFrame(renderBH);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, cameraTiltAngle]);

  const timeDilationFactor = useMemo(() => {
    const r = Math.max(1.001, observerDistRs);
    const factor = Math.sqrt(1 - 1 / r);
    return factor > 0 ? (1 / factor).toFixed(2) : '∞ (INFINITE AT HORIZON)';
  }, [observerDistRs]);

  const schwarzschildRadiusKm = useMemo(() => {
    return (2.953 * bhMassSolar).toLocaleString();
  }, [bhMassSolar]);

  const filteredFacts = useMemo(() => {
    return SPACE_FACTS.filter((f) => {
      const matchSearch =
        f.title.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.breakdown.toLowerCase().includes(factSearch.toLowerCase());
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
                      THE SUN + 8 PLANETS + ASTEROID BELT // CLICK OBJECT TO INSPECT
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
              <div className="relative aspect-[16/10] w-full bg-[#01040d] rounded-2xl overflow-hidden border border-glass-border/50">
                <canvas ref={solarCanvasRef} className="w-full h-full block" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-star-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
                  <span>SUN + 8 PLANETARY ORBITS + ASTEROID BELT</span>
                </div>
              </div>

              {/* Quick Selector Pills (Sun + All Planets) */}
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CELESTIAL_OBJECTS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelectedPlanetId(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-space tracking-wider border cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${
                      p.id === selectedPlanetId
                        ? 'bg-cyan-glow/25 border-cyan-glow text-star-white font-bold shadow-[0_0_15px_rgba(99,199,255,0.35)] scale-105'
                        : 'bg-black/60 border-white/10 text-star-white/70 hover:text-star-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Selected Celestial Object Detailed Inspection Card (Right 4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              <motion.div
                className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-glow/30 box-glow relative overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                  <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-cyan-glow">
                    ASTROPHYSICS // {selectedObject.name.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-glow/15 text-cyan-glow font-bold">
                    {selectedObject.category}
                  </span>
                </div>

                <div className="space-y-2.5 font-space text-xs">
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Distance from Sun:</span>
                    <span className="font-mono text-star-white font-bold">{selectedObject.distAU} AU</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Equatorial Radius:</span>
                    <span className="font-mono text-star-white font-bold">{selectedObject.radiusKm.toLocaleString()} km</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Mass:</span>
                    <span className="font-mono text-star-white font-bold text-[11px]">{selectedObject.massKg}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Orbital Period:</span>
                    <span className="font-mono text-cyan-glow font-bold">
                      {selectedObject.orbitalPeriodDays > 0 ? `${selectedObject.orbitalPeriodDays} Earth Days` : 'Galactic Orbit ~230M yrs'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Surface Gravity:</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedObject.gravity}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Surface Temperature:</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">{selectedObject.surfaceTemp}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-muted-gray text-[11px]">Core Temperature:</span>
                    <span className="font-mono text-purple-400 font-bold text-[11px]">{selectedObject.coreTemp}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-glass-border space-y-2 text-xs">
                  <span className="font-space text-[10px] uppercase font-bold text-star-white block">
                    INTERNAL STRUCTURE &amp; MISSIONS:
                  </span>
                  <p className="font-inter text-[11px] text-star-white/90 leading-relaxed">
                    {selectedObject.summary}
                  </p>
                  <p className="font-inter text-[10px] text-star-white/70">
                    <strong className="text-cyan-glow font-space">Structure:</strong> {selectedObject.internalStructure}
                  </p>
                  <p className="font-inter text-[10px] text-muted-gray">
                    <strong className="text-amber-300 font-space">Exploration:</strong> {selectedObject.missions}
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
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-space">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Observer Orbit (r / Rs):</span>
                    <span className="font-mono text-amber-400 font-bold">{observerDistRs} Rs</span>
                  </div>
                  <input
                    type="range"
                    min="1.01"
                    max="8.0"
                    step="0.05"
                    value={observerDistRs}
                    onChange={(e) => setObserverDistRs(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Disk Tilt Pitch:</span>
                    <span className="font-mono text-cyan-glow font-bold">{(cameraTiltAngle * 90).toFixed(0)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.45"
                    step="0.02"
                    value={cameraTiltAngle}
                    onChange={(e) => setCameraTiltAngle(parseFloat(e.target.value))}
                    className="w-full accent-cyan-glow cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Black Hole Mass (M☉):</span>
                    <span className="font-mono text-purple-400 font-bold">{bhMassSolar.toLocaleString()} M☉</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="300000000"
                    step="5000000"
                    value={bhMassSolar}
                    onChange={(e) => setBhMassSolar(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
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

            {/* Fact Cards Grid with Rich Visual Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border hover:border-purple-400/40 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                        {fact.category}
                      </span>
                      <span className="text-[10px] font-mono text-muted-gray">{fact.id}</span>
                    </div>

                    <h3 className="font-space text-sm font-bold text-star-white">{fact.title}</h3>

                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-0.5">
                      <span className="font-mono text-lg font-bold text-purple-400 block">{fact.metric}</span>
                      <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">{fact.metricLabel}</span>
                    </div>

                    <p className="font-inter text-xs text-star-white/85 leading-relaxed">
                      {fact.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300">
                      {fact.breakdown}
                    </div>
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
