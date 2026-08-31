'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Activity,
  Zap,
  HelpCircle,
  Satellite,
  Layers,
  ArrowRight,
  RefreshCw,
  Cpu,
  Search,
  Filter,
  Eye,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import {
  api,
  SpacecraftCyberThreatStatus,
  CyberThreatLog,
  PacketVerificationResult,
  KeyRotationResult,
  AttackSimulationResult,
} from '../lib/api';

export default function CyberDefenseMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, formatMissionTime } = useMission();

  const [cyberStatus, setCyberStatus] = useState<SpacecraftCyberThreatStatus | null>(null);
  const [testingPacket, setTestingPacket] = useState(false);
  const [testResult, setTestResult] = useState<PacketVerificationResult | null>(null);
  const [rotatingKeys, setRotatingKeys] = useState(false);
  const [rotationResult, setRotationResult] = useState<KeyRotationResult | null>(null);
  const [simulatingAttack, setSimulatingAttack] = useState(false);
  const [attackResult, setAttackResult] = useState<AttackSimulationResult | null>(null);
  const [selectedAttackType, setSelectedAttackType] = useState<string>('GNSS_SPOOFING');

  // Logs Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [localLogs, setLocalLogs] = useState<CyberThreatLog[]>([]);

  // Pipeline animation tick
  const [pipelineStep, setPipelineStep] = useState(0);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Fetch cybersecurity status
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const data = await api.getCyberDefenseStatus(selectedSatelliteId);
        if (isMounted) {
          setCyberStatus(data);
          if (localLogs.length === 0 && data.threat_logs) {
            setLocalLogs(data.threat_logs);
          }
        }
      } catch {
        // Fallback to initial state
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSatelliteId, localLogs.length]);

  // Animated pipeline loop
  useEffect(() => {
    const pInterval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 5);
    }, 1200);
    return () => clearInterval(pInterval);
  }, []);

  // Run cryptographic verification simulation
  const handleVerifyPacket = async (type: 'AUTHENTIC' | 'MALICIOUS_FORGERY') => {
    setTestingPacket(true);
    try {
      const sig = type === 'AUTHENTIC' ? 'AUTO_GENERATE' : '0xDEADBEEF4928A49C82B1';
      const res = await api.verifyUplinkPacket({
        satellite_id: selectedSatelliteId,
        command_name: 'CMD_THRUSTER_FIRING_VECTOR',
        raw_payload_hex: '0x434D445F4255524E5F564543544F52',
        signature_hmac: sig,
        operator_key_id: 'OP-KEY-VAULT-2026-A',
      });
      setTestResult(res);
    } catch {
      // Keep state
    } finally {
      setTestingPacket(false);
    }
  };

  // Trigger on-orbit session key rotation
  const handleRotateKeys = async () => {
    setRotatingKeys(true);
    try {
      const res = await api.rotateCyberKeys({
        satellite_id: selectedSatelliteId,
        operator_id: 'Commander Vance',
      });
      setRotationResult(res);
      if (cyberStatus) {
        setCyberStatus({
          ...cyberStatus,
          key_epoch_id: res.new_key_epoch_id,
          key_rotation_status: `KEYS_ROTATED // ${res.new_key_epoch_id}`,
        });
      }
    } catch {
      // Keep state
    } finally {
      setRotatingKeys(false);
    }
  };

  // Simulate complex space cyber-attack
  const handleSimulateAttack = async () => {
    setSimulatingAttack(true);
    try {
      const res = await api.simulateCyberAttack({
        satellite_id: selectedSatelliteId,
        attack_type: selectedAttackType,
      });
      setAttackResult(res);
      if (res.quarantined_log) {
        setLocalLogs((prev) => [res.quarantined_log, ...prev]);
      }
    } catch {
      // Keep state
    } finally {
      setSimulatingAttack(false);
    }
  };

  // Filtered threat logs
  const filteredLogs = useMemo(() => {
    return localLogs.filter((log) => {
      const matchesSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.attack_vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source_rf_carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.mitigation_action.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity =
        selectedSeverity === 'ALL' || log.severity.toUpperCase() === selectedSeverity.toUpperCase();
      return matchesSearch && matchesSeverity;
    });
  }, [localLogs, searchQuery, selectedSeverity]);

  const attackScenarios = [
    {
      id: 'GNSS_SPOOFING',
      name: 'GNSS / GPS Spoofing',
      icon: Radio,
      desc: 'Inject fake L1/L2 GPS RF pseudoranges to induce navigation trajectory drift.',
      defense: 'RAIM autonomous Doppler & Star Tracker Kalman failover',
      badge: 'HIGH RISK',
      color: 'text-amber-400 border-amber-400/30 bg-amber-500/10',
    },
    {
      id: 'REPLAY_ATTACK',
      name: 'Replay Command Attack',
      icon: RotateCcw,
      desc: 'Re-broadcast captured valid telemetry frames to force duplicate execution.',
      defense: 'CCSDS SDLS Anti-Replay Sliding Window & Stale FC Rejection',
      badge: 'CRITICAL',
      color: 'text-red-400 border-red-400/30 bg-red-500/10',
    },
    {
      id: 'MALICIOUS_TELECOMMAND',
      name: 'Forged Telecommand',
      icon: Terminal,
      desc: 'Inject unauthorized propulsion fire vectors with forged signature bytes.',
      defense: 'NIST FIPS 140-3 Level 4 Hardware HSM HMAC-SHA256 barrier',
      badge: 'CRITICAL',
      color: 'text-red-400 border-red-400/30 bg-red-500/10',
    },
    {
      id: 'DOS_JAMMING',
      name: 'Uplink Carrier Jamming',
      icon: Zap,
      desc: 'Flood S-band receiver with high-power broadband RF noise floor.',
      defense: 'Direct Sequence Spread Spectrum (DSSS) Adaptive Notch Filtering',
      badge: 'HIGH RISK',
      color: 'text-amber-400 border-amber-400/30 bg-amber-500/10',
    },
  ];

  const pipelineStages = [
    { id: 0, label: 'RF DEMOD', sub: '2.2 GHz S-Band', status: 'LOCKED' },
    { id: 1, label: 'FRAME COUNTER', sub: `FC=${cyberStatus?.frame_sequence_counter || 104982}`, status: 'SYNCED' },
    { id: 2, label: 'HMAC-SHA256', sub: 'HSM Enclave', status: 'VERIFIED' },
    { id: 3, label: 'ZERO-TRUST FIREWALL', sub: 'Rule Matrix', status: 'CLEARED' },
    { id: 4, label: 'OBC FLIGHT QUEUE', sub: 'Safe Sequence', status: 'EXECUTING' },
  ];

  return (
    <section id="cyber-defense" className="section-spacing relative overflow-hidden py-16 md:py-24" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-400/30 bg-red-500/10 mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <ShieldAlert size={13} className="text-red-400 animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.25em] text-red-400 uppercase font-bold">
              ZERO-TRUST ON-BOARD CRYPTOGRAPHIC FIREWALL &amp; GNSS ANTI-SPOOFING
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-star-white">
            SPACECRAFT CYBER-DEFENSE
          </h2>
          <p className="font-inter text-xs sm:text-sm text-muted-gray mt-2.5 max-w-2xl mx-auto leading-relaxed">
            CCSDS SDLS AES-256 cryptographic security, hardware root-of-trust key vault, autonomous multi-constellation GNSS RAIM integrity monitoring, and real-time threat quarantine.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-red-400/60 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS - Responsive Scroll/Wrap */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <button
                  type="button"
                  key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-red-500/20 border-red-400 text-star-white shadow-[0_0_20px_rgba(239,68,68,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-red-400/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-red-400' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 5-STAGE PACKET INSPECTION PIPELINE VISUALIZER */}
        <motion.div
          className="mb-8 p-4 sm:p-5 rounded-3xl glass-panel border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)] relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glass-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Activity size={16} className="text-red-400 animate-pulse" />
              <span className="font-space text-xs sm:text-sm font-bold tracking-wider text-star-white uppercase">
                CCSDS FLIGHT PACKET INSPECTION PIPELINE // {activeSat.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-gray">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                120 FRAMES/SEC THROUGHPUT
              </span>
              <span className="hidden sm:inline text-cyan-glow">0 DROPPED VALID PACKETS</span>
            </div>
          </div>

          {/* Pipeline Stage Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 relative">
            {pipelineStages.map((stage, idx) => {
              const isActive = pipelineStep === idx;
              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-red-500/20 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02]'
                      : 'bg-black/50 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] text-muted-gray uppercase">STAGE 0{idx + 1}</span>
                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-red-400 text-black' : 'bg-white/10 text-star-white/70'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <span className="font-space text-xs font-bold text-star-white block truncate">{stage.label}</span>
                  <span className="font-inter text-[10px] text-red-400/90 block truncate">{stage.sub}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-amber-400 to-red-500"
                      layoutId="pipelineGlow"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* MAIN 2-COLUMN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column (Architecture, GNSS RAIM Radar & Threat Simulator) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Cryptographic Key Vault & HSM Security Status */}
            <motion.div
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-red-500/30 relative overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.15)]"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border pb-4 mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-red-400 animate-pulse shrink-0" />
                  <div>
                    <span className="font-space text-xs sm:text-sm tracking-wider text-star-white uppercase block font-bold">
                      HARDWARE ROOT-OF-TRUST &amp; KEY VAULT
                    </span>
                    <span className="font-space text-[10px] sm:text-[11px] text-red-400/90 font-mono">
                      {cyberStatus?.hsm_enclave_status || 'FIPS 140-3 LEVEL 4 TAMPER-RESISTANT HSM ACTIVE'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRotateKeys}
                  disabled={rotatingKeys}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 font-space text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw size={13} className={rotatingKeys ? 'animate-spin' : ''} />
                  <span>{rotatingKeys ? 'RE-KEYING...' : 'ROTATE SESSION KEYS'}</span>
                </button>
              </div>

              {/* Security Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">ENCRYPTION:</span>
                  <span className="font-mono text-xs font-bold text-red-400 block truncate">AES-GCM-256</span>
                  <span className="text-[8px] font-inter text-star-white/60 block">CCSDS 355.0-B-1</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">FRAME COUNTER:</span>
                  <span className="font-mono text-xs font-bold text-cyan-glow block truncate">
                    {cyberStatus?.frame_sequence_counter || 104982}
                  </span>
                  <span className="text-[8px] font-inter text-emerald-400 block">Anti-Replay Lock</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">EPOCH ID:</span>
                  <span className="font-mono text-xs font-bold text-amber-400 block truncate">
                    {cyberStatus?.key_epoch_id || 'EPOCH-2026-08'}
                  </span>
                  <span className="text-[8px] font-inter text-star-white/60 block">256-bit Entropy</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">TRUST INDEX:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 block truncate">
                    {cyberStatus?.trust_index_pct || 99.8}%
                  </span>
                  <span className="text-[8px] font-inter text-emerald-400 block">Zero Compromise</span>
                </div>
              </div>

              {/* Key Rotation Result Alert */}
              <AnimatePresence>
                {rotationResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3.5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-space space-y-1"
                  >
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>SESSION KEYS RE-KEYED (QUANTUM SEED)</span>
                      </span>
                      <span className="font-mono text-[9px]">{rotationResult.new_key_epoch_id}</span>
                    </div>
                    <p className="font-inter text-[10px] text-star-white/80 leading-tight">
                      Fingerprint: <code className="font-mono text-cyan-glow">{rotationResult.session_key_fingerprint}</code>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* GNSS Multi-Constellation RAIM Anti-Spoofing Radar */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-3">
                <span className="font-space text-xs sm:text-sm font-bold text-star-white uppercase flex items-center gap-2">
                  <Radio size={16} className="text-cyan-glow animate-pulse" />
                  <span>RECEIVER AUTONOMOUS INTEGRITY MONITORING (RAIM)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                  NOMINAL RAIM LOCK (36 SATS)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-space">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Pseudorange Residual:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {cyberStatus?.gps_pseudorange_residual_ns || 0.04} ns
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Carrier-to-Noise (C/N₀):</span>
                  <span className="font-mono text-cyan-glow font-bold">
                    {cyberStatus?.carrier_to_noise_c_n0_dbhz || 44.5} dB-Hz
                  </span>
                </div>
              </div>

              {/* Multi-Constellation Health Matrix */}
              <div className="space-y-2">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-muted-gray block">
                  TRACKED GNSS CONSTELLATION HEALTH
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    cyberStatus?.gnss_constellations || [
                      { name: 'GPS (Navstar)', tracked_sats: 12, health_status: 'NOMINAL', pseudorange_residual_ns: 0.04, c_n0_dbhz: 44.8 },
                      { name: 'Galileo (EU)', tracked_sats: 9, health_status: 'NOMINAL', pseudorange_residual_ns: 0.03, c_n0_dbhz: 45.2 },
                      { name: 'GLONASS (RU)', tracked_sats: 8, health_status: 'NOMINAL', pseudorange_residual_ns: 0.06, c_n0_dbhz: 43.9 },
                      { name: 'NavIC (ISRO)', tracked_sats: 7, health_status: 'NOMINAL', pseudorange_residual_ns: 0.035, c_n0_dbhz: 46.0 },
                    ]
                  ).map((c) => (
                    <div key={c.name} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="font-space text-[10px] font-bold text-star-white block truncate">{c.name}</span>
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-muted-gray">{c.tracked_sats} Sats</span>
                        <span className="text-emerald-400 font-bold">{c.health_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LIVE SPACE CYBER-ATTACK SIMULATOR */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-3">
                <span className="font-space text-xs sm:text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span>ON-ORBIT CYBER-ATTACK THREAT SIMULATOR</span>
                </span>
                <span className="text-[10px] font-mono text-star-white/60">AUTONOMOUS MITIGATION EVALUATOR</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attackScenarios.map((sc) => {
                  const isSelected = selectedAttackType === sc.id;
                  const Icon = sc.icon;
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={sc.id}
                      onClick={() => setSelectedAttackType(sc.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 text-left ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-space font-bold text-star-white">
                          <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-muted-gray'} />
                          <span>{sc.name}</span>
                        </div>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${sc.color}`}>
                          {sc.badge}
                        </span>
                      </div>
                      <p className="font-inter text-[10px] text-muted-gray line-clamp-2">{sc.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Trigger Attack Button */}
              <button
                type="button"
                onClick={handleSimulateAttack}
                disabled={simulatingAttack}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-red-500/30 border border-amber-400/50 text-amber-300 font-space text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play size={14} className={simulatingAttack ? 'animate-spin' : ''} />
                <span>{simulatingAttack ? 'INJECTING SCENARIO...' : `SIMULATE ${selectedAttackType} ATTACK`}</span>
              </button>

              {/* Attack Simulation Result Box */}
              <AnimatePresence>
                {attackResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-[#090306] border border-amber-400/40 text-xs font-space space-y-2"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold border-b border-white/10 pb-2">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>ATTACK NEUTRALIZED &amp; ISOLATED</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">{attackResult.status}</span>
                    </div>

                    <div className="space-y-1 text-[11px] font-inter text-star-white/90">
                      <p>
                        <strong className="text-amber-300 font-space font-semibold">Anomaly:</strong> {attackResult.detected_anomaly}
                      </p>
                      <p>
                        <strong className="text-emerald-400 font-space font-semibold">Autonomous Defense:</strong>{' '}
                        {attackResult.autonomous_mitigation}
                      </p>
                      <p>
                        <strong className="text-cyan-glow font-space font-semibold">OBC State:</strong>{' '}
                        {attackResult.flight_computer_action}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column (Crypto Firewall Terminal & Searchable Threat Log) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive Telecommand Crypto Verification Console */}
            <motion.div
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-red-400/30 box-glow relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <span className="font-space text-xs tracking-[0.2em] uppercase font-bold text-red-400">
                  INTERACTIVE CRYPTO FIREWALL TEST
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-space font-bold bg-black/40 text-star-white/70 border border-white/10">
                  OBC TESTBED
                </span>
              </div>

              <p className="text-xs font-inter text-star-white/80 mb-4 leading-relaxed">
                Inject test telecommand frames into the flight computer cryptographic firewall to verify HMAC-SHA256 signature enforcement and forged packet isolation.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => handleVerifyPacket('AUTHENTIC')}
                  disabled={testingPacket}
                  className="px-3.5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-space text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>INJECT AUTHENTIC PACKET</span>
                  <span className="text-[8px] font-mono text-emerald-400/80 font-normal">Valid HMAC Key</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyPacket('MALICIOUS_FORGERY')}
                  disabled={testingPacket}
                  className="px-3.5 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-space text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle size={16} />
                  <span>INJECT FORGED PACKET</span>
                  <span className="text-[8px] font-mono text-red-400/80 font-normal">Tampered Hash</span>
                </button>
              </div>

              {/* Verification Output Terminal */}
              <div className="p-4 rounded-2xl bg-[#050106] border border-white/10 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted-gray border-b border-white/5 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal size={11} className="text-red-400" />
                    <span>CCSDS OBC EXECUTION BUFFER</span>
                  </span>
                  <span>{testingPacket ? 'VERIFYING...' : 'IDLE'}</span>
                </div>

                {testResult ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-star-white/60">Status:</span>
                      <span className={`font-bold ${testResult.is_authentic ? 'text-emerald-400' : 'text-red-400'}`}>
                        {testResult.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-star-white/60">HMAC-SHA256:</span>
                      <span className="text-cyan-glow">{testResult.computed_hmac}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-star-white/60">Trust Score:</span>
                      <span className="text-amber-400 font-bold">{testResult.trust_score}%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[10px] font-inter text-star-white/90 leading-tight">
                      <strong>Action:</strong> {testResult.action_taken}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] font-inter text-muted-gray py-2 text-center">
                    Select a packet injection test above to evaluate the flight hardware crypto barrier.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Quarantined Cyber Threat Incident Log with Search & Filters */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-3">
                <span className="font-space text-xs sm:text-sm tracking-wider uppercase font-bold text-star-white flex items-center gap-2">
                  <Terminal size={14} className="text-red-400" />
                  <span>FIREWALL INTERCEPT &amp; QUARANTINE LOG</span>
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold">
                  {filteredLogs.length} THREATS LOGGED
                </span>
              </div>

              {/* Search & Severity Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by attack vector, carrier, ID..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-inter text-star-white placeholder:text-muted-gray/60 focus:outline-none focus:border-red-400/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-space tracking-wider border cursor-pointer shrink-0 transition-all ${
                        selectedSeverity === sev
                          ? 'bg-red-500/20 border-red-400 text-red-300 font-bold'
                          : 'bg-black/40 border-white/10 text-muted-gray hover:text-star-white'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1.5 hover:border-red-400/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-space flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ${
                            log.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {log.attack_vector}
                        </span>
                        <span className="text-muted-gray text-[10px] truncate max-w-[120px] sm:max-w-none">
                          {log.source_rf_carrier}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-star-white/50">{log.id}</span>
                    </div>
                    <p className="text-[11px] font-inter text-star-white/80 leading-tight">
                      {log.mitigation_action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
