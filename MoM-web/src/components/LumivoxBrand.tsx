import { useState, useRef, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DayMark, NightMark } from './LumivoxLogo';
import { useTheme } from './ThemeContext';
import './LumivoxBrand.scss';

// Brand logo that swaps the day sun ↔ night monogram with the theme (like the
// homepage) and links back to /home.
// Easter Egg: 8 rapid clicks within 4 seconds unlocks the secret intranet entrance.
export function LumivoxBrand() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const clicksRef = useRef<number[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    // Keep clicks occurring within the last 4 seconds (4000ms)
    clicksRef.current = [...clicksRef.current.filter((t) => now - t < 4000), now];

    if (clicksRef.current.length >= 8) {
      e.preventDefault();
      clicksRef.current = [];
      setIsPulsing(true);

      setTimeout(() => {
        setIsPulsing(false);
        navigate('/intranet/login');
      }, 350);
    }
  };

  return (
    <Link
      className={`lvx-brand-logo ${isPulsing ? 'is-secret-pulsing' : ''}`}
      to="/home"
      data-theme={theme}
      aria-label="Lumivox — inicio"
      onClick={handleClick}
    >
      <span className="lvx-brand-marks">
        <DayMark />
        <NightMark />
      </span>
      <span className="lvx-brand-word">lumivox</span>
    </Link>
  );
}
