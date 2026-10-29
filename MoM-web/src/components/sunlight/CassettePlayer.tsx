import { useState, useRef, useEffect } from 'react';
import { useLang } from '../../i18n';
import type { SunlightSampleBase, SunlightCompiledCassette } from '../../models/Sunlight';
import './CassettePlayer.scss';

interface CassettePlayerProps {
  tracks?: SunlightSampleBase[];
  compiledCassette?: SunlightCompiledCassette | null;
  activeSide?: 'A' | 'B';
  onSideChange?: (side: 'A' | 'B') => void;
  onTrackEnded?: (loopEnabled?: boolean) => boolean | void;
  autoPlayOnChange?: boolean;
  activeTrackKey?: string;
  selectedTrackKey?: string;
  onTrackChange?: (key: string) => void;
  onSelectTrack?: (key: string) => void;
}

export function CassettePlayer({
  tracks = [],
  compiledCassette,
  activeSide = 'A',
  onSideChange,
  onTrackEnded,
  autoPlayOnChange = true,
  activeTrackKey,
  selectedTrackKey,
  onTrackChange,
  onSelectTrack,
}: CassettePlayerProps) {
  const { t } = useLang();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveActiveKey = activeTrackKey || selectedTrackKey;

  const notifyTrackChange = (key: string) => {
    onTrackChange?.(key);
    onSelectTrack?.(key);
  };

  const musicTracks = tracks.filter((t) => t.Kind === 'music');
  const [legacyIndex, setLegacyIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isLoop, setIsLoop] = useState(true);

  const isPlayingRef = useRef(false);
  const shouldKeepPlayingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Active track determination based on compiledCassette vs legacy tracks
  const currentSide: 'A' | 'B' = compiledCassette ? activeSide : (legacyIndex === 1 ? 'B' : 'A');

  const currentTrack: SunlightSampleBase | null = compiledCassette
    ? currentSide === 'B' && compiledCassette.sideB
      ? compiledCassette.sideB
      : compiledCassette.sideA
    : musicTracks[legacyIndex] || musicTracks[0] || null;

  // Sync index when active key changes from parent (legacy fallback)
  useEffect(() => {
    if (!compiledCassette && effectiveActiveKey) {
      const idx = musicTracks.findIndex((t) => t.Key === effectiveActiveKey);
      if (idx >= 0 && idx !== legacyIndex) {
        setLegacyIndex(idx);
      }
    }
  }, [effectiveActiveKey, musicTracks, compiledCassette, legacyIndex]);

  const getTrackSrc = (trk?: SunlightSampleBase | null): string => {
    if (!trk) return '';
    return trk.AudioBinary || trk.AudioUrl || trk.MediaUrl || '';
  };

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update audio source when track or cassette changes and ensure play button stays active
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const src = getTrackSrc(currentTrack);
    if (!src) return;

    const currentSrc = audio.currentSrc || audio.src;
    const isSame = currentSrc && (currentSrc === src || currentSrc.endsWith(src));

    // Keep playing if already playing, or if explicitly requested, or if user interacted and autoPlayOnChange
    const shouldPlay =
      isPlayingRef.current ||
      shouldKeepPlayingRef.current ||
      (autoPlayOnChange && hasUserInteractedRef.current);

    if (!isSame) {
      audio.src = src;
      audio.load();
      setCurrentTime(0);

      if (shouldPlay) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            shouldKeepPlayingRef.current = false;
          })
          .catch((err) => {
            console.warn('Playback resume error:', err);
            setIsPlaying(false);
            shouldKeepPlayingRef.current = false;
          });
      } else {
        setIsPlaying(false);
      }
    } else if (shouldPlay && audio.paused) {
      // Loop or restart same track
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          shouldKeepPlayingRef.current = false;
        })
        .catch((err) => {
          console.warn('Playback restart error:', err);
          setIsPlaying(false);
          shouldKeepPlayingRef.current = false;
        });
    }
  }, [currentTrack, autoPlayOnChange]);

  const togglePlay = () => {
    hasUserInteractedRef.current = true;
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      shouldKeepPlayingRef.current = false;
    } else {
      const src = getTrackSrc(currentTrack);
      const currentSrc = audio.currentSrc || audio.src;
      const isSame = currentSrc && (currentSrc === src || currentSrc.endsWith(src));
      if (!isSame && src) {
        audio.src = src;
        audio.load();
      }
      shouldKeepPlayingRef.current = true;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play error:', err);
          setIsPlaying(false);
          shouldKeepPlayingRef.current = false;
        });
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      shouldKeepPlayingRef.current = false;
      setCurrentTime(0);
    }
  };

  const handleSelectSide = (side: 'A' | 'B') => {
    hasUserInteractedRef.current = true;
    shouldKeepPlayingRef.current = true;

    if (compiledCassette) {
      if (side === 'B' && !compiledCassette.sideB) return;
      if (side === currentSide) {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        return;
      }

      onSideChange?.(side);
      const targetTrk = side === 'B' ? compiledCassette.sideB : compiledCassette.sideA;
      if (targetTrk) {
        notifyTrackChange(targetTrk.Key);
      }
    } else {
      const targetIdx = side === 'A' ? 0 : 1;
      if (targetIdx >= 0 && targetIdx < musicTracks.length) {
        setLegacyIndex(targetIdx);
        const trk = musicTracks[targetIdx];
        if (trk) {
          notifyTrackChange(trk.Key);
        }
      }
    }
  };

  const handleTrackEndedInternal = () => {
    hasUserInteractedRef.current = true;

    if (onTrackEnded) {
      const advanced = onTrackEnded(isLoop);
      if (advanced === false) {
        shouldKeepPlayingRef.current = false;
        setIsPlaying(false);
        return;
      }
      shouldKeepPlayingRef.current = true;
    } else if (compiledCassette) {
      // Local fallback for cassette side toggle
      if (currentSide === 'A' && compiledCassette.sideB) {
        shouldKeepPlayingRef.current = true;
        handleSelectSide('B');
      } else if (isLoop) {
        shouldKeepPlayingRef.current = true;
        handleSelectSide('A');
      } else {
        shouldKeepPlayingRef.current = false;
        setIsPlaying(false);
      }
    } else if (musicTracks.length > 0) {
      if (!isLoop && legacyIndex >= musicTracks.length - 1) {
        shouldKeepPlayingRef.current = false;
        setIsPlaying(false);
        return;
      }
      const nextIdx = (legacyIndex + 1) % musicTracks.length;
      setLegacyIndex(nextIdx);
      const trk = musicTracks[nextIdx];
      if (trk) {
        shouldKeepPlayingRef.current = true;
        notifyTrackChange(trk.Key);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const isSideA = currentSide === 'A';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`sl-cassette-unit ${isPlaying ? 'is-running' : ''}`}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={handleTrackEndedInternal}
        onError={(e) => {
          console.warn('Audio tag playback error:', e);
          setIsPlaying(false);
          shouldKeepPlayingRef.current = false;
        }}
      />

      {/* Top Deck Transport Control Bar */}
      <div className="sl-deck-topbar">
        <div className="sl-deck-branding">
          <span className="sl-brand-logo-text">SUNLIGHT BLUE</span>
          <span className="sl-brand-model">WM-90 CASSETTE DECK</span>
        </div>
        <div className="sl-deck-leds">
          <span className={`sl-led ${isPlaying ? 'is-active' : ''}`} title="Power / Play" />
          <span className="sl-led-label">AUTO REVERSE · DOLBY B-NR</span>
        </div>
      </div>

      {/* Main Player Body: Cassette Door + Integrated LCD Display */}
      <div className="sl-deck-main">
        {/* Cassette Tape Chamber with Window */}
        <div
          className="sl-tape-door"
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          title={isPlaying ? 'Click to Pause' : 'Click to Play'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePlay();
            }
          }}
        >
          {/* Glass Reflection */}
          <div className="sl-door-glass-sheen" />

          {/* Real Cassette Body */}
          <div className="sl-cassette-shell">
            {/* Corner Screws */}
            <span className="sl-screw s-tl" />
            <span className="sl-screw s-tr" />
            <span className="sl-screw s-bl" />
            <span className="sl-screw s-br" />

            {/* Cassette Tape Label Sticker */}
            <div className="sl-tape-sticker">
              <div className="sl-sticker-top">
                <span className="sl-side-pill">{isSideA ? 'A' : 'B'}</span>
                <span className="sl-tape-title">
                  {compiledCassette ? (compiledCassette.title || currentTrack.Title) : currentTrack.Title}
                </span>
              </div>
              <div className="sl-sticker-rule" />
              <div className="sl-sticker-bottom">
                <span>SUNLIGHT RECORDS · CHROME POSITION · TYPE II</span>
                <span>EQ 70us</span>
              </div>
            </div>

            {/* Tape Window with Dual Rotating Spools */}
            <div className="sl-spool-chamber">
              {/* Left Spool */}
              <div className={`sl-spool spool-left ${isPlaying ? 'spool-spinning' : ''}`}>
                <div className="sl-spool-hub">
                  <span className="hub-tooth t-1" />
                  <span className="hub-tooth t-2" />
                  <span className="hub-tooth t-3" />
                </div>
                <div
                  className="sl-tape-pancake"
                  style={{
                    transform: `scale(${0.55 + 0.45 * (1 - progressPercent / 100)})`,
                  }}
                />
              </div>

              {/* Tape Center Bridge */}
              <div className="sl-tape-bridge">
                <div className="sl-tape-ribbon" />
                <div className="sl-tape-ticks">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
              </div>

              {/* Right Spool */}
              <div className={`sl-spool spool-right ${isPlaying ? 'spool-spinning' : ''}`}>
                <div className="sl-spool-hub">
                  <span className="hub-tooth t-1" />
                  <span className="hub-tooth t-2" />
                  <span className="hub-tooth t-3" />
                </div>
                <div
                  className="sl-tape-pancake"
                  style={{
                    transform: `scale(${0.55 + 0.45 * (progressPercent / 100)})`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Tape Roller Cutout */}
            <div className="sl-tape-bottom-notch">
              <span className="sl-guide-pin" />
              <span className="sl-felt-pad" />
              <span className="sl-guide-pin" />
            </div>
          </div>
        </div>

        {/* Integrated LCD Display Screen (Built directly into the cassette player) */}
        <div className="sl-integrated-lcd">
          {/* LCD Bezel */}
          <div className="sl-lcd-glass">
            <div className="sl-lcd-status-line">
              <span className={`sl-lcd-indicator ${isPlaying ? 'is-playing' : ''}`}>
                {isPlaying ? 'PLAY' : currentTime > 0 ? 'PAUSE' : 'STOP'}
              </span>
              <span className="sl-lcd-side">
                SIDE {isSideA ? 'A' : 'B'}
              </span>
              {isLoop && <span className="sl-lcd-loop-pill">LOOP</span>}
              <span className="sl-lcd-counter">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Marquee Song Name Display */}
            <div className="sl-lcd-track-line">
              <div className="sl-marquee-wrap">
                <span className="sl-marquee-text">
                  TRACK: {currentTrack.Title.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Equalizer Spectrum Bars */}
            <div className={`sl-lcd-spectrum ${isPlaying ? 'is-active' : ''}`}>
              <div className="sl-eq-col"><span className="eq-bar bar-1" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-2" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-3" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-4" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-5" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-6" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-7" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-8" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-9" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-10" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-11" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-12" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-13" /></div>
              <div className="sl-eq-col"><span className="eq-bar bar-14" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Scrubbing Bar */}
      <div className="sl-deck-scrub-row">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="sl-scrub-slider"
          aria-label="Seek position"
        />
      </div>

      {/* Tactile Control Buttons Bar */}
      <div className="sl-deck-controls-row">
        {/* Physical Side Selector Buttons */}
        <div className="sl-deck-sides">
          <button
            type="button"
            className={`sl-side-switch-btn ${isSideA ? 'is-active' : ''}`}
            onClick={() => handleSelectSide('A')}
            title="Cara A"
          >
            <span className="btn-side-char">A</span>
            <span className="btn-side-label">
              {compiledCassette ? compiledCassette.sideA.Title : t('sunlight.player.side_a')}
            </span>
          </button>

          <button
            type="button"
            className={`sl-side-switch-btn ${!isSideA ? 'is-active' : ''}`}
            onClick={() => handleSelectSide('B')}
            disabled={compiledCassette ? !compiledCassette.sideB : false}
            title={compiledCassette && !compiledCassette.sideB ? 'Sin Cara B' : 'Cara B'}
          >
            <span className="btn-side-char">B</span>
            <span className="btn-side-label">
              {compiledCassette
                ? (compiledCassette.sideB ? compiledCassette.sideB.Title : 'Sin Cara B')
                : t('sunlight.player.side_b')}
            </span>
          </button>
        </div>

        {/* Mechanical Push Buttons */}
        <div className="sl-push-buttons">
          <button
            type="button"
            className={`sl-push-btn btn-loop ${isLoop ? 'is-active' : ''}`}
            onClick={() => setIsLoop((prev) => !prev)}
            title={isLoop ? 'Bucle continuo activado' : 'Bucle desactivado'}
            aria-label="Loop"
            aria-pressed={isLoop}
          >
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="btn-loop-icon"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            LOOP
          </button>

          <button
            type="button"
            className={`sl-push-btn btn-play ${isPlaying ? 'is-active' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>

          <button
            type="button"
            className="sl-push-btn btn-stop"
            onClick={handleStop}
            title="Stop"
            aria-label="Stop"
          >
            STOP
          </button>
        </div>

        {/* Volume Thumbwheel */}
        <div className="sl-volume-thumb">
          <span className="vol-text">VOL</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            className="sl-vol-slider"
            aria-label="Volume level"
          />
        </div>
      </div>
    </div>
  );
}
