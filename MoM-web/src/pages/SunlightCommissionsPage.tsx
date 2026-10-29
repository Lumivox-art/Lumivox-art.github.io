import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { IntranetShortcut } from '../components/IntranetShortcut';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import { SunlightCommissionsService } from '../services/SunlightCommissionsService';
import type { SunlightSampleBase } from '../models/Sunlight';
import { CassettePlayer } from '../components/sunlight/CassettePlayer';
import { VinylCoverCard } from '../components/sunlight/VinylCoverCard';
import { LumivoxDbImage } from '../components/LumivoxDbImage';
import './SunlightCommissions.scss';

const SUNLIGHT_DISCORD_HANDLE = '@sunlight_blue';
const SUNLIGHT_DISCORD_URL = 'https://discord.com';



export function SunlightCommissionsPage() {
  const { theme } = useTheme();
  const { t } = useLang();

  // Samples loaded via SunlightCommissionsService with 0ms local cache hydration
  const [samples, setSamples] = useState<SunlightSampleBase[]>(() =>
    SunlightCommissionsService.GetCachedSamples(),
  );

  // Selected options in the Commission Builder
  const [selectedArtKey, setSelectedArtKey] = useState<string | null>(null);
  const [selectedSongKey, setSelectedSongKey] = useState<string | null>(null);
  const [lyricsLanguage, setLyricsLanguage] = useState<'es' | 'en' | 'both'>('es');

  // Add-ons

  // Custom user notes
  const [notes, setNotes] = useState('');

  // Cassette player track state
  const [playerTrackKey, setPlayerTrackKey] = useState<string>('instrumental');

  // Zoom modal state for album covers
  const [zoomedSample, setZoomedSample] = useState<SunlightSampleBase | null>(null);

  // Clipboard & Discord action states
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [recopied, setRecopied] = useState(false);

  useEffect(() => {
    const unsubscribe = SunlightCommissionsService.Subscribe((res) => {
      if (res.Result && res.Result.length > 0) {
        setSamples(res.Result);
      }
    });
    return () => unsubscribe();
  }, []);

  const artCovers = samples.filter((s) => s.Kind === 'cover');
  const musicTracks = samples.filter((s) => s.Kind === 'music');

  const selectedArt = artCovers.find((s) => s.Key === selectedArtKey) || null;
  const selectedSong = musicTracks.find((s) => s.Key === selectedSongKey) || null;

  // Pricing calculation
  const artCostUsd = selectedArt ? selectedArt.PriceUsd : 0;
  const artCostMxn = selectedArt ? selectedArt.PriceMxn : 0;

  const songCostUsd = selectedSong ? selectedSong.PriceUsd : 0;
  const songCostMxn = selectedSong ? selectedSong.PriceMxn : 0;
  const totalUsd = artCostUsd + songCostUsd;
  const totalMxn = artCostMxn + songCostMxn;

  const hasSelection = Boolean(selectedArt || selectedSong);

  // Discord message generation
  const handleGenerateQuote = () => {
    if (!hasSelection) return;

    const items: string[] = [];

    if (selectedArt) {
      items.push(`• Digital Art: ${selectedArt.Title} ($${selectedArt.PriceUsd} USD ~ $${selectedArt.PriceMxn} MXN)`);
    }

    if (selectedSong) {
      const lyricsDetail =
        selectedSong.Key === 'vocal-with-lyrics'
          ? ` [Idioma: ${lyricsLanguage === 'es' ? 'Español' : lyricsLanguage === 'en' ? 'Inglés' : 'Bilingüe'}]`
          : '';
      items.push(`• Custom Song: ${selectedSong.Title}${lyricsDetail} ($${selectedSong.PriceUsd} USD ~ $${selectedSong.PriceMxn} MXN)`);
    }
    if (notes.trim()) {
      items.push(`• Notas / Idea: ${notes.trim()}`);
    }

    const message = [
      t('sunlight.discord.msg.greeting'),
      '',
      ...items,
      '',
      `Total: $${totalUsd} USD (~$${totalMxn} MXN)`,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).catch((err) => {
        console.warn('Clipboard write failed:', err);
      });
    }

    setCopiedMessage(message);
    setCopied(true);
    setRecopied(false);
  };

  const handleRecopy = async () => {
    if (!copiedMessage) return;
    try {
      await navigator.clipboard.writeText(copiedMessage);
      setRecopied(true);
      setTimeout(() => setRecopied(false), 2000);
    } catch (err) {
      console.warn('Recopy failed:', err);
    }
  };

  return (
    <div className="sunlight-comm" data-theme={theme}>
      {/* Topbar */}
      <div className="sl-topbar">
        <LumivoxBrand />
        <div className="sl-topbar-actions">
          <Link to="/artistas/sunlight-blue" className="sl-back-link">
            ← {t('artists.back')}
          </Link>
          <IntranetShortcut />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* 90s Record Label Hero */}
      <header className="sl-hero">
        <h1 className="sl-title">{t('sunlight.title')}</h1>
      </header>

      {/* Main Stepped Flow */}
      <main className="sl-container">
        {/* Audio Showcase: Integrated 90s Analog Cassette Deck */}
        <section className="sl-showcase-section">
          <div className="sl-showcase-header">
            <span className="sl-showcase-tag">AUDIO SAMPLE SHOWCASE</span>
            <h2>{t('sunlight.player.title')}</h2>
            <p className="sl-showcase-desc">
              Escucha muestras musicales análogas compuestas por Sunlight Blue. Pulsa PLAY en el cassette para escuchar ejemplos de producción.
            </p>
          </div>

          <CassettePlayer
            tracks={musicTracks}
            activeTrackKey={playerTrackKey}
            onTrackChange={(key) => {
              setPlayerTrackKey(key);
              if (key === 'instrumental' || key === 'vocal-with-lyrics') {
                setSelectedSongKey(key);
                setCopied(false);
              }
            }}
          />
        </section>

        {/* Step 1: Digital Art Styles & 90s Vinyl Album Covers */}
        <section className="sl-step">
          <h2>
            <span className="sl-num">1</span>
            <span>{t('sunlight.step.art')}</span>
          </h2>
          <p className="sl-step-desc">{t('sunlight.gallery.subtitle')}</p>

          <div className="sl-covers-grid">
            {artCovers.map((cover) => (
              <VinylCoverCard
                key={cover.Key}
                sample={cover}
                isSelected={selectedArtKey === cover.Key}
                onSelect={() => {
                  setSelectedArtKey(selectedArtKey === cover.Key ? null : cover.Key);
                  setCopied(false);
                }}
                onZoom={(s) => setZoomedSample(s)}
              />
            ))}
          </div>
        </section>

        {/* Step 2: Custom Music / Song Production */}
        <section className="sl-step">
          <h2>
            <span className="sl-num">2</span>
            <span>{t('sunlight.step.song')}</span>
          </h2>
          <p className="sl-step-desc">
            Composiciones originales a medida para proyectos multimedia, portadas sonoras o canciones de autor.
          </p>

          <div className="sl-song-grid">
            {musicTracks.map((song) => (
              <button
                key={song.Key}
                type="button"
                className={`sl-card sl-song-card ${selectedSongKey === song.Key ? 'selected' : ''}`}
                onClick={() => {
                  const newKey = selectedSongKey === song.Key ? null : song.Key;
                  setSelectedSongKey(newKey);
                  if (newKey) {
                    setPlayerTrackKey(newKey);
                  }
                  setCopied(false);
                }}
                aria-pressed={selectedSongKey === song.Key}
              >
                <div className="sl-song-info">
                  <span className="sl-song-name">{song.Title}</span>
                  <span className="sl-song-desc">{song.Description}</span>
                </div>
                <div className="sl-price-block">
                  <span className="sl-price">${song.PriceUsd} USD</span>
                  <span className="sl-price-sub">~${song.PriceMxn} MXN</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Step 3: Studio Options & Add-ons */}
        <section className="sl-step">
          <h2>
            <span className="sl-num">3</span>
            <span>{t('sunlight.step.options')}</span>
          </h2>

          <div className="sl-options-panel">
            {/* Lyrics Language Selector (if vocals selected) */}
            {selectedSongKey === 'vocal-with-lyrics' && (
              <div className="sl-field-block animate-fade-in">
                <label className="sl-field-title">{t('sunlight.lyrics.lang')}</label>
                <div className="sl-lang-pills">
                  <button
                    type="button"
                    className={`sl-pill-btn ${lyricsLanguage === 'es' ? 'is-active' : ''}`}
                    onClick={() => {
                      setLyricsLanguage('es');
                      setCopied(false);
                    }}
                  >
                    {t('sunlight.lyrics.es')}
                  </button>
                  <button
                    type="button"
                    className={`sl-pill-btn ${lyricsLanguage === 'en' ? 'is-active' : ''}`}
                    onClick={() => {
                      setLyricsLanguage('en');
                      setCopied(false);
                    }}
                  >
                    {t('sunlight.lyrics.en')}
                  </button>
                  <button
                    type="button"
                    className={`sl-pill-btn ${lyricsLanguage === 'both' ? 'is-active' : ''}`}
                    onClick={() => {
                      setLyricsLanguage('both');
                      setCopied(false);
                    }}
                  >
                    Bilingüe / Both
                  </button>
                </div>
              </div>
            )}

            {/* Project Idea / Notes */}
            <div className="sl-field-block">
              <label htmlFor="sl-notes" className="sl-field-title">
                Descripción de tu Proyecto o Idea (Opcional):
              </label>
              <textarea
                id="sl-notes"
                className="sl-textarea"
                rows={3}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setCopied(false);
                }}
                placeholder="Cuéntale a Sunlight Blue sobre tu temática, referencias de sonido, atmósfera deseada..."
              />
            </div>
          </div>
        </section>

        {/* Step 4: Studio Order Summary & Discord Action */}
        <section className="sl-step sl-summary-step">
          <h2>
            <span className="sl-num">4</span>
            <span>{t('sunlight.summary.title')}</span>
          </h2>

          <div className="sl-summary-card">
            <div className="sl-summary-header">
              <span className="sl-receipt-tag">SUNLIGHT BLUE RECORDING STUDIO ORDER</span>
              <span className="sl-receipt-date">ORDEN OFICIAL</span>
            </div>

            {!hasSelection ? (
              <p className="sl-summary-empty">{t('sunlight.summary.empty')}</p>
            ) : (
              <ul className="sl-summary-lines">
                {selectedArt && (
                  <li className="sl-summary-line">
                    <span className="line-category">Arte Digital</span>
                    <span className="line-title">{selectedArt.Title}</span>
                    <span className="line-price">${selectedArt.PriceUsd} USD</span>
                  </li>
                )}
                {selectedSong && (
                  <li className="sl-summary-line">
                    <span className="line-category">Producción Sonora</span>
                    <span className="line-title">
                      {selectedSong.Title}
                      {selectedSong.Key === 'vocal-with-lyrics' &&
                        ` (${lyricsLanguage === 'es' ? 'Español' : lyricsLanguage === 'en' ? 'Inglés' : 'Bilingüe'})`}
                    </span>
                    <span className="line-price">${selectedSong.PriceUsd} USD</span>
                  </li>
                )}
              </ul>
            )}

            {/* Total Row */}
            <div className="sl-summary-total">
              <div className="sl-total-chip total-usd">
                <span className="chip-label">{t('sunlight.total')}</span>
                <strong className="chip-value">${totalUsd} USD</strong>
              </div>
              <div className="sl-total-chip total-mxn">
                <span className="chip-label">{t('sunlight.mxn')}</span>
                <strong className="chip-value">~${totalMxn} MXN</strong>
              </div>
            </div>

            {/* Discord Action */}
            <div className="sl-discord-action">
              <button
                type="button"
                className={`sl-discord-btn ${!hasSelection ? 'is-disabled' : ''}`}
                onClick={handleGenerateQuote}
                disabled={!hasSelection}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>{t('sunlight.discord.action')}</span>
              </button>

              {copied && copiedMessage && (
                <div className="sl-discord-feedback animate-fade-in">
                  <div className="sl-feedback-header">
                    <span className="sl-check-mark">✓</span>
                    <div>
                      <strong>{t('sunlight.discord.copied.title')}</strong>
                      <p>{t('sunlight.discord.copied.desc')}</p>
                    </div>
                  </div>

                  <pre className="sl-message-preview">{copiedMessage}</pre>

                  <div className="sl-feedback-actions">
                    <button
                      type="button"
                      className="sl-btn-recopy"
                      onClick={handleRecopy}
                    >
                      {recopied ? '✓ Copiado!' : 'Copiar de nuevo'}
                    </button>
                    <a
                      href={SUNLIGHT_DISCORD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sl-btn-send"
                    >
                      {t('sunlight.discord.send')} ({SUNLIGHT_DISCORD_HANDLE})
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {zoomedSample && (
        <div
          className="sl-lightbox-overlay animate-fade-in"
          onClick={() => setZoomedSample(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sl-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sl-lightbox-close"
              onClick={() => setZoomedSample(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="sl-lightbox-media">
              <LumivoxDbImage
                src={zoomedSample.ImageBinary || zoomedSample.MediaUrl}
                alt={zoomedSample.Title}
                circleSize={64}
              />
            </div>
            <div className="sl-lightbox-info">
              <h3>{zoomedSample.Title}</h3>
              <p>{zoomedSample.Description}</p>
              <div className="sl-lightbox-footer">
                <span className="lightbox-price">
                  ${zoomedSample.PriceUsd} USD (~${zoomedSample.PriceMxn} MXN)
                </span>
                <button
                  type="button"
                  className="sl-btn-lightbox-select"
                  onClick={() => {
                    setSelectedArtKey(zoomedSample.Key);
                    setZoomedSample(null);
                    setCopied(false);
                  }}
                >
                  Seleccionar este Estilo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
