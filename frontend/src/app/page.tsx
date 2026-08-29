'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import StarField from '../components/StarField';
import SpaceParticles from '../components/SpaceParticles';
import HeroSpaceSequence from '../components/HeroSpaceSequence';
import OrbitLines from '../components/OrbitLines';
import MissionIntro from '../components/MissionIntro';
import MissionOverview from '../components/MissionOverview';
import MissionRiskFusion from '../components/MissionRiskFusion';
import AIAnomalySection from '../components/AIAnomalySection';
import AIAnomalyCenter from '../components/AIAnomalyCenter';
import DigitalTwinSection from '../components/DigitalTwinSection';
import SatelliteDigitalTwin from '../components/SatelliteDigitalTwin';
import TelemetryExplorer from '../components/TelemetryExplorer';
import OrbitalEnvironment from '../components/OrbitalEnvironment';
import SpaceWeatherCenter from '../components/SpaceWeatherCenter';
import ConjunctionSection from '../components/ConjunctionSection';
import MissionRiskCenter from '../components/MissionRiskCenter';
import AlertsCenter from '../components/AlertsCenter';
import DeepSpaceExplorer from '../components/DeepSpaceExplorer';
import LandingDescentSimulation from '../components/LandingDescentSimulation';
import SurfaceLandingAnalysis from '../components/SurfaceLandingAnalysis';
import Administration from '../components/Administration';
import MissionControlPreview from '../components/MissionControlPreview';
import DataFlow from '../components/DataFlow';
import PlatformCapabilities from '../components/PlatformCapabilities';
import TechnologyStack from '../components/TechnologyStack';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import AeroCopilotHUD from '../components/AeroCopilotHUD';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070B] text-star-white relative selection:bg-cyan-glow/20 selection:text-white">
      {/* Background Starfield and Floating Cosmic Particles */}
      <StarField starCount={280} />
      <SpaceParticles count={45} />
      <OrbitLines variant="grid" />

      {/* Persistent Navigation Bar */}
      <Navbar />

      {/* 1. Cinematic Hero Space Sequence */}
      <HeroSpaceSequence />

      {/* 2. Mission Story Comparison */}
      <MissionIntro />
      <OrbitLines label="CONSTELLATION STATUS // FLEET METRICS" />

      {/* 3. Constellation Mission Overview */}
      <MissionOverview />
      <OrbitLines label="BAYESIAN NEURAL FUSION // EPSILON-7" />

      {/* 4. Mission Risk Fusion Engine */}
      <MissionRiskFusion />
      <OrbitLines label="AI RESIDUAL ANOMALY DETECTOR" />

      {/* 5. AI Anomaly Telemetry */}
      <AIAnomalySection />

      {/* 6. AI Anomaly Center */}
      <AIAnomalyCenter />
      <OrbitLines label="DIGITAL TWIN VIRTUALIZATION" />

      {/* 7. Digital Twin Spacecraft Overview */}
      <DigitalTwinSection />

      {/* 8. Primary Mission Control & Multi-Satellite Digital Twin Fleet */}
      <SatelliteDigitalTwin />
      <OrbitLines label="TIMESCALEDB TELEMETRY EXPLORER" />

      {/* 9. Progressive Time-Series Telemetry Explorer */}
      <TelemetryExplorer />
      <OrbitLines label="3D SGP4 ORBITAL RADAR" />

      {/* 10. Interactive 3D Orbital Environment & SGP4 Radar */}
      <OrbitalEnvironment />
      <OrbitLines label="SPACE WEATHER &amp; RADIATION BELTS // NOAA SWPC" />

      {/* 11. Real-Time Space Weather & SAA Radiation Threat Matrix */}
      <SpaceWeatherCenter />
      <OrbitLines label="CONJUNCTION INTERSECTION SOLVER" />

      {/* 12. Conjunction Trajectory Intersection & TCA Analysis */}
      <ConjunctionSection />
      <OrbitLines label="MISSION RISK FUSION ENGINE" />

      {/* 12. Mission Risk Fusion Center */}
      <MissionRiskCenter />
      <OrbitLines label="MISSION ALERT INTELLIGENCE // SIREN" />

      {/* 13. Active Mission Alert Center */}
      <AlertsCenter />
      <OrbitLines label="DEEP SPACE &amp; LAGRANGE POINT EXPLORER // ISRO &amp; NASA" />

      {/* 14. Deep-Space & Lagrange Point Specialized Displays (Aditya-L1, Chandrayaan-3, JWST) */}
      <DeepSpaceExplorer />
      <OrbitLines label="CHANDRAYAAN EDL SIMULATION &amp; HARDENING" />

      {/* 15. Chandrayaan Lunar EDL Trajectory & Failure-Proof Engineering */}
      <LandingDescentSimulation />
      <OrbitLines label="PLANETARY RECONNAISSANCE &amp; SHIV SHAKTI POINT" />

      {/* 15. Planetary Surface Reconnaissance & Landing-Site Topography */}
      <SurfaceLandingAnalysis />
      <OrbitLines label="ACCESS CONTROL &amp; AUDIT TRAIL" />

      {/* 16. Mission Administration, Access Roles & Audit Trail */}
      <Administration />
      <OrbitLines label="INTEGRATED OPERATIONS DECK" />

      {/* 17. Live Integrated Mission Control Interface Preview */}
      <MissionControlPreview />
      <OrbitLines label="TIMESCALEDB ARCHITECTURE &amp; DATA FLOW" />

      {/* 18. End-to-End Mission Data Flow Pipeline */}
      <DataFlow />

      {/* 19. Core Platform Architectural Capabilities */}
      <PlatformCapabilities />

      {/* 20. Technology & Astrodynamics Stack */}
      <TechnologyStack />

      {/* 21. Call to Action / Command Deck Portal */}
      <CTASection />

      {/* 22. Deep Footer with NASA & Open Source Astrodynamics Attributions */}
      <Footer />

      {/* Autonomous AERO-AI Natural Language Flight Director Copilot HUD */}
      <AeroCopilotHUD />
    </main>
  );
}
