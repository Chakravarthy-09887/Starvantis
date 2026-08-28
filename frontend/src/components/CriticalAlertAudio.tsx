'use client';

import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX, AlertTriangle, BellRing, BellOff } from 'lucide-react';

interface CriticalAlertAudioProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  isAlarmActive?: boolean;
  onStopAlarm?: () => void;
}

// Global reference to active continuous alarm interval
let globalAlarmInterval: NodeJS.Timeout | null = null;

export default function CriticalAlertAudio({
  soundEnabled,
  onToggleSound,
  isAlarmActive = false,
  onStopAlarm,
}: CriticalAlertAudioProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play single aerospace double-beep chirp
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      [0, 0.16].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, now + offset);
        osc.frequency.exponentialRampToValueAtTime(1960, now + offset + 0.1);

        gain.gain.setValueAtTime(0.16, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.005, now + offset + 0.13);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch {
      // Audio restricted or unavailable
    }
  };

  // Continuous recurring beeper when alarm is active
  useEffect(() => {
    if (isAlarmActive && soundEnabled) {
      // Play first beep immediately
      playBeep();
      if (!globalAlarmInterval) {
        globalAlarmInterval = setInterval(() => {
          playBeep();
        }, 1100);
      }
    } else {
      if (globalAlarmInterval) {
        clearInterval(globalAlarmInterval);
        globalAlarmInterval = null;
      }
    }

    return () => {
      if (globalAlarmInterval) {
        clearInterval(globalAlarmInterval);
        globalAlarmInterval = null;
      }
    };
  }, [isAlarmActive, soundEnabled]);

  return (
    <div className="inline-flex items-center gap-2">
      {/* Turn Off Alarm Button when actively beeping */}
      {isAlarmActive && (
        <div role="button" tabIndex={0} onClick={() => {
            if (globalAlarmInterval) {
              clearInterval(globalAlarmInterval);
              globalAlarmInterval = null;
            }
            onStopAlarm?.();
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-alert-critical text-white font-space text-[11px] font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(255,59,59,0.7)] animate-pulse hover:bg-red-700 transition-all cursor-pointer"
        >
          <BellOff size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>TURN OFF ALARM</span>
        </div>
      )}

      {/* Mute / Unmute Toggle Button */}
      <div role="button" tabIndex={0} onClick={() => {
          const next = !soundEnabled;
          onToggleSound(next);
          if (!next && globalAlarmInterval) {
            clearInterval(globalAlarmInterval);
            globalAlarmInterval = null;
          } else if (next) {
            playBeep();
          }
        }}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-space tracking-wider uppercase transition-all duration-300 ${
          soundEnabled
            ? isAlarmActive
              ? 'bg-alert-critical/25 border-alert-critical text-alert-critical shadow-[0_0_20px_rgba(255,59,59,0.4)]'
              : 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow shadow-[0_0_15px_rgba(99,199,255,0.3)]'
            : 'border-cyan-glow/20 bg-space-navy/50 text-star-white/60 hover:text-star-white'
        }`}
        title={soundEnabled ? 'Disable Mission Alarm Audio' : 'Enable Mission Alarm Audio'}
      >
        {soundEnabled ? (
          <>
            <Volume2 size={14} className={isAlarmActive ? 'text-alert-critical animate-bounce' : 'text-cyan-glow'} />
            <span className="font-semibold">{isAlarmActive ? 'ALARM BEEPING' : 'AUDIO ON'}</span>
          </>
        ) : (
          <>
            <VolumeX size={14} className="text-star-white/40" />
            <span>AUDIO OFF</span>
          </>
        )}
      </div>
    </div>
  );
}

// Programmatic continuous alarm trigger utility
export function triggerContinuousMissionAlarm(soundEnabled: boolean, onStart?: () => void) {
  if (onStart) onStart();
}
