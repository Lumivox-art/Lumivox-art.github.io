/**
 * Physical Mechanical Cassette Deck SFX.
 * Authentic acoustic recording of a vintage tape-deck button latch engagement.
 * Instant zero-latency playback using an HTMLAudioElement pool with embedded audio.
 */

const CASSETTE_CLICK_DATA_URI =
  'data:audio/mp3;base64,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';

export class CassetteSfx {
  /**
   * Configurable playback volume for tape switch SFX (0.0 to 1.0).
   */
  public static volume: number = 0.5;

  private static audioPool: HTMLAudioElement[] = [];
  private static poolIndex = 0;
  private static isInitialized = false;

  /**
   * Sets the playback volume for all current and future pool instances.
   */
  public static setVolume(newVolume: number): void {
    const clamped = Math.max(0, Math.min(1, newVolume));
    CassetteSfx.volume = clamped;
    for (const audio of CassetteSfx.audioPool) {
      audio.volume = clamped;
    }
  }

  /**
   * Gets the current playback volume.
   */
  public static getVolume(): number {
    return CassetteSfx.volume;
  }

  /**
   * Initializes audio instances with the mechanical click sample.
   */
  private static initPool(): void {
    if (typeof window === 'undefined') return;
    try {
      CassetteSfx.audioPool = [];
      for (let i = 0; i < 4; i++) {
        const audio = new Audio(CASSETTE_CLICK_DATA_URI);
        audio.volume = CassetteSfx.volume;
        audio.preload = 'auto';
        CassetteSfx.audioPool.push(audio);
      }
      CassetteSfx.isInitialized = true;
    } catch (e) {
      console.warn('Cassette SFX initialization warning:', e);
    }
  }

  /**
   * Plays a crisp physical mechanical tape switch / latch click sound.
   */
  public static playTapeSwitch(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!CassetteSfx.isInitialized || CassetteSfx.audioPool.length === 0) {
        CassetteSfx.initPool();
      }

      if (CassetteSfx.audioPool.length > 0) {
        const audio = CassetteSfx.audioPool[CassetteSfx.poolIndex];
        CassetteSfx.poolIndex = (CassetteSfx.poolIndex + 1) % CassetteSfx.audioPool.length;

        audio.volume = CassetteSfx.volume;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Ignore autoplay blocking before initial user interaction
          });
        }
      }
    } catch (e) {
      console.warn('Cassette SFX playback warning:', e);
    }
  }
}
