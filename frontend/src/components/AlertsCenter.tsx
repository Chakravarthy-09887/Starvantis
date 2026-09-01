'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Radio,
  Filter,
  Check,
  RotateCcw,
  Wifi,
  Volume2,
  VolumeX,
  BellRing,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { alarmAudio } from '../lib/alarmAudio';

export default function AlertsCenter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { alerts, alertScanCountdownSeconds, dispatchLiveAlert, ackAlert, wsConnected, formatMissionTime, currentClock, timezone } = useMission();

  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'unack'>('all');
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isBeeping, setIsBeeping] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Format countdown mm:ss
  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Subscribe to global alarm audio state
  useEffect(() => {
    const unsubscribe = alarmAudio.subscribe((playing) => {
      setIsBeeping(playing);
    });
    return unsubscribe;
  }, []);

  // Sync soundEnabled with alarmAudio
  useEffect(() => {
    alarmAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleContinuousBeep = () => {
    if (isBeeping) {
      alarmAudio.stop();
    } else {
      alarmAudio.play(true);
    }
  };

  const stopContinuousBeep = () => {
    alarmAudio.stop();
  };

  const playAckChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(1560, now + 0.15);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Ack chime error:', e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAcknowledge = async (id: string) => {
    playAckChime();
    await ackAlert(id, 'Commander Vance', 'Acknowledged via real-time Mission Control Deck');
    setSuccessToast(`Alert ${id} successfully acknowledged & logged to audit trail`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleTriggerManualDispatch = () => {
    dispatchLiveAlert();
    playAckChime();
    setSuccessToast('New telemetry-triggered space alert successfully dispatched to active queue');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unack') return !alert.acknowledged;
    return alert.severity === activeFilter;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;
  const totalUnack = alerts.filter((a) => !a.acknowledged).length;

  return (
    <section id="alerts" className="section-spacing relative overflow-hidden py-20 md:py-28" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-alert-critical/20 bg-alert-critical/5 mb-3.5 shadow-[0_0_15px_rgba(255,59,59,0.15)]">
            <AlertOctagon size={13} className="text-alert-critical animate-pulse" />
            <span className="font-space text-[10px] tracking-[0.3em] text-alert-critical uppercase font-semibold">
              Mission Control Alert Dispatch // 30-Sec Live Loop
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            ACTIVE MISSION ALERTS
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed">
            Prioritized multi-vector space alerts automatically monitored, refreshed, and dispatched on a live 30-second synchronized telemetry polling loop.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-alert-critical/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* LIVE 30-SECOND DISPATCH BANNER & COUNTDOWN HUD */}
        <motion.div
          className="mb-8 p-4 sm:p-5 rounded-3xl glass-panel border border-cyan-glow/30 shadow-[0_0_40px_rgba(4,18,34,0.8)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {/* Progress bar background indicator for 30s cycle */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-glow via-purple-400 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, ((30 - alertScanCountdownSeconds) / 30) * 100))}%` }}
          />

          {/* Left: Live Status & Pulse */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow shrink-0">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-space text-xs sm:text-sm font-bold tracking-wider text-star-white uppercase">
                  LIVE TELEMETRY ALERT ENGINE
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  30-SEC REFRESH ACTIVE
                </span>
              </div>
              <span className="font-inter text-[11px] text-muted-gray block mt-0.5">
                Continuously evaluates thermal gradients, orbital conjunctions, Deep Space telemetry, and EPS voltages across all fleet spacecraft.
              </span>
            </div>
          </div>

          {/* Right: Countdown Timer & Manual Trigger */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
            <div className="px-4 py-2 rounded-2xl bg-black/60 border border-cyan-glow/30 text-right">
              <span className="text-[9px] font-space text-muted-gray uppercase block font-semibold">
                NEXT FLEET ALERT SCAN IN:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg sm:text-xl font-bold text-cyan-glow tracking-wider" suppressHydrationWarning>
                  {formatCountdown(alertScanCountdownSeconds)}
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerManualDispatch}
              className="px-4 py-2.5 rounded-2xl bg-cyan-glow/20 hover:bg-cyan-glow/30 border border-cyan-glow/50 text-star-white font-space text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(99,199,255,0.25)] hover:scale-105"
            >
              <RotateCcw size={14} className="text-cyan-glow" />
              <span>DISPATCH LIVE ALERT NOW</span>
            </button>
          </div>
        </motion.div>

        {/* Real-time Notification Banner */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.25)] text-xs font-space text-emerald-300"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{successToast}</span>
              </div>
              <span className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-semibold">
                AUDIT LOGGED
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl glass-panel border border-glass-border">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'ALL ALERTS', count: alerts.length },
              { id: 'unack', label: 'PENDING ACTION', count: totalUnack, highlight: totalUnack > 0 },
              { id: 'critical', label: 'CRITICAL', count: alerts.filter((a) => a.severity === 'critical').length, isCrit: true },
              { id: 'high', label: 'HIGH', count: alerts.filter((a) => a.severity === 'high').length },
              { id: 'medium', label: 'MEDIUM', count: alerts.filter((a) => a.severity === 'medium').length },
              { id: 'low', label: 'LOW', count: alerts.filter((a) => a.severity === 'low').length },
            ].map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <div role="button" tabIndex={0} key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-glow/20 border-cyan-glow text-star-white font-bold shadow-[0_0_15px_rgba(99,199,255,0.3)]'
                      : f.isCrit && f.count > 0
                      ? 'bg-alert-critical/10 border-alert-critical/30 text-alert-critical hover:bg-alert-critical/20'
                      : 'border-glass-border bg-space-navy/50 text-muted-gray hover:text-star-white hover:border-cyan-glow/30'
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-cyan-glow text-black'
                        : f.isCrit
                        ? 'bg-alert-critical/20 text-alert-critical'
                        : 'bg-white/10 text-star-white/70'
                    }`}
                  >
                    {f.count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-space text-muted-gray flex-wrap">
            {/* Continuous Audio Alert Beep Toggle (Manual Stop Only) */}
            <div
              role="button"
              tabIndex={0}
              onClick={toggleContinuousBeep}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
                isBeeping
                  ? 'border-alert-critical bg-alert-critical/30 text-white shadow-[0_0_20px_rgba(255,59,59,0.6)] animate-pulse'
                  : 'border-alert-critical/40 bg-alert-critical/15 text-alert-critical hover:bg-alert-critical/25 shadow-[0_0_12px_rgba(255,59,59,0.2)]'
              }`}
              title={isBeeping ? 'Click to manually stop continuous beep' : 'Click to start continuous alarm beep'}
            >
              <BellRing size={13} className={isBeeping ? 'animate-bounce text-white' : 'animate-pulse text-alert-critical'} />
              <span>{isBeeping ? 'SILENCE ALARM BEEP (ACTIVE)' : 'START ALARM BEEP'}</span>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (soundEnabled && isBeeping) {
                  stopContinuousBeep();
                }
                setSoundEnabled(!soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                soundEnabled
                  ? 'border-cyan-glow/40 bg-cyan-glow/15 text-cyan-glow font-bold'
                  : 'border-white/10 bg-white/5 text-muted-gray'
              }`}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>AUDIO: {soundEnabled ? 'ACTIVE' : 'MUTED'}</span>
            </div>

            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                wsConnected
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow font-bold'
              }`}
            >
              <Wifi size={12} className="animate-pulse" />
              <span>{wsConnected ? '2-WAY WS SYNC ACTIVE' : 'LIVE 1Hz TELEMETRY STREAM'}</span>
            </span>
          </div>
        </div>

        {/* ALERTS LIST WITH PERFECT TEXT ALIGNMENT */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isHigh = alert.severity === 'high';
              const isMed = alert.severity === 'medium';
              const isExpanded = !!expandedAlerts[alert.id];

              const badgeColor = isCritical
                ? '#ff3b3b'
                : isHigh
                ? '#ff8c00'
                : isMed
                ? '#fbbf24'
                : '#63C7FF';

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`rounded-3xl border transition-all duration-300 relative overflow-hidden backdrop-blur-2xl ${
                    isCritical && !alert.acknowledged
                      ? 'border-alert-critical/50 bg-[#140507]/95 shadow-[0_0_35px_rgba(255,59,59,0.25)]'
                      : 'border-cyan-glow/20 bg-[#060c14]/95 hover:border-cyan-glow/40 shadow-[0_0_25px_rgba(4,18,34,0.6)]'
                  }`}
                >
                  {/* Left Edge Severity Indicator Bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-2 ${
                      isCritical
                        ? 'bg-alert-critical animate-pulse'
                        : isHigh
                        ? 'bg-amber-500'
                        : isMed
                        ? 'bg-yellow-400'
                        : 'bg-cyan-glow'
                    }`}
                  />

                  {/* Main Box Container */}
                  <div className="p-5 md:p-6 pl-6 md:pl-7">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Block: Meta Chips, Title & Description */}
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Meta Chips Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-space tracking-widest uppercase font-bold border"
                            style={{
                              borderColor: `${badgeColor}60`,
                              backgroundColor: `${badgeColor}20`,
                              color: badgeColor,
                            }}
                          >
                            {alert.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-space text-[11px] text-star-white font-bold">
                            {alert.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-glow/10 border border-cyan-glow/30 font-space text-[11px] text-cyan-glow font-bold">
                            {alert.asset}
                          </span>
                          {parseInt(alert.id.replace('ALT-', '')) >= 905 && !alert.acknowledged && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/60 font-space text-[10px] text-emerald-300 font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              LIVE DISPATCH
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-inter text-[11px] text-star-white/80">
                            {alert.subsystem}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-black/40 font-space text-[10px] text-muted-gray" suppressHydrationWarning>
                            {formatMissionTime(alert.timestamp, 'hms')}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-space text-base md:text-lg text-star-white font-bold tracking-wide break-words">
                          {alert.title}
                        </h3>

                        {/* Description */}
                        <p className="font-inter text-xs md:text-sm text-star-white/80 leading-relaxed max-w-4xl break-words">
                          {alert.description}
                        </p>
                      </div>

                      {/* Right Block: Action Buttons */}
                      <div className="flex items-center gap-3 shrink-0 flex-wrap">
                        {alert.acknowledged ? (
                          <div className="flex items-center gap-1.5 text-xs font-space text-cyan-glow bg-cyan-glow/15 px-4 py-2 rounded-xl border border-cyan-glow/30 font-semibold">
                            <CheckCircle2 size={15} className="text-cyan-glow" />
                            <span>
                              ACKNOWLEDGED {alert.acknowledged_by ? `(${alert.acknowledged_by})` : ''}
                            </span>
                          </div>
                        ) : (
                          <div role="button" tabIndex={0} onClick={() => handleAcknowledge(alert.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 border font-bold cursor-pointer ${
                              isCritical
                                ? 'bg-alert-critical/30 border-alert-critical text-alert-critical hover:bg-alert-critical/45 shadow-[0_0_20px_rgba(255,59,59,0.4)]'
                                : 'bg-cyan-glow/10 border-cyan-glow/30 text-cyan-glow hover:bg-cyan-glow/20'
                            }`}
                          >
                            <ShieldAlert size={15} />
                            <span>Acknowledge</span>
                          </div>
                        )}

                        {/* Interactive Expand / Collapse Toggle Button */}
                        <div role="button" tabIndex={0} onClick={() => toggleExpand(alert.id)}
                          className="p-2.5 rounded-xl border border-cyan-glow/25 bg-space-navy/60 text-star-white/80 hover:text-star-white hover:bg-space-navy transition-all cursor-pointer"
                          title={isExpanded ? 'Collapse parameters' : 'Expand parameters'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDABLE TELEMETRY BREAKDOWN WITH STRICT ALIGNMENT */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-5 pt-4 border-t border-white/10 space-y-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-black/60 border border-cyan-glow/20 flex flex-col justify-between min-h-[72px]">
                              <span className="font-space text-[10px] text-star-white/60 uppercase tracking-wider block font-semibold">
                                AI ANOMALY CONFIDENCE
                              </span>
                              <span className="font-space text-base font-bold text-cyan-glow mt-1">
                                {alert.confidence}% (HIGH FIDELITY)
                              </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/60 border border-cyan-glow/20 flex flex-col justify-between min-h-[72px]">
                              <span className="font-space text-[10px] text-star-white/60 uppercase tracking-wider block font-semibold">
                                ORBITAL SUBSYSTEM TARGET
                              </span>
                              <span className="font-space text-sm font-medium text-star-white mt-1 truncate">
                                {alert.subsystem}
                              </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/60 border border-cyan-glow/20 flex flex-col justify-between min-h-[72px]">
                              <span className="font-space text-[10px] text-star-white/60 uppercase tracking-wider block font-semibold">
                                RECOMMENDED STATUS
                              </span>
                              <span
                                className={`font-space text-sm font-bold mt-1 ${
                                  isCritical ? 'text-alert-critical' : 'text-emerald-400'
                                }`}
                              >
                                {isCritical ? 'URGENT MITIGATION REQUIRED' : 'AUTOMATED RETRY SCHEDULED'}
                              </span>
                            </div>
                          </div>

                          {/* Recommended Mitigation Action Box */}
                          <div className="p-4 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-start gap-3">
                            <Shield size={18} className="text-cyan-glow shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-space text-[10px] text-cyan-glow uppercase tracking-wider font-bold block">
                                RECOMMENDED MITIGATION ACTION
                              </span>
                              <p className="font-inter text-xs text-star-white/90 mt-1 leading-relaxed break-words">
                                {alert.mitigation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Section Footnote */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md text-[10px] font-space text-star-white/50 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CONNECTED TO POSTGRESQL 16 &amp; TIMESCALEDB REAL-TIME PIPELINE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
