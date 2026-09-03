/**
 * STARVANTIS Mission Control Alarm Audio Subsystem
 * Manages playback of the official mission alarm audio asset (/audio/alarm.mp3).
 */

class AlarmAudioController {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private volume: number = 0.75;
  private soundEnabled: boolean = true;

  private userHasInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      this.setupInteractionListeners();
    }
  }

  private setupInteractionListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.userHasInteracted = true;
      if (this.audio && this.audio.paused && this.isPlaying) {
        this.audio.play().catch(() => {});
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
  }

  private initAudio() {
    try {
      this.audio = new Audio('/audio/alarm.mp3');
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;
      this.audio.loop = true;

      this.audio.addEventListener('error', () => {
        // Fallback to root alias if subfolder fails
        if (this.audio && this.audio.src.includes('/audio/alarm.mp3')) {
          this.audio.src = '/alarm.mp3';
          this.audio.load();
        }
      });

      this.audio.addEventListener('ended', () => {
        if (!this.audio?.loop) {
          this.isPlaying = false;
          this.notify();
        }
      });
    } catch (e) {
      // Safe initialization catch
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.isPlaying) {
      this.stop();
    }
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public play(loop: boolean = true): Promise<boolean> {
    if (!this.soundEnabled) return Promise.resolve(false);
    if (typeof window === 'undefined') return Promise.resolve(false);

    if (!this.audio) {
      this.initAudio();
    }

    if (!this.audio) return Promise.resolve(false);

    this.audio.loop = loop;
    this.audio.currentTime = 0;
    this.audio.volume = this.volume;

    return this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
        this.userHasInteracted = true;
        this.notify();
        return true;
      })
      .catch((err) => {
        // Browser autoplay policy requires user interaction first
        if (err && err.name !== 'NotAllowedError') {
          console.debug('[AlarmAudio] Autoplay queued until user gesture:', err.message);
        }
        this.isPlaying = false;
        this.notify();
        return false;
      });
  }

  public playOnce(): Promise<boolean> {
    return this.play(false);
  }

  public stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (e) {
        // Ignore pause errors
      }
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle(loop: boolean = true) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(loop);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isPlaying);
      } catch (err) {
        console.error('[AlarmAudio] Listener error:', err);
      }
    });
  }
}

// Global singleton instance
export const alarmAudio = new AlarmAudioController();
