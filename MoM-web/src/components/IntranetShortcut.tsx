import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './IntranetShortcut.scss';

export function IntranetShortcut({ className = '' }: { className?: string }) {
  const { currentUser, artistHandle } = useAuth();
  const location = useLocation();

  if (!currentUser || location.pathname.startsWith('/intranet')) return null;

  return (
    <Link
      to="/intranet"
      className={`lvx-intranet-shortcut ${className}`}
      title="Ir a mi panel de intranet"
    >
      <span className="lvx-intranet-dot" />
      <span className="lvx-intranet-text">
        Intranet ({artistHandle || currentUser.displayName || 'Artista'})
      </span>
    </Link>
  );
}

/**
 * Floating badge mounted globally in RootLayout that guarantees the intranet user
 * can always return to their dashboard from any scrolled position on any page.
 */
export function IntranetFloatingBadge() {
  const { currentUser, artistHandle } = useAuth();
  const location = useLocation();

  if (!currentUser || location.pathname.startsWith('/intranet')) return null;

  return (
    <Link
      to="/intranet"
      className="lvx-intranet-floating-badge animate-fade-in"
      title="Volver a mi panel de Intranet"
      aria-label="Panel de Intranet"
    >
      <span className="lvx-intranet-dot" />
      <span className="lvx-intranet-floating-label">
        Intranet ({artistHandle || currentUser.displayName || 'Artista'})
      </span>
    </Link>
  );
}
