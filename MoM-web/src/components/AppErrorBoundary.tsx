import { Component, type ErrorInfo, type ReactNode } from 'react';
import { DayMark, NightMark } from './LumivoxLogo';
import './AppErrorBoundary.scss';

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isChunkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    const message = error.message || '';
    const name = error.name || '';
    const isChunk =
      name === 'ChunkLoadError' ||
      message.includes('Loading chunk') ||
      message.includes('dynamically imported module') ||
      message.includes('Failed to fetch') ||
      message.includes('error loading dynamically imported module');

    return {
      hasError: true,
      error,
      isChunkError: isChunk,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Lumivox] Uncaught exception intercepted by AppErrorBoundary:', error, errorInfo);

    if (this.state.isChunkError) {
      const lockKey = 'lvx_boundary_reload_lock';
      if (!sessionStorage.getItem(lockKey)) {
        try {
          sessionStorage.setItem(lockKey, 'true');
        } catch {
          // safe
        }
        window.location.reload();
      }
    }
  }

  handleReload = (): void => {
    try {
      sessionStorage.removeItem('lvx_boundary_reload_lock');
      sessionStorage.removeItem('lvx_chunk_reload_lock');
    } catch {
      // safe
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const currentTheme =
        typeof document !== 'undefined'
          ? (document.documentElement.getAttribute('data-theme') ?? 'day')
          : 'day';

      return (
        <main className="lvx-boundary-screen" data-theme={currentTheme}>
          <div className="lvx-boundary-card" role="alert" aria-live="assertive">
            <div className="lvx-boundary-mark" aria-hidden="true">
              {currentTheme === 'night' ? <NightMark /> : <DayMark />}
            </div>
            <h1 className="lvx-boundary-title">Sesión restablecida</h1>
            <p className="lvx-boundary-message">
              La conexión se pausó tras un período de inactividad. Puedes continuar recargando la página.
            </p>
            <button
              type="button"
              className="lvx-boundary-btn"
              onClick={this.handleReload}
            >
              Recargar página
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
