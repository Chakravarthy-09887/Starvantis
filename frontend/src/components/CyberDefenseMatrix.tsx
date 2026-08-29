'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
  ArrowUpRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES, SatelliteFleetDefinition } from '../lib/satellites';
import {
  api,
  SpacecraftCyberThreatStatus,
  CyberThreatLog,
  PacketVerificationResult,
} from '../lib/api';

export default function CyberDefenseMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { selectedSatelliteId, setSelectedSatelliteId, formatMissionTime } = useMission();

  const [cyberStatus, setCyberStatus] = useState<SpacecraftCyberThreatStatus | null>(null);
  const [testingPacket, setTestingPacket] = useState(false);
  const [testResult, setTestResult] = useState<PacketVerificationResult | null>(null);
  const [testType, setTestType] = useState<'AUTHENTIC' | 'MALICIOUS_FORGERY'>('AUTHENTIC');

  const activeSat: SatelliteFleetDefinition =
    FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  // Fetch cybersecurity status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getCyberDefenseStatus(selectedSatelliteId);
        setCyberStatus(data);
      } catch {
        // Fallback
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [selectedSatelliteId]);

  // Run cryptographic verification simulation
  const handleVerifyPacket = async (type: 'AUTHENTIC' | 'MALICIOUS_FORGERY') => {
    setTestingPacket(true);
    setTestType(type);
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
      // Fallback
    } finally {
      setTestingPacket(false);
    }
  };

  return (
    <section id="cyber-defense" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-400/20 bg-red-400/5 mb-4">
            <ShieldAlert size={13} className="text-red-400 animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-red-400 uppercase font-bold">
              CCSDS SDLS SPACE DATA LINK SECURITY &amp; HARDWARE ROOT-OF-TRUST
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            SPACECRAFT CYBER-DEFENSE
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto">
            Zero-trust on-board cryptographic firewall, GNSS/GPS anti-spoofing RAIM cross-correlation, HMAC-SHA256 telecommand authorization, and replay attack neutralization.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-red-400/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />

          {/* SATELLITE SWITCHER TABS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {FLEET_SATELLITES.map((sat) => {
              const isSelected = sat.id === selectedSatelliteId;
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={sat.id}
                  onClick={() => setSelectedSatelliteId(sat.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-space tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-red-500/20 border-red-400 text-star-white shadow-[0_0_20px_rgba(239,68,68,0.35)] scale-105 font-bold'
                      : 'bg-space-navy/60 border-glass-border text-muted-gray hover:text-star-white hover:border-red-400/40'
                  }`}
                >
                  <Satellite size={13} className={isSelected ? 'text-red-400' : 'text-muted-gray'} />
                  <span>{sat.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Cryptographic Shield & GNSS Anti-Spoofing Radar (Left Column) */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Cryptographic Architecture Card */}
            <div className="glass-panel rounded-3xl p-6 border border-red-500/30 relative overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.15)]">
              <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-red-400 animate-pulse" />
                  <div>
                    <span className="font-space text-xs tracking-widest text-star-white uppercase block font-bold">
                      CCSDS SDLS CRYPTOGRAPHIC LOCK // {activeSat.name}
                    </span>
                    <span className="font-space text-[10px] text-red-400/80">
                      ON-BOARD HARDWARE SECURITY MODULE (HSM) ACTIVE
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-space text-[10px] font-bold flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  <span>TRUST INDEX: 99.8%</span>
                </span>
              </div>

              {/* Security Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                    ENCRYPTION MODE:
                  </span>
                  <span className="font-mono text-xs font-bold text-red-400 block">AES-GCM-256</span>
                  <span className="text-[8px] font-inter text-star-white/60">CCSDS 355.0-B-1 Compliant</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                    FRAME COUNTER (FC):
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-glow block">
                    {cyberStatus?.frame_sequence_counter || 104982}
                  </span>
                  <span className="text-[8px] font-inter text-emerald-400">Replay Filter Locked</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                    KEY ROTATION:
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400 block">VALID // EPOCH-14</span>
                  <span className="text-[8px] font-inter text-star-white/60">Next Rotation in 14h</span>
                </div>
              </div>

              {/* GNSS / GPS Anti-Spoofing RAIM Radar */}
              <div className="mt-4 p-4 rounded-2xl bg-[#0a0408] border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs font-bold text-star-white uppercase flex items-center gap-2">
                    <Radio size={14} className="text-red-400 animate-pulse" />
                    <span>RECEIVER AUTONOMOUS INTEGRITY MONITORING (RAIM)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    NOMINAL RAIM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-space">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                    <span className="text-muted-gray text-[10px]">Pseudorange Residual:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {cyberStatus?.gps_pseudorange_residual_ns || 0.04} ns
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                    <span className="text-muted-gray text-[10px]">Carrier-to-Noise (C/N₀):</span>
                    <span className="font-mono text-cyan-glow font-bold">
                      {cyberStatus?.carrier_to_noise_c_n0_dbhz || 44.5} dB-Hz
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-inter text-star-white/70 leading-relaxed">
                  Autonomous Kalman filter compares GPS ephemeris against on-board Star Tracker quaternions and tri-axial fiber optic gyros (FOG) to detect fake RF signal spoofing.
                </p>
              </div>
            </div>

            {/* Quarantined Cyber Threat Incident Log */}
            <div className="glass-panel rounded-3xl p-6 border border-glass-border space-y-3">
              <div className="flex items-center justify-between border-b border-glass-border pb-3">
                <span className="font-space text-xs tracking-wider uppercase font-bold text-star-white flex items-center gap-2">
                  <Terminal size={14} className="text-red-400" />
                  <span>ON-BOARD FIREWALL INTERCEPT &amp; QUARANTINE LOG</span>
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold">
                  {cyberStatus?.quarantined_packets_24h || 3} THREATS BLOCKED (24H)
                </span>
              </div>

              <div className="space-y-2">
                {(cyberStatus?.threat_logs || []).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1.5 hover:border-red-400/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-space flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 font-mono text-[9px] font-bold">
                          {log.attack_vector}
                        </span>
                        <span className="text-muted-gray text-[10px]">{log.source_rf_carrier}</span>
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
          </motion.div>

          {/* Interactive Telecommand Crypto Verification Console (Right Column) */}
          <motion.div
            className="lg:col-span-5 space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <div className="glass-panel rounded-3xl p-6 border border-red-400/30 box-glow relative overflow-hidden">
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
              <div className="grid grid-cols-2 gap-3 mb-4">
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
                      <span
                        className={`font-bold ${
                          testResult.is_authentic ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
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

              {/* Footnote */}
              <div className="mt-4 pt-3 border-t border-glass-border flex items-start gap-2">
                <HelpCircle size={12} className="text-muted-gray shrink-0 mt-0.5" />
                <p className="font-inter text-[9px] text-muted-gray leading-tight">
                  Hardened against unauthenticated ground uplinks, radio replay loops, and GNSS spoofing vectors via NIST FIPS 140-3 Level 4 equivalent protection.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
