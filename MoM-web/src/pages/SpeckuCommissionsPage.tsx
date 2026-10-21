import { useState } from 'react';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import {
  SPECKU_DISCORD_PROFILE_URL,
  buildDiscordCommissionMessage,
} from '../utils/discordMessage';
import './SpeckuCommissions.scss';

// Functional commission quote builder for Specku.
// Pick one option per step (style + size + look); the total updates live.
// Total is shown in USD and in MXN at a fixed 1 USD = 19 MXN rate.
// Labels are localized via the i18n layer (size/look names live in the dictionary
// keyed by id; style names are proper names and stay as-is).

type StyleOption = { id: string; name: string; days: string; price: number };
type SizeCrop = 'shoulders' | 'half' | 'full';
type CropOption = { id: SizeCrop; price: number };
type LookOption = { id: string; price: number };

const STYLES: StyleOption[] = [
  { id: 'cutsey', name: 'Cutsey', days: '3–5', price: 4 },
  { id: 'chibi', name: 'Chibi+', days: '5–7', price: 7 },
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

const USD_TO_MXN = 19;
const usd = (n: number): string => `$${n}`;
const mxn = (n: number): string => `$${n * USD_TO_MXN}`;

/** Style sample art — keyed by STYLES[].id when a figure file exists. */
const STYLE_SAMPLE_IMAGES: Partial<Record<string, string>> = {
  cutsey: '/lumivox-media/joph-cutsey.webp',
  chibi: '/lumivox-media/joph-chibi.webp',
  noodle: '/lumivox-media/joph-noodle.webp',
  'dull-eyes': '/lumivox-media/joph-dull-eyes.webp',
  anima: '/lumivox-media/joph-anima.webp',
  'semi-real': '/lumivox-media/joph-semi-real.webp',
};

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
  const [styleId, setStyleId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [lookId, setLookId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [recopied, setRecopied] = useState(false);

  const style = STYLES.find((s) => s.id === styleId) ?? null;
  const size = SIZES.find((s) => s.id === sizeId) ?? null;
  const look = LOOKS.find((l) => l.id === lookId) ?? null;

  const total = (style?.price ?? 0) + (size?.price ?? 0) + (look?.price ?? 0);
  const complete = !!style && !!size && !!look;

  const handleOpenDiscord = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!complete || !style || !size || !look) {
      e.preventDefault();
      return;
    }

    const message = buildDiscordCommissionMessage({
      greeting: t('specku.discord.msg.greeting'),
      items: [
        { category: t('specku.line.style'), label: style.name, price: style.price },
        { category: t('specku.line.size'), label: t(`specku.size.${size.id}`), price: size.price },
        { category: t('specku.line.look'), label: t(`specku.look.${look.id}`), price: look.price },
      ],
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
        <p>{t('specku.subtitle')}</p>
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
                className={`jc-style-art${STYLE_SAMPLE_IMAGES[s.id] ? ' jc-style-art--sample' : ''}`}
                style={
                  STYLE_SAMPLE_IMAGES[s.id]
                    ? { ['--jc-style-sample' as string]: `url(${STYLE_SAMPLE_IMAGES[s.id]})` }
                    : undefined
                }
                {...(STYLE_SAMPLE_IMAGES[s.id]
                  ? {
                      role: 'img' as const,
                      'aria-label': `${s.name} — commission style example`,
                    }
                  : {})}
              >
                {!STYLE_SAMPLE_IMAGES[s.id] ? <span>{t('common.example')}</span> : null}
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
          <a
            href={complete ? SPECKU_DISCORD_PROFILE_URL : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`jc-discord-btn${!complete ? ' is-disabled' : ''}`}
            onClick={handleOpenDiscord}
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
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>{t('specku.discord.action')}</span>
          </a>

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
                <button
                  type="button"
                  className="jc-discord-recopy-btn"
                  onClick={handleRecopy}
                >
                  {recopied ? '✓' : '📋'} {t('specku.discord.copied.recopy')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Backward compatibility export
export { SpeckuCommissionsPage as JozCommissionsPage };
