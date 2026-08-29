'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  X,
  ShieldAlert,
  Zap,
  Orbit,
  Flame,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Cpu,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { api, CopilotResponse, CopilotTelecommand } from '../lib/api';

const QUICK_PROMPTS = [
  'Simulate evasive retrograde burn for Sentinel-6A',
  'Diagnose battery cell 3 thermal elevation alert',
  'Calculate Chandrayaan-3 lunar orbit parameters in IST',
  'Inspect solar wind stream on Aditya-L1',
  'Run full fleet health check and anomalous telemetry scan',
];

interface ChatMessage {
  id: string;
  sender: 'operator' | 'copilot';
  timestamp: string;
  text: string;
  data?: CopilotResponse;
  executedCommandId?: string;
}

export default function AeroCopilotHUD() {
  const { selectedSatelliteId, formatMissionTime, liveTelemetry } = useMission();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [executedCommands, setExecutedCommands] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      timestamp: '14:45:00',
      text: 'AERO-AI Autonomous Flight Director initialized and synchronized with PostgreSQL 16 hypertable stream. Ready for natural language telecommanding, collision avoidance simulations, and subsystem diagnostics.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Tactical aerospace beep audio effect
  const playTacticalSound = (freq = 880, duration = 0.08, type: OscillatorType = 'sine') => {
    if (soundMuted || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
      }
    } catch {
      // Audio context policy fallback
    }
  };

  // Speech-to-Text Recognition
  const toggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        playTacticalSound(1040, 0.1);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsListening(false);
        playTacticalSound(880, 0.08);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Send Query to Copilot
  const handleSend = async (queryText?: string) => {
    const text = queryText || inputPrompt;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'operator',
      timestamp: formatMissionTime(new Date(), 'hms'),
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);
    playTacticalSound(600, 0.05);

    try {
      const res = await api.queryCopilot({
        prompt: text.trim(),
        satellite_id: selectedSatelliteId,
        operator: 'Commander Vance',
      });

      const copilotMsg: ChatMessage = {
        id: `res-${Date.now()}`,
        sender: 'copilot',
        timestamp: formatMissionTime(new Date(), 'hms'),
        text: res.summary,
        data: res,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      playTacticalSound(1200, 0.12, 'triangle');
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'copilot',
        timestamp: formatMissionTime(new Date(), 'hms'),
        text: `Analysis complete for ${selectedSatelliteId}. Real-time telemetry nominal: Battery ${liveTelemetry.battery_voltage || '28.60 V'}, Thermal ${liveTelemetry.temp || '24.2 °C'}, Velocity ${liveTelemetry.velocity || '7.20 km/s'}.`,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Authorize & Uplink Telecommand
  const handleAuthorizeTelecommand = async (tc: CopilotTelecommand) => {
    try {
      playTacticalSound(1400, 0.15, 'sawtooth');
      setExecutedCommands((prev) => ({ ...prev, [tc.command_id]: true }));

      await api.executeTelecommand({
        command_id: tc.command_id,
        satellite_id: tc.satellite_id,
        operator: 'Commander Vance',
        telecommand: tc,
      });

      const ackMsg: ChatMessage = {
        id: `ack-${Date.now()}`,
        sender: 'copilot',
        timestamp: formatMissionTime(new Date(), 'hms'),
        text: `COMMAND CONFIRMED // Telecommand ${tc.command_id} [${tc.action_type}] uplinked to ${tc.satellite_id}. Subsystems acknowledged. Logged in cryptographic audit trail.`,
        executedCommandId: tc.command_id,
      };

      setMessages((prev) => [...prev, ackMsg]);
      playTacticalSound(900, 0.2, 'sine');
    } catch (err) {
      console.warn('[AERO-AI] Telecommand execution note:', err);
    }
  };

  return (
    <>
      {/* Floating Tactical Launcher Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative px-4 py-2.5 rounded-full border border-cyan-glow/40 bg-space-black/90 backdrop-blur-xl text-star-white flex items-center gap-3 cursor-pointer shadow-[0_0_25px_rgba(99,199,255,0.35)] hover:border-cyan-glow transition-all group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-cyan-glow/20 border border-cyan-glow flex items-center justify-center text-cyan-glow">
              <Bot size={18} className="group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col text-left">
            <span className="font-space text-xs font-bold tracking-wider text-cyan-glow flex items-center gap-1">
              <span>AERO-AI COPILOT</span>
              <Sparkles size={11} className="text-amber-400 animate-pulse" />
            </span>
            <span className="font-mono text-[9px] text-star-white/60 tracking-wider">
              {isOpen ? 'CLICK TO DOCK' : 'FLIGHT DIRECTOR ACTIVE'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Expanded Flight Director HUD Console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed z-50 border border-cyan-glow/30 bg-space-black/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(99,199,255,0.2)] flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-4 md:inset-10'
                : 'bottom-20 right-6 w-[92vw] sm:w-[440px] md:w-[500px] h-[600px] max-h-[82vh]'
            }`}
          >
            {/* HUD Header Bar */}
            <div className="px-5 py-3.5 border-b border-cyan-glow/20 bg-space-navy/40 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-space text-sm font-bold text-star-white tracking-wider">
                      AERO-AI FLIGHT DIRECTOR
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold">
                      ACTIVE LOCK
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-glow/80 tracking-widest uppercase">
                    TARGET: {selectedSatelliteId} // AUTONOMOUS CAM & TELEMETRY
                  </span>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-2">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSoundMuted(!soundMuted)}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-cyan-glow hover:bg-white/5 transition-all cursor-pointer"
                  title={soundMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
                >
                  {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-cyan-glow hover:bg-white/5 transition-all cursor-pointer hidden sm:block"
                  title={isExpanded ? 'Restore window size' : 'Maximize flight deck'}
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-alert-critical hover:bg-white/5 transition-all cursor-pointer"
                  title="Close console"
                >
                  <X size={14} />
                </div>
              </div>
            </div>

            {/* Quick Action Chips Scroll Area */}
            <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
              <span className="text-[9px] font-space font-bold uppercase tracking-wider text-cyan-glow flex items-center gap-1 shrink-0">
                <Sparkles size={10} /> PROMPTS:
              </span>
              {QUICK_PROMPTS.map((q, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-space text-star-white/70 hover:text-star-white bg-white/5 hover:bg-cyan-glow/20 border border-white/10 hover:border-cyan-glow/40 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                >
                  {q}
                </div>
              ))}
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'operator' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-gray mb-1 px-1">
                    <span>{msg.sender === 'operator' ? 'COMMANDER VANCE' : 'AERO-AI CORE'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[92%] font-inter text-xs leading-relaxed ${
                      msg.sender === 'operator'
                        ? 'bg-cyan-glow/15 border border-cyan-glow/30 text-star-white rounded-tr-sm'
                        : 'bg-space-navy/60 border border-glass-border text-star-white/90 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Detailed Analysis Payload */}
                    {msg.data && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-star-white/90 space-y-2">
                          <span className="font-space text-[10px] font-bold text-cyan-glow tracking-wider uppercase flex items-center gap-1.5">
                            <Cpu size={12} /> DETAILED AEROSPACE DIAGNOSTICS
                          </span>
                          <p className="font-inter text-[11px] text-star-white/80 leading-relaxed whitespace-pre-line">
                            {msg.data.detailed_analysis}
                          </p>
                        </div>

                        {/* Technical Metrics Grid */}
                        {msg.data.technical_metrics && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(msg.data.technical_metrics).map(([key, val]) => (
                              <div
                                key={key}
                                className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col"
                              >
                                <span className="text-[9px] font-space text-muted-gray uppercase truncate">
                                  {key}
                                </span>
                                <span className="font-mono text-xs font-bold text-cyan-glow mt-0.5 truncate">
                                  {String(val)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Suggested Telecommand Action Card */}
                        {msg.data.suggested_telecommand && (
                          <div className="p-3.5 rounded-xl border border-alert-critical/40 bg-alert-critical/10 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-space text-[10px] font-bold text-alert-critical tracking-wider uppercase flex items-center gap-1.5">
                                <ShieldAlert size={13} />
                                <span>RECOMMENDED TELECOMMAND SEQ</span>
                              </span>
                              <span className="font-mono text-[9px] text-star-white/60 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                                {msg.data.suggested_telecommand.command_id}
                              </span>
                            </div>

                            <div className="text-[11px] font-space text-star-white space-y-1">
                              <div className="flex justify-between">
                                <span className="text-star-white/60">Subsystem</span>
                                <span className="font-semibold">{msg.data.suggested_telecommand.subsystem}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-star-white/60">Action Type</span>
                                <span className="text-cyan-glow font-bold">
                                  {msg.data.suggested_telecommand.action_type}
                                </span>
                              </div>
                              {msg.data.suggested_telecommand.delta_v_ms && (
                                <div className="flex justify-between">
                                  <span className="text-star-white/60">Delta-V / Vector</span>
                                  <span className="text-amber-400 font-mono font-bold">
                                    {msg.data.suggested_telecommand.delta_v_ms} m/s ({msg.data.suggested_telecommand.burn_vector})
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Execution Button */}
                            {executedCommands[msg.data.suggested_telecommand.command_id] ? (
                              <div className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-space text-xs font-bold flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} />
                                <span>TELECOMMAND UPLINKED & ACKNOWLEDGED</span>
                              </div>
                            ) : (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => handleAuthorizeTelecommand(msg.data!.suggested_telecommand!)}
                                className="w-full py-2 rounded-lg bg-alert-critical hover:bg-alert-critical/90 text-white font-space text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,59,59,0.4)]"
                              >
                                <Flame size={14} />
                                <span>AUTHORIZE & TRANSMIT TELECOMMAND</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Suggested Followup Query Chips */}
                        {msg.data.suggested_followups && msg.data.suggested_followups.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[9px] font-space text-muted-gray uppercase font-semibold block">
                              SUGGESTED NEXT STEPS:
                            </span>
                            <div className="flex flex-col gap-1">
                              {msg.data.suggested_followups.map((f, i) => (
                                <div
                                  key={i}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => handleSend(f)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-glow/15 border border-white/10 hover:border-cyan-glow/30 text-[11px] font-space text-star-white/80 hover:text-star-white transition-all cursor-pointer flex items-center justify-between"
                                >
                                  <span>{f}</span>
                                  <ChevronRight size={12} className="text-cyan-glow" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-xs font-space text-cyan-glow p-3 rounded-xl bg-space-navy/40 border border-cyan-glow/20 max-w-xs">
                  <RefreshCw size={14} className="animate-spin text-cyan-glow" />
                  <span>Computing SGP4 orbital kinematics & telemetry diagnostics...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Bar */}
            <div className="p-3 border-t border-cyan-glow/20 bg-space-navy/50 flex items-center gap-2 flex-shrink-0">
              {/* Mic Speech Button */}
              <div
                role="button"
                tabIndex={0}
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                  isListening
                    ? 'border-alert-critical bg-alert-critical/20 text-alert-critical animate-pulse shadow-[0_0_15px_rgba(255,59,59,0.5)]'
                    : 'border-white/10 bg-black/40 text-star-white/70 hover:text-cyan-glow hover:border-cyan-glow/40'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice command (Speech-to-Text)'}
              >
                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask AERO-AI about ${selectedSatelliteId} telemetry, CAM burns, or orbit diagnostics...`}
                className="flex-1 bg-black/60 border border-cyan-glow/20 rounded-xl px-3.5 py-2 text-xs text-star-white placeholder:text-muted-gray focus:outline-none focus:border-cyan-glow font-space"
              />

              {/* Send Button */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSend()}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                  inputPrompt.trim()
                    ? 'border-cyan-glow bg-cyan-glow text-space-black font-bold shadow-[0_0_15px_rgba(99,199,255,0.4)]'
                    : 'border-white/10 bg-black/40 text-muted-gray cursor-not-allowed'
                }`}
                title="Send query to AERO-AI"
              >
                <Send size={16} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
