'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  ArrowRight,
  Radio,
  Target,
  Compass as CompassIcon,
} from 'lucide-react';

// CELESTIAL BODIES DEFINITIONS (SUN + 8 PLANETS + PLUTO)
interface CelestialBody {
  id: string;
  name: string;
  category: 'STAR' | 'ROCKY' | 'GAS_GIANT' | 'ICE_GIANT' | 'DWARF';
  subtitle: string;
  orderFromSun: number;
  distAU: number;
  distMillionKm: number;
  radiusKm: number;
  scaleRatioVsEarth: number;
  massKg: string;
  massEarths: number;
  orbitalPeriod: string;
  orbitalSpeedKmS: number;
  orbitRadiusPx: number;
  orbitSpeedFactor: number;
  color: string;
  glowColor: string;
  surfaceTemp: string;
  coreTemp: string;
  gravityMps2: number;
  gravityG: number;
  escapeVelocityKmS: number;
  dayLength: string;
  axialTiltDeg: number;
  moonsCount: number;
  majorMoons: string[];
  atmosphere: string[];
  layers: { name: string; depth: string; composition: string; color: string }[];
  summary: string;
  specialFeature: string;
  missions: string[];
}

const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun',
    category: 'STAR',
    subtitle: 'G2V Main-Sequence Yellow Dwarf Star',
    orderFromSun: 0,
    distAU: 0.0,
    distMillionKm: 0.0,
    radiusKm: 696340,
    scaleRatioVsEarth: 109.3,
    massKg: '1.989 × 10³⁰ kg',
    massEarths: 333000,
    orbitalPeriod: 'Galactic Year ~230 Million Years',
    orbitalSpeedKmS: 230.0,
    orbitRadiusPx: 0,
    orbitSpeedFactor: 0,
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.8)',
    surfaceTemp: '5,500 °C (Photosphere)',
    coreTemp: '15,000,000 °C (Nuclear Fusion)',
    gravityMps2: 274.0,
    gravityG: 28.0,
    escapeVelocityKmS: 617.7,
    dayLength: '25–35 Earth Days (Differential)',
    axialTiltDeg: 7.25,
    moonsCount: 8,
    majorMoons: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    atmosphere: ['73.46% Hydrogen', '24.85% Helium', '0.77% Oxygen', '0.29% Carbon'],
    layers: [
      { name: 'Thermonuclear Core', depth: '0 – 175,000 km', composition: 'Dense plasma undergoing p-p hydrogen fusion', color: '#ffffff' },
      { name: 'Radiative Zone', depth: '175,000 – 490,000 km', composition: 'Photon diffusion zone (takes 100,000 yrs for light to escape)', color: '#fde047' },
      { name: 'Convective Zone', depth: '490,000 – 696,000 km', composition: 'Boiling plasma convection cells (granules)', color: '#ea580c' },
      { name: 'Photosphere & Corona', depth: 'Outer Atmosphere', composition: 'Million-degree solar corona & CME magnetic loops', color: '#f97316' },
    ],
    summary: 'The radiant heart of the Solar System containing 99.86% of its mass. Converts 600 million tons of hydrogen into helium every second, generating the light and warmth powering Earth’s biosphere.',
    specialFeature: 'Coronal Mass Ejections (CMEs) unleash billions of tons of magnetized plasma across the solar wind at >800 km/s.',
    missions: ['Parker Solar Probe', 'Aditya-L1', 'SOHO', 'Solar Dynamics Observatory (SDO)', 'Solar Orbiter'],
  },
  {
    id: 'mercury',
    name: 'Mercury',
    category: 'ROCKY',
    subtitle: 'Heavily Cratered Metallic Core World',
    orderFromSun: 1,
    distAU: 0.39,
    distMillionKm: 57.9,
    radiusKm: 2439.7,
    scaleRatioVsEarth: 0.38,
    massKg: '3.301 × 10²³ kg',
    massEarths: 0.055,
    orbitalPeriod: '88 Earth Days',
    orbitalSpeedKmS: 47.4,
    orbitRadiusPx: 42,
    orbitSpeedFactor: 0.048,
    color: '#a3a3a3',
    glowColor: 'rgba(163, 163, 163, 0.6)',
    surfaceTemp: '-180 °C to +430 °C',
    coreTemp: '1,500 °C',
    gravityMps2: 3.7,
    gravityG: 0.38,
    escapeVelocityKmS: 4.25,
    dayLength: '58.6 Earth Days (3:2 Spin-Orbit)',
    axialTiltDeg: 0.03,
    moonsCount: 0,
    majorMoons: [],
    atmosphere: ['Trace Exosphere: 42% Oxygen', '29% Sodium', '22% Hydrogen', '6% Helium'],
    layers: [
      { name: 'Giant Metallic Core', depth: 'Radius: 2,000 km (85% of planet)', composition: 'Partially molten iron-nickel dynamo', color: '#71717a' },
      { name: 'Silicate Mantle', depth: 'Thickness: 400 km', composition: 'Dense magnesium-iron silicates', color: '#a1a1aa' },
      { name: 'Cratered Basaltic Crust', depth: 'Thickness: 35 km', composition: 'Impact-shattered regolith & lobate scarps', color: '#d4d4d8' },
    ],
    summary: 'Smallest planet in the solar system and closest to the Sun. Experiences the most extreme diurnal temperature swing of 610°C between blistering daytime and frigid nights.',
    specialFeature: 'Giant thrust faults (lobate scarps) show the entire planet contracted by ~7 km as its massive iron core cooled.',
    missions: ['Mariner 10 (1974)', 'MESSENGER (2011–2015)', 'BepiColombo (In Transit 2026)'],
  },
  {
    id: 'venus',
    name: 'Venus',
    category: 'ROCKY',
    subtitle: 'Runaway Greenhouse Volcanic Twin',
    orderFromSun: 2,
    distAU: 0.72,
    distMillionKm: 108.2,
    radiusKm: 6051.8,
    scaleRatioVsEarth: 0.95,
    massKg: '4.867 × 10²⁴ kg',
    massEarths: 0.815,
    orbitalPeriod: '224.7 Earth Days',
    orbitalSpeedKmS: 35.0,
    orbitRadiusPx: 72,
    orbitSpeedFactor: 0.035,
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    surfaceTemp: '+465 °C (Hotter than Mercury)',
    coreTemp: '2,800 °C',
    gravityMps2: 8.87,
    gravityG: 0.9,
    escapeVelocityKmS: 10.36,
    dayLength: '243 Earth Days (Retrograde Spin)',
    axialTiltDeg: 177.3,
    moonsCount: 0,
    majorMoons: [],
    atmosphere: ['96.5% Carbon Dioxide', '3.5% Nitrogen', 'Sulfuric Acid Clouds (92 bar pressure)'],
    layers: [
      { name: 'Iron-Nickel Core', depth: 'Radius: 3,000 km', composition: 'Metallic core without active global magnetic dynamo', color: '#854d0e' },
      { name: 'Convecting Rocky Mantle', depth: 'Thickness: 3,000 km', composition: 'Silicate rock under intense thermal plumes', color: '#ca8a04' },
      { name: 'Basaltic Volcanic Crust', depth: 'Thickness: 20–50 km', composition: 'Thousands of shield volcanoes and lava plains', color: '#eab308' },
    ],
    summary: 'Earth’s toxic twin enveloped in opaque sulfuric acid clouds. With 92 atmospheres of crushing pressure and constant 465°C furnace temperatures, it is the hottest planet in the Solar System.',
    specialFeature: 'Rotates backwards (retrograde) extremely slowly: a single Venusian day lasts longer than its orbital year!',
    missions: ['Venera 7–14 Landers (USSR)', 'Magellan Radar (NASA)', 'Akatsuki (JAXA)', 'DAVINCI / VERITAS (Upcoming)'],
  },
  {
    id: 'earth',
    name: 'Earth & Moon',
    category: 'ROCKY',
    subtitle: 'Dynamic Ocean Biosphere & Habitable Sanctuary',
    orderFromSun: 3,
    distAU: 1.0,
    distMillionKm: 149.6,
    radiusKm: 6371.0,
    scaleRatioVsEarth: 1.0,
    massKg: '5.972 × 10²⁴ kg',
    massEarths: 1.0,
    orbitalPeriod: '365.25 Earth Days (1 Year)',
    orbitalSpeedKmS: 29.8,
    orbitRadiusPx: 105,
    orbitSpeedFactor: 0.026,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    surfaceTemp: '-88 °C to +58 °C (Mean: +15 °C)',
    coreTemp: '5,400 °C (Hot as Sun’s Surface)',
    gravityMps2: 9.807,
    gravityG: 1.0,
    escapeVelocityKmS: 11.18,
    dayLength: '23h 56m 04s (1 Solar Day = 24h)',
    axialTiltDeg: 23.44,
    moonsCount: 1,
    majorMoons: ['The Moon (Luna, 3,474 km dia)'],
    atmosphere: ['78.08% Nitrogen', '20.95% Oxygen', '0.93% Argon', '0.04% Carbon Dioxide'],
    layers: [
      { name: 'Solid Inner Core', depth: 'Radius: 1,220 km', composition: 'Crystalline solid iron-nickel alloy at 3.3 million atm', color: '#ffffff' },
      { name: 'Liquid Outer Core', depth: 'Thickness: 2,260 km', composition: 'Flowing molten iron dynamo generating the magnetosphere', color: '#38bdf8' },
      { name: 'Convecting Silicate Mantle', depth: 'Thickness: 2,900 km', composition: 'Solid rock undergoing ductile plastic convection', color: '#0284c7' },
      { name: 'Ocean & Continental Crust', depth: 'Thickness: 5–70 km', composition: 'Granite continents, basalt ocean floor & water oceans', color: '#bae6fd' },
    ],
    summary: 'The only known astronomical world supporting life, featuring liquid surface water oceans, plate tectonics, and a protective magnetosphere shielding the biosphere from cosmic radiation.',
    specialFeature: 'Tidally locked Moon stabilizes Earth’s 23.4° axial tilt, guaranteeing long-term climate stability for billions of years.',
    missions: ['Thousands of Earth Observation Fleets (Sentinel, Landsat)', 'Apollo Lunar Landings (11–17)', 'International Space Station'],
  },
  {
    id: 'mars',
    name: 'Mars',
    category: 'ROCKY',
    subtitle: 'Red Desert World & Ancient River Valleys',
    orderFromSun: 4,
    distAU: 1.52,
    distMillionKm: 227.9,
    radiusKm: 3389.5,
    scaleRatioVsEarth: 0.53,
    massKg: '6.417 × 10²³ kg',
    massEarths: 0.107,
    orbitalPeriod: '687 Earth Days (1.88 Yrs)',
    orbitalSpeedKmS: 24.1,
    orbitRadiusPx: 142,
    orbitSpeedFactor: 0.019,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    surfaceTemp: '-140 °C to +20 °C (Mean: -63 °C)',
    coreTemp: '1,900 °C',
    gravityMps2: 3.72,
    gravityG: 0.38,
    escapeVelocityKmS: 5.03,
    dayLength: '24h 37m 22s (1 Martian Sol)',
    axialTiltDeg: 25.19,
    moonsCount: 2,
    majorMoons: ['Phobos (22.2 km)', 'Deimos (12.4 km)'],
    atmosphere: ['95.32% Carbon Dioxide', '2.6% Nitrogen', '1.9% Argon', '0.13% Oxygen'],
    layers: [
      { name: 'Dense Metallic Core', depth: 'Radius: 1,830 km', composition: 'Iron, nickel, and sulfur (partially molten)', color: '#991b1b' },
      { name: 'Silicate Mantle', depth: 'Thickness: 1,500 km', composition: 'Iron-rich peridotite silicate rock', color: '#b91c1c' },
      { name: 'Ferric Oxide Basalt Crust', depth: 'Thickness: 50 km', composition: 'Basaltic rock covered in rust (iron oxide) dust', color: '#ef4444' },
    ],
    summary: 'The Red Planet, sculpted by ancient rivers, deltas, and giant volcanic eruptions. Features Olympus Mons (tallest planetary volcano at 21.9 km) and Valles Marineris (4,000 km canyon).',
    specialFeature: 'Extensive subsurface water ice deposits discovered across mid-latitude plains and polar ice sheets.',
    missions: ['Curiosity Rover', 'Perseverance Rover & Ingenuity', 'Mangalyaan (ISRO)', 'Hope Probe (UAE)', 'Tianwen-1 (China)'],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    category: 'GAS_GIANT',
    subtitle: 'King of Gas Giants & Lord of 95 Moons',
    orderFromSun: 5,
    distAU: 5.2,
    distMillionKm: 778.5,
    radiusKm: 69911,
    scaleRatioVsEarth: 11.0,
    massKg: '1.898 × 10²⁷ kg',
    massEarths: 317.8,
    orbitalPeriod: '4,333 Earth Days (11.86 Yrs)',
    orbitalSpeedKmS: 13.1,
    orbitRadiusPx: 188,
    orbitSpeedFactor: 0.012,
    color: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.7)',
    surfaceTemp: '-110 °C (1-bar cloud deck)',
    coreTemp: '24,000 °C (Hotter than Sun’s surface)',
    gravityMps2: 24.79,
    gravityG: 2.53,
    escapeVelocityKmS: 59.5,
    dayLength: '9h 55m (Fastest rotation in Solar System)',
    axialTiltDeg: 3.13,
    moonsCount: 95,
    majorMoons: ['Io (Volcanic)', 'Europa (Ocean World)', 'Ganymede (Largest in System)', 'Callisto (Cratered)'],
    atmosphere: ['89.8% Hydrogen', '10.2% Helium', 'trace Methane, Ammonia, Water Ice Crystals'],
    layers: [
      { name: 'Diffuse Heavy Element Core', depth: 'Radius: ~20,000 km', composition: 'Dense rock and metallic solutes under extreme pressure', color: '#ea580c' },
      { name: 'Liquid Metallic Hydrogen', depth: 'Thickness: 40,000 km', composition: 'Hydrogen compressed into an electrical superconductor', color: '#f97316' },
      { name: 'Liquid Molecular Hydrogen', depth: 'Thickness: 15,000 km', composition: 'Fluid hydrogen and helium transition ocean', color: '#fb923c' },
      { name: 'Turbulent Cloud Belts', depth: 'Outer 1,000 km', composition: 'Ammonia and ammonium hydrosulfide cloud bands', color: '#fed7aa' },
    ],
    summary: 'The colossal gas giant containing 2.5 times the mass of all other planets combined. Its massive magnetosphere is the largest continuous structure in the Solar System.',
    specialFeature: 'Great Red Spot is an anticyclonic vortex larger than Earth that has raged continuously for over 350 years.',
    missions: ['Voyager 1 & 2', 'Galileo Orbiter & Atmospheric Probe', 'Juno (Active)', 'JUICE (ESA, In Transit)', 'Europa Clipper (NASA)'],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    category: 'GAS_GIANT',
    subtitle: 'The Ringed Jewel & Ocean Moon Haven',
    orderFromSun: 6,
    distAU: 9.58,
    distMillionKm: 1434.0,
    radiusKm: 58232,
    scaleRatioVsEarth: 9.14,
    massKg: '5.683 × 10²⁶ kg',
    massEarths: 95.2,
    orbitalPeriod: '10,759 Earth Days (29.45 Yrs)',
    orbitalSpeedKmS: 9.7,
    orbitRadiusPx: 235,
    orbitSpeedFactor: 0.008,
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.7)',
    surfaceTemp: '-140 °C',
    coreTemp: '11,700 °C',
    gravityMps2: 10.44,
    gravityG: 1.06,
    escapeVelocityKmS: 35.5,
    dayLength: '10h 33m',
    axialTiltDeg: 26.73,
    moonsCount: 146,
    majorMoons: ['Titan (Dense N₂ Atmosphere)', 'Enceladus (Active Geysers)', 'Mimas', 'Iapetus', 'Rhea'],
    atmosphere: ['96.3% Hydrogen', '3.25% Helium', '0.45% Methane', 'Ammonia haze'],
    layers: [
      { name: 'Rocky Core', depth: 'Radius: ~15,000 km', composition: 'Iron, silicates, and heavy ice under pressure', color: '#ca8a04' },
      { name: 'Metallic Liquid Hydrogen', depth: 'Thickness: ~20,000 km', composition: 'Conductive liquid hydrogen producing magnetic field', color: '#eab308' },
      { name: 'Molecular Liquid Hydrogen', depth: 'Thickness: ~25,000 km', composition: 'Fluid molecular hydrogen & helium rain', color: '#facc15' },
      { name: 'Brilliant Ice Ring System', depth: 'Span: 282,000 km, Thickness: 10m', composition: '99% pure water ice particles (cm to meters)', color: '#fef08a' },
    ],
    summary: 'The ringed masterwork of the cosmos made of billions of water-ice fragments spanning 282,000 km across. Its overall bulk density (0.687 g/cm³) is less than water!',
    specialFeature: 'Moon Enceladus ejects plumes of water vapor and organic volatiles from a warm subsurface global ocean.',
    missions: ['Pioneer 11', 'Voyager 1 & 2', 'Cassini-Huygens (13-Year Orbital Mission)', 'Dragonfly Rotorcraft (Upcoming)'],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    category: 'ICE_GIANT',
    subtitle: 'Sideways Tilted Supercritical Ice Giant',
    orderFromSun: 7,
    distAU: 19.22,
    distMillionKm: 2871.0,
    radiusKm: 25362,
    scaleRatioVsEarth: 3.98,
    massKg: '8.681 × 10²⁵ kg',
    massEarths: 14.5,
    orbitalPeriod: '30,687 Earth Days (84.0 Yrs)',
    orbitalSpeedKmS: 6.8,
    orbitRadiusPx: 280,
    orbitSpeedFactor: 0.005,
    color: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.7)',
    surfaceTemp: '-224 °C (Coldest atmosphere recorded)',
    coreTemp: '4,700 °C',
    gravityMps2: 8.69,
    gravityG: 0.89,
    escapeVelocityKmS: 21.3,
    dayLength: '17h 14m (Retrograde with 97.8° tilt)',
    axialTiltDeg: 97.77,
    moonsCount: 28,
    majorMoons: ['Titania', 'Oberon', 'Umbriel', 'Ariel', 'Miranda (Extreme cliffs)'],
    atmosphere: ['82.5% Hydrogen', '15.2% Helium', '2.3% Methane (absorbs red light, yields cyan color)'],
    layers: [
      { name: 'Silicate-Iron Core', depth: 'Radius: ~5,000 km', composition: 'Dense rock and nickel-iron', color: '#0f766e' },
      { name: 'Supercritical Fluid Ice Mantle', depth: 'Thickness: ~15,000 km', composition: 'Hot dense ocean of water, ammonia, and methane ices', color: '#14b8a6' },
      { name: 'Hydrogen-Helium Atmosphere', depth: 'Outer 5,000 km', composition: 'Atmosphere with methane cloud decks and 13 narrow rings', color: '#2dd4bf' },
    ],
    summary: 'An ice giant tilted completely on its side with a 97.77° axial tilt, rolling around the Sun like a ball. Emits virtually no internal heat compared to other gas planets.',
    specialFeature: 'Experiences extreme 42-year continuous daylight followed by 42-year continuous night at its poles.',
    missions: ['Voyager 2 (1986 Historic Flyby)', 'Uranus Orbiter & Probe (High Priority Decadal Survey)'],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    category: 'ICE_GIANT',
    subtitle: 'Supersonic Azure Storm Giant & Triton Capture',
    orderFromSun: 8,
    distAU: 30.05,
    distMillionKm: 4495.0,
    radiusKm: 24622,
    scaleRatioVsEarth: 3.86,
    massKg: '1.024 × 10²⁶ kg',
    massEarths: 17.1,
    orbitalPeriod: '60,190 Earth Days (164.8 Yrs)',
    orbitalSpeedKmS: 5.4,
    orbitRadiusPx: 322,
    orbitSpeedFactor: 0.0038,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.75)',
    surfaceTemp: '-218 °C',
    coreTemp: '5,100 °C',
    gravityMps2: 11.15,
    gravityG: 1.14,
    escapeVelocityKmS: 23.5,
    dayLength: '16h 06m',
    axialTiltDeg: 28.32,
    moonsCount: 16,
    majorMoons: ['Triton (Captured Retrograde Cryo-Moon)', 'Proteus', 'Nereid'],
    atmosphere: ['80.0% Hydrogen', '19.0% Helium', '1.5% Methane', 'Deep blue hue'],
    layers: [
      { name: 'Rock & Iron Core', depth: 'Radius: ~6,000 km', composition: 'Silicates and nickel-iron', color: '#1e3a8a' },
      { name: 'Supercritical Water-Methane Mantle', depth: 'Thickness: ~14,000 km', composition: 'High-pressure diamond-raining fluid mantle', color: '#2563eb' },
      { name: 'Outer Hydrogen-Helium Atmosphere', depth: 'Outer 4,500 km', composition: 'Supersonic atmospheric winds and Great Dark Spot storms', color: '#3b82f6' },
    ],
    summary: 'The most distant major planet in the Solar System, boasting the fastest recorded supersonic winds in the cosmos exceeding 2,100 km/h and dynamic dark vortex storms.',
    specialFeature: 'Triton is a captured Kuiper Belt dwarf planet orbiting retrograde with active liquid nitrogen cryovolcanoes.',
    missions: ['Voyager 2 (1989 Flyby)'],
  },
];

export default function CosmicCosmologyCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  // Main Section Tabs: SOLAR_SYSTEM, BLACK_HOLE_3D, ASTRO_FACTS
  const [activeTab, setActiveTab] = useState<'SOLAR_SYSTEM' | 'BLACK_HOLE_3D' | 'ASTRO_FACTS'>('SOLAR_SYSTEM');

  // Solar System Controls
  const [selectedBodyId, setSelectedBodyId] = useState<string>('earth');
  const [solarViewMode, setSolarViewMode] = useState<'ORBIT_MAP' | 'SIZE_COMPARISON' | 'LAYER_INSPECTOR'>('ORBIT_MAP');
  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState<number>(1);
  const [isOrbitPaused, setIsOrbitPaused] = useState<boolean>(false);
  const [scaleMode, setScaleMode] = useState<'VISUAL_ENHANCED' | 'TRUE_PROPORTION'>('VISUAL_ENHANCED');
  const solarCanvasRef = useRef<HTMLCanvasElement>(null);

  // Inspector Sub-tab
  const [inspectorTab, setInspectorTab] = useState<'OVERVIEW' | 'LAYERS' | 'PHYSICS' | 'MISSIONS'>('OVERVIEW');

  // Black Hole State
  const [bhMassSolar, setBhMassSolar] = useState<number>(100000000);
  const [observerDistRs, setObserverDistRs] = useState<number>(1.1);
  const [cameraTiltAngle, setCameraTiltAngle] = useState<number>(0.15);
  const bhCanvasRef = useRef<HTMLCanvasElement>(null);

  // Facts Search & Category
  const [factSearch, setFactSearch] = useState<string>('');
  const [selectedFactCategory, setSelectedFactCategory] = useState<string>('ALL');

  const selectedBody = CELESTIAL_BODIES.find((b) => b.id === selectedBodyId) || CELESTIAL_BODIES[3];

  // -------------------------------------------------------------
  // 1. DYNAMIC HIGH-PERFORMANCE SOLAR SYSTEM ORRERY CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'SOLAR_SYSTEM' || solarViewMode !== 'ORBIT_MAP') return;
    const canvas = solarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const angleOffsets = CELESTIAL_BODIES.map((b) => Math.random() * Math.PI * 2);

    // 160 Asteroid Belt particles
    const asteroids = Array.from({ length: 160 }).map((_, i) => ({
      distOffset: Math.random() * 20 - 10,
      angle: (i / 160) * Math.PI * 2 + Math.random() * 0.08,
      speed: 0.015 + Math.random() * 0.003,
      size: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.45 + 0.25,
    }));

    const render = () => {
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space canvas background
      ctx.fillStyle = '#01040d';
      ctx.fillRect(0, 0, w, h);

      // Distant background starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 70; i++) {
        const sx = (Math.sin(i * 192.4) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 341.8) * 0.5 + 0.5) * h;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      const scale = Math.min(w, h) / 720;

      // Draw Asteroid Belt (Between Mars at 142 and Jupiter at 188)
      const asteroidBaseR = 165 * scale;
      asteroids.forEach((ast) => {
        if (!isOrbitPaused) {
          ast.angle += ast.speed * orbitSpeedMultiplier * 0.4;
        }
        const ar = asteroidBaseR + ast.distOffset * scale;
        const ax = cx + Math.cos(ast.angle) * ar;
        const ay = cy + Math.sin(ast.angle) * ar * 0.88;
        ctx.beginPath();
        ctx.arc(ax, ay, ast.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(163, 163, 163, ${ast.alpha})`;
        ctx.fill();
      });

      // Draw Central Sun
      const sunPulse = Math.sin(Date.now() * 0.003) * 2;
      const sunR = (28 + sunPulse) * scale;

      const sunGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, sunR);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fde047');
      sunGrad.addColorStop(0.7, '#ea580c');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Sun Photosphere Core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 12 * scale, 0, Math.PI * 2);
      ctx.fill();

      if (selectedBodyId === 'sun') {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Orbits and Planets
      CELESTIAL_BODIES.forEach((body, idx) => {
        if (body.id === 'sun') return;

        const r = body.orbitRadiusPx * scale;
        const isSelected = body.id === selectedBodyId;

        // Elliptical Orbit Track
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.88, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.75)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isSelected ? 1.8 : 0.8;
        if (!isSelected) ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Update angle
        if (!isOrbitPaused) {
          angleOffsets[idx] += body.orbitSpeedFactor * orbitSpeedMultiplier * 0.4;
        }
        const a = angleOffsets[idx];
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r * 0.88;

        const pSize = Math.max(3.8, (Math.log10(body.radiusKm) - 2.5) * 4.5 * scale);

        // Selection Highlight Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, pSize + 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }

        // Planet Body
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = body.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = body.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Saturn Rings
        if (body.id === 'saturn') {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(0.35);
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 2.4, pSize * 0.8, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 1.7, pSize * 0.55, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();
        }

        // Earth's Moon
        if (body.id === 'earth') {
          const moonAngle = a * 12;
          const mx = px + Math.cos(moonAngle) * 10 * scale;
          const my = py + Math.sin(moonAngle) * 10 * scale;
          ctx.beginPath();
          ctx.arc(mx, my, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.fill();
        }

        // Label on Selected
        if (isSelected) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold 10.5px 'Space Grotesk', sans-serif`;
          ctx.fillText(body.name, px + 10, py - 6);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, solarViewMode, selectedBodyId, orbitSpeedMultiplier, isOrbitPaused]);

  // -------------------------------------------------------------
  // 2. INTERSTELLAR GARGANTUA BLACK HOLE 3D CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'BLACK_HOLE_3D') return;
    const canvas = bhCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const gasParticles = Array.from({ length: 180 }).map(() => ({
      radius: Math.random() * 1.8 + 1.15,
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

      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, w, h);

      const bhRadius = Math.min(w, h) * 0.17;

      // Warped Stars
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

      // Top Gravitational Lens Arc
      const topHaloGrad = ctx.createLinearGradient(-bhRadius * 2.2, -bhRadius * 1.6, bhRadius * 2.2, 0);
      topHaloGrad.addColorStop(0, '#ffffff');
      topHaloGrad.addColorStop(0.2, '#fef08a');
      topHaloGrad.addColorStop(0.5, '#f59e0b');
      topHaloGrad.addColorStop(0.85, '#dc2626');
      topHaloGrad.addColorStop(1, 'rgba(120, 20, 20, 0.2)');

      ctx.beginPath();
      ctx.ellipse(0, -bhRadius * 0.16, bhRadius * 1.65, bhRadius * 1.3, 0, Math.PI, 0);
      ctx.strokeStyle = topHaloGrad;
      ctx.lineWidth = bhRadius * 0.48;
      ctx.shadowBlur = 45;
      ctx.shadowColor = '#f59e0b';
      ctx.stroke();

      // Bottom Arc
      const bottomHaloGrad = ctx.createLinearGradient(-bhRadius * 1.8, 0, bhRadius * 1.8, bhRadius * 1.3);
      bottomHaloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
      bottomHaloGrad.addColorStop(1, 'rgba(160, 20, 20, 0.15)');
      ctx.beginPath();
      ctx.ellipse(0, bhRadius * 0.16, bhRadius * 1.45, bhRadius * 1.05, 0, 0, Math.PI);
      ctx.strokeStyle = bottomHaloGrad;
      ctx.lineWidth = bhRadius * 0.38;
      ctx.stroke();

      // Photon Sphere Ring (1.5 Rs)
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 1.06, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();

      // Swirling Gas Streams
      gasParticles.forEach((p) => {
        p.angle += p.speed * (1 / p.radius);
        const px = Math.cos(p.angle) * (p.radius * bhRadius);
        const py = Math.sin(p.angle) * (p.radius * bhRadius) * (0.35 + cameraTiltAngle);
        const isApproaching = Math.sin(p.angle) > 0;
        const color = isApproaching ? '#ffffff' : '#f59e0b';

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.intensity * (isApproaching ? 0.95 : 0.4);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Primary Horizontal Accretion Disk
      const diskGrad = ctx.createLinearGradient(-bhRadius * 3.0, 0, bhRadius * 3.0, 0);
      diskGrad.addColorStop(0, '#ffffff');
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

      // Central Horizon Shadow
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
    return [
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
    ].filter((f) => {
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

          {/* MAIN MODULE SWITCHER */}
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
        {/* MODULE 1: REVAMPED EASY-TO-UNDERSTAND 3D SOLAR SYSTEM ORRERY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'SOLAR_SYSTEM' && (
          <div className="space-y-6">
            {/* SUB-MODE TOGGLE BAR (Orrery Map vs Size Comparison vs Layer Inspector) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-black/50 border border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {[
                  { id: 'ORBIT_MAP', label: 'HELIOCENTRIC ORRERY MAP', icon: Orbit },
                  { id: 'SIZE_COMPARISON', label: 'PLANETARY SCALE COMPARISON', icon: Sliders },
                  { id: 'LAYER_INSPECTOR', label: 'INTERNAL GEOLOGY LAYERS', icon: Layers },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSel = solarViewMode === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setSolarViewMode(mode.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-space text-xs tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isSel
                          ? 'bg-cyan-glow/20 border border-cyan-glow text-star-white font-bold shadow-[0_0_12px_rgba(99,199,255,0.3)]'
                          : 'text-muted-gray hover:text-star-white border border-transparent'
                      }`}
                    >
                      <Icon size={13} className={isSel ? 'text-cyan-glow' : 'text-muted-gray'} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {solarViewMode === 'ORBIT_MAP' && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsOrbitPaused(!isOrbitPaused)}
                    className="p-2 rounded-xl bg-black/60 border border-white/10 hover:border-cyan-glow text-star-white cursor-pointer"
                  >
                    {isOrbitPaused ? <Play size={13} /> : <Pause size={13} />}
                  </button>

                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
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
              )}
            </div>

            {/* QUICK CELESTIAL STRIP SELECTOR (SUN + 8 PLANETS) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CELESTIAL_BODIES.map((body) => {
                const isSel = body.id === selectedBodyId;
                return (
                  <button
                    type="button"
                    key={body.id}
                    onClick={() => setSelectedBodyId(body.id)}
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-space tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSel
                        ? 'bg-cyan-glow/25 border-cyan-glow text-star-white font-bold shadow-[0_0_18px_rgba(99,199,255,0.35)] scale-105 ring-1 ring-cyan-glow'
                        : 'bg-black/50 border-white/10 text-muted-gray hover:text-star-white hover:border-white/20'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: body.color }} />
                    <span>{body.name}</span>
                    <span className="text-[9px] font-mono text-muted-gray">{body.distAU > 0 ? `${body.distAU} AU` : '0 AU'}</span>
                  </button>
                );
              })}
            </div>

            {/* MAIN VISUALIZER & INSPECTION DUAL COLUMN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column (Canvas or Linear Scale) - 7 Cols */}
              <motion.div
                className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border overflow-hidden relative shadow-[0_0_60px_rgba(4,18,34,0.9)] flex flex-col"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/70 pb-4 mb-4 gap-2">
                  <div>
                    <span className="font-space text-sm font-bold text-star-white uppercase block">
                      {selectedBody.name} {'//'} {selectedBody.subtitle}
                    </span>
                    <span className="font-space text-[10px] text-cyan-glow font-mono">
                      ORBIT DISTANCE: {selectedBody.distMillionKm.toLocaleString()} MILLION KM ({selectedBody.distAU} AU)
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 self-start sm:self-auto">
                    {selectedBody.category}
                  </span>
                </div>

                {/* MODE 1: HELIOCENTRIC ORBIT CANVAS */}
                {solarViewMode === 'ORBIT_MAP' && (
                  <div className="relative aspect-[16/11] w-full bg-[#01040d] rounded-2xl overflow-hidden border border-glass-border/50">
                    <canvas ref={solarCanvasRef} className="w-full h-full block" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 border border-white/10 text-[10px] font-space text-star-white font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
                      <span>HELIOCENTRIC ORBITAL GRID (SUN + 8 PLANETS)</span>
                    </div>
                  </div>
                )}

                {/* MODE 2: PLANETARY SCALE COMPARISON BAR */}
                {solarViewMode === 'SIZE_COMPARISON' && (
                  <div className="p-4 rounded-2xl bg-[#020612] border border-glass-border/50 space-y-4">
                    <span className="text-[10px] font-space text-muted-gray uppercase block font-semibold">
                      RELATIVE EQUATORIAL DIAMETER (EARTH = 1.0X):
                    </span>
                    <div className="space-y-3">
                      {CELESTIAL_BODIES.map((body) => {
                        const pct = Math.min(100, Math.max(3, (body.radiusKm / 696340) * 100 * (body.id === 'sun' ? 0.35 : 12)));
                        const isSel = body.id === selectedBodyId;
                        return (
                          <div
                            key={body.id}
                            onClick={() => setSelectedBodyId(body.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSel ? 'bg-cyan-glow/20 border-cyan-glow' : 'bg-black/40 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between text-xs font-space mb-1">
                              <span className="font-bold text-star-white">{body.name}</span>
                              <span className="font-mono text-cyan-glow">{body.radiusKm.toLocaleString()} km ({body.scaleRatioVsEarth}x Earth)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: body.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MODE 3: INTERNAL GEOLOGY LAYERS */}
                {solarViewMode === 'LAYER_INSPECTOR' && (
                  <div className="p-4 rounded-2xl bg-[#020612] border border-glass-border/50 space-y-3">
                    <span className="text-[10px] font-space text-cyan-glow uppercase block font-bold">
                      INTERNAL CROSS-SECTION LAYERS {'//'} {selectedBody.name.toUpperCase()}
                    </span>
                    <div className="space-y-2.5">
                      {selectedBody.layers.map((layer, idx) => (
                        <div key={layer.name} className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                          <div className="flex items-center justify-between text-xs font-space">
                            <span className="font-bold text-star-white flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
                              <span>{idx + 1}. {layer.name}</span>
                            </span>
                            <span className="font-mono text-[10px] text-cyan-glow">{layer.depth}</span>
                          </div>
                          <p className="text-[11px] font-inter text-star-white/80">{layer.composition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Right Column: In-Depth Astrophysics Details Panel - 5 Cols */}
              <div className="lg:col-span-5 space-y-5">
                <motion.div
                  className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-glow/30 box-glow relative overflow-hidden"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Sub-tabs: Overview, Physics, Atmosphere, Missions */}
                  <div className="flex items-center gap-1.5 border-b border-glass-border pb-3 mb-4 overflow-x-auto scrollbar-none">
                    {[
                      { id: 'OVERVIEW', label: 'OVERVIEW' },
                      { id: 'PHYSICS', label: 'PHYSICS' },
                      { id: 'LAYERS', label: 'LAYERS' },
                      { id: 'MISSIONS', label: 'MISSIONS' },
                    ].map((tab) => (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setInspectorTab(tab.id as any)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-space font-bold border transition-all cursor-pointer ${
                          inspectorTab === tab.id
                            ? 'bg-cyan-glow/25 border-cyan-glow text-star-white'
                            : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB 1: OVERVIEW */}
                  {inspectorTab === 'OVERVIEW' && (
                    <div className="space-y-3 font-space text-xs">
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                        <span className="text-[10px] text-cyan-glow uppercase font-bold block">ASTROPHYSICAL SUMMARY:</span>
                        <p className="font-inter text-xs text-star-white/90 leading-relaxed">{selectedBody.summary}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block">KEY SCIENTIFIC PHENOMENON:</span>
                        <p className="font-inter text-[11px] text-star-white/90 leading-tight">{selectedBody.specialFeature}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                          <span className="text-[9px] text-muted-gray uppercase block">SURFACE TEMP:</span>
                          <span className="font-mono text-sm font-bold text-emerald-400 mt-0.5 block">{selectedBody.surfaceTemp}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                          <span className="text-[9px] text-muted-gray uppercase block">CORE TEMP:</span>
                          <span className="font-mono text-sm font-bold text-amber-400 mt-0.5 block">{selectedBody.coreTemp}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PHYSICS */}
                  {inspectorTab === 'PHYSICS' && (
                    <div className="space-y-2.5 font-space text-xs">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Equatorial Radius:</span>
                        <span className="font-mono text-star-white font-bold">{selectedBody.radiusKm.toLocaleString()} km</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Total Mass:</span>
                        <span className="font-mono text-star-white font-bold">{selectedBody.massKg}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Surface Gravity (g):</span>
                        <span className="font-mono text-cyan-glow font-bold">{selectedBody.gravityMps2} m/s² ({selectedBody.gravityG}g)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Escape Velocity:</span>
                        <span className="font-mono text-amber-400 font-bold">{selectedBody.escapeVelocityKmS} km/s</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Orbital Period (Year):</span>
                        <span className="font-mono text-emerald-400 font-bold">{selectedBody.orbitalPeriod}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Orbital Speed:</span>
                        <span className="font-mono text-star-white font-bold">{selectedBody.orbitalSpeedKmS} km/s</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex justify-between">
                        <span className="text-muted-gray">Day Length (Rotation):</span>
                        <span className="font-mono text-purple-400 font-bold">{selectedBody.dayLength}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LAYERS & ATMOSPHERE */}
                  {inspectorTab === 'LAYERS' && (
                    <div className="space-y-3 font-space text-xs">
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                        <span className="text-[10px] text-cyan-glow uppercase font-bold block">ATMOSPHERIC COMPOSITION:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBody.atmosphere.map((gas) => (
                            <span key={gas} className="px-2 py-0.5 rounded-lg bg-cyan-glow/15 text-cyan-glow text-[10px] font-mono">
                              {gas}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">MAJOR MOONS ({selectedBody.moonsCount}):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBody.majorMoons.length > 0 ? (
                            selectedBody.majorMoons.map((m) => (
                              <span key={m} className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-gray text-[10px]">No natural satellites</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: MISSIONS */}
                  {inspectorTab === 'MISSIONS' && (
                    <div className="space-y-2.5 font-space text-xs">
                      <span className="text-[10px] text-cyan-glow uppercase font-bold block">EXPLORATION TIMELINE:</span>
                      {selectedBody.missions.map((m) => (
                        <div key={m} className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center gap-2">
                          <CompassIcon size={14} className="text-cyan-glow shrink-0" />
                          <span className="font-inter text-star-white/90 text-[11px]">{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODULE 2: INTERSTELLAR GARGANTUA BLACK HOLE 3D SIMULATOR */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'BLACK_HOLE_3D' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
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
                      GARGANTUA KERR BLACK HOLE {'//'} RELATIVISTIC LIGHT LENSING
                    </span>
                    <span className="font-space text-[10px] text-muted-gray">
                      EINSTEIN-THORNE EQUATIONS {'//'} GRAVITATIONAL DOPPLER BEAMING
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-space text-[10px] font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <Activity size={12} />
                  <span>KERR SPIN a* = 0.998</span>
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

              {/* Controls */}
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

            {/* Relativistic Details */}
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
