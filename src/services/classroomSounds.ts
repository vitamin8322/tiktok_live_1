/** Classroom cues and the user's countdown backing track. */
export type ClassroomCue = 'question' | 'tick' | 'countdown' | 'answer' | 'gift' | 'celebrate';

const CUES: Record<ClassroomCue, { notes: number[]; spacing: number; duration: number; wave: OscillatorType; gain: number }> = {
  question: { notes: [523.25, 659.25, 783.99], spacing: 0.095, duration: 0.13, wave: 'sine', gain: 0.12 },
  tick: { notes: [880], spacing: 0, duration: 0.07, wave: 'sine', gain: 0.10 },
  countdown: { notes: [659.25, 783.99], spacing: 0.12, duration: 0.08, wave: 'triangle', gain: 0.09 },
  answer: { notes: [659.25, 783.99, 1046.5], spacing: 0.11, duration: 0.16, wave: 'sine', gain: 0.11 },
  gift: { notes: [783.99, 987.77, 1174.66], spacing: 0.075, duration: 0.12, wave: 'triangle', gain: 0.1 },
  celebrate: { notes: [523.25, 659.25, 783.99, 1046.5], spacing: 0.1, duration: 0.2, wave: 'triangle', gain: 0.1 },
};

class ClassroomSounds {
  private context: AudioContext | null = null;
  private lastCue = new Map<ClassroomCue, number>();
  private unlocked = false;
  private enabled = true;
  private volume = 0.45;
  private countdownAudio: HTMLAudioElement | null = null;
  private countdownStartedAt = 0;
  private countdownDeadline = 0;

  configure(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.volume = Math.min(1, Math.max(0, volume));
    this.syncCountdown();
  }

  /** Called only from a user gesture; later events never force audio playback. */
  unlock() {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!this.context || this.context.state === 'closed') this.context = new AudioContextClass();
    this.unlocked = true;
    if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    this.syncCountdown();
  }

  startCountdown(deadline: number) {
    this.stopCountdown();
    this.countdownStartedAt = Date.now();
    this.countdownDeadline = deadline;
    this.syncCountdown();
  }

  private syncCountdown() {
    if (!this.countdownDeadline) return;
    if (Date.now() >= this.countdownDeadline) { this.stopCountdown(); return; }
    if (!this.enabled || !this.unlocked) { this.countdownAudio?.pause(); return; }
    if (!this.countdownAudio) {
      this.countdownAudio = new Audio('/assets/audio/countdown.mp3');
      this.countdownAudio.loop = true;
    }
    this.countdownAudio.volume = this.volume;
    if (this.countdownAudio.paused) {
      this.countdownAudio.currentTime = Math.max(0, (Date.now() - this.countdownStartedAt) / 1000);
      void this.countdownAudio.play().catch(() => {});
    }
  }

  stopCountdown() {
    this.countdownDeadline = 0;
    if (!this.countdownAudio) return;
    this.countdownAudio.pause();
    this.countdownAudio.currentTime = 0;
    this.countdownAudio = null;
  }

  play(cue: ClassroomCue) {
    if (!this.enabled || !this.unlocked || !this.context || this.context.state !== 'running') return;
    const nowMs = Date.now();
    if (nowMs - (this.lastCue.get(cue) ?? 0) < (cue === 'tick' ? 600 : 1500)) return;
    this.lastCue.set(cue, nowMs);
    const context = this.context;
    const sound = CUES[cue];
    sound.notes.forEach((frequency, index) => {
      const at = context.currentTime + index * sound.spacing;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = sound.wave;
      oscillator.frequency.setValueAtTime(frequency, at);
      envelope.gain.setValueAtTime(0.0001, at);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, sound.gain * this.volume), at + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.0001, at + sound.duration);
      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(at);
      oscillator.stop(at + sound.duration + 0.01);
    });
  }

  dispose() {
    this.stopCountdown();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.unlocked = false;
  }
}

export const classroomSounds = new ClassroomSounds();
if (import.meta.hot) import.meta.hot.dispose(() => classroomSounds.dispose());
