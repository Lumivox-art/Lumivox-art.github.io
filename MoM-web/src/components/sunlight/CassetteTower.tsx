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

      {/* Stack of Cassette Jewel Cases (Prepared for 10 tapes) */}
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
              {/* 3D Acrylic Jewel Case (Caja de Cassette Transparente) */}
              <div className="sl-jewel-case">
                {/* Crystal Glass Reflection & Beveled Sheen */}
                <div className="sl-case-sheen" />
                <span className="sl-case-hinge hinge-top" />
                <span className="sl-case-hinge hinge-bottom" />

                {/* Top: J-Card Spine Fold with Title & Status */}
                <div className="sl-case-jcard">
                  <div className="sl-jcard-left">
                    <span className="sl-jcard-num">
                      {String(tape.tapeNumber).padStart(2, '0')}
                    </span>
                    <span className="sl-jcard-title" title={tape.title}>
                      {tape.title}
                    </span>
                  </div>
                  <span className={`sl-jcard-status ${isActive ? 'is-active-badge' : ''}`}>
                    {isActive ? 'EN DECK' : `SLOT ${tape.tapeNumber}`}
                  </span>
                </div>

                {/* Real Cassette Body nested inside the transparent case */}
                <div className="sl-case-tape-shell">
                  {/* Corner Screws of the Cassette Shell */}
                  <span className="sl-mini-screw s-tl" />
                  <span className="sl-mini-screw s-tr" />
                  <span className="sl-mini-screw s-bl" />
                  <span className="sl-mini-screw s-br" />

                  {/* Tape Label Sticker with Cara A & Cara B Tracks */}
                  <div className="sl-case-tape-label">
                    <div className="sl-label-tracks">
                      <button
                        type="button"
                        className={`sl-case-track-pill pill-a ${isActive && activeSide === 'A' ? 'is-playing' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCassette(actualIdx, 'A');
                        }}
                        title={`Lado A: ${tape.sideA.Title}`}
                      >
                        <span className="side-char">A</span>
                        <span className="side-name">{tape.sideA.Title}</span>
                      </button>

                      {tape.sideB ? (
                        <button
                          type="button"
                          className={`sl-case-track-pill pill-b ${isActive && activeSide === 'B' ? 'is-playing' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCassette(actualIdx, 'B');
                          }}
                          title={`Lado B: ${tape.sideB.Title}`}
                        >
                          <span className="side-char">B</span>
                          <span className="side-name">{tape.sideB.Title}</span>
                        </button>
                      ) : (
                        <span className="sl-case-track-pill pill-empty">
                          <span className="side-char">B</span>
                          <span className="side-name">Sin Cara B</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Central Tape Viewing Chamber with Spools & Ribbon */}
                  <div className="sl-case-spool-chamber">
                    {/* Left Reel Spool */}
                    <div className={`sl-case-spool ${isActive ? 'is-spinning' : ''}`}>
                      <div className="sl-case-hub">
                        <span className="hub-tooth t-1" />
                        <span className="hub-tooth t-2" />
                        <span className="hub-tooth t-3" />
                      </div>
                    </div>

                    {/* Magnetic Tape Ribbon Bridge */}
                    <div className="sl-case-bridge">
                      <div className="sl-case-tape-ribbon" />
                      <div className="sl-case-ticks">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>

                    {/* Right Reel Spool */}
                    <div className={`sl-case-spool ${isActive ? 'is-spinning' : ''}`}>
                      <div className="sl-case-hub">
                        <span className="hub-tooth t-1" />
                        <span className="hub-tooth t-2" />
                        <span className="hub-tooth t-3" />
                      </div>
                    </div>
                  </div>
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
