import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import { SpeckuGalleryService } from '../services/SpeckuGalleryService';
import { LumivoxLoadingCircle } from '../components/LumivoxLoadingCircle';
import {
  SPECKU_DISCORD_PROFILE_URL,
  buildDiscordCommissionMessage,
} from '../utils/discordMessage';
import './SpeckuCommissions.scss';

// Functional commission quote builder for Specku.
// Pick one option per mandatory step (style + size + look);
// optional sections (backgrounds, objects of interest, additional people)
// can be toggled on/off to reflect whether the drawing contains them.
// Total is shown in USD and in MXN at a fixed 1 USD = 17 MXN rate.

type StyleOption = { id: string; name: string; days: string; price: number };
type SizeCrop = 'shoulders' | 'half' | 'full';
type CropOption = { id: SizeCrop; price: number };
type LookOption = { id: string; price: number };
type BackgroundOption = { id: 'simple' | 'detailed'; price: number };
type ObjectOption = { id: 'small' | 'medium' | 'big'; price: number };

const STYLES: StyleOption[] = [
  { id: 'cutsey', name: 'Cutsey', days: '3–5', price: 4 },
  { id: 'chibi', name: 'Chibi', days: '5–7', price: 7 },
  { id: 'noodle', name: 'Noodle', days: '3–5', price: 7 },
  { id: 'dull-eyes', name: 'Dull-Eyes', days: '3–7', price: 13 },
  { id: 'anima', name: 'Anima', days: '7–15', price: 21 },
  { id: 'semi-real', name: 'Semi-Real', days: '12–20', price: 25 },
];

const SIZES: CropOption[] = [
  { id: 'shoulders', price: 3 },
  { id: 'half', price: 5 },
  { id: 'full', price: 10 },
];

const LOOKS: LookOption[] = [
  { id: 'draft', price: 3 },
  { id: 'lineart', price: 6 },
  { id: 'clean', price: 9 },
  { id: 'rendered', price: 12 },
];

const BACKGROUNDS: BackgroundOption[] = [
  { id: 'simple', price: 3 },
  { id: 'detailed', price: 10 },
];

const OBJECTS_OF_INTEREST: ObjectOption[] = [
  { id: 'small', price: 2 },
  { id: 'medium', price: 4 },
  { id: 'big', price: 8 },
];

const USD_TO_MXN = 17;
const usd = (n: number): string => `$${n}`;
const mxn = (n: number): string => `$${n * USD_TO_MXN}`;

// The included region of a full figure, as a fraction of its height, per crop.
const CROP_FRACTION: Record<SizeCrop, number> = { shoulders: 0.34, half: 0.62, full: 1 };

/** Tiny figure that shades the part of the body a given size includes. */
function SizeFigure({ crop }: { crop: SizeCrop }) {
  const cutY = 100 * CROP_FRACTION[crop];
  return (
    <svg className="jc-fig" viewBox="0 0 60 100" aria-hidden="true">
      <g className="jc-fig-body">
        <circle cx="30" cy="16" r="11" />
        <path d="M14 44c0-9 7-15 16-15s16 6 16 15v18H14z" />
        <rect x="18" y="60" width="24" height="38" rx="6" />
      </g>
      {/* Fade the part NOT included by this size */}
      {crop !== 'full' && <rect className="jc-fig-cut" x="0" y={cutY} width="60" height={100 - cutY} />}
      {crop !== 'full' && (
        <line className="jc-fig-line" x1="2" y1={cutY} x2="58" y2={cutY} strokeDasharray="4 4" />
      )}
    </svg>
  );
}

export function SpeckuCommissionsPage() {
  const { theme } = useTheme();
  const { t } = useLang();

  // Mandatory steps
  const [styleId, setStyleId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [lookId, setLookId] = useState<string | null>(null);

  // Optional sections (toggled)
  const [hasBackground, setHasBackground] = useState(false);
  const [backgroundId, setBackgroundId] = useState<'simple' | 'detailed'>('simple');

  const [hasObjects, setHasObjects] = useState(false);
  const [objectId, setObjectId] = useState<'small' | 'medium' | 'big'>('small');

  const [hasAdditionalPeople, setHasAdditionalPeople] = useState(false);
  const [additionalPeopleCount, setAdditionalPeopleCount] = useState(1);

  // Clipboard & preview state
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [recopied, setRecopied] = useState(false);

  // Binary style sample artworks retrieved dynamically from Firebase RTDB with instant synchronous cache hydration
  const [styleSamples, setStyleSamples] = useState<Record<string, string>>(() =>
    SpeckuGalleryService.GetCachedSampleMap()
  );

  useEffect(() => {
    const unsubscribe = SpeckuGalleryService.Subscribe((response) => {
      if (response.Result && response.Result.length > 0) {
        const sampleMap: Record<string, string> = {};
        response.Result.forEach((item) => {
          if (item.Key && item.ImageBinary) {
            sampleMap[item.Key] = item.ImageBinary;
          }
        });
        setStyleSamples(sampleMap);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const style = STYLES.find((s) => s.id === styleId) ?? null;
  const size = SIZES.find((s) => s.id === sizeId) ?? null;
  const look = LOOKS.find((l) => l.id === lookId) ?? null;

  const background = BACKGROUNDS.find((b) => b.id === backgroundId) ?? null;
  const objectOption = OBJECTS_OF_INTEREST.find((o) => o.id === objectId) ?? null;

  // Pricing calculations
  const baseCost = (style?.price ?? 0) + (size?.price ?? 0) + (look?.price ?? 0);
  const backgroundCost = hasBackground && background ? background.price : 0;
  const objectCost = hasObjects && objectOption ? objectOption.price : 0;

  // 40% of base cost per additional person
  const additionalPersonUnit = Math.round(baseCost * 0.4);
  const additionalPeopleCost =
    hasAdditionalPeople && additionalPeopleCount > 0 ? additionalPersonUnit * additionalPeopleCount : 0;

  const total = baseCost + backgroundCost + objectCost + additionalPeopleCost;
  const complete = !!style && !!size && !!look;

  const handleGenerateQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!complete || !style || !size || !look) {
      return;
    }

    const items: { category: string; label: string; price: number }[] = [
      { category: t('specku.line.style'), label: style.name, price: style.price },
      { category: t('specku.line.size'), label: t(`specku.size.${size.id}`), price: size.price },
      { category: t('specku.line.look'), label: t(`specku.look.${look.id}`), price: look.price },
    ];

    if (hasBackground && background) {
      items.push({
        category: t('specku.line.bg'),
        label: t(`specku.bg.${background.id}`),
        price: background.price,
      });
    }

    if (hasObjects && objectOption) {
      items.push({
        category: t('specku.line.obj'),
        label: t(`specku.obj.${objectOption.id}`),
        price: objectOption.price,
      });
    }

    if (hasAdditionalPeople && additionalPeopleCount > 0) {
      const labelText = `${additionalPeopleCount} ${
        additionalPeopleCount === 1 ? t('specku.people.singular') : t('specku.people.plural')
      } (+40%)`;
      items.push({
        category: t('specku.line.people'),
        label: labelText,
        price: additionalPeopleCost,
      });
    }

    const message = buildDiscordCommissionMessage({
      greeting: t('specku.discord.msg.greeting'),
      items,
      totalUsd: total,
      totalMxn: total * USD_TO_MXN,
    });

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

  const handleSendDiscord = () => {
    if (copiedMessage && navigator.clipboard) {
      navigator.clipboard.writeText(copiedMessage).catch(() => {});
    }
  };

  return (
    <div className="specku-comm" data-theme={theme}>
      <div className="jc-topbar">
        <LumivoxBrand />
        <div className="jc-topbar-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <header className="jc-hero">
        <h1>{t('specku.title')}</h1>
        <p>
          {t('specku.subtitle.prefix')}{' '}
          <Link to="/home/specku/galeria" className="jc-gallery-link">
            {t('specku.subtitle.link')}
          </Link>
        </p>
      </header>

      {/* Step 1 — style */}
      <section className="jc-step">
        <h2>
          <span className="jc-num">1</span> {t('specku.step.style')}
        </h2>
        <div className="jc-style-grid">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`jc-card jc-style-card${styleId === s.id ? ' selected' : ''}`}
              aria-pressed={styleId === s.id}
              onClick={() => {
                setStyleId(s.id);
                setCopied(false);
              }}
            >
              <div className="jc-style-info">
                <span className="jc-style-name">{s.name}</span>
                <span className="jc-style-days">
                  {s.days} {t('common.days')}
                </span>
                <span className="jc-price">{usd(s.price)}</span>
              </div>
              <div
                className={`jc-style-art${styleSamples[s.id] ? ' jc-style-art--sample' : ''}`}
                style={
                  styleSamples[s.id]
                    ? { ['--jc-style-sample' as string]: `url(${styleSamples[s.id]})` }
                    : undefined
                }
                {...(styleSamples[s.id]
                  ? {
                      role: 'img' as const,
                      'aria-label': `${s.name} — commission style example`,
                    }
                  : {})}
              >
                {!styleSamples[s.id] ? <LumivoxLoadingCircle size={28} /> : null}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 — size */}
      <section className="jc-step">
        <h2>
          <span className="jc-num">2</span> {t('specku.step.size')}
        </h2>
        <div className="jc-size-row">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`jc-card jc-size-card${sizeId === s.id ? ' selected' : ''}`}
              aria-pressed={sizeId === s.id}
              onClick={() => {
                setSizeId(s.id);
                setCopied(false);
              }}
            >
              <SizeFigure crop={s.id} />
              <span className="jc-size-name">{t(`specku.size.${s.id}`)}</span>
              <span className="jc-size-desc">{t(`specku.size.${s.id}.desc`)}</span>
              <span className="jc-price">{usd(s.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 3 — look */}
      <section className="jc-step">
        <h2>
          <span className="jc-num">3</span> {t('specku.step.look')}
        </h2>
        <div className="jc-look-row">
          {LOOKS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`jc-card jc-look-card${lookId === l.id ? ' selected' : ''}`}
              aria-pressed={lookId === l.id}
              onClick={() => {
                setLookId(l.id);
                setCopied(false);
              }}
            >
              <span className="jc-look-name">{t(`specku.look.${l.id}`)}</span>
              <span className="jc-look-desc">{t(`specku.look.${l.id}.desc`)}</span>
              <span className="jc-price">{usd(l.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Optional Extras (Toggleable sections) */}
      <section className="jc-step jc-extras-step">
        <h2>
          <span className="jc-num">+</span> {t('specku.extras.title')}
        </h2>
        <p className="jc-step-desc">{t('specku.extras.subtitle')}</p>

        <div className="jc-extras-grid">
          {/* Backgrounds */}
          <div className={`jc-extra-card${hasBackground ? ' is-active' : ''}`}>
            <div className="jc-extra-header">
              <div className="jc-extra-title-group">
                <span className="jc-extra-badge">{t('specku.bg.title')}</span>
                <label htmlFor="toggle-bg" className="jc-extra-question">
                  {t('specku.bg.question')}
                </label>
              </div>
              <label className="jc-switch" aria-label={t('specku.bg.question')}>
                <input
                  id="toggle-bg"
                  type="checkbox"
                  checked={hasBackground}
                  onChange={(e) => {
                    setHasBackground(e.target.checked);
                    setCopied(false);
                  }}
                />
                <span className="jc-slider" />
              </label>
            </div>

            {hasBackground && (
              <div className="jc-extra-options jc-bg-options">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    className={`jc-card jc-extra-option-btn${backgroundId === bg.id ? ' selected' : ''}`}
                    aria-pressed={backgroundId === bg.id}
                    onClick={() => {
                      setBackgroundId(bg.id);
                      setCopied(false);
                    }}
                  >
                    <span className="jc-extra-opt-name">{t(`specku.bg.${bg.id}`)}</span>
                    <span className="jc-extra-opt-desc">{t(`specku.bg.${bg.id}.desc`)}</span>
                    <span className="jc-price">{usd(bg.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Objects of interest */}
          <div className={`jc-extra-card${hasObjects ? ' is-active' : ''}`}>
            <div className="jc-extra-header">
              <div className="jc-extra-title-group">
                <span className="jc-extra-badge">{t('specku.obj.title')}</span>
                <label htmlFor="toggle-obj" className="jc-extra-question">
                  {t('specku.obj.question')}
                </label>
              </div>
              <label className="jc-switch" aria-label={t('specku.obj.question')}>
                <input
                  id="toggle-obj"
                  type="checkbox"
                  checked={hasObjects}
                  onChange={(e) => {
                    setHasObjects(e.target.checked);
                    setCopied(false);
                  }}
                />
                <span className="jc-slider" />
              </label>
            </div>

            {hasObjects && (
              <div className="jc-extra-options jc-obj-options">
                {OBJECTS_OF_INTEREST.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    className={`jc-card jc-extra-option-btn${objectId === obj.id ? ' selected' : ''}`}
                    aria-pressed={objectId === obj.id}
                    onClick={() => {
                      setObjectId(obj.id);
                      setCopied(false);
                    }}
                  >
                    <span className="jc-extra-opt-name">{t(`specku.obj.${obj.id}`)}</span>
                    <span className="jc-extra-opt-desc">{t(`specku.obj.${obj.id}.desc`)}</span>
                    <span className="jc-price">{usd(obj.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Additional people */}
          <div className={`jc-extra-card${hasAdditionalPeople ? ' is-active' : ''}`}>
            <div className="jc-extra-header">
              <div className="jc-extra-title-group">
                <span className="jc-extra-badge">{t('specku.people.title')}</span>
                <label htmlFor="toggle-people" className="jc-extra-question">
                  {t('specku.people.question')}
                </label>
              </div>
              <label className="jc-switch" aria-label={t('specku.people.question')}>
                <input
                  id="toggle-people"
                  type="checkbox"
                  checked={hasAdditionalPeople}
                  onChange={(e) => {
                    setHasAdditionalPeople(e.target.checked);
                    setCopied(false);
                  }}
                />
                <span className="jc-slider" />
              </label>
            </div>

            {hasAdditionalPeople && (
              <div className="jc-extra-people-body">
                <p className="jc-extra-people-note">{t('specku.people.desc')}</p>
                <div className="jc-people-stepper">
                  <span className="jc-people-stepper-label">{t('specku.people.count')}:</span>
                  <div className="jc-stepper-controls">
                    <button
                      type="button"
                      className="jc-stepper-btn"
                      onClick={() => {
                        if (additionalPeopleCount > 1) {
                          setAdditionalPeopleCount(additionalPeopleCount - 1);
                          setCopied(false);
                        }
                      }}
                      disabled={additionalPeopleCount <= 1}
                      aria-label="Decrease additional people"
                    >
                      −
                    </button>
                    <span className="jc-stepper-value">{additionalPeopleCount}</span>
                    <button
                      type="button"
                      className="jc-stepper-btn"
                      onClick={() => {
                        if (additionalPeopleCount < 10) {
                          setAdditionalPeopleCount(additionalPeopleCount + 1);
                          setCopied(false);
                        }
                      }}
                      disabled={additionalPeopleCount >= 10}
                      aria-label="Increase additional people"
                    >
                      +
                    </button>
                  </div>
                  <div className="jc-people-stepper-price">
                    <span className="jc-price">+{usd(additionalPeopleCost)}</span>
                    {complete && (
                      <span className="jc-people-unit-hint">
                        ({usd(additionalPersonUnit)} / {t('specku.people.singular')})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="jc-summary" aria-live="polite">
        <h2>{t('specku.summary')}</h2>
        <ul className="jc-lines">
          <li>
            <span className="jc-line-step">{t('specku.line.style')}</span>
            <span className="jc-line-pick">{style ? style.name : '—'}</span>
            <span className="jc-line-price">{style ? usd(style.price) : '$0'}</span>
          </li>
          <li>
            <span className="jc-line-step">{t('specku.line.size')}</span>
            <span className="jc-line-pick">{size ? t(`specku.size.${size.id}`) : '—'}</span>
            <span className="jc-line-price">{size ? usd(size.price) : '$0'}</span>
          </li>
          <li>
            <span className="jc-line-step">{t('specku.line.look')}</span>
            <span className="jc-line-pick">{look ? t(`specku.look.${look.id}`) : '—'}</span>
            <span className="jc-line-price">{look ? usd(look.price) : '$0'}</span>
          </li>
          {hasBackground && background && (
            <li className="jc-line-extra">
              <span className="jc-line-step">{t('specku.line.bg')}</span>
              <span className="jc-line-pick">{t(`specku.bg.${background.id}`)}</span>
              <span className="jc-line-price">{usd(background.price)}</span>
            </li>
          )}
          {hasObjects && objectOption && (
            <li className="jc-line-extra">
              <span className="jc-line-step">{t('specku.line.obj')}</span>
              <span className="jc-line-pick">{t(`specku.obj.${objectOption.id}`)}</span>
              <span className="jc-line-price">{usd(objectOption.price)}</span>
            </li>
          )}
          {hasAdditionalPeople && additionalPeopleCount > 0 && (
            <li className="jc-line-extra">
              <span className="jc-line-step">{t('specku.line.people')}</span>
              <span className="jc-line-pick">
                {additionalPeopleCount}{' '}
                {additionalPeopleCount === 1 ? t('specku.people.singular') : t('specku.people.plural')} (+40%)
              </span>
              <span className="jc-line-price">{usd(additionalPeopleCost)}</span>
            </li>
          )}
        </ul>

        <div className="jc-total">
          <div className="jc-total-usd">
            <span>{t('specku.total')}</span>
            <strong>{usd(total)} USD</strong>
          </div>
          <div className="jc-total-mxn">
            <span>{t('specku.mxn')}</span>
            <strong>{mxn(total)} MXN</strong>
          </div>
        </div>

        {!complete && <p className="jc-hint">{t('specku.hint')}</p>}

        <div className="jc-discord-action">
          <button
            type="button"
            className={`jc-discord-btn${!complete ? ' is-disabled' : ''}`}
            onClick={handleGenerateQuote}
            disabled={!complete}
            aria-disabled={!complete}
          >
            <svg
              className="jc-discord-icon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>{t('specku.discord.action')}</span>
          </button>

          {copied && copiedMessage && (
            <div className="jc-discord-feedback" role="status">
              <div className="jc-discord-feedback-main">
                <span className="jc-discord-feedback-check">✓</span>
                <div className="jc-discord-feedback-text">
                  <strong>{t('specku.discord.copied.title')}</strong>
                  <p>{t('specku.discord.copied.desc')}</p>
                </div>
              </div>

              <div className="jc-discord-preview">
                <span className="jc-discord-preview-label">{t('specku.discord.copied.preview')}</span>
                <pre className="jc-discord-preview-box">{copiedMessage}</pre>
                <div className="jc-discord-preview-actions">
                  <button
                    type="button"
                    className="jc-discord-recopy-btn"
                    onClick={handleRecopy}
                  >
                    {recopied ? '✓' : '📋'}{' '}
                    {recopied ? t('specku.discord.copied.copied') : t('specku.discord.copied.recopy')}
                  </button>

                  <a
                    href={SPECKU_DISCORD_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jc-discord-send-btn"
                    onClick={handleSendDiscord}
                  >
                    <svg
                      className="jc-discord-send-icon"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <span>{t('specku.discord.send')}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <footer className="jc-footer">
        <p className="jc-footer-terms">
          {t('specku.footer.prefix')}{' '}
          <Link to="/home/specku/terminos" className="jc-terms-link">
            {t('specku.footer.termsLink')}
          </Link>
          {t('specku.footer.suffix')}
        </p>
      </footer>
    </div>
  );
}

// Backward compatibility export
export { SpeckuCommissionsPage as JozCommissionsPage };
