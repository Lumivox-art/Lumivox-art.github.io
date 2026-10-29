import { useState, useRef, useEffect } from 'react';
import { useLang } from '../../i18n';
import type { SunlightSampleBase } from '../../models/Sunlight';
import './CassettePlayer.scss';

interface CassettePlayerProps {
  tracks: SunlightSampleBase[];
  selectedTrackKey?: string;
  onSelectTrack?: (key: string) => void;
}

export function CassettePlayer({
  tracks,
  selectedTrackKey,
  onSelectTrack,
}: CassettePlayerProps) {
  const { t } = useLang();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicTracks = tracks.filter((t) => t.Kind === 'music');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  const activeTrack = musicTracks[currentTrackIndex] || musicTracks[0];

  // Sync with selectedTrackKey if parent component changes it
  useEffect(() => {
    if (selectedTrackKey) {
      const idx = musicTracks.findIndex((t) => t.Key === selectedTrackKey);
      if (idx >= 0 && idx !== currentTrackIndex) {
        setCurrentTrackIndex(idx);
        setIsPlaying(true);
      }
    }
  }, [selectedTrackKey, musicTracks]);

  // Audio source effect
  useEffect(() => {
    if (audioRef.current && activeTrack) {
      audioRef.current.src = activeTrack.AudioUrl || activeTrack.MediaUrl;
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.warn('Audio auto-play prevented:', err));
      }
    }
  }, [currentTrackIndex, activeTrack]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Playback error:', err));
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
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

  const handlePrev = () => {
    const nextIdx = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
    setCurrentTrackIndex(nextIdx);
    onSelectTrack?.(musicTracks[nextIdx].Key);
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % musicTracks.length;
    setCurrentTrackIndex(nextIdx);
    onSelectTrack?.(musicTracks[nextIdx].Key);
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
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeTrack) return null;

  const isSideA = activeTrack.Key === 'instrumental';

  return (
    <div className="sunlight-cassette-deck">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          handleNext();
        }}
      />

      {/* Retro Deck Header */}
      <div className="deck-header">
        <div className="deck-brand-pill">
          <span className="deck-led-dot active" />
          <span>SUNLIGHT BLUE · HI-FI STEREO CASSETTE DECK</span>
        </div>
        <div className="deck-dolby-badge">DOLBY B-NR · TYPE II CHROME</div>
      </div>

      {/* Cassette Tape Physical Housing */}
      <div className={`cassette-casing ${isPlaying ? 'is-playing' : ''}`}>
        <div className="cassette-body">
          {/* Top screws & bevels */}
          <div className="cassette-screw top-left" />
          <div className="cassette-screw top-right" />
          <div className="cassette-screw bottom-left" />
          <div className="cassette-screw bottom-right" />

          {/* Cassette Sticker / Label */}
          <div className="cassette-label">
            <div className="label-side-banner">
              <span className="label-side-letter">{isSideA ? 'A' : 'B'}</span>
              <span className="label-title">{activeTrack.Title}</span>
              <span className="label-year">{activeTrack.ReleaseYear || '1995'}</span>
            </div>
            <div className="label-sub">{t('sunlight.player.tape_label')}</div>
          </div>

          {/* Acrylic Window with Tape Reels */}
          <div className="cassette-window">
            {/* Left Spool */}
            <div className={`spool spool-left ${isPlaying ? 'is-spinning' : ''}`}>
              <div className="spool-core">
                <div className="spool-teeth tooth-1" />
                <div className="spool-teeth tooth-2" />
                <div className="spool-teeth tooth-3" />
              </div>
              <div
                className="tape-pack tape-left"
                style={{
                  transform: `scale(${0.6 + (0.4 * (duration ? 1 - currentTime / duration : 1))})`,
                }}
              />
            </div>

            {/* Magnetic Tape Ribbon Window */}
            <div className="tape-center-window">
              <div className="tape-bridge" />
              <div className="tape-guide-marks">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
            </div>

            {/* Right Spool */}
            <div className={`spool spool-right ${isPlaying ? 'is-spinning' : ''}`}>
              <div className="spool-core">
                <div className="spool-teeth tooth-1" />
                <div className="spool-teeth tooth-2" />
                <div className="spool-teeth tooth-3" />
              </div>
              <div
                className="tape-pack tape-right"
                style={{
                  transform: `scale(${0.6 + (0.4 * (duration ? currentTime / duration : 0))})`,
                }}
              />
            </div>
          </div>

          {/* Cassette Bottom Trapezoid Cutout */}
          <div className="cassette-bottom-trap">
            <div className="pressure-pad" />
            <div className="tape-roller left" />
            <div className="tape-roller right" />
          </div>
        </div>
      </div>

      {/* Retro LCD & VU Meters Section */}
      <div className="deck-display-panel">
        <div className="lcd-screen">
          <div className="lcd-status-row">
            <span className={`lcd-status ${isPlaying ? 'status-play' : 'status-stop'}`}>
              {isPlaying
                ? `▶ ${t('sunlight.player.now_playing')}`
                : currentTime > 0
                  ? `❚❚ ${t('sunlight.player.paused')}`
                  : `■ ${t('sunlight.player.stopped')}`}
            </span>
            <span className="lcd-track-num">TRK 0{currentTrackIndex + 1}</span>
            <span className="lcd-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="lcd-track-title">{activeTrack.Title}</div>
        </div>

        {/* Animated 90s Equalizer Spectrum */}
        <div className={`deck-vu-meter ${isPlaying ? 'is-active' : ''}`}>
          <div className="vu-label">PEAK LEVEL (dB)</div>
          <div className="vu-bars-row">
            <span className="vu-bar bar-1" />
            <span className="vu-bar bar-2" />
            <span className="vu-bar bar-3" />
            <span className="vu-bar bar-4" />
            <span className="vu-bar bar-5" />
            <span className="vu-bar bar-6" />
            <span className="vu-bar bar-7" />
            <span className="vu-bar bar-8" />
            <span className="vu-bar bar-9" />
            <span className="vu-bar bar-10" />
            <span className="vu-bar bar-11" />
            <span className="vu-bar bar-12" />
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="deck-scrubber-row">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="deck-scrubber"
          aria-label="Audio scrubber"
        />
      </div>

      {/* Cassette Deck Tactile Control Buttons */}
      <div className="deck-controls-panel">
        {/* Side Switch Buttons */}
        <div className="deck-side-selector">
          {musicTracks.map((trk, i) => (
            <button
              key={trk.Key}
              type="button"
              className={`deck-side-btn ${currentTrackIndex === i ? 'is-active' : ''}`}
              onClick={() => {
                setCurrentTrackIndex(i);
                onSelectTrack?.(trk.Key);
                setIsPlaying(true);
              }}
            >
              <span className="side-letter">{i === 0 ? 'A' : 'B'}</span>
              <span className="side-title">
                {i === 0 ? t('sunlight.player.side_a') : t('sunlight.player.side_b')}
              </span>
            </button>
          ))}
        </div>

        {/* Tape Transport Controls */}
        <div className="deck-transport-buttons">
          <button
            type="button"
            className="deck-btn btn-rewind"
            onClick={handlePrev}
            title="Previous Track"
            aria-label="Previous Track"
          >
            ◄◄
          </button>

          {!isPlaying ? (
            <button
              type="button"
              className="deck-btn btn-play"
              onClick={handlePlay}
              title="Play"
              aria-label="Play"
            >
              ▶ PLAY
            </button>
          ) : (
            <button
              type="button"
              className="deck-btn btn-pause is-active"
              onClick={handlePause}
              title="Pause"
              aria-label="Pause"
            >
              ❚❚ PAUSE
            </button>
          )}

          <button
            type="button"
            className="deck-btn btn-stop"
            onClick={handleStop}
            title="Stop"
            aria-label="Stop"
          >
            ■ STOP
          </button>

          <button
            type="button"
            className="deck-btn btn-fastforward"
            onClick={handleNext}
            title="Next Track"
            aria-label="Next Track"
          >
            ►►
          </button>
        </div>

        {/* Volume Fader */}
        <div className="deck-volume-fader">
          <span className="vol-icon">VOL</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            className="deck-fader"
            aria-label="Volume slider"
          />
        </div>
      </div>
    </div>
  );
}
