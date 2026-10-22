// Lumivox day/night logo marks, shared by the homepage and the page transition.

export type Theme = 'day' | 'night';
export const THEME_KEY = 'lumivox-theme';

/** Read the persisted theme, falling back to the OS preference. */
export function readTheme(): Theme {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    if (saved === 'day' || saved === 'night') return saved;
  } catch {
    // Safe fallback
  }
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

// Sun rays: 30° apart; outer ring deep red, inner ring coral. (From the brand guide.)
const RAYS = [
  { x1: 65, y1: 50, x2: 84, y2: 50, c: '#8D3E2E' },
  { x1: 57.5, y1: 62.99, x2: 67, y2: 79.44, c: '#8D3E2E' },
  { x1: 42.5, y1: 62.99, x2: 33, y2: 79.44, c: '#8D3E2E' },
  { x1: 35, y1: 50, x2: 16, y2: 50, c: '#8D3E2E' },
  { x1: 42.5, y1: 37.01, x2: 33, y2: 20.56, c: '#8D3E2E' },
  { x1: 57.5, y1: 37.01, x2: 67, y2: 20.56, c: '#8D3E2E' },
  { x1: 62.99, y1: 57.5, x2: 79.44, y2: 67, c: '#E07A6F' },
  { x1: 50, y1: 65, x2: 50, y2: 84, c: '#E07A6F' },
  { x1: 37.01, y1: 57.5, x2: 20.56, y2: 67, c: '#E07A6F' },
  { x1: 37.01, y1: 42.5, x2: 20.56, y2: 33, c: '#E07A6F' },
  { x1: 50, y1: 35, x2: 50, y2: 16, c: '#E07A6F' },
  { x1: 62.99, y1: 42.5, x2: 79.44, y2: 33, c: '#E07A6F' },
];

const STARS = [
  { cx: 20, cy: 22, r: 1.6, o: 0.7 },
  { cx: 82, cy: 28, r: 2, o: 0.75 },
  { cx: 76, cy: 74, r: 1.5, o: 0.6 },
  { cx: 24, cy: 68, r: 1.4, o: 0.6 },
];

export function DayMark() {
  return (
    <svg className="mark-day" viewBox="0 0 100 100" aria-hidden="true">
      <g className="rays" strokeLinecap="round" strokeWidth="5" fill="none">
        {RAYS.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={r.c} />
        ))}
      </g>
      <rect x="40" y="40" width="20" height="20" rx="6" fill="#E5A63B" />
      <circle cx="50" cy="50" r="4" fill="#FFE500" />
    </svg>
  );
}

export function NightMark({ stars = false }: { stars?: boolean }) {
  return (
    <svg className="mark-night" viewBox="0 0 100 100" aria-hidden="true">
      {stars &&
        STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#F4EFE6" opacity={s.o} />
        ))}
      <path
        d="M30 30 L50 78 L70 30"
        fill="none"
        stroke="#FFE500"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="dot" cx="50" cy="34" r="8" fill="#FF007F" />
    </svg>
  );
}
