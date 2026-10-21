import './ConnectionFailurePlaceholder.scss';

export const CONNECTION_FAILURE_SVG_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#1a1c23" rx="8"/>
      <g fill="none" stroke="#e07a6f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(140, 55)">
        <path d="M1 1l38 38"/>
        <path d="M33 13A16 16 0 0 0 7 20a11 11 0 0 0 2 22h22a12 12 0 0 0 9-7"/>
      </g>
      <text x="160" y="135" fill="#f5e6d3" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">
        Fallo de conexión
      </text>
      <text x="160" y="158" fill="#a09085" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle">
        No se pudo conectar a la base de datos
      </text>
    </svg>`
  );

interface ConnectionFailurePlaceholderProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ConnectionFailurePlaceholder({
  message = 'Fallo de conexión a la base de datos',
  onRetry,
  compact = false,
}: ConnectionFailurePlaceholderProps) {
  return (
    <div
      className={`lvx-connection-error${compact ? ' lvx-connection-error--compact' : ''}`}
      role="alert"
    >
      <div className="lvx-connection-error-icon" aria-hidden="true">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 6l36 36" />
          <path d="M38.5 16.5A18 18 0 0 0 10 24a14 14 0 0 0 3 24h24a15 15 0 0 0 13-10" />
        </svg>
      </div>
      <p className="lvx-connection-error-text">{message}</p>
      {onRetry && (
        <button type="button" className="lvx-connection-error-retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
