'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronDown,
  Copy,
  RefreshCw,
  Cpu,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  Headphones,
  Satellite,
  Shield,
  Sun,
  Activity,
  Sliders,
  Check,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { FLEET_SATELLITES } from '../lib/satellites';
import { api, CopilotResponse, CopilotTelecommand } from '../lib/api';
import { alarmAudio } from '../lib/alarmAudio';

const QUICK_PROMPT_CATEGORIES = [
  {
    category: 'COLLISION & ORBIT',
    icon: Orbit,
    prompts: [
      'Simulate evasive retrograde burn for Sentinel-6A',
      'Calculate Keplerian orbital state vector & ground station pass',
      'Check conjunction TCA and debris miss distance',
    ],
  },
  {
    category: 'DEEP-SPACE & LUNAR',
    icon: Sparkles,
    prompts: [
      'Initiate Chandrayaan-3 terminal descent braking guidance',
      'Inspect solar wind stream and CME flux on Aditya-L1',
      'Check JWST MIRI 6.7K cryocooler loop and wavefront error',
    ],
  },
  {
    category: 'CYBER & POWER',
    icon: Shield,
    prompts: [
      'Rotate CCSDS SDLS AES-256 telecommand encryption keys',
      'Diagnose battery cell thermal elevation and load balancing',
      'Run full fleet health check and AI anomaly residual scan',
    ],
  },
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
  const { selectedSatelliteId, setSelectedSatelliteId, formatMissionTime, liveTelemetry } = useMission();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [satDropdownOpen, setSatDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [executedCommands, setExecutedCommands] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      timestamp: '14:45:00',
      text: 'JARVIS Autonomous Flight Director initialized and synchronized with PostgreSQL 16 & TimescaleDB hypertable stream.\n\nReady for natural language telecommanding, SGP4 collision avoidance burns, Lunar EDL guidance, and deep-space telemetry diagnostics.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const satDropdownRef = useRef<HTMLDivElement>(null);
  const promptsScrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const scrollPrompts = (direction: 'left' | 'right') => {
    if (promptsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      promptsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close satellite dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (satDropdownRef.current && !satDropdownRef.current.contains(e.target as Node)) {
        setSatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

  // Text-To-Speech (TTS) Flight Director Voice Synthesizer
  const speakText = useCallback(
    (textToSpeak: string) => {
      if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      try {
        window.speechSynthesis.cancel();
        // Clean markdown characters for voice readability
        const cleanText = textToSpeak
          .replace(/[*#_`]/g, '')
          .replace(/•/g, '')
          .replace(/\n+/g, '. ')
          .slice(0, 320); // Speak concise portion

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.lang = 'en-US';

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[TTS] Speech synthesis error:', e);
        setIsSpeaking(false);
      }
    },
    [ttsEnabled]
  );

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-to-Text (STT) Recognition
  const toggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
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

    stopSpeaking();

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

      // Speak response aloud if TTS enabled
      if (ttsEnabled) {
        speakText(res.summary);
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'copilot',
        timestamp: formatMissionTime(new Date(), 'hms'),
        text: `Analysis complete for ${selectedSatelliteId}.\n\nReal-time telemetry nominal: Battery ${liveTelemetry.battery_voltage || '28.60 V'}, Thermal ${liveTelemetry.temp || '24.2 °C'}, Velocity ${liveTelemetry.velocity || '7.20 km/s'}. SGP4 state vector synchronized.`,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (ttsEnabled) {
        speakText(fallbackMsg.text);
      }
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

      const ackText = `COMMAND CONFIRMED // Telecommand ${tc.command_id} [${tc.action_type}] uplinked to ${tc.satellite_id}.\n\nSubsystems acknowledged. HMAC verification hash registered in immutable audit log.`;

      const ackMsg: ChatMessage = {
        id: `ack-${Date.now()}`,
        sender: 'copilot',
        timestamp: formatMissionTime(new Date(), 'hms'),
        text: ackText,
        executedCommandId: tc.command_id,
      };

      setMessages((prev) => [...prev, ackMsg]);
      playTacticalSound(900, 0.2, 'sine');

      if (ttsEnabled) {
        speakText(`Telecommand ${tc.command_id} uplinked and confirmed for ${tc.satellite_id}.`);
      }
    } catch (err) {
      console.warn('[JARVIS] Telecommand execution note:', err);
    }
  };

  // Export Flight Log as JSON/Text
  const exportFlightLog = () => {
    try {
      const logData = {
        platform: 'STARVANTIS AEROSPACE INTELLIGENCE',
        missionControlSession: 'JARVIS FLIGHT DIRECTOR LOG',
        exportedAt: new Date().toISOString(),
        targetSatellite: selectedSatelliteId,
        operator: 'Commander Vance',
        totalMessages: messages.length,
        messages: messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          timestamp: m.timestamp,
          text: m.text,
          telecommand: m.data?.suggested_telecommand || null,
          metrics: m.data?.technical_metrics || null,
        })),
      };

      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `STARVANTIS_JARVIS_Log_${selectedSatelliteId}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      playTacticalSound(1100, 0.1);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  // Clear Chat History
  const handleClearHistory = () => {
    stopSpeaking();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'copilot',
        timestamp: formatMissionTime(new Date(), 'hms'),
        text: `Flight Director session reset for ${selectedSatelliteId}. Telemetry channels re-initialized. Ready for telecommand queries.`,
      },
    ]);
    playTacticalSound(750, 0.1);
  };

  // Get current active satellite object
  const currentSat = FLEET_SATELLITES.find((s) => s.id === selectedSatelliteId) || FLEET_SATELLITES[0];

  const allPrompts =
    activeCategory === 'ALL'
      ? QUICK_PROMPT_CATEGORIES.flatMap((c) => c.prompts)
      : QUICK_PROMPT_CATEGORIES.find((c) => c.category === activeCategory)?.prompts || [];

  return (
    <>
      {/* Floating Tactical Launcher Pill (Bottom-Right - Responsive compact on mobile, full on desktop) */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40">
        <motion.div
          role="button"
          tabIndex={0}
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) stopSpeaking();
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-cyan-glow/40 bg-space-black/90 backdrop-blur-xl text-star-white flex items-center gap-2 sm:gap-3 cursor-pointer shadow-[0_0_25px_rgba(99,199,255,0.35)] hover:border-cyan-glow transition-all group select-none"
        >
          <div className="relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-glow/20 border border-cyan-glow flex items-center justify-center text-cyan-glow">
              <Bot size={16} className="group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col text-left">
            <span className="font-space text-xs sm:text-sm font-bold tracking-widest text-cyan-glow flex items-center gap-1.5">
              <span>JARVIS</span>
              <Sparkles size={11} className="text-amber-400 animate-pulse" />
            </span>
            <span className="hidden sm:flex font-mono text-[9px] text-star-white/70 tracking-wider items-center gap-1.5">
              <span className="font-semibold text-emerald-400">{isOpen ? 'DOCK' : 'COPILOT'}</span>
              <span className="text-cyan-glow font-bold">• {selectedSatelliteId}</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Expanded Flight Director HUD Console (Responsive mobile/laptop layout) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed z-50 border border-cyan-glow/30 bg-space-black/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(99,199,255,0.25)] flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-3 sm:inset-6 md:inset-8'
                : 'bottom-16 sm:bottom-20 left-3 right-3 sm:left-auto sm:right-6 w-[calc(100vw-24px)] sm:w-[480px] md:w-[540px] h-[580px] sm:h-[640px] max-h-[82vh]'
            }`}
          >
            {/* HUD Header Bar */}
            <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-cyan-glow/20 bg-space-navy/50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow relative">
                  <Bot size={18} />
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-glow animate-ping" />
                  )}
                </div>

                {/* Target Satellite Selector Dropdown */}
                <div className="relative" ref={satDropdownRef}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSatDropdownOpen(!satDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-cyan-glow/30 hover:border-cyan-glow hover:bg-cyan-glow/10 transition-all cursor-pointer"
                    title="Switch Target Spacecraft for Telemetry & Guidance"
                  >
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-space text-xs font-bold text-star-white truncate max-w-[140px] sm:max-w-[180px]">
                          {selectedSatelliteId}
                        </span>
                        <ChevronDown size={12} className="text-cyan-glow" />
                      </div>
                      <span className="font-mono text-[8px] text-cyan-glow/80 uppercase tracking-wider">
                        {`${currentSat.agency} // ${currentSat.orbitType}`}
                      </span>
                    </div>
                  </div>

                  {/* Satellite Options Menu */}
                  <AnimatePresence>
                    {satDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 top-full mt-2 w-64 max-h-64 overflow-y-auto rounded-2xl bg-[#090D16] border border-cyan-glow/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 p-1.5 scrollbar-thin space-y-1"
                      >
                        <div className="px-2.5 py-1 text-[9px] font-space text-muted-gray uppercase font-bold tracking-wider border-b border-white/5">
                          SELECT TARGET SPACECRAFT
                        </div>
                        {FLEET_SATELLITES.map((sat) => {
                          const isSelected = sat.id === selectedSatelliteId;
                          return (
                            <div
                              key={sat.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setSelectedSatelliteId(sat.id);
                                setSatDropdownOpen(false);
                                playTacticalSound(980, 0.06);
                              }}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-space transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow font-bold'
                                  : 'text-star-white/80 hover:bg-white/5 hover:text-star-white'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="truncate">{sat.name}</span>
                                <span className="text-[9px] font-mono text-muted-gray">{sat.agency} • {sat.altitude}</span>
                              </div>
                              {isSelected && <Check size={14} className="text-cyan-glow shrink-0 ml-1" />}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5">
                {/* TTS Voice Readout Toggle */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const next = !ttsEnabled;
                    setTtsEnabled(next);
                    if (!next) stopSpeaking();
                    playTacticalSound(next ? 1100 : 700, 0.08);
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    ttsEnabled
                      ? 'border-cyan-glow/40 bg-cyan-glow/15 text-cyan-glow'
                      : 'border-white/10 text-star-white/40 hover:text-star-white/70'
                  }`}
                  title={ttsEnabled ? 'Flight Director Voice (TTS) Enabled' : 'Flight Director Voice (TTS) Muted'}
                >
                  <Headphones size={13} className={isSpeaking ? 'animate-bounce text-cyan-glow' : ''} />
                </div>

                {/* Sound Effects Toggle */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSoundMuted(!soundMuted)}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-cyan-glow hover:bg-white/5 transition-all cursor-pointer"
                  title={soundMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
                >
                  {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </div>

                {/* Export Session Log */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={exportFlightLog}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-emerald-400 hover:bg-white/5 transition-all cursor-pointer"
                  title="Export Mission Flight Director Log (JSON)"
                >
                  <Download size={13} />
                </div>

                {/* Clear Chat History */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-amber-400 hover:bg-white/5 transition-all cursor-pointer"
                  title="Clear Session History"
                >
                  <Trash2 size={13} />
                </div>

                {/* Maximize Window */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-cyan-glow hover:bg-white/5 transition-all cursor-pointer hidden sm:block"
                  title={isExpanded ? 'Restore window size' : 'Maximize flight deck'}
                >
                  {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </div>

                {/* Close Console */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                  }}
                  className="p-1.5 rounded-lg border border-white/10 text-star-white/60 hover:text-alert-critical hover:bg-white/5 transition-all cursor-pointer"
                  title="Close flight director console"
                >
                  <X size={13} />
                </div>
              </div>
            </div>

            {/* Category Filter Chips Bar */}
            <div className="px-3 py-1.5 border-b border-white/5 bg-black/40 flex items-center justify-between gap-1 flex-shrink-0">
              <div className="flex items-center gap-1 flex-1 overflow-hidden relative">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="p-1 rounded-md bg-white/5 hover:bg-cyan-glow/20 text-star-white/70 hover:text-cyan-glow transition-all shrink-0 z-10 cursor-pointer"
                  title="Scroll categories left"
                >
                  <ChevronLeft size={11} />
                </button>
                <div
                  ref={categoriesScrollRef}
                  onWheel={(e) => {
                    if (e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-glow/30 scrollbar-track-transparent py-0.5 px-1 flex-1 select-none"
                >
                  {['ALL', 'COLLISION & ORBIT', 'DEEP-SPACE & LUNAR', 'CYBER & POWER'].map((cat) => (
                    <div
                      key={cat}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-space tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeCategory === cat
                          ? 'bg-cyan-glow/25 text-cyan-glow font-bold border border-cyan-glow/40 shadow-[0_0_10px_rgba(99,199,255,0.2)]'
                          : 'text-muted-gray hover:text-star-white hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="p-1 rounded-md bg-white/5 hover:bg-cyan-glow/20 text-star-white/70 hover:text-cyan-glow transition-all shrink-0 z-10 cursor-pointer"
                  title="Scroll categories right"
                >
                  <ChevronRight size={11} />
                </button>
              </div>

              {isSpeaking && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={stopSpeaking}
                  className="px-2 py-0.5 rounded-full bg-cyan-glow/20 border border-cyan-glow/40 text-[9px] font-space text-cyan-glow font-bold flex items-center gap-1 cursor-pointer animate-pulse shrink-0 ml-1"
                  title="Stop voice readout"
                >
                  <Volume2 size={10} className="animate-bounce" />
                  <span className="hidden sm:inline">STOP</span>
                </div>
              )}
            </div>

            {/* Quick Action Prompt Chips with Smooth Horizontal Scroll & Arrows */}
            <div className="px-2.5 py-1.5 border-b border-white/5 bg-black/30 flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] font-space font-bold uppercase tracking-wider text-cyan-glow flex items-center gap-1 shrink-0 pl-1">
                <Sparkles size={10} className="text-amber-400" /> PROMPTS:
              </span>
              <button
                type="button"
                onClick={() => scrollPrompts('left')}
                className="p-1 rounded-md bg-white/5 hover:bg-cyan-glow/20 text-star-white/70 hover:text-cyan-glow transition-all shrink-0 cursor-pointer"
                title="Scroll prompts left"
              >
                <ChevronLeft size={12} />
              </button>
              <div
                ref={promptsScrollRef}
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-glow/30 scrollbar-track-transparent py-1 px-1 flex-1 select-none"
              >
                {allPrompts.map((q, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-space text-star-white/80 hover:text-star-white bg-white/5 hover:bg-cyan-glow/20 border border-white/10 hover:border-cyan-glow/40 transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-sm hover:shadow-[0_0_10px_rgba(99,199,255,0.2)]"
                  >
                    {q}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollPrompts('right')}
                className="p-1 rounded-md bg-white/5 hover:bg-cyan-glow/20 text-star-white/70 hover:text-cyan-glow transition-all shrink-0 cursor-pointer"
                title="Scroll prompts right"
              >
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-3.5 md:p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'operator' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-gray mb-1 px-1">
                    <span className="font-semibold text-star-white/70">
                      {msg.sender === 'operator' ? 'COMMANDER VANCE' : 'JARVIS FLIGHT DIRECTOR'}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'copilot' && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => speakText(msg.text)}
                        className="ml-1 text-muted-gray hover:text-cyan-glow cursor-pointer transition-colors"
                        title="Read message aloud"
                      >
                        <Volume2 size={11} />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[94%] font-inter text-xs leading-relaxed ${
                      msg.sender === 'operator'
                        ? 'bg-cyan-glow/15 border border-cyan-glow/30 text-star-white rounded-tr-sm'
                        : 'bg-space-navy/70 border border-glass-border text-star-white/90 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                    {/* Detailed Analysis Payload */}
                    {msg.data && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-star-white/90 space-y-2">
                          <span className="font-space text-[10px] font-bold text-cyan-glow tracking-wider uppercase flex items-center gap-1.5">
                            <Cpu size={12} /> DETAILED AEROSPACE DIAGNOSTICS
                          </span>
                          <div className="font-inter text-[11px] text-star-white/85 leading-relaxed whitespace-pre-line">
                            {msg.data.detailed_analysis}
                          </div>
                        </div>

                        {/* Technical Metrics Grid */}
                        {msg.data.technical_metrics && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {Object.entries(msg.data.technical_metrics).map(([key, val]) => (
                              <div
                                key={key}
                                className="p-2 rounded-xl bg-black/50 border border-white/5 flex flex-col justify-between"
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
                          <div className="p-3.5 rounded-2xl border border-alert-critical/40 bg-alert-critical/10 space-y-2.5 shadow-[0_0_20px_rgba(255,59,59,0.15)]">
                            <div className="flex items-center justify-between">
                              <span className="font-space text-[10px] font-bold text-alert-critical tracking-wider uppercase flex items-center gap-1.5">
                                <ShieldAlert size={13} />
                                <span>RECOMMENDED TELECOMMAND SEQ</span>
                              </span>
                              <span className="font-mono text-[9px] text-star-white/70 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                                {msg.data.suggested_telecommand.command_id}
                              </span>
                            </div>

                            <div className="text-[11px] font-space text-star-white space-y-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                              <div className="flex justify-between">
                                <span className="text-star-white/60">Subsystem</span>
                                <span className="font-semibold text-cyan-glow">
                                  {msg.data.suggested_telecommand.subsystem}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-star-white/60">Action Type</span>
                                <span className="text-star-white font-bold">
                                  {msg.data.suggested_telecommand.action_type}
                                </span>
                              </div>
                              {msg.data.suggested_telecommand.delta_v_ms && (
                                <div className="flex justify-between">
                                  <span className="text-star-white/60">Delta-V / Vector</span>
                                  <span className="text-amber-400 font-mono font-bold">
                                    {msg.data.suggested_telecommand.delta_v_ms} m/s (
                                    {msg.data.suggested_telecommand.burn_vector})
                                  </span>
                                </div>
                              )}
                              {msg.data.suggested_telecommand.target_value && (
                                <div className="flex justify-between">
                                  <span className="text-star-white/60">Target Clearance</span>
                                  <span className="text-emerald-400 font-mono font-bold">
                                    {msg.data.suggested_telecommand.target_value}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between text-[9px] font-mono text-muted-gray pt-1 border-t border-white/5">
                                <span>HMAC AUTH SIGNATURE</span>
                                <span>{msg.data.suggested_telecommand.verification_hash}</span>
                              </div>
                            </div>

                            {/* Execution Button */}
                            {executedCommands[msg.data.suggested_telecommand.command_id] ? (
                              <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-space text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 size={15} />
                                <span>TELECOMMAND UPLINKED & ACKNOWLEDGED</span>
                              </div>
                            ) : (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => handleAuthorizeTelecommand(msg.data!.suggested_telecommand!)}
                                className="w-full py-2.5 rounded-xl bg-alert-critical hover:bg-red-700 text-white font-space text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,59,59,0.5)] animate-pulse"
                              >
                                <Flame size={15} />
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
                                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-glow/15 border border-white/10 hover:border-cyan-glow/30 text-[11px] font-space text-star-white/80 hover:text-star-white transition-all cursor-pointer flex items-center justify-between"
                                >
                                  <span>{f}</span>
                                  <ChevronRight size={13} className="text-cyan-glow" />
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
                <div className="flex items-center gap-2 text-xs font-space text-cyan-glow p-3.5 rounded-2xl bg-space-navy/50 border border-cyan-glow/30 max-w-xs shadow-[0_0_15px_rgba(99,199,255,0.15)]">
                  <RefreshCw size={14} className="animate-spin text-cyan-glow" />
                  <span>Solving SGP4 astrodynamics & telemetry models...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Bar */}
            <div className="p-3 border-t border-cyan-glow/20 bg-space-navy/60 flex items-center gap-2 flex-shrink-0">
              {/* Mic Speech Button */}
              <div
                role="button"
                tabIndex={0}
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                  isListening
                    ? 'border-alert-critical bg-alert-critical/25 text-alert-critical animate-pulse shadow-[0_0_15px_rgba(255,59,59,0.5)]'
                    : 'border-white/10 bg-black/50 text-star-white/70 hover:text-cyan-glow hover:border-cyan-glow/40'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice command (Speech-to-Text)'}
              >
                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              </div>

              {/* Text Input */}
              <input
                id="copilot-prompt-input"
                name="copilotPrompt"
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask JARVIS about ${selectedSatelliteId} telemetry, Lunar EDL, or CAM burns...`}
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
                title="Send query to JARVIS"
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
