'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
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
  const [highlightedFactId, setHighlightedFactId] = useState<string | null>(null);

  const selectedBody = CELESTIAL_BODIES.find((b) => b.id === selectedBodyId) || CELESTIAL_BODIES[3];

  // -------------------------------------------------------------
  // 1. REAL-TIME 3D THREE.JS WEBGL SOLAR SYSTEM ORRERY
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'SOLAR_SYSTEM' || solarViewMode !== 'ORBIT_MAP') return;
    const canvas = solarCanvasRef.current;
    if (!canvas) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const width = canvas.clientWidth || canvas.offsetWidth || 800;
      const height = canvas.clientHeight || canvas.offsetHeight || 500;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 5000);
      camera.position.set(0, 260, 380);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Ensure WebGL pixel store does not enforce FLIP_Y/PREMULTIPLY_ALPHA on 3D textures
      const gl = renderer.getContext();
      if (gl && 'pixelStorei' in gl) {
        try {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        } catch {}
      }

      // Lighting: Central Warm Sun Light + Ambient Space Fill
      const sunLight = new THREE.PointLight(0xfff6dd, 3.8, 3500, 0.15);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      const ambientLight = new THREE.AmbientLight(0x2d3a54, 0.85);
      scene.add(ambientLight);

      // Deep Background Stars (1000 Particles)
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1000;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        const r = 1200 + Math.random() * 1500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        starPos[i] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i + 2] = r * Math.cos(phi);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2.2,
        transparent: true,
        opacity: 0.8,
      });
      const starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      // Procedural Texture Generators
      const createTexture = (drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 256, h = 128) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (ctx) drawFn(ctx, w, h);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.flipY = false;
        tex.premultiplyAlpha = false;
        return tex;
      };

      // 1. Sun Texture & Glowing Corona
      const sunTex = createTexture((ctx, w, h) => {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#ffcc00');
        grad.addColorStop(0.3, '#ff7700');
        grad.addColorStop(0.6, '#ffea88');
        grad.addColorStop(1, '#ff5500');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 8 + 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const sunGeo = new THREE.SphereGeometry(18, 36, 36);
      const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sunMesh);

      // Sun Coronal Glow Halo
      const coronaGeo = new THREE.SphereGeometry(22, 24, 24);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.28,
        side: THREE.BackSide,
      });
      const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
      scene.add(coronaMesh);

      // Planet Definitions with 3D Meshes
      const planetConfigs = [
        { id: 'mercury', name: 'Mercury', r: 2.4, dist: 46, speed: 0.038, color: 0xa3a3a3, tilt: 0.03 },
        { id: 'venus', name: 'Venus', r: 4.2, dist: 72, speed: 0.024, color: 0xeab308, tilt: 0.05 },
        { id: 'earth', name: 'Earth', r: 4.6, dist: 104, speed: 0.016, color: 0x38bdf8, tilt: 0.41, hasMoon: true, hasClouds: true },
        { id: 'mars', name: 'Mars', r: 3.2, dist: 142, speed: 0.011, color: 0xef4444, tilt: 0.44 },
        { id: 'jupiter', name: 'Jupiter', r: 12.0, dist: 215, speed: 0.0055, color: 0xf59e0b, tilt: 0.05, hasBands: true, hasGalileanMoons: true },
        { id: 'saturn', name: 'Saturn', r: 10.0, dist: 295, speed: 0.0034, color: 0xfacc15, tilt: 0.47, hasRings: true },
        { id: 'uranus', name: 'Uranus', r: 6.4, dist: 375, speed: 0.0019, color: 0x06b6d4, tilt: 1.71, hasUranusRings: true },
        { id: 'neptune', name: 'Neptune', r: 6.2, dist: 450, speed: 0.0011, color: 0x3b82f6, tilt: 0.49 },
        { id: 'pluto', name: 'Pluto', r: 1.8, dist: 515, speed: 0.0007, color: 0xc4b5fd, tilt: 1.0 },
      ];

      const planetObjects: {
        id: string;
        mesh: THREE.Mesh;
        cloudsMesh?: THREE.Mesh;
        ringsMesh?: THREE.Mesh;
        moonMesh?: THREE.Mesh;
        galileanMoons?: THREE.Mesh[];
        dist: number;
        speed: number;
        angle: number;
        radius: number;
      }[] = [];

      // Create each 3D planet
      planetConfigs.forEach((cfg) => {
        // Orbit Line
        const orbitCurve = new THREE.EllipseCurve(0, 0, cfg.dist, cfg.dist * 0.95, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(90);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(
          points.map((p) => new THREE.Vector3(p.x, 0, p.y))
        );
        const orbitMat = new THREE.LineBasicMaterial({
          color: cfg.id === selectedBodyId ? 0x00d4ff : 0xffffff,
          transparent: true,
          opacity: cfg.id === selectedBodyId ? 0.7 : 0.12,
        });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);

        // Planet Procedural Texture
        const pTex = createTexture((ctx, w, h) => {
          if (cfg.hasBands) {
            // Jupiter banded clouds
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#e5b882');
            grad.addColorStop(0.2, '#c68a4c');
            grad.addColorStop(0.35, '#8c4b1d');
            grad.addColorStop(0.5, '#f3d9b1');
            grad.addColorStop(0.65, '#99582a');
            grad.addColorStop(0.85, '#d4a373');
            grad.addColorStop(1, '#6f3a15');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            // Great Red Spot
            ctx.fillStyle = '#b91c1c';
            ctx.beginPath();
            ctx.ellipse(w * 0.65, h * 0.62, w * 0.08, h * 0.09, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (cfg.id === 'earth') {
            // Earth continents and oceans
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(w * 0.25, h * 0.45, w * 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w * 0.68, h * 0.4, w * 0.22, 0, Math.PI * 2);
            ctx.fill();
            // Polar ice caps
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h * 0.1);
            ctx.fillRect(0, h * 0.9, w, h * 0.1);
          } else if (cfg.id === 'mars') {
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.5, w * 0.25, h * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // White polar ice caps
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h * 0.08);
            ctx.fillRect(0, h * 0.92, w, h * 0.08);
          } else {
            ctx.fillStyle = `#${cfg.color.toString(16).padStart(6, '0')}`;
            ctx.fillRect(0, 0, w, h);
          }
        });

        const pGeo = new THREE.SphereGeometry(cfg.r, 32, 32);
        const pMat = new THREE.MeshStandardMaterial({
          map: pTex,
          roughness: 0.7,
          metalness: 0.1,
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.rotation.z = cfg.tilt;
        scene.add(pMesh);

        let cloudsMesh: THREE.Mesh | undefined;
        let ringsMesh: THREE.Mesh | undefined;
        let moonMesh: THREE.Mesh | undefined;
        let galileanMoons: THREE.Mesh[] | undefined;

        // Earth Clouds
        if (cfg.hasClouds) {
          const cGeo = new THREE.SphereGeometry(cfg.r * 1.025, 28, 28);
          const cTex = createTexture((ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(255,255,255,0.65)';
            for (let i = 0; i < 20; i++) {
              ctx.beginPath();
              ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 30 + 10, Math.random() * 10 + 4, Math.random(), 0, Math.PI * 2);
              ctx.fill();
            }
          });
          const cMat = new THREE.MeshStandardMaterial({
            map: cTex,
            transparent: true,
            opacity: 0.5,
          });
          cloudsMesh = new THREE.Mesh(cGeo, cMat);
          scene.add(cloudsMesh);
        }

        // Earth Moon
        if (cfg.hasMoon) {
          const mGeo = new THREE.SphereGeometry(1.2, 16, 16);
          const mMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.9 });
          moonMesh = new THREE.Mesh(mGeo, mMat);
          scene.add(moonMesh);
        }

        // Jupiter Galilean Moons (Io, Europa, Ganymede, Callisto)
        if (cfg.hasGalileanMoons) {
          galileanMoons = [
            new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfde047 })),
            new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })),
            new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), new THREE.MeshStandardMaterial({ color: 0x94a3b8 })),
            new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), new THREE.MeshStandardMaterial({ color: 0x64748b })),
          ];
          galileanMoons.forEach((m) => scene.add(m));
        }

        // Saturn 3D Rings
        if (cfg.hasRings) {
          const ringGeo = new THREE.RingGeometry(cfg.r * 1.3, cfg.r * 2.4, 48);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
            roughness: 0.6,
          });
          ringsMesh = new THREE.Mesh(ringGeo, ringMat);
          ringsMesh.rotation.x = Math.PI / 2 + 0.35;
          scene.add(ringsMesh);
        }

        // Uranus Tilted Rings
        if (cfg.hasUranusRings) {
          const uRingGeo = new THREE.RingGeometry(cfg.r * 1.25, cfg.r * 1.7, 36);
          const uRingMat = new THREE.MeshStandardMaterial({
            color: 0x67e8f9,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.45,
          });
          ringsMesh = new THREE.Mesh(uRingGeo, uRingMat);
          ringsMesh.rotation.x = Math.PI / 2 + 1.2;
          scene.add(ringsMesh);
        }

        planetObjects.push({
          id: cfg.id,
          mesh: pMesh,
          cloudsMesh,
          ringsMesh,
          moonMesh,
          galileanMoons,
          dist: cfg.dist,
          speed: cfg.speed,
          angle: Math.random() * Math.PI * 2,
          radius: cfg.r,
        });
      });

      // 3D Asteroid Belt (320 Rotating Particles between Mars and Jupiter)
      const asteroidCount = 320;
      const astGeo = new THREE.BufferGeometry();
      const astPositions = new Float32Array(asteroidCount * 3);
      const astAngles = new Float32Array(asteroidCount);
      const astRadii = new Float32Array(asteroidCount);
      const astSpeeds = new Float32Array(asteroidCount);

      for (let i = 0; i < asteroidCount; i++) {
        const rad = 168 + (Math.random() - 0.5) * 32;
        const ang = (i / asteroidCount) * Math.PI * 2 + Math.random() * 0.1;
        const y = (Math.random() - 0.5) * 12;
        astRadii[i] = rad;
        astAngles[i] = ang;
        astSpeeds[i] = 0.006 + Math.random() * 0.002;
        astPositions[i * 3] = Math.cos(ang) * rad;
        astPositions[i * 3 + 1] = y;
        astPositions[i * 3 + 2] = Math.sin(ang) * rad * 0.95;
      }
      astGeo.setAttribute('position', new THREE.BufferAttribute(astPositions, 3));
      const astMat = new THREE.PointsMaterial({ color: 0x9ca3af, size: 2.0, transparent: true, opacity: 0.75 });
      const asteroidBelt = new THREE.Points(astGeo, astMat);
      scene.add(asteroidBelt);

      // Camera Orbit Controls & Target Tracking
      let cameraDistance = 420;
      let cameraRotX = 35;
      let cameraRotY = 25;
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      const targetLookAt = new THREE.Vector3(0, 0, 0);

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        cameraRotY += deltaX * 0.35;
        cameraRotX = Math.max(5, Math.min(85, cameraRotX - deltaY * 0.35));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        cameraDistance = Math.max(45, Math.min(900, cameraDistance + e.deltaY * 0.45));
      };

      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('wheel', onWheel, { passive: false });

      // Main 3D Animation Loop
      let clockTime = 0;

      const animate = () => {
        animId = requestAnimationFrame(animate);
        clockTime += 0.016;

        // Sun axial rotation & coronal pulse
        sunMesh.rotation.y += 0.003;
        coronaMesh.rotation.y -= 0.002;
        const pulse = 1 + Math.sin(clockTime * 2.5) * 0.04;
        coronaMesh.scale.set(pulse, pulse, pulse);

        // Update Asteroids
        if (!isOrbitPaused) {
          const posAttr = astGeo.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          for (let i = 0; i < asteroidCount; i++) {
            astAngles[i] += astSpeeds[i] * orbitSpeedMultiplier * 0.35;
            posArray[i * 3] = Math.cos(astAngles[i]) * astRadii[i];
            posArray[i * 3 + 2] = Math.sin(astAngles[i]) * astRadii[i] * 0.95;
          }
          posAttr.needsUpdate = true;
        }

        let focusedPos = new THREE.Vector3(0, 0, 0);

        // Update Planet Orbits
        planetObjects.forEach((p) => {
          if (!isOrbitPaused) {
            p.angle += p.speed * orbitSpeedMultiplier * 0.4;
          }
          const px = Math.cos(p.angle) * p.dist;
          const pz = Math.sin(p.angle) * p.dist * 0.95;
          p.mesh.position.set(px, 0, pz);
          p.mesh.rotation.y += 0.012;

          if (p.cloudsMesh) {
            p.cloudsMesh.position.set(px, 0, pz);
            p.cloudsMesh.rotation.y += 0.016;
          }

          if (p.ringsMesh) {
            p.ringsMesh.position.set(px, 0, pz);
          }

          if (p.moonMesh) {
            const mAngle = clockTime * 3;
            p.moonMesh.position.set(px + Math.cos(mAngle) * 9, Math.sin(mAngle) * 2, pz + Math.sin(mAngle) * 9);
          }

          if (p.galileanMoons) {
            p.galileanMoons.forEach((gm, idx) => {
              const gmDist = 16 + idx * 4.5;
              const gmAngle = clockTime * (4 - idx * 0.8);
              gm.position.set(px + Math.cos(gmAngle) * gmDist, Math.sin(gmAngle) * 1.5, pz + Math.sin(gmAngle) * gmDist);
            });
          }

          if (p.id === selectedBodyId) {
            focusedPos = p.mesh.position.clone();
          }
        });

        // Smooth Camera Target Interpolation
        if (selectedBodyId !== 'sun') {
          targetLookAt.lerp(focusedPos, 0.06);
        } else {
          targetLookAt.lerp(new THREE.Vector3(0, 0, 0), 0.06);
        }

        // Camera Spherical Position Calculation
        const radX = (cameraRotX * Math.PI) / 180;
        const radY = (cameraRotY * Math.PI) / 180;
        const camX = targetLookAt.x + cameraDistance * Math.cos(radX) * Math.sin(radY);
        const camY = targetLookAt.y + cameraDistance * Math.sin(radX);
        const camZ = targetLookAt.z + cameraDistance * Math.cos(radX) * Math.cos(radY);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(targetLookAt);

        renderer?.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!canvas) return;
        const w = canvas.clientWidth || canvas.offsetWidth || 800;
        const h = canvas.clientHeight || canvas.offsetHeight || 500;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer?.setSize(w, h, false);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('wheel', onWheel);
        renderer?.dispose();
      };
    } catch (e) {
      console.warn('Three.js Solar System error:', e);
    }
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

  const ALL_SPACE_FACTS = useMemo(() => [
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
      id: 'FACT-EINSTEIN-RINGS',
      category: 'RELATIVITY',
      title: 'Gravitational Lensing & Einstein Rings',
      metric: 'θ_E ~ 30 arcsec',
      metricLabel: 'Angular Einstein Radius for Massive Galaxy Clusters',
      description: 'Massive galactic foreground clusters warp spacetime curvature, bending light from background quasars and galaxies into brilliant circular arcs and multi-image mirages.',
      scientificReference: 'General Relativity null geodesic deflection: α = 4GM / (c² b); Hubble & JWST lensing surveys.',
      breakdown: 'Einstein radius formula: θ_E = √((4GM/c²) · (D_ls / (D_l · D_s))). Acts as a natural cosmic magnifying glass.',
      color: '#fbbf24',
    },
    {
      id: 'FACT-FRAME-DRAGGING',
      category: 'RELATIVITY',
      title: 'Lense-Thirring Spacetime Frame Dragging',
      metric: '39 milliarcsec/yr',
      metricLabel: 'Earth Frame Dragging measured by Gravity Probe B',
      description: 'Rotating massive bodies drag the very fabric of spacetime around with them like honey around a spinning spoon. Near rotating Kerr black holes, frame dragging forces all matter inside the ergosphere to co-rotate.',
      scientificReference: 'Kerr metric frame dragging angular velocity: ω = 2GJr / (r⁴ + a²r² + 2GMa²r); Gravity Probe B (2011).',
      breakdown: 'Inside the ergosphere (r_E = M + √(M² - a²cos²θ)), static observers cannot exist; everything must spin faster than light locally.',
      color: '#a855f7',
    },
    {
      id: 'FACT-GRAV-WAVES',
      category: 'RELATIVITY',
      title: 'Gravitational Waves & LIGO Spacetime Ripples',
      metric: 'h ~ 10⁻²¹ strain',
      metricLabel: 'Relative displacement (1/10,000th proton diameter)',
      description: 'Cataclysmic collisions of binary black holes and neutron stars radiate pure gravitational quadrupole energy, rippling the spacetime metric across billions of light-years at the speed of light.',
      scientificReference: 'LIGO/Virgo GW150914 & GW170817; Quadrupole formula: P = (c⁵/5G) (G M/r c²)⁵.',
      breakdown: 'In GW150914, 3.0 solar masses (5.4 × 10⁴⁷ Joules) were converted into pure gravitational wave energy in 20 milliseconds.',
      color: '#38bdf8',
    },
    {
      id: 'FACT-CH3-SHIV-SHAKTI',
      category: 'CHANDRAYAAN_LUNAR',
      title: 'Shiv Shakti Point 60°C Regolith Thermal Delta',
      metric: 'ΔT = 60.6 °C',
      metricLabel: 'Surface (+50.4°C) to 10cm Subsurface (-10.2°C)',
      description: 'ISRO’s ChaSTE probe on the Vikram lander recorded the first in-situ thermal profile of the lunar South Pole (69.373° S), discovering that ultra-porous lunar regolith acts as an extraordinary thermal insulator.',
      scientificReference: 'ISRO Chandrayaan-3 ChaSTE (Chandra’s Surface Thermophysical Experiment) Telemetry (Aug 2023).',
      breakdown: 'Regolith thermal conductivity K < 0.001 W/(m·K) in vacuum prevents solar heat from penetrating deeper than a few centimeters.',
      color: '#f59e0b',
    },
    {
      id: 'FACT-CH3-PERMANENT-ICE',
      category: 'CHANDRAYAAN_LUNAR',
      title: 'Lunar South Pole Permanently Shadowed Water Ice',
      metric: '>600M Tons',
      metricLabel: 'Estimated Water Ice trapped in Polar Craters (PSRs)',
      description: 'Deep polar craters (such as Shackleton, Faustini, Shoemaker) receive zero sunlight for billions of years, remaining at cryogenic temperatures of 25K to 40K where water ice remains permanently frozen.',
      scientificReference: 'ISRO Chandrayaan-1 Moon Mineralogy Mapper (M3), LRO Mini-RF radar, and Chandrayaan-3 Class/APXS.',
      breakdown: 'Volatile sublimation rate is zero below 100K. Ice deposits represent vital in-situ rocket propellant (LH2/LOX) for deep space exploration.',
      color: '#00d4ff',
    },
    {
      id: 'FACT-CH3-REGOLITH-PERM',
      category: 'CHANDRAYAAN_LUNAR',
      title: 'Lunar Polar Regolith Dielectric Permittivity',
      metric: 'ε_r = 2.7 ± 0.2',
      metricLabel: 'Relative Dielectric Permittivity at 1.4 GHz',
      description: 'Radar and microwave penetration studies by Chandrayaan-3 confirmed low electrical loss tangents in polar regolith, enabling deep ground-penetrating radar imaging of subsurface basaltic lava tubes and ice layers.',
      scientificReference: 'ISRO Dual-Frequency Synthetic Aperture Radar (DFSAR) & Lander Sensors.',
      breakdown: 'Loss tangent tan δ ≈ 0.004 allows microwave signals to penetrate up to 5 meters beneath the surface.',
      color: '#10b981',
    },
    {
      id: 'FACT-CH3-MOONQUAKES',
      category: 'CHANDRAYAAN_LUNAR',
      title: 'Deep Lunar Seismology & Moonquakes',
      metric: 'M_L = 1.0 to 2.5',
      metricLabel: 'ILSA Seismometer Micro-vibrations Logged',
      description: 'ISRO’s ILSA instrument detected natural lunar seismic events along with Pragyan rover movements, demonstrating that the Moon is seismically active due to Earth tidal kneading and thermal stresses.',
      scientificReference: 'ILSA (Instrument for Lunar Seismic Activity) MEMS accelerometer array on Vikram Lander.',
      breakdown: 'Unlike Earth quakes that subside in minutes, moonquakes ring like a resonant bell for over an hour due to dry, highly fractured crust.',
      color: '#ec4899',
    },
    {
      id: 'FACT-JWST-EARLY-UNIVERSE',
      category: 'JWST_DISCOVERIES',
      title: 'JWST High-Redshift Early Primordial Galaxies',
      metric: 'z = 14.32',
      metricLabel: 'JADES-GS-z14-0 (290M yrs post-Big Bang)',
      description: 'The James Webb Space Telescope discovered luminous, massive galaxies existing only 290–330 million years after the Big Bang, challenging traditional hierarchical galaxy assembly and dark matter halo growth models.',
      scientificReference: 'JWST NIRCam / NIRSpec JADES Survey; Lyman-break spectroscopy; Carniani et al. (2024).',
      breakdown: 'Features intense UV luminosity and substantial dust enrichment, indicating rapid early Population III star formation.',
      color: '#10b981',
    },
    {
      id: 'FACT-JWST-WASP-39B',
      category: 'JWST_DISCOVERIES',
      title: 'First CO₂ & Photochemistry on Alien Worlds',
      metric: '4.3 µm Absorption',
      metricLabel: 'WASP-39b Carbon Dioxide & Sulfur Dioxide Fingerprint',
      description: 'JWST captured the first definitive molecular spectroscopic transmission profile of carbon dioxide and photochemical sulfur dioxide in an exoplanetary atmosphere 700 light-years away.',
      scientificReference: 'JWST Transiting Exoplanet Early Release Science Team; Nature (2023).',
      breakdown: 'NIRSpec PRISM high signal-to-noise transmission spectrum confirmed complex atmospheric cloud decks and photochemistry triggered by stellar UV.',
      color: '#38bdf8',
    },
    {
      id: 'FACT-JWST-SMACS-0723',
      category: 'JWST_DISCOVERIES',
      title: 'SMACS 0723 Ultra-Deep Gravitational Lens',
      metric: '13.1 Billion Yrs',
      metricLabel: 'Light Travel Time of Magnified Background Galaxies',
      description: 'JWST’s first deep field image focused on galaxy cluster SMACS 0723, using its tremendous gravitational mass to magnify and bend the infrared light of thousands of distant primordial galaxies.',
      scientificReference: 'JWST NIRCam 12.5-hour composite exposure; gravitational cluster mass M ~ 10¹⁵ M_sun.',
      breakdown: 'Mid-infrared MIRI channels revealed chemical fingerprints of polycyclic aromatic hydrocarbons (PAHs) across cosmic time.',
      color: '#ec4899',
    },
    {
      id: 'FACT-JWST-SUNSHIELD-DELTA',
      category: 'JWST_DISCOVERIES',
      title: '5-Layer Kapton Passive Cryogenic Shielding',
      metric: 'ΔT = 318 °C',
      metricLabel: '+85°C Hot Sunward Side to -233°C (40 K) Cold Side',
      description: 'JWST’s tennis-court-sized 5-layer aluminum/silicon coated Kapton sunshield dissipates 99.99% of solar heat through vacuum gaps, cooling the primary mirror array passively down to 40 Kelvin without active liquid coolant.',
      scientificReference: 'NASA Goddard Space Flight Center JWST Passive Cryogenic Thermal Architecture.',
      breakdown: 'Each layer is 0.025 to 0.05 mm thick. Active MIRI helium loop cools the mid-infrared sensor further down to 6.4 K.',
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
      id: 'FACT-KERR-PENROSE',
      category: 'COMPACT_OBJECTS',
      title: 'Penrose Process & Black Hole Superradiance',
      metric: '29% Mass Energy',
      metricLabel: 'Maximum Rotational Energy Extraction Limit',
      description: 'In the ergosphere outside a rotating Kerr black hole horizon, particles can split such that negative energy states fall into the hole while positive energy particles escape with more energy than entered.',
      scientificReference: 'Roger Penrose (1969); Christodoulou irreducible mass formula: M² = M_irr² + J² / (4 M_irr²).',
      breakdown: 'Enables superradiant scattering and extraction of up to 29% of the black hole’s total rest-mass energy (E = 0.29 M c²).',
      color: '#8b5cf6',
    },
    {
      id: 'FACT-SGR-A-PHOTON-RING',
      category: 'COMPACT_OBJECTS',
      title: 'Sagittarius A* Event Horizon Shadow & Photon Ring',
      metric: '52 µas Diameter',
      metricLabel: 'Angular Shadow of Milky Way’s 4.15M M_sun Black Hole',
      description: 'The Event Horizon Telescope (EHT) array resolved the glowing ring of plasma orbiting Sagittarius A* at 30% the speed of light, confirming General Relativity in the strong-field limit.',
      scientificReference: 'Event Horizon Telescope Collaboration; Astrophysical Journal Letters (2022).',
      breakdown: 'Photon sphere radius r_ph = 3GM/c² creates a critical impact parameter b_c = √27 GM/c², defining the shadow diameter.',
      color: '#f97316',
    },
    {
      id: 'FACT-HAWKING-RADIATION',
      category: 'COMPACT_OBJECTS',
      title: 'Hawking Radiation & Black Hole Evaporation',
      metric: 'T_H ~ 10⁻⁸ K',
      metricLabel: 'Hawking Temperature for a Solar-Mass Black Hole',
      description: 'Quantum vacuum fluctuations near the event horizon cause virtual particle-antiparticle pairs to separate, allowing thermal radiation to escape while the black hole slowly loses mass and eventually evaporates.',
      scientificReference: 'Stephen Hawking (1974); Black hole thermodynamic temperature: T_H = ℏ c³ / (8π G M k_B).',
      breakdown: 'Evaporation timescale: t_evap = (5120 π G² M³) / (1.536 × 10³ ℏ c⁴) ≈ 2.1 × 10⁶⁷ years for 1 solar mass.',
      color: '#06b6d4',
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
    {
      id: 'FACT-55-CANCRI-E',
      category: 'EXOPLANETS',
      title: '55 Cancri e Super-Earth Diamond Mantle',
      metric: '8.6 Earth Masses',
      metricLabel: 'Carbon-Rich Super-Earth orbiting in 18 Hours',
      description: 'An ultra-dense carbon-rich lava world where core temperatures exceed 2,000°C and pressures surpass 1.5 million atmospheres, compressing graphite and carbon into a thick mantle of pure crystalline diamond.',
      scientificReference: 'Spitzer / JWST Thermal Emission Spectroscopy; Madhusudhan et al. (2012).',
      breakdown: 'Extreme proximity to host star (0.0154 AU) creates a permanent dayside lava ocean with a mineral vapor atmosphere.',
      color: '#a78bfa',
    },
    {
      id: 'FACT-HD189733B-GLASS',
      category: 'EXOPLANETS',
      title: 'HD 189733b Molten Silicate Glass Rain',
      metric: '8,700 km/h',
      metricLabel: 'Equatorial Wind Speeds (Mach 7 Sideways Rain)',
      description: 'A cobalt-blue hot Jupiter where temperatures exceed 1,000°C. Silicate particles in the atmosphere condense into glass grains, blown sideways in violent supersonic jet streams of molten glass rain.',
      scientificReference: 'Hubble Space Telescope STIS blue albedo spectroscopy; sodium and silicate dust signatures.',
      breakdown: 'High daytime temperatures drive strong global pressure gradients, creating intense day-to-night thermal circulation.',
      color: '#60a5fa',
    },
    {
      id: 'FACT-K2-18B-HYCEAN',
      category: 'EXOPLANETS',
      title: 'K2-18b Hycean Ocean World Biosignature Candidate',
      metric: '2.6x Earth Radius',
      metricLabel: 'Hydrogen Atmosphere over Liquid Water Ocean',
      description: 'JWST observations detected methane (CH₄) and carbon dioxide (CO₂) with an absence of ammonia in K2-18b, pointing to a habitable Hycean world with a vast liquid ocean beneath a hydrogen-rich atmosphere.',
      scientificReference: 'JWST NIRISS and NIRSpec observations (Madhusudhan et al., 2023); potential DMS biosignature trace.',
      breakdown: 'Tentative detection of dimethyl sulfide (DMS) — a biomarker exclusively emitted by marine phytoplankton on Earth.',
      color: '#34d399',
    },
    {
      id: 'FACT-OLYMPUS-MONS',
      category: 'SOLAR_SYSTEM',
      title: 'Olympus Mons: Solar System’s Largest Shield Volcano',
      metric: '21.9 km Tall',
      metricLabel: '2.5x Mount Everest with a 600 km Base on Mars',
      description: 'A monstrous shield volcano on Mars so massive its summit pokes out into the Martian upper stratosphere. Because Mars lacks moving tectonic plates, magma plumes erupted over hundreds of millions of years at the same stationary spot.',
      scientificReference: 'Mars Global Surveyor MOLA altimetry; Mars Express HRSC stereo imaging.',
      breakdown: 'The caldera alone spans 80 km across and 3 km deep — large enough to swallow the entire city of London.',
      color: '#f97316',
    },
    {
      id: 'FACT-EUROPA-OCEAN',
      category: 'SOLAR_SYSTEM',
      title: 'Europa Subsurface Liquid Ocean & Tidal Heating',
      metric: '100 km Deep',
      metricLabel: '2x Volume of all Earth’s Oceans Combined',
      description: 'Jupiter’s moon Europa conceals a global salty ocean beneath a 15–25 km ice shell, kept liquid by gravitational tidal flexion from Jupiter and neighboring Galilean moons.',
      scientificReference: 'Galileo magnetometer induced magnetic dipole discovery; Europa Clipper mission baseline.',
      breakdown: 'Hydrothermal vents on Europa’s rocky ocean floor may provide chemical gradients and energy to support extraterrestrial chemosynthetic life.',
      color: '#38bdf8',
    },
    {
      id: 'FACT-TITAN-LAKES',
      category: 'SOLAR_SYSTEM',
      title: 'Titan Liquid Methane Lakes & Nitrogen Atmosphere',
      metric: '1.45 Bar Surface',
      metricLabel: 'Dense Atmosphere with Methane Hydrological Cycle',
      description: 'Saturn’s moon Titan is the only celestial body besides Earth with liquid rivers, lakes, and seas (Kraken Mare), filled with liquid methane and ethane falling from orange smog clouds.',
      scientificReference: 'Cassini-Huygens RADAR and DISR descent probe measurements; Dragonfly mission target.',
      breakdown: 'Surface temperature of 94 K (-179°C) allows methane to exist near its triple point, mirroring Earth’s water cycle.',
      color: '#fbbf24',
    },
    {
      id: 'FACT-ENCELADUS-GEYSERS',
      category: 'SOLAR_SYSTEM',
      title: 'Enceladus Cryovolcanic Hydrothermal Plumes',
      metric: '400 kg/s Ejecta',
      metricLabel: 'Supersonic Cryo-plumes feeding Saturn’s E-Ring',
      description: 'Over 100 cryovolcanic geysers erupt from the "Tiger Stripe" fractures at Enceladus’ South Pole, blasting water vapor, ice grains, salts, and complex organic macromolecule chains directly into space.',
      scientificReference: 'Cassini INMS (Ion and Neutral Mass Spectrometer) and CDA (Cosmic Dust Analyzer); Postberg et al. (2023).',
      breakdown: 'Detection of molecular hydrogen (H2) and phosphorus confirms hydrothermal serpentinization reactions in the ocean floor.',
      color: '#a855f7',
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
      id: 'FACT-COSMIC-WEB',
      category: 'COSMOLOGY',
      title: 'The Cosmic Web & Dark Matter Halos',
      metric: '100 Mpc Filaments',
      metricLabel: 'Filamentary Scaffolding connecting Superclusters',
      description: 'Gravity shapes dark matter and primordial gas into a colossal cosmic network of dense filaments and nodes surrounding gargantuan empty cosmic voids (some spanning 300 million light-years across).',
      scientificReference: 'Millennium & IllustrisTNG cosmological simulations; SDSS Baryon Oscillation Spectroscopic Survey.',
      breakdown: 'Warm-hot intergalactic medium (WHIM) along filaments accounts for the majority of previously "missing" cosmic baryons.',
      color: '#ec4899',
    },
  ], []);

  const filteredFacts = useMemo(() => {
    return ALL_SPACE_FACTS.filter((f) => {
      const matchSearch =
        f.title.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(factSearch.toLowerCase()) ||
        f.breakdown.toLowerCase().includes(factSearch.toLowerCase());
      const matchCat = selectedFactCategory === 'ALL' || f.category === selectedFactCategory;
      return matchSearch && matchCat;
    });
  }, [ALL_SPACE_FACTS, factSearch, selectedFactCategory]);

  const handleSurpriseMe = () => {
    const randomFact = ALL_SPACE_FACTS[Math.floor(Math.random() * ALL_SPACE_FACTS.length)];
    setSelectedFactCategory('ALL');
    setFactSearch('');
    setHighlightedFactId(randomFact.id);
    setTimeout(() => {
      const el = document.getElementById(randomFact.id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

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
                  <div className="relative aspect-[16/11] w-full bg-[#01040d] rounded-2xl overflow-hidden border border-glass-border/50 select-none">
                    <canvas ref={solarCanvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 text-[10px] font-space text-star-white font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
                      <span>REAL-TIME 3D ORRERY (THREE.JS WEBGL)</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBodyId('sun')}
                        className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black border border-cyan-glow/40 text-[10px] font-space text-cyan-glow font-bold flex items-center gap-1.5 cursor-pointer shadow-lg backdrop-blur-md transition-all hover:scale-105"
                      >
                        <RotateCcw size={12} />
                        <span>OVERVIEW / SUN</span>
                      </button>
                    </div>

                    {/* Bottom Instructions / Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-xl bg-black/80 border border-white/10 text-[9px] font-space text-muted-gray backdrop-blur-md">
                        CLICK PLANET OR DRAG 360° TO ROTATE // SCROLL WHEEL TO ZOOM
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-[9px] font-space text-cyan-glow font-bold backdrop-blur-md">
                        TRACKING: {selectedBody.name.toUpperCase()}
                      </span>
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
                    id="bh-observer-dist-slider"
                    name="bhObserverDist"
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
                    id="bh-camera-tilt-slider"
                    name="bhCameraTilt"
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
                    id="bh-mass-solar-slider"
                    name="bhMassSolar"
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
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-glass-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray" />
                <input
                  id="fact-search-input"
                  name="factSearch"
                  type="text"
                  value={factSearch}
                  onChange={(e) => setFactSearch(e.target.value)}
                  placeholder="Search 27 space facts (Relativity, Chandrayaan, JWST, Dark Energy, Magnetars, Exoplanets)..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs font-inter text-star-white placeholder:text-muted-gray/60 focus:outline-none focus:border-purple-400/50"
                />
              </div>

              {/* Surprise Me / Random Fact Button */}
              <button
                type="button"
                onClick={handleSurpriseMe}
                className="px-4 py-2.5 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-star-white font-space text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:scale-105 shrink-0"
              >
                <Sparkles size={14} className="text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>SURPRISE ME / RANDOM FACT</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'ALL', label: 'ALL FACTS', count: ALL_SPACE_FACTS.length },
                { id: 'RELATIVITY', label: 'RELATIVITY', count: ALL_SPACE_FACTS.filter((f) => f.category === 'RELATIVITY').length },
                { id: 'CHANDRAYAAN_LUNAR', label: 'CHANDRAYAAN & LUNAR', count: ALL_SPACE_FACTS.filter((f) => f.category === 'CHANDRAYAAN_LUNAR').length },
                { id: 'JWST_DISCOVERIES', label: 'JWST DISCOVERIES', count: ALL_SPACE_FACTS.filter((f) => f.category === 'JWST_DISCOVERIES').length },
                { id: 'COMPACT_OBJECTS', label: 'COMPACT OBJECTS', count: ALL_SPACE_FACTS.filter((f) => f.category === 'COMPACT_OBJECTS').length },
                { id: 'EXOPLANETS', label: 'EXOPLANETS', count: ALL_SPACE_FACTS.filter((f) => f.category === 'EXOPLANETS').length },
                { id: 'SOLAR_SYSTEM', label: 'SOLAR SYSTEM', count: ALL_SPACE_FACTS.filter((f) => f.category === 'SOLAR_SYSTEM').length },
                { id: 'COSMOLOGY', label: 'COSMOLOGY', count: ALL_SPACE_FACTS.filter((f) => f.category === 'COSMOLOGY').length },
              ].map((cat) => {
                const isSelected = selectedFactCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedFactCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-[11px] font-space tracking-wider border cursor-pointer shrink-0 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-purple-500/25 border-purple-400 text-purple-300 font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-105'
                        : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white hover:border-purple-400/30'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono ${isSelected ? 'bg-purple-400/30 text-star-white' : 'bg-white/10 text-muted-gray'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFacts.map((fact) => {
                const isHighlighted = highlightedFactId === fact.id;
                return (
                  <div
                    id={fact.id}
                    key={fact.id}
                    className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all duration-500 space-y-3 relative overflow-hidden flex flex-col justify-between ${
                      isHighlighted
                        ? 'border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_35px_rgba(168,85,247,0.4)] scale-[1.02]'
                        : 'border-glass-border hover:border-purple-400/40'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase"
                          style={{
                            backgroundColor: `${fact.color || '#a855f7'}20`,
                            color: fact.color || '#c084fc',
                            border: `1px solid ${fact.color || '#a855f7'}40`,
                          }}
                        >
                          {fact.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-muted-gray">{fact.id}</span>
                      </div>

                      <h3 className="font-space text-sm font-bold text-star-white">{fact.title}</h3>

                      <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-0.5">
                        <span className="font-mono text-lg font-bold block" style={{ color: fact.color || '#c084fc' }}>
                          {fact.metric}
                        </span>
                        <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                          {fact.metricLabel}
                        </span>
                      </div>

                      <p className="font-inter text-xs text-star-white/85 leading-relaxed">
                        {fact.description}
                      </p>

                      <div
                        className="p-2.5 rounded-xl text-[11px] font-mono leading-relaxed"
                        style={{
                          backgroundColor: `${fact.color || '#a855f7'}10`,
                          border: `1px solid ${fact.color || '#a855f7'}25`,
                          color: fact.color || '#c084fc',
                        }}
                      >
                        {fact.breakdown}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <span className="text-[9px] font-mono text-muted-gray block truncate">
                        Ref: {fact.scientificReference}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
