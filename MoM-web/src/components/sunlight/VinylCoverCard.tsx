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
      aria-pressed={isSelected}
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

          {/* Quick Zoom Pill (No emojis) */}
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
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Zoom</span>
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="vinyl-card-meta">
        <h3 className="meta-title">{sample.Title}</h3>
        <div className="meta-price-row">
          <span className="price-usd">${sample.PriceUsd} USD</span>
          <span className="price-mxn">~${sample.PriceMxn} MXN</span>
        </div>
      </div>
    </div>
  );
}
