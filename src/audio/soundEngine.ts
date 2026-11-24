/**
 * POP! Solitaire Procedural Audio Engine
 * Synthesizes tactile comic-book card SFX + an upbeat 1960s Pop-Art Swing/Funk lounge loop
 * purely via Web Audio API with zero external audio asset dependencies.
 */

const SFX_KEY = 'pop_solitaire_sfx';
const MUSIC_KEY = 'pop_solitaire_music';

// Midi note to Hz helper
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Music scheduler state
  private isMusicPlaying = false;
  private schedulerTimer: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private readonly bpm = 108;
  private readonly stepsPerBeat = 4; // 16th-note resolution

  // Upbeat 60s Pop-Art Lounge / Swing Groove (8-bar loop = 128 sixteenth-note steps)
  // Chord progression (2 bars each or 1 bar each): Cmaj7 | Am7 | Dm7 | G7 | Em7 | A7 | Dm7 | G9
  private readonly chords: number[][] = [
    [60, 64, 67, 71], // Cmaj7
    [57, 60, 64, 67], // Am7
    [62, 65, 69, 72], // Dm7
    [55, 59, 62, 65], // G7
    [64, 67, 71, 74], // Em7
    [57, 61, 64, 67], // A7
    [62, 65, 69, 72], // Dm7
    [55, 59, 62, 69], // G9
  ];

  // Walking groovy bass (4 quarter notes per bar across 8 bars = 32 beats)
  private readonly bassLine: number[] = [
    48, 52, 55, 52, // C
    45, 48, 52, 48, // Am
    50, 53, 57, 53, // Dm
    43, 47, 50, 47, // G7
    52, 55, 59, 55, // Em
    45, 49, 52, 49, // A7
    50, 53, 57, 53, // Dm
    43, 47, 50, 47, // G9
  ];

  // Playful retro vibraphone/marimba riff (sparse & melodic on 16th steps, -1 = rest)
  private readonly melodyPattern: Record<number, number> = {
    0: 76, 3: 79, 6: 83, 10: 79,
    16: 76, 20: 72, 24: 74, 28: 72,
    32: 74, 35: 77, 38: 81, 42: 77,
    48: 74, 52: 71, 56: 74, 60: 79,
    64: 79, 67: 83, 70: 86, 74: 83,
    80: 81, 84: 79, 88: 76, 92: 73,
    96: 74, 99: 77, 102: 81, 106: 79,
    112: 77, 116: 74, 120: 71, 124: 74,
  };

  constructor() {
    try {
      const savedSfx = localStorage.getItem(SFX_KEY);
      const savedMusic = localStorage.getItem(MUSIC_KEY);
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
    } catch {
      // ignore storage restrictions
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.ctx.suspend().catch(() => {});
        } else if (this.isMusicPlaying && this.musicEnabled) {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.85;
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? 0.13 : 0;
      this.musicGain.connect(this.ctx.destination);

      // Generate reusable white noise buffer for card paper rustle & brushed hi-hats
      const bufferSize = this.ctx.sampleRate * 0.4;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAndStartMusic(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.musicEnabled && !this.isMusicPlaying) {
      this.startMusicLoop();
    }
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    try {
      localStorage.setItem(SFX_KEY, String(enabled));
    } catch {
      // ignore
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    try {
      localStorage.setItem(MUSIC_KEY, String(enabled));
    } catch {
      // ignore
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;

    const now = ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(enabled ? 0.13 : 0, now, 0.08);

    if (enabled) {
      if (!this.isMusicPlaying) this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  // ==========================================
  // PROCEDURAL 1960s POP-ART LOUNGE MUSIC LOOP
  // ==========================================
  private startMusicLoop(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.nextStepTime = ctx.currentTime + 0.06;
    this.schedulerTimer = window.setInterval(() => this.scheduleMusicSteps(), 35);
  }

  private stopMusicLoop(): void {
    this.isMusicPlaying = false;
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private scheduleMusicSteps(): void {
    if (!this.ctx || !this.musicEnabled || !this.isMusicPlaying) return;

    const stepDuration = 60 / this.bpm / this.stepsPerBeat;
    const lookahead = 0.12;

    while (this.nextStepTime < this.ctx.currentTime + lookahead) {
      this.playMusicStep(this.currentStep, this.nextStepTime, stepDuration);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 128;
    }
  }

  private playMusicStep(step: number, time: number, stepDur: number): void {
    if (!this.ctx || !this.musicGain) return;

    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // Subtle swing feel on odd 8th-note subdivisions
    const swingOffset = stepInBar % 4 === 2 ? stepDur * 0.16 : 0;
    const t = time + swingOffset;

    // 1. Warm Rhodes Electric Piano Comping (beats 1 and syncopated 2.5 & 4)
    if (stepInBar === 0 || stepInBar === 6 || stepInBar === 12) {
      const chord = this.chords[bar];
      const dur = stepInBar === 0 ? stepDur * 5 : stepDur * 2.6;
      const vol = stepInBar === 0 ? 0.15 : 0.1;
      chord.forEach((note) => {
        this.scheduleMusicTone(midiToFreq(note), 'sine', t, dur, vol, 0.015);
      });
    }

    // 2. Groovy Muted Walking Bass (every quarter note)
    if (stepInBar % 4 === 0) {
      const beatIndex = bar * 4 + stepInBar / 4;
      const bassNote = this.bassLine[beatIndex];
      this.scheduleMusicTone(midiToFreq(bassNote), 'triangle', t, stepDur * 3.1, 0.34, 0.01);
    }

    // 3. Soft Brushed Hi-Hat Swing
    if (stepInBar % 2 === 0 && this.noiseBuffer) {
      const isAccent = stepInBar % 4 === 2;
      this.scheduleHiHat(t, isAccent ? 0.065 : 0.032, isAccent ? 0.055 : 0.03);
    }

    // 4. Playful Vibraphone / Organ Melody Hook
    const melodyNote = this.melodyPattern[step];
    if (melodyNote !== undefined) {
      this.scheduleMusicTone(midiToFreq(melodyNote), 'triangle', t, stepDur * 2.8, 0.19, 0.008);
      // Soft harmonic shimmer an octave up
      this.scheduleMusicTone(midiToFreq(melodyNote + 12), 'sine', t, stepDur * 1.4, 0.05, 0.005);
    }
  }

  private scheduleMusicTone(
    freq: number,
    type: OscillatorType,
    startTime: number,
    duration: number,
    volume: number,
    attack = 0.01
  ): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private scheduleHiHat(startTime: number, volume: number, duration: number): void {
    if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    src.start(startTime);
    src.stop(startTime + duration + 0.01);
  }

  // ==========================================
  // TACTILE POP ART CARD SOUND EFFECTS
  // ==========================================
  private playNoiseBurst(duration: number, filterFreq: number, filterType: BiquadFilterType, vol: number): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxEnabled || !this.sfxGain || !this.noiseBuffer) return;

    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
    src.stop(now + duration + 0.01);
  }

  private playSfxTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    vol = 0.14,
    slideTo: number | null = null,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxEnabled || !this.sfxGain) return;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    }

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  public playCardLift(): void {
    if (!this.sfxEnabled) return;
    this.playNoiseBurst(0.045, 2200, 'bandpass', 0.12);
    this.playSfxTone(360, 'sine', 0.055, 0.07, 520);
  }

  public playCardPlace(): void {
    if (!this.sfxEnabled) return;
    this.playNoiseBurst(0.055, 1100, 'lowpass', 0.18);
    this.playSfxTone(210, 'triangle', 0.075, 0.14, 115);
  }

  public playCardFlip(): void {
    if (!this.sfxEnabled) return;
    this.playNoiseBurst(0.07, 2800, 'bandpass', 0.16);
    this.playSfxTone(310, 'triangle', 0.085, 0.1, 610);
  }

  public playShuffle(): void {
    if (!this.sfxEnabled) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playNoiseBurst(0.04, 1800 + i * 240, 'bandpass', 0.11);
        this.playSfxTone(260 + i * 35, 'triangle', 0.045, 0.06, 380 + i * 40);
      }, i * 42);
    }
  }

  public playFoundation(rankValue = 1): void {
    if (!this.sfxEnabled) return;
    // Musical pitch rises as you build Ace (1) -> King (13)!
    const baseMidi = 64 + Math.min(12, rankValue - 1);
    const f1 = midiToFreq(baseMidi);
    const f2 = midiToFreq(baseMidi + 4);
    const f3 = midiToFreq(baseMidi + 7);
    this.playSfxTone(f1, 'triangle', 0.11, 0.14, f2, 0);
    this.playSfxTone(f2, 'sine', 0.14, 0.14, f3, 0.055);
    if (rankValue === 13) {
      this.playSfxTone(midiToFreq(baseMidi + 12), 'triangle', 0.24, 0.16, null, 0.11);
    }
  }

  public playHint(): void {
    if (!this.sfxEnabled) return;
    this.playSfxTone(660, 'sine', 0.1, 0.11, 880, 0);
    this.playSfxTone(880, 'triangle', 0.14, 0.1, 1046.5, 0.07);
  }

  public playUndo(): void {
    if (!this.sfxEnabled) return;
    this.playNoiseBurst(0.05, 1600, 'bandpass', 0.1);
    this.playSfxTone(480, 'triangle', 0.09, 0.1, 240);
  }

  public playError(): void {
    if (!this.sfxEnabled) return;
    this.playSfxTone(165, 'sawtooth', 0.13, 0.08, 105);
  }

  public playButton(): void {
    if (!this.sfxEnabled) return;
    this.playSfxTone(520, 'triangle', 0.05, 0.09, 700);
  }

  public playSplashIntro(): void {
    if (!this.sfxEnabled) return;
    // Crisp Pop Art intro swoop + punchy comic chord hit
    this.playNoiseBurst(0.11, 2400, 'bandpass', 0.14);
    this.playSfxTone(261.63, 'triangle', 0.14, 0.14, 523.25, 0.02);
    this.playSfxTone(392.0, 'triangle', 0.18, 0.13, 659.25, 0.12);
    this.playSfxTone(523.25, 'triangle', 0.28, 0.16, null, 0.24);
    this.playSfxTone(659.25, 'sine', 0.28, 0.12, null, 0.24);
    this.playSfxTone(783.99, 'triangle', 0.34, 0.14, null, 0.32);
  }

  public playSadFail(): void {
    if (!this.sfxEnabled) return;
    // Classic descending comic "wah-wah-waaah" sad trombone glide
    this.playSfxTone(392.0, 'triangle', 0.24, 0.14, 370.0, 0.0);
    this.playSfxTone(369.99, 'triangle', 0.24, 0.14, 349.23, 0.25);
    this.playSfxTone(349.23, 'triangle', 0.24, 0.14, 329.63, 0.5);
    this.playSfxTone(329.63, 'sawtooth', 0.58, 0.09, 246.94, 0.75);
    this.playSfxTone(329.63, 'triangle', 0.58, 0.12, 246.94, 0.75);
  }

  public playWin(): void {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((freq, i) => {
      this.playSfxTone(freq, 'triangle', 0.28, 0.16, null, i * 0.085);
      this.playSfxTone(freq * 0.5, 'sine', 0.3, 0.1, null, i * 0.085);
    });
  }
}

export const soundEngine = new SoundEngine();
