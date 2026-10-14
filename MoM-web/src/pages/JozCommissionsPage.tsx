import { useState } from 'react';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import './JozCommissions.scss';

// Functional commission quote builder for Joz.
// Pick one option per step (style + size + look); the total updates live.
// Total is shown in USD and in MXN at a fixed 1 USD = 20 MXN rate.
// Labels are localized via the i18n layer (size/look names live in the dictionary
// keyed by id; style names are proper names and stay as-is).

type StyleOption = { id: string; name: string; days: string; price: number };
type SizeCrop = 'shoulders' | 'half' | 'full';
type CropOption = { id: SizeCrop; price: number };
type LookOption = { id: string; price: number };

const STYLES: StyleOption[] = [
  { id: 'cutsey', name: 'Cutsey', days: '3–5', price: 3 },
  { id: 'chibi', name: 'Chibi+', days: '5–7', price: 7 },
  { id: 'fiddle', name: 'Fiddle', days: '3–5', price: 7 },
  { id: 'dull-eyes', name: 'Dull-Eyes', days: '3–7', price: 10 },
  { id: 'anima', name: 'Anima', days: '7–15', price: 18 },
  { id: 'semi-real', name: 'Semi-Real', days: '12–20', price: 22 },
];

const SIZES: CropOption[] = [
  { id: 'shoulders', price: 2 },
  { id: 'half', price: 4 },
  { id: 'full', price: 8 },
];

const LOOKS: LookOption[] = [
  { id: 'draft', price: 2 },
  { id: 'lineart', price: 6 },
  { id: 'clean', price: 7 },
  { id: 'rendered', price: 10 },
];

const USD_TO_MXN = 20;
const usd = (n: number): string => `$${n}`;
const mxn = (n: number): string => `$${n * USD_TO_MXN}`;

/** Style sample art — keyed by STYLES[].id when a figure file exists. */
const STYLE_SAMPLE_IMAGES: Partial<Record<string, string>> = {
  cutsey: '/lumivox-media/joph-cutsey.webp',
  chibi: '/lumivox-media/joph-chibi.webp',
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

export function JozCommissionsPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const [styleId, setStyleId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [lookId, setLookId] = useState<string | null>(null);

  const style = STYLES.find((s) => s.id === styleId) ?? null;
  const size = SIZES.find((s) => s.id === sizeId) ?? null;
  const look = LOOKS.find((l) => l.id === lookId) ?? null;

  const total = (style?.price ?? 0) + (size?.price ?? 0) + (look?.price ?? 0);
  const complete = !!style && !!size && !!look;

  return (
    <div className="joz-comm" data-theme={theme}>
      <div className="jc-topbar">
        <LumivoxBrand />
        <div className="jc-topbar-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <header className="jc-hero">
        <h1>{t('joz.title')}</h1>
        <p>{t('joz.subtitle')}</p>
      </header>

      {/* Step 1 — style */}
      <section className="jc-step">
        <h2>
          <span className="jc-num">1</span> {t('joz.step.style')}
        </h2>
        <div className="jc-style-grid">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`jc-card jc-style-card${styleId === s.id ? ' selected' : ''}`}
              aria-pressed={styleId === s.id}
              onClick={() => setStyleId(s.id)}
            >
              <div className="jc-style-info">
                <span className="jc-style-name">{s.name}</span>
                <span className="jc-style-days">
                  {s.days} {t('common.days')}
                </span>
                <span className="jc-price">{usd(s.price)}</span>
              </div>
              <div className="jc-style-art">
                {STYLE_SAMPLE_IMAGES[s.id] ? (
                  <img
                    src={STYLE_SAMPLE_IMAGES[s.id]}
                    alt={`${s.name} — commission style example`}
                  />
                ) : (
                  <span>{t('common.example')}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 — size */}
      <section className="jc-step">
        <h2>
          <span className="jc-num">2</span> {t('joz.step.size')}
        </h2>
        <div className="jc-size-row">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`jc-card jc-size-card${sizeId === s.id ? ' selected' : ''}`}
              aria-pressed={sizeId === s.id}
              onClick={() => setSizeId(s.id)}
            >
              <SizeFigure crop={s.id} />
              <span className="jc-size-name">{t(`joz.size.${s.id}`)}</span>
              <span className="jc-size-desc">{t(`joz.size.${s.id}.desc`)}</span>
              <span className="jc-price">{usd(s.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 3 — look */}
      <section className="jc-step">
        <h2>
          <span className="jc-num">3</span> {t('joz.step.look')}
        </h2>
        <div className="jc-look-row">
          {LOOKS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`jc-card jc-look-card${lookId === l.id ? ' selected' : ''}`}
              aria-pressed={lookId === l.id}
              onClick={() => setLookId(l.id)}
            >
              <span className="jc-look-name">{t(`joz.look.${l.id}`)}</span>
              <span className="jc-look-desc">{t(`joz.look.${l.id}.desc`)}</span>
              <span className="jc-price">{usd(l.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="jc-summary" aria-live="polite">
        <h2>{t('joz.summary')}</h2>
        <ul className="jc-lines">
          <li>
            <span className="jc-line-step">{t('joz.line.style')}</span>
            <span className="jc-line-pick">{style ? style.name : '—'}</span>
            <span className="jc-line-price">{style ? usd(style.price) : '$0'}</span>
          </li>
          <li>
            <span className="jc-line-step">{t('joz.line.size')}</span>
            <span className="jc-line-pick">{size ? t(`joz.size.${size.id}`) : '—'}</span>
            <span className="jc-line-price">{size ? usd(size.price) : '$0'}</span>
          </li>
          <li>
            <span className="jc-line-step">{t('joz.line.look')}</span>
            <span className="jc-line-pick">{look ? t(`joz.look.${look.id}`) : '—'}</span>
            <span className="jc-line-price">{look ? usd(look.price) : '$0'}</span>
          </li>
        </ul>

        <div className="jc-total">
          <div className="jc-total-usd">
            <span>{t('joz.total')}</span>
            <strong>{usd(total)} USD</strong>
          </div>
          <div className="jc-total-mxn">
            <span>{t('joz.mxn')}</span>
            <strong>{mxn(total)} MXN</strong>
          </div>
        </div>

        {!complete && <p className="jc-hint">{t('joz.hint')}</p>}
      </section>
    </div>
  );
}
