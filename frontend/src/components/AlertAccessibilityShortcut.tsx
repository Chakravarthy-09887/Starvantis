'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  BellOff,
  BellRing,
  Volume2,
  VolumeX,
  Check,
  CheckCircle2,
  ChevronRight,
  X,
  ExternalLink,
  ShieldAlert,
  Shield,
  Radio,
  Sparkles,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { alarmAudio } from '../lib/alarmAudio';

export default function AlertAccessibilityShortcut() {
  const { alerts, ackAlert, formatMissionTime, currentClock, timezone, dispatchLiveAlert } = useMission();

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [audioChimeCtx, setAudioChimeCtx] = useState<AudioContext | null>(null);

  // Subscribe to global alarm audio playback state
  useEffect(() => {
    setIsPlaying(alarmAudio.getIsPlaying());
    setSoundEnabled(alarmAudio.getSoundEnabled());

    const unsubscribe = alarmAudio.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  // Sync soundEnabled
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    alarmAudio.setSoundEnabled(next);
    if (!next) {
      alarmAudio.stop();
    }
  };

  // Immediate Silence Alarm
  const handleSilenceAlarm = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    alarmAudio.stop();
    setSuccessToast('Mission alarm silenced');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Keyboard shortcut listener (Alt+A or Shift+A to toggle, Escape to close & silence)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.shiftKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        if (alarmAudio.getIsPlaying()) {
          alarmAudio.stop();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Play acknowledgment chime
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioChimeCtx || new AudioCtx();
      if (!audioChimeCtx) setAudioChimeCtx(ctx);
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1440, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Audio context catch
    }
  };

  // Acknowledge alert directly from HUD
  const handleAcknowledge = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playChime();
    await ackAlert(id, 'Flight Director Vance', 'Acknowledged via Quick Accessibility Shortcut Console');
    setSuccessToast(`Alert ${id} acknowledged & logged to audit log`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Jump to alerts section
  const handleJumpToAlerts = () => {
    setIsOpen(false);
    const el = document.getElementById('alerts');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter((a) => a.severity === 'critical').length;
  const latestAlert = unacknowledgedAlerts.length > 0 ? unacknowledgedAlerts[0] : alerts[0];

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-alert-critical/20 border-alert-critical/60 text-alert-critical shadow-[0_0_12px_rgba(255,59,59,0.3)]';
      case 'high':
        return 'bg-alert-high/20 border-alert-high/60 text-alert-high shadow-[0_0_12px_rgba(255,140,0,0.3)]';
      case 'medium':
        return 'bg-alert-medium/20 border-alert-medium/60 text-alert-medium';
      default:
        return 'bg-cyan-glow/20 border-cyan-glow/60 text-cyan-glow';
    }
  };

  return (
    <>
      {/* Floating Tactical Launcher Pill (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Mission Alerts and Alarm Silence Shortcut (Press Alt+A)"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative px-4 py-2.5 rounded-full border backdrop-blur-xl flex items-center gap-3 cursor-pointer transition-all duration-300 shadow-2xl group ${
            isPlaying
              ? 'bg-alert-critical/30 border-alert-critical text-white shadow-[0_0_30px_rgba(255,59,59,0.7)] animate-pulse'
              : criticalCount > 0
              ? 'bg-[#090508]/95 border-alert-critical/60 text-star-white shadow-[0_0_20px_rgba(255,59,59,0.3)]'
              : 'bg-space-black/90 border-cyan-glow/40 text-star-white shadow-[0_0_20px_rgba(99,199,255,0.25)] hover:border-cyan-glow'
          }`}
          title="Mission Alerts & Alarm Controls (Shortcut: Alt+A)"
        >
          {/* Icon & Badge Indicator */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-alert-critical text-white border-white animate-bounce'
                  : criticalCount > 0
                  ? 'bg-alert-critical/20 border-alert-critical text-alert-critical'
                  : 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow'
              }`}
            >
              {isPlaying ? (
                <BellRing size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
              ) : criticalCount > 0 ? (
                <AlertOctagon size={16} className="animate-pulse" />
              ) : (
                <ShieldAlert size={16} />
              )}
            </div>

            {unacknowledgedAlerts.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border ${
                  isPlaying || criticalCount > 0
                    ? 'bg-alert-critical text-white border-white animate-ping'
                    : 'bg-cyan-glow text-black border-cyan-glow'
                }`}
              >
                {unacknowledgedAlerts.length}
              </span>
            )}
          </div>

          {/* Label Text & Quick State */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className={`font-space text-xs font-bold tracking-wider uppercase ${isPlaying ? 'text-white' : criticalCount > 0 ? 'text-alert-critical' : 'text-cyan-glow'}`}>
                {isPlaying ? 'SIREN ACTIVE' : criticalCount > 0 ? `${criticalCount} CRITICAL ALERT${criticalCount > 1 ? 'S' : ''}` : 'ALERTS CONSOLE'}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[8px] font-mono bg-white/10 text-star-white/60 border border-white/10">
                Alt+A
              </span>
            </div>
            <span className="font-mono text-[9px] text-star-white/70 tracking-wider">
              {isPlaying ? 'CLICK TO SILENCE' : unacknowledgedAlerts.length > 0 ? `${unacknowledgedAlerts.length} PENDING ACTION` : 'ALL SYSTEMS NOMINAL'}
            </span>
          </div>

          {/* Quick Instant Silence Button directly on launcher pill if actively playing */}
          {isPlaying && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleSilenceAlarm}
              className="ml-1 p-1.5 rounded-full bg-white text-alert-critical hover:bg-star-white transition-all shadow-md cursor-pointer hover:scale-110"
              title="Silence siren immediately"
            >
              <BellOff size={14} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Alerts & Alarm Silence HUD Popover / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 left-4 sm:left-6 z-50 w-[95vw] sm:w-[460px] md:w-[500px] max-h-[85vh] rounded-3xl border border-cyan-glow/30 bg-[#040812]/98 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(99,199,255,0.2)] flex flex-col overflow-hidden text-star-white"
            role="dialog"
            aria-modal="true"
            aria-label="Mission Alerts Quick Control Console"
          >
            {/* HUD Header */}
            <div className="px-5 py-3.5 border-b border-cyan-glow/15 bg-space-navy/70 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${isPlaying ? 'bg-alert-critical/20 border-alert-critical text-alert-critical animate-pulse' : 'bg-cyan-glow/15 border-cyan-glow/30 text-cyan-glow'}`}>
                  {isPlaying ? <BellRing size={16} /> : <AlertOctagon size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-space text-xs sm:text-sm font-bold tracking-wider text-star-white uppercase">
                      MISSION ALERT INTELLIGENCE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-semibold">
                      QUICK HUD
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-gray block mt-0.5" suppressHydrationWarning>
                    EPOCH: {currentClock} ({timezone})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Mute/Unmute Toggle */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleToggleSound}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    soundEnabled
                      ? 'border-cyan-glow/30 bg-cyan-glow/15 text-cyan-glow hover:bg-cyan-glow/25'
                      : 'border-white/10 bg-black/40 text-muted-gray hover:text-star-white'
                  }`}
                  title={soundEnabled ? 'Mute Alert Audio' : 'Unmute Alert Audio'}
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </div>

                {/* Close Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-star-white/70 hover:text-star-white transition-all cursor-pointer"
                  title="Close Quick Console (Esc)"
                >
                  <X size={15} />
                </div>
              </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
              {successToast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/15 border-b border-emerald-500/40 px-4 py-2 flex items-center justify-between text-[11px] font-space text-emerald-300"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{successToast}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">LOGGED</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emergency Action Strip */}
            <div className="p-3 bg-black/40 border-b border-cyan-glow/10 flex items-center gap-2 flex-wrap">
              {/* Silence Alarm Button (Primary Emergency Action) */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleSilenceAlarm}
                className={`flex-1 py-2.5 px-4 rounded-2xl border font-space text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPlaying
                    ? 'bg-alert-critical border-alert-critical text-white shadow-[0_0_25px_rgba(255,59,59,0.8)] animate-pulse hover:bg-red-700'
                    : 'bg-space-navy/70 border-alert-critical/40 text-alert-critical hover:bg-alert-critical/15'
                }`}
                title="Silence Active Mission Alarm"
              >
                <BellOff size={15} />
                <span>{isPlaying ? 'SILENCE ACTIVE ALARM NOW' : 'SILENCE ALARM / SIREN'}</span>
              </div>

              {/* Sound Audio Mode Status */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleToggleSound}
                className="py-2.5 px-3 rounded-2xl border border-white/10 bg-black/50 text-[11px] font-space font-medium text-star-white/80 hover:text-star-white flex items-center gap-1.5 cursor-pointer"
              >
                {soundEnabled ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>AUDIO ON</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-muted-gray" />
                    <span>MUTED</span>
                  </>
                )}
              </div>
            </div>

            {/* Main HUD Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[55vh] scrollbar-thin">
              {/* LATEST ACTIVE ALERT SPOTLIGHT */}
              {latestAlert ? (
                <div className="rounded-2xl border border-cyan-glow/20 bg-space-navy/50 p-4 space-y-3 relative overflow-hidden shadow-lg">
                  {/* Glowing Severity Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider border ${getSeverityBadgeClass(latestAlert.severity)}`}>
                        {latestAlert.severity} PRIORITY
                      </span>
                      <span className="font-mono text-[10px] text-muted-gray">{latestAlert.id}</span>
                    </div>

                    <span className="font-mono text-[10px] text-cyan-glow font-medium">
                      {latestAlert.timestamp}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-space text-sm font-bold text-star-white leading-snug">
                      {latestAlert.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-space text-muted-gray mt-1">
                      <span className="text-cyan-glow font-medium">{latestAlert.asset}</span>
                      <span>•</span>
                      <span>{latestAlert.subsystem}</span>
                    </div>
                    <p className="font-inter text-xs text-star-white/75 mt-2 leading-relaxed">
                      {latestAlert.description}
                    </p>
                  </div>

                  {/* Recommended Mitigation & AI Confidence */}
                  {latestAlert.mitigation && (
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1 text-xs font-inter">
                      <div className="flex items-center justify-between text-[10px] font-space">
                        <span className="text-cyan-glow font-bold uppercase tracking-wider flex items-center gap-1">
                          <Zap size={11} /> RECOMMENDED MITIGATION:
                        </span>
                        {latestAlert.confidence && (
                          <span className="text-emerald-400 font-mono font-bold">
                            AI Confidence {latestAlert.confidence}%
                          </span>
                        )}
                      </div>
                      <p className="text-star-white/85 text-[11px] leading-relaxed">
                        {latestAlert.mitigation}
                      </p>
                    </div>
                  )}

                  {/* Action Bar for Latest Alert */}
                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-white/10">
                    {!latestAlert.acknowledged ? (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleAcknowledge(latestAlert.id, e)}
                        className="py-2 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-space text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      >
                        <Check size={14} />
                        <span>ACKNOWLEDGE ALERT</span>
                      </div>
                    ) : (
                      <div className="py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-space text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>ACKNOWLEDGED &amp; LOGGED</span>
                      </div>
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handleJumpToAlerts}
                      className="py-2 px-3 rounded-xl bg-cyan-glow/15 hover:bg-cyan-glow/25 border border-cyan-glow/30 text-cyan-glow font-space text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Alert Console</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl border border-glass-border bg-black/40 space-y-2">
                  <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
                  <h4 className="font-space text-sm font-bold text-star-white">No Active Alerts Detected</h4>
                  <p className="font-inter text-xs text-muted-gray">All spacecraft telemetry streams within nominal operating baselines.</p>
                </div>
              )}

              {/* ACTIVE QUEUE SUMMARY */}
              {unacknowledgedAlerts.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-space text-muted-gray">
                    <span className="uppercase tracking-wider font-bold text-star-white/70">
                      OTHER PENDING ALERTS ({unacknowledgedAlerts.length - 1})
                    </span>
                    <span className="text-[10px]">Real-Time Telemetry</span>
                  </div>

                  <div className="space-y-2">
                    {unacknowledgedAlerts.slice(1, 4).map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between gap-3 text-xs font-space hover:border-cyan-glow/30 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${getSeverityBadgeClass(alt.severity)}`}>
                              {alt.severity}
                            </span>
                            <span className="font-bold text-star-white truncate text-[11px]">{alt.title}</span>
                          </div>
                          <span className="text-[10px] text-muted-gray truncate block mt-0.5">
                            {alt.asset} • {alt.timestamp}
                          </span>
                        </div>

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleAcknowledge(alt.id, e)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-star-white/70 hover:text-emerald-400 transition-all cursor-pointer flex-shrink-0"
                          title="Acknowledge alert"
                        >
                          <Check size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="p-3.5 border-t border-cyan-glow/15 bg-space-navy/80 flex items-center justify-between gap-3 flex-shrink-0">
              <span className="font-space text-[10px] text-star-white/60">
                Shortcuts: <kbd className="bg-white/10 px-1 py-0.5 rounded text-[9px] font-mono">Alt+A</kbd> / <kbd className="bg-white/10 px-1 py-0.5 rounded text-[9px] font-mono">Esc</kbd>
              </span>

              <div
                role="button"
                tabIndex={0}
                onClick={handleJumpToAlerts}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/20 hover:bg-cyan-glow/30 border border-cyan-glow/40 text-cyan-glow font-space text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(99,199,255,0.2)]"
              >
                <span>Navigate to #alerts</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
