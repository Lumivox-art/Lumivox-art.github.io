import { useState, useEffect } from 'react';
import { LumivoxLoadingCircle } from './LumivoxLoadingCircle';
import { ConnectionFailurePlaceholder } from './ConnectionFailurePlaceholder';
import './LumivoxDbImage.scss';

interface LumivoxDbImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  circleSize?: number;
  compactError?: boolean;
  style?: React.CSSProperties;
}

export function LumivoxDbImage({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  circleSize = 44,
  compactError = false,
  style,
}: LumivoxDbImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset state on src change
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  if (hasError) {
    return <ConnectionFailurePlaceholder compact={compactError} />;
  }

  return (
    <div className={`lvx-db-image-container ${className}`.trim()} style={style}>
      {(!src || !isLoaded) && (
        <div className="lvx-db-image-loader">
          <LumivoxLoadingCircle size={circleSize} />
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`lvx-db-img ${isLoaded ? 'is-loaded' : 'is-loading'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
