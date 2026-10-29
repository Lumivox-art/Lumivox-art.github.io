/**
 * Procedural Analog 90s Hi-Fi Mechanical Cassette Deck SFX Generator.
 * Uses Web Audio API to synthesize photorealistic solenoid/spring/head-engage mechanical sounds
 * with zero external assets, zero network latency, and guaranteed cross-browser support.
 */
export class CassetteSfx {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!CassetteSfx.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        CassetteSfx.ctx = new AudioCtx();
      }
    }
    if (CassetteSfx.ctx && CassetteSfx.ctx.state === 'suspended') {
      CassetteSfx.ctx.resume().catch(() => {});
    }
    return CassetteSfx.ctx;
  }

  /**
   * Plays a vintage mechanical tape-head engagement / solenoid switch CLUNK-CLICK sound.
   * Synthesizes the dual mechanical impact of solenoid release and spring-loaded head seating.
   */
  public static playTapeSwitch(): void {
    try {
      const ctx = CassetteSfx.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Transient Metallic Spring Click (Solenoid Release)
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2600, now);
      noiseFilter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);

      // 2. Heavy Mechanical Latch / Solenoid Thud (The "CHUNK" of the head assembly)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now + 0.015);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.setValueAtTime(0.45, now + 0.015);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now + 0.015);
      osc.stop(now + 0.12);

      // 3. Head Carrier Lock Click (Final metallic contact tick)
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();

      tickOsc.type = 'sine';
      tickOsc.frequency.setValueAtTime(1900, now + 0.055);
      tickOsc.frequency.exponentialRampToValueAtTime(650, now + 0.085);

      tickGain.gain.setValueAtTime(0.001, now);
      tickGain.gain.setValueAtTime(0.22, now + 0.055);
      tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.start(now + 0.055);
      tickOsc.stop(now + 0.1);
    } catch (e) {
      console.warn('Cassette SFX non-critical warning:', e);
    }
  }
}
