import { useState, useEffect, useRef } from 'react';
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
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setHasError(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  if (hasError) {
    return <ConnectionFailurePlaceholder compact={compactError} />;
  }

  // Data URLs are already local in memory; use eager decoding to eliminate layout flash
  const effectiveLoading = src?.startsWith('data:') ? 'eager' : loading;

  return (
    <div className={`lvx-db-image-container ${className}`.trim()} style={style}>
      {(!src || !isLoaded) && (
        <div className="lvx-db-image-loader">
          <LumivoxLoadingCircle size={circleSize} />
        </div>
      )}
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={effectiveLoading}
          className={`lvx-db-img ${isLoaded ? 'is-loaded' : 'is-loading'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
