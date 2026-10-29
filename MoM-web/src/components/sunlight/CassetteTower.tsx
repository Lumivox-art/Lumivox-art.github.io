import { useState, useRef, useEffect } from 'react';
import type { SunlightCompiledCassette } from '../../models/Sunlight';
import './CassetteTower.scss';

const VISIBLE_SLOTS_CAPACITY = 10;

interface CassetteTowerProps {
  cassettes: SunlightCompiledCassette[];
  activeCassetteIndex: number;
  activeSide: 'A' | 'B';
  onSelectCassette: (index: number, side?: 'A' | 'B') => void;
}

export function CassetteTower({
  cassettes,
  activeCassetteIndex,
  activeSide,
  onSelectCassette,
}: CassetteTowerProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const stackRef = useRef<HTMLDivElement | null>(null);

  const maxOffset = Math.max(0, cassettes.length - VISIBLE_SLOTS_CAPACITY);
  const hasOverflow = cassettes.length > VISIBLE_SLOTS_CAPACITY;

  const handleScrollUp = () => {
    setScrollOffset((prev) => Math.max(0, prev - 1));
  };

  const handleScrollDown = () => {
    setScrollOffset((prev) => Math.min(maxOffset, prev + 1));
  };

  // Keep active cassette visible in viewport when tower auto-advances or loops
  useEffect(() => {
    if (!hasOverflow) return;
    if (activeCassetteIndex < scrollOffset) {
      setScrollOffset(activeCassetteIndex);
    } else if (activeCassetteIndex >= scrollOffset + VISIBLE_SLOTS_CAPACITY) {
      setScrollOffset(Math.min(maxOffset, activeCassetteIndex - VISIBLE_SLOTS_CAPACITY + 1));
    }
  }, [activeCassetteIndex, hasOverflow, maxOffset, scrollOffset]);

  // Visible window of cassettes if overflow exceeds 10
  const displayedCassettes = hasOverflow
    ? cassettes.slice(scrollOffset, scrollOffset + VISIBLE_SLOTS_CAPACITY)
    : cassettes;

  return (
    <aside className="sl-cassette-tower" aria-label="Torre de Cassettes">
      {/* Tower Top Header */}
      <div className="sl-tower-header">
        <div className="sl-tower-title-block">
          <span className="sl-tower-tag">TAPE RACK · HI-FI</span>
          <h3 className="sl-tower-heading">Torre de Cassettes</h3>
        </div>
        <span className="sl-tower-count-badge">
          {cassettes.length} {cassettes.length === 1 ? 'Cinta' : 'Cintas'}
        </span>
      </div>

      {/* Up Arrow (Visible when overflow and not at top) */}
      {hasOverflow && (
        <button
          type="button"
          className={`sl-tower-arrow-btn arrow-up ${scrollOffset === 0 ? 'is-disabled' : ''}`}
          onClick={handleScrollUp}
          disabled={scrollOffset === 0}
          title="Subir en la torre de cassettes"
          aria-label="Subir en la torre de cassettes"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span className="arrow-label">Subir en la torre</span>
        </button>
      )}

      {/* Stack of Cassette Slots (Prepared for 10 tapes) */}
      <div className="sl-tower-stack" ref={stackRef}>
        {displayedCassettes.map((tape, localIdx) => {
          const actualIdx = hasOverflow ? scrollOffset + localIdx : localIdx;
          const isActive = actualIdx === activeCassetteIndex;

          return (
            <div
              key={tape.id}
              className={`sl-tower-slot ${isActive ? 'is-loaded' : ''}`}
              onClick={() => onSelectCassette(actualIdx, 'A')}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCassette(actualIdx, 'A');
                }
              }}
            >
              {/* Tape Spine Case */}
              <div className="sl-spine-case">
                <div className="sl-spine-header">
                  <span className="sl-spine-num">
                    {String(tape.tapeNumber).padStart(2, '0')}
                  </span>
                  <span className="sl-spine-status">
                    {isActive ? 'EN DECK' : 'SLOT'}
                  </span>
                </div>

                {/* Spine Label Content */}
                <div className="sl-spine-info">
                  <span className="sl-spine-title">{tape.title}</span>
                  <div className="sl-spine-tracks">
                    <span
                      className={`sl-track-chip ${isActive && activeSide === 'A' ? 'is-side-active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCassette(actualIdx, 'A');
                      }}
                      title={`Lado A: ${tape.sideA.Title}`}
                    >
                      A: {tape.sideA.Title}
                    </span>

                    {tape.sideB && (
                      <span
                        className={`sl-track-chip ${isActive && activeSide === 'B' ? 'is-side-active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCassette(actualIdx, 'B');
                        }}
                        title={`Lado B: ${tape.sideB.Title}`}
                      >
                        B: {tape.sideB.Title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Spine Texture Details */}
                <div className="sl-spine-teeth">
                  <span />
                  <span />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Down Arrow (Visible when overflow and not at bottom) */}
      {hasOverflow && (
        <button
          type="button"
          className={`sl-tower-arrow-btn arrow-down ${scrollOffset >= maxOffset ? 'is-disabled' : ''}`}
          onClick={handleScrollDown}
          disabled={scrollOffset >= maxOffset}
          title="Bajar en la torre de cassettes"
          aria-label="Bajar en la torre de cassettes"
        >
          <span className="arrow-label">Bajar en la torre</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </aside>
  );
}
