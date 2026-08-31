'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, BellOff, BellRing, AlertOctagon } from 'lucide-react';
import { alarmAudio } from '../lib/alarmAudio';

interface CriticalAlertAudioProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  isAlarmActive?: boolean;
  onStopAlarm?: () => void;
}

export default function CriticalAlertAudio({
  soundEnabled,
  onToggleSound,
  isAlarmActive = false,
  onStopAlarm,
}: CriticalAlertAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync soundEnabled with controller
  useEffect(() => {
    alarmAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Subscribe to alarm state changes
  useEffect(() => {
    const unsubscribe = alarmAudio.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  // Handle active alarm trigger changes
  useEffect(() => {
    if (isAlarmActive && soundEnabled) {
      alarmAudio.play(true);
    } else if (!isAlarmActive && alarmAudio.getIsPlaying()) {
      alarmAudio.stop();
    }
  }, [isAlarmActive, soundEnabled]);

  const handleStopAlarm = () => {
    alarmAudio.stop();
    onStopAlarm?.();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    onToggleSound(next);
    alarmAudio.setSoundEnabled(next);
    if (!next) {
      alarmAudio.stop();
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      {/* Turn Off Alarm Button when actively sounding */}
      {(isAlarmActive || isPlaying) && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleStopAlarm}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-alert-critical text-white font-space text-[11px] font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(255,59,59,0.7)] animate-pulse hover:bg-red-700 transition-all cursor-pointer"
          title="Silence Active Mission Alarm Sound"
        >
          <BellOff size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>TURN OFF ALARM</span>
        </div>
      )}

      {/* Mute / Unmute Toggle Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggleSound}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-space tracking-wider uppercase transition-all duration-300 cursor-pointer ${
          soundEnabled
            ? isAlarmActive || isPlaying
              ? 'bg-alert-critical/25 border-alert-critical text-alert-critical shadow-[0_0_20px_rgba(255,59,59,0.4)]'
              : 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow shadow-[0_0_15px_rgba(99,199,255,0.3)]'
            : 'border-cyan-glow/20 bg-space-navy/50 text-star-white/60 hover:text-star-white'
        }`}
        title={soundEnabled ? 'Disable Mission Alarm Audio' : 'Enable Mission Alarm Audio'}
      >
        {soundEnabled ? (
          <>
            <Volume2
              size={14}
              className={isAlarmActive || isPlaying ? 'text-alert-critical animate-bounce' : 'text-cyan-glow'}
            />
            <span className="font-semibold">{isAlarmActive || isPlaying ? 'ALARM ACTIVE' : 'AUDIO ON'}</span>
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
  if (soundEnabled) {
    alarmAudio.play(true);
  }
  if (onStart) onStart();
}
