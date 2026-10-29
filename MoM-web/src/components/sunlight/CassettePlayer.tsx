import { useState, useRef, useEffect } from 'react';
import { useLang } from '../../i18n';
import type { SunlightSampleBase } from '../../models/Sunlight';
import './CassettePlayer.scss';

interface CassettePlayerProps {
  tracks: SunlightSampleBase[];
  activeTrackKey?: string;
  selectedTrackKey?: string;
  onTrackChange?: (key: string) => void;
  onSelectTrack?: (key: string) => void;
}

export function CassettePlayer({
  tracks,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  // Sync index when active key changes from parent (e.g. commission builder)
  useEffect(() => {
    if (effectiveActiveKey) {
      const idx = musicTracks.findIndex((t) => t.Key === effectiveActiveKey);
      if (idx >= 0 && idx !== currentIndex) {
        setCurrentIndex(idx);
        setIsPlaying(true);
      }
    }
  }, [effectiveActiveKey, musicTracks]);

  const currentTrack = musicTracks[currentIndex] || musicTracks[0];

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const src = currentTrack.AudioBinary || currentTrack.AudioUrl || currentTrack.MediaUrl;
      audioRef.current.src = src;
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.warn('Audio playback prevented:', err));
      }
    }
  }, [currentIndex, currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src && currentTrack) {
        audioRef.current.src = currentTrack.AudioBinary || currentTrack.AudioUrl || currentTrack.MediaUrl;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSwitchSide = (idx: number) => {
    setCurrentIndex(idx);
    const trk = musicTracks[idx];
    if (trk) {
      notifyTrackChange(trk.Key);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + musicTracks.length) % musicTracks.length;
    handleSwitchSide(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % musicTracks.length;
    handleSwitchSide(nextIdx);
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

  const isSideA = currentTrack.Key === 'instrumental';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`sl-cassette-unit ${isPlaying ? 'is-running' : ''}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          handleNext();
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
                <span className="sl-tape-title">{currentTrack.Title}</span>
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
          {musicTracks.map((trk, i) => (
            <button
              key={trk.Key}
              type="button"
              className={`sl-side-switch-btn ${currentIndex === i ? 'is-active' : ''}`}
              onClick={() => handleSwitchSide(i)}
            >
              <span className="btn-side-char">{i === 0 ? 'A' : 'B'}</span>
              <span className="btn-side-label">
                {i === 0 ? t('sunlight.player.side_a') : t('sunlight.player.side_b')}
              </span>
            </button>
          ))}
        </div>

        {/* Mechanical Push Buttons */}
        <div className="sl-push-buttons">
          <button
            type="button"
            className="sl-push-btn btn-rewind"
            onClick={handlePrev}
            title="Rewind"
            aria-label="Rewind"
          >
            REW
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

          <button
            type="button"
            className="sl-push-btn btn-fastforward"
            onClick={handleNext}
            title="Fast Forward"
            aria-label="Fast Forward"
          >
            FF
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
