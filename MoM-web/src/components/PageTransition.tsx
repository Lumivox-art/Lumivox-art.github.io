import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DayMark, NightMark } from './LumivoxLogo';
import { useTheme } from './ThemeContext';
import './PageTransition.scss';

type Phase = 'idle' | 'cover' | 'reveal';

// Full-screen overlay that flashes the Lumivox logo (sun by day, "V" monogram
// by night) on every route change. The cover is applied in useLayoutEffect so
// it paints before the new page is ever visible (no flash), then fades out.
export function PageTransition() {
  const location = useLocation();
  const { theme } = useTheme();
  const [phase, setPhase] = useState<Phase>('idle');
  const first = useRef(true);

  // If tab was backgrounded or sleeping during navigation, ensure overlay is dismissed on wake
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setPhase('idle');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false; // no transition on initial load
      return;
    }
    setPhase('cover');
    const toReveal = setTimeout(() => setPhase('reveal'), 430);
    const toIdle = setTimeout(() => setPhase('idle'), 850);
    // Hard fallback timeout ensures overlay can never freeze the screen even under extreme CPU throttling
    const maxSafety = setTimeout(() => setPhase('idle'), 1600);
    return () => {
      clearTimeout(toReveal);
      clearTimeout(toIdle);
      clearTimeout(maxSafety);
    };
  }, [location.pathname]);

  return (
    <div className={`lvx-transition lvx-transition-${phase}`} data-theme={theme} aria-hidden="true">
      <div className="lvx-transition-mark">{theme === 'night' ? <NightMark /> : <DayMark />}</div>
    </div>
  );
}
