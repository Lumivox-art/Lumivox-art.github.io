import { useState } from 'react';
import type { SunlightSampleBase } from '../../models/Sunlight';
import { LumivoxDbImage } from '../LumivoxDbImage';
import './VinylCoverCard.scss';

interface VinylCoverCardProps {
  sample: SunlightSampleBase;
  isSelected?: boolean;
  onSelect?: () => void;
  onZoom?: (sample: SunlightSampleBase) => void;
}

export function VinylCoverCard({
  sample,
  isSelected = false,
  onSelect,
  onZoom,
}: VinylCoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`vinyl-cover-card ${isSelected ? 'is-selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {/* Vinyl Sleeve & Slipping Record */}
      <div className="sleeve-container">
        {/* Sliding Vinyl Record */}
        <div className={`vinyl-disc ${isHovered || isSelected ? 'is-slid-out' : ''}`}>
          <div className="vinyl-groove groove-1" />
          <div className="vinyl-groove groove-2" />
          <div className="vinyl-groove groove-3" />
          <div className="vinyl-center-label">
            <span className="vinyl-label-text">SUNLIGHT</span>
            <span className="vinyl-rpm">33 RPM</span>
          </div>
          <div className="vinyl-spindle-hole" />
        </div>

        {/* 12" Album Jacket Sleeve */}
        <div className="album-jacket">
          <div className="cellophane-shine" />
          <LumivoxDbImage
            src={sample.ImageBinary || sample.MediaUrl}
            alt={sample.Title}
            circleSize={48}
            className="jacket-art"
          />

          {/* Retro Badges */}
          <div className="jacket-overlay-badges">
            <span className="badge-stereo">STEREO</span>
            {sample.ReleaseYear && (
              <span className="badge-year">{sample.ReleaseYear}</span>
            )}
          </div>

          {/* Quick Zoom Pill */}
          <button
            type="button"
            className="jacket-zoom-btn"
            onClick={(e) => {
              e.stopPropagation();
              onZoom?.(sample);
            }}
            title="Zoom Cover"
            aria-label="Zoom Cover"
          >
            🔍 Zoom
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="vinyl-card-meta">
        <h3 className="meta-title">{sample.Title}</h3>
        {sample.Vibe && <span className="meta-vibe">{sample.Vibe}</span>}
        <div className="meta-price-row">
          <span className="price-usd">${sample.PriceUsd} USD</span>
          <span className="price-mxn">~${sample.PriceMxn} MXN</span>
        </div>
      </div>
    </div>
  );
}
