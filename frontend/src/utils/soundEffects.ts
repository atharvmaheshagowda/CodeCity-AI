/**
 * Procedural WebAudio Sound Effects Engine for CodeCity AI
 * 100% offline, zero audio asset downloads, mathematically synthesized in real-time.
 * Default is MUTED until user enables audio in the navigation bar.
 */

let audioCtx: AudioContext | null = null;
let isAudioMuted = true; // Off by default as required by specification

// Check localStorage for persisted preference if available
try {
  const saved = localStorage.getItem('codecity_audio_enabled');
  if (saved !== null) {
    isAudioMuted = saved !== 'true';
  }
} catch {
  // Ignore in SSR / restricted iframe
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundFx = {
  isMuted: () => isAudioMuted,

  toggleMute: () => {
    isAudioMuted = !isAudioMuted;
    try {
      localStorage.setItem('codecity_audio_enabled', String(!isAudioMuted));
    } catch {
      // ignore
    }
    if (!isAudioMuted) {
      getAudioContext();
      soundFx.playClick();
    }
    return !isAudioMuted;
  },

  setMuted: (muted: boolean) => {
    isAudioMuted = muted;
    try {
      localStorage.setItem('codecity_audio_enabled', String(!muted));
    } catch {
      // ignore
    }
  },

  /** Soft micro-tick for hovering building items or buttons */
  playHoverTick: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);

      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.018);
    } catch {
      // audio error handling
    }
  },

  /** Crisp haptic click on building / list selection */
  playClick: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // audio error handling
    }
  },

  /** Smooth resonant whoosh for drawer open / camera fly-to */
  playWhoosh: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // White noise buffer with dynamic bandpass filter sweep
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.09);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.18);
      filter.Q.value = 3.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.19);
    } catch {
      // audio error handling
    }
  },

  /** Resonant blast radius shockwave trigger */
  playBlastWave: () => {
    if (isAudioMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.35);

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(60, now);
      sub.frequency.exponentialRampToValueAtTime(180, now + 0.4);

      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.46);
      sub.stop(now + 0.46);
    } catch {
      // audio error handling
    }
  },
};

