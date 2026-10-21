import { DayMark, NightMark } from './LumivoxLogo';
import { useTheme } from './ThemeContext';
import './LumivoxLoadingCircle.scss';

interface LumivoxLoadingCircleProps {
  size?: number | string;
  className?: string;
  ariaLabel?: string;
}

export function LumivoxLoadingCircle({
  size = 48,
  className = '',
  ariaLabel = 'Cargando...',
}: LumivoxLoadingCircleProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`lvx-loading-circle-wrapper ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="lvx-loading-circle-mark">
        {theme === 'night' ? <NightMark /> : <DayMark />}
      </div>
    </div>
  );
}
