'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  Satellite,
  RefreshCw,
  Search,
  Play,
  RotateCcw,
  Sparkles,
  X,
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
  const { selectedSatelliteId, setSelectedSatelliteId } = useMission();

  const [cyberStatus, setCyberStatus] = useState<SpacecraftCyberThreatStatus | null>(null);
  const [testingPacket, setTestingPacket] = useState(false);
  const [testResult, setTestResult] = useState<PacketVerificationResult | null>(null);
  const [rotatingKeys, setRotatingKeys] = useState(false);
  const [rotationResult, setRotationResult] = useState<KeyRotationResult | null>(null);
  const [selectedAttackType, setSelectedAttackType] = useState<string>('GNSS_SPOOFING');

  // Interactive Live Simulation Engine States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simMessage, setSimMessage] = useState<string>('');
  const [attackResult, setAttackResult] = useState<AttackSimulationResult | null>(null);

  // Instant Packet Acknowledgement Modal
  const [ackModal, setAckModal] = useState<{
    open: boolean;
    type: 'AUTHENTIC' | 'FORGED';
    result: PacketVerificationResult | null;
  }>({ open: false, type: 'AUTHENTIC', result: null });

  // Live Jitter and Streaming Tick
  const [liveSec, setLiveSec] = useState<number>(0);
  const [liveThroughput, setLiveThroughput] = useState<number>(120);

  // Logs Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [threatLogs, setThreatLogs] = useState<CyberThreatLog[]>([]);

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // 30-second live cryptographic threat sync countdown
  const [syncCountdown, setSyncCountdown] = useState<number>(30);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const data = await api.getCyberDefenseStatus(selectedSatelliteId);
        if (isMounted) {
          setCyberStatus(data);
          setThreatLogs(data.threat_logs || []);
          setTestResult(null);
          setAttackResult(null);
          setRotationResult(null);
          setSyncCountdown(30);
        }
      } catch {
        // Fallback
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    const countdownTimer = setInterval(() => {
      setSyncCountdown((c) => (c <= 1 ? 30 : c - 1));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(countdownTimer);
    };
  }, [selectedSatelliteId]);

  useEffect(() => {
    const tickTimer = setInterval(() => {
      setLiveSec((s) => s + 1);
      setLiveThroughput(118 + Math.floor(Math.random() * 7));
    }, 1000);
    return () => clearInterval(tickTimer);
  }, []);

  const liveFrameCounter = useMemo(() => {
    const base = cyberStatus?.frame_sequence_counter || 104982;
    return base + liveSec * 2;
  }, [cyberStatus?.frame_sequence_counter, liveSec]);

  const livePseudorange = useMemo(() => {
    if (isSimulating && selectedAttackType === 'GNSS_SPOOFING') {
      return (0.084 + Math.sin(liveSec * 3.0) * 0.01).toFixed(4);
    }
    const base = cyberStatus?.gps_pseudorange_residual_ns || 0.04;
    return (base + Math.sin(liveSec * 1.5) * 0.003).toFixed(4);
  }, [cyberStatus?.gps_pseudorange_residual_ns, liveSec, isSimulating, selectedAttackType]);

  const liveCN0 = useMemo(() => {
    if (isSimulating && selectedAttackType === 'DOS_JAMMING') {
      return (14.2 + Math.cos(liveSec * 2.0) * 2.0).toFixed(1);
    }
    const base = cyberStatus?.carrier_to_noise_c_n0_dbhz || 44.5;
    return (base + Math.cos(liveSec * 0.8) * 0.4).toFixed(1);
  }, [cyberStatus?.carrier_to_noise_c_n0_dbhz, liveSec, isSimulating, selectedAttackType]);

  const liveTrustIndex = useMemo(() => {
    if (isSimulating) {
      return (92.4 + Math.sin(liveSec * 2) * 3).toFixed(1);
    }
    return (cyberStatus?.trust_index_pct || 99.8).toFixed(1);
  }, [cyberStatus?.trust_index_pct, isSimulating, liveSec]);

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

  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  const handleSimulateAttack = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimCompleted(false);
    setSimStep(1);
    setSimMessage('STAGE 1: Ingesting RF Carrier and evaluating frame parity...');

    setTimeout(() => {
      setSimStep(2);
      setSimMessage('STAGE 2: Evaluating Frame Sequence Counter and anti-replay sliding window...');
    }, 900);

    setTimeout(() => {
      setSimStep(3);
      setSimMessage('STAGE 3: Cryptographic HMAC-SHA256 Root-of-Trust verification...');
    }, 1800);

    setTimeout(async () => {
      setSimStep(4);
      setSimMessage('STAGE 4: Zero-Trust Firewall anomaly trigger & autonomous mitigation...');
      try {
        const res = await api.simulateCyberAttack({
          satellite_id: selectedSatelliteId,
          attack_type: selectedAttackType,
        });
        setAttackResult(res);
        if (res.quarantined_log) {
          setThreatLogs((prev) => [res.quarantined_log, ...prev]);
        }
      } catch {
        // Keep state
      }
    }, 2700);

    setTimeout(() => {
      setSimStep(5);
      setSimMessage('STAGE 5: Threat neutralized. OBC protected, telemetry isolated to quarantine log.');
      setIsSimulating(false);
      setSimCompleted(true);
    }, 3800);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimCompleted(false);
    setSimStep(0);
    setSimMessage('');
  };

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
      // Open instant visual acknowledgement modal
      setAckModal({
        open: true,
        type: type === 'AUTHENTIC' ? 'AUTHENTIC' : 'FORGED',
        result: res,
      });
    } catch {
      // Keep state
    } finally {
      setTestingPacket(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return threatLogs.filter((log) => {
      const matchesSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.attack_vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source_rf_carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.mitigation_action.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity =
        selectedSeverity === 'ALL' || log.severity.toUpperCase() === selectedSeverity.toUpperCase();
      return matchesSearch && matchesSeverity;
    });
  }, [threatLogs, searchQuery, selectedSeverity]);

  const attackScenarios = [
    {
      id: 'GNSS_SPOOFING',
      name: 'GNSS / GPS Spoofing',
      icon: Radio,
      desc: 'Inject fake L1/L2 GPS RF pseudorange steps (+84ns) to induce navigation trajectory drift.',
      badge: 'HIGH RISK',
      color: 'text-amber-400 border-amber-400/30 bg-amber-500/10',
    },
    {
      id: 'REPLAY_ATTACK',
      name: 'Replay Command Attack',
      icon: RotateCcw,
      desc: 'Re-broadcast captured valid telemetry frames to force duplicate execution.',
      badge: 'CRITICAL',
      color: 'text-red-400 border-red-400/30 bg-red-500/10',
    },
    {
      id: 'MALICIOUS_TELECOMMAND',
      name: 'Forged Telecommand',
      icon: Terminal,
      desc: 'Inject unauthorized propulsion fire vectors with forged signature bytes.',
      badge: 'CRITICAL',
      color: 'text-red-400 border-red-400/30 bg-red-500/10',
    },
    {
      id: 'DOS_JAMMING',
      name: 'Uplink Carrier Jamming',
      icon: Zap,
      desc: 'Flood receiver channel with high-power broadband RF noise floor (+18 dB).',
      badge: 'HIGH RISK',
      color: 'text-amber-400 border-amber-400/30 bg-amber-500/10',
    },
  ];

  const pipelineStages = [
    { id: 1, label: 'RF DEMOD', sub: '2.2 GHz S-Band' },
    { id: 2, label: 'FRAME COUNTER', sub: `FC=${liveFrameCounter}` },
    { id: 3, label: 'HMAC-SHA256', sub: 'HSM Enclave' },
    { id: 4, label: 'ZERO-TRUST FIREWALL', sub: 'Rule Matrix' },
    { id: 5, label: 'OBC FLIGHT QUEUE', sub: 'Execution Buffer' },
  ];

  return (
    <section id="cyber-defense" className="section-spacing relative overflow-hidden py-16 md:py-24" ref={containerRef}>
      {/* INSTANT PACKET ACKNOWLEDGEMENT MODAL */}
      <AnimatePresence>
        {ackModal.open && ackModal.result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-lg w-full rounded-3xl p-6 border shadow-2xl relative ${
                ackModal.type === 'AUTHENTIC'
                  ? 'bg-[#041912] border-emerald-500/60 shadow-[0_0_60px_rgba(16,185,129,0.35)]'
                  : 'bg-[#1e070a] border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.35)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setAckModal({ open: false, type: 'AUTHENTIC', result: null })}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-star-white cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                {ackModal.type === 'AUTHENTIC' ? (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={28} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
                    <AlertTriangle size={28} />
                  </div>
                )}
                <div>
                  <span className="font-space text-[10px] tracking-widest text-muted-gray uppercase block font-bold">
                    CRYPTOGRAPHIC TELECOMMAND ACKNOWLEDGEMENT
                  </span>
                  <h3 className={`font-space text-lg font-bold ${ackModal.type === 'AUTHENTIC' ? 'text-emerald-300' : 'text-red-400'}`}>
                    {ackModal.type === 'AUTHENTIC' ? 'PACKET AUTHENTICATED & SCHEDULED' : 'FORGED PACKET INTERCEPTED & QUARANTINED'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 font-space text-xs border-y border-white/10 py-4 my-4">
                <div className="flex justify-between">
                  <span className="text-muted-gray">Target Spacecraft:</span>
                  <span className="font-bold text-star-white">{activeSat.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-gray">Verification Status:</span>
                  <span className={`font-bold font-mono ${ackModal.type === 'AUTHENTIC' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ackModal.result.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-gray">HMAC-SHA256 Token:</span>
                  <span className="font-mono text-cyan-glow">{ackModal.result.computed_hmac}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-gray">OBC Trust Rating:</span>
                  <span className="font-mono font-bold text-amber-400">{ackModal.result.trust_score}%</span>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-inter text-[11px] text-star-white/90">
                  <strong>OBC Action:</strong> {ackModal.result.action_taken}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAckModal({ open: false, type: 'AUTHENTIC', result: null })}
                className={`w-full py-2.5 rounded-xl font-space text-xs font-bold transition-all cursor-pointer ${
                  ackModal.type === 'AUTHENTIC'
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                DISMISS ACKNOWLEDGEMENT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-400/30 bg-red-500/10 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <ShieldAlert size={14} className="text-red-400 animate-pulse" />
            <span className="font-space text-[10px] md:text-xs tracking-[0.25em] text-red-400 uppercase font-bold">
              ZERO-TRUST FIREWALL // 30s LIVE TELECOMMAND AUDIT ({syncCountdown}s)
            </span>
          </div>
          <h2 className="font-space text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-star-white">
            SPACECRAFT CYBER-DEFENSE
          </h2>
          <p className="font-inter text-xs sm:text-sm text-muted-gray mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Real-time CCSDS SDLS cryptographic verification, on-orbit key rotation, GNSS RAIM multi-constellation anti-spoofing, and interactive aerospace threat simulation.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-red-400/60 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <button
                  type="button"
                  key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-red-500/25 border-red-400 text-star-white shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-105 font-bold ring-1 ring-red-400'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-red-400/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-red-400' : 'text-muted-gray'} />
                  <span>{sat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 5-STAGE PACKET INSPECTION PIPELINE VISUALIZER */}
        <motion.div
          className={`mb-8 p-4 sm:p-5 rounded-3xl glass-panel border transition-all duration-500 relative overflow-hidden ${
            isSimulating
              ? 'border-amber-400/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] bg-black/80'
              : 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)]'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-glass-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Activity size={16} className={`animate-pulse ${isSimulating ? 'text-amber-400' : 'text-red-400'}`} />
              <span className="font-space text-xs sm:text-sm font-bold tracking-wider text-star-white uppercase">
                CCSDS PACKET INSPECTION PIPELINE // {activeSat.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-gray">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {liveThroughput} FRAMES/SEC THROUGHPUT
              </span>
              <span className="hidden sm:inline text-cyan-glow">
                {isSimulating ? 'EVALUATING INTRUSION...' : 'OBC PROTECTED'}
              </span>
            </div>
          </div>

          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-between text-xs font-space text-amber-300"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-amber-400" />
                <span className="font-bold">{simMessage}</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-bold">
                STAGE 0{simStep} / 05
              </span>
            </motion.div>
          )}

          {simCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-space text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-star-white">STAGE 05 / 05 // ATTACK MITIGATION COMPLETE</span>
                  <span className="text-[11px] text-emerald-400/90 font-inter">
                    Malicious packet quarantined to audit log. Spacecraft OBC running undisturbed on nominal flight cycle.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-[10px] uppercase tracking-wider cursor-pointer shrink-0"
              >
                RESET SIMULATOR
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 relative">
            {pipelineStages.map((stage) => {
              const isActiveInSim = isSimulating && simStep === stage.id;
              const isPassedInSim = (isSimulating && simStep > stage.id) || (simCompleted && simStep >= stage.id);
              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isActiveInSim
                      ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.03] ring-1 ring-amber-400'
                      : isPassedInSim
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-black/50 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] text-muted-gray uppercase">STAGE 0{stage.id}</span>
                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActiveInSim
                          ? 'bg-amber-400 text-black animate-pulse'
                          : isPassedInSim
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-white/10 text-star-white/70'
                      }`}
                    >
                      {isActiveInSim ? 'EVALUATING' : isPassedInSim ? 'CLEARED' : 'ARMED'}
                    </span>
                  </div>
                  <span className="font-space text-xs font-bold text-star-white block truncate">{stage.label}</span>
                  <span className="font-inter text-[10px] text-red-400/90 block truncate">{stage.sub}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* MAIN 2-COLUMN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Key Vault & HSM */}
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
                      HARDWARE ROOT-OF-TRUST &amp; KEY VAULT // {activeSat.name.split(' ')[0]}
                    </span>
                    <span className="font-space text-[10px] sm:text-[11px] text-red-400/90 font-mono">
                      {cyberStatus?.hsm_enclave_status || 'FIPS 140-3 LEVEL 4 TAMPER-RESISTANT HSM ACTIVE'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRotateKeys}
                  disabled={rotatingKeys || isSimulating}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 font-space text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw size={13} className={rotatingKeys ? 'animate-spin' : ''} />
                  <span>{rotatingKeys ? 'RE-KEYING...' : 'ROTATE SESSION KEYS'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">ENCRYPTION:</span>
                  <span className="font-mono text-xs font-bold text-red-400 block truncate">
                    {cyberStatus?.ccsds_sdls_crypto_mode?.split(' ')[0] || 'AES-GCM-256'}
                  </span>
                  <span className="text-[8px] font-inter text-star-white/60 block truncate">
                    {activeSat.agency} Secure
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">FRAME COUNTER:</span>
                  <span className="font-mono text-xs font-bold text-cyan-glow block truncate">
                    {liveFrameCounter}
                  </span>
                  <span className="text-[8px] font-inter text-emerald-400 block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Stream
                  </span>
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
                    {liveTrustIndex}%
                  </span>
                  <span className="text-[8px] font-inter text-emerald-400 block">Zero Compromise</span>
                </div>
              </div>

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

            {/* GNSS Multi-Constellation RAIM Radar */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-3">
                <span className="font-space text-xs sm:text-sm font-bold text-star-white uppercase flex items-center gap-2">
                  <Radio size={16} className="text-cyan-glow animate-pulse" />
                  <span>RECEIVER AUTONOMOUS INTEGRITY MONITORING (RAIM)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                  {cyberStatus?.gnss_raim_status?.split('//')[0] || 'NOMINAL RAIM LOCK'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-space">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Pseudorange Residual:</span>
                  <span className={`font-mono font-bold ${isSimulating && selectedAttackType === 'GNSS_SPOOFING' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {livePseudorange} ns
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                  <span className="text-muted-gray text-[11px]">Carrier-to-Noise (C/N₀):</span>
                  <span className={`font-mono font-bold ${isSimulating && selectedAttackType === 'DOS_JAMMING' ? 'text-amber-400 animate-pulse' : 'text-cyan-glow'}`}>
                    {liveCN0} dB-Hz
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-muted-gray block">
                  TRACKED CONSTELLATION NODES // {activeSat.name}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    cyberStatus?.gnss_constellations || [
                      { name: 'GPS (Navstar)', tracked_sats: 12, health_status: 'NOMINAL', pseudorange_residual_ns: 0.04, c_n0_dbhz: 44.8 },
                      { name: 'Galileo (EU)', tracked_sats: 10, health_status: 'NOMINAL', pseudorange_residual_ns: 0.03, c_n0_dbhz: 45.2 },
                      { name: 'NavIC (ISRO)', tracked_sats: 7, health_status: 'NOMINAL', pseudorange_residual_ns: 0.035, c_n0_dbhz: 46.0 },
                      { name: 'Star Tracker POD', tracked_sats: 4, health_status: 'NOMINAL', pseudorange_residual_ns: 0.005, c_n0_dbhz: 50.0 },
                    ]
                  ).map((c) => (
                    <div key={c.name} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="font-space text-[10px] font-bold text-star-white block truncate">{c.name}</span>
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-muted-gray">{c.tracked_sats} Nodes</span>
                        <span className="text-emerald-400 font-bold">{c.health_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ON-ORBIT CYBER-ATTACK THREAT SIMULATOR */}
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
                      onClick={() => !isSimulating && setSelectedAttackType(sc.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 text-left ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
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

              <button
                type="button"
                onClick={handleSimulateAttack}
                disabled={isSimulating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-red-500/25 to-amber-500/25 hover:from-amber-500/35 hover:to-red-500/35 border border-amber-400/60 text-amber-300 font-space text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <Play size={15} className={isSimulating ? 'animate-spin' : ''} />
                <span>
                  {isSimulating
                    ? `SIMULATING ${selectedAttackType} ATTACK ON ${activeSat.name.split(' ')[0]}...`
                    : `SIMULATE ${selectedAttackType} ATTACK ON ${activeSat.name.split(' ')[0]}`}
                </span>
              </button>

              <AnimatePresence>
                {attackResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-[#090306] border border-amber-400/50 text-xs font-space space-y-2 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold border-b border-white/10 pb-2">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>ATTACK NEUTRALIZED &amp; ISOLATED // {attackResult.satellite_id}</span>
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {attackResult.status}
                      </span>
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

          {/* Right Column (Crypto Firewall Terminal & Quarantine Threat Log) */}
          <div className="lg:col-span-5 space-y-6">
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
                Inject test telecommand frames into the flight computer cryptographic firewall to verify HMAC-SHA256 signature enforcement and forged packet isolation for {activeSat.name}.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => handleVerifyPacket('AUTHENTIC')}
                  disabled={testingPacket || isSimulating}
                  className="px-3 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-space text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>INGEST VALID PACKET</span>
                  <span className="text-[8px] font-mono text-emerald-400/80 font-normal">Valid Key &amp; Ack Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyPacket('MALICIOUS_FORGERY')}
                  disabled={testingPacket || isSimulating}
                  className="px-3 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-space text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle size={16} />
                  <span>INGEST FORGED PACKET</span>
                  <span className="text-[8px] font-mono text-red-400/80 font-normal">Tampered Hash Isolation</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyPacket('AUTHENTIC')}
                  disabled={testingPacket || isSimulating}
                  className="px-3 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-space text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Radio size={16} />
                  <span>ACK PACKET INGESTION</span>
                  <span className="text-[8px] font-mono text-cyan-300/80 font-normal">Instant Crypto Certificate</span>
                </button>
              </div>

              {/* Terminal View */}
              <div className="p-4 rounded-2xl bg-[#050106] border border-white/10 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted-gray border-b border-white/5 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal size={11} className="text-red-400" />
                    <span>CCSDS OBC EXECUTION BUFFER // {activeSat.name.split(' ')[0]}</span>
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

            {/* Quarantine Threat Log with Search & Filter */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-glass-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-3">
                <span className="font-space text-xs sm:text-sm tracking-wider uppercase font-bold text-star-white flex items-center gap-2">
                  <Terminal size={14} className="text-red-400" />
                  <span>FIREWALL QUARANTINE LOG // {activeSat.name.split(' ')[0]}</span>
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold">
                  {filteredLogs.length} THREATS LOGGED
                </span>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray" />
                  <input
                    id="cyber-threat-search-input"
                    name="cyberThreatSearch"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search threats by vector, carrier, ID..."
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

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredLogs.map((log, idx) => (
                  <div
                    key={log.id + idx}
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
