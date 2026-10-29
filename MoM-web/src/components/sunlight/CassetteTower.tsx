import { useRef, useEffect } from 'react';
import type { SunlightCompiledCassette } from '../../models/Sunlight';
import { CassetteSfx } from '../../utils/CassetteSfx';
import './CassetteTower.scss';

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
  const stackRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the stack so the active cassette is always smoothly in view
  useEffect(() => {
    if (!stackRef.current) return;
    const activeSlot = stackRef.current.querySelector<HTMLElement>('.sl-tower-slot.is-loaded');
    if (activeSlot) {
      activeSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeCassetteIndex]);

  return (
    <aside className="sl-cassette-tower" aria-label="Torre de Cassettes">
      {/* Tower Top Header */}
      <div className="sl-tower-header">
        <div className="sl-tower-title-block">
          <span className="sl-tower-tag">TAPE RACK · HI-FI</span>
          <h3 className="sl-tower-heading">Torre de Cassettes</h3>
        </div>
        <div className="sl-tower-header-actions">
          <span className="sl-tower-count-badge">
            {cassettes.length} {cassettes.length === 1 ? 'Cinta' : 'Cintas'}
          </span>
          <div className="sl-tower-scroll-controls">
            <button
              type="button"
              className="sl-tower-nav-arrow arrow-up"
              onClick={() => stackRef.current?.scrollBy({ top: -130, behavior: 'smooth' })}
              title="Subir en la torre"
              aria-label="Subir en la torre"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              className="sl-tower-nav-arrow arrow-down"
              onClick={() => stackRef.current?.scrollBy({ top: 130, behavior: 'smooth' })}
              title="Bajar en la torre"
              aria-label="Bajar en la torre"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stack of Cassette Jewel Cases with Dynamic Scroll */}
      <div className="sl-tower-stack" ref={stackRef}>
        {cassettes.map((tape, idx) => {
          const isActive = idx === activeCassetteIndex;

          const tapeDisplayName = tape.title.includes(':')
            ? tape.title.split(':')[0].trim()
            : tape.title;

          return (
            <div
              key={tape.id}
              className={`sl-tower-slot ${isActive ? 'is-loaded' : ''}`}
              onClick={() => { CassetteSfx.playTapeSwitch(); onSelectCassette(idx, 'A'); }}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCassette(idx, 'A');
                }
              }}
            >
              {/* 3D Acrylic Jewel Case */}
              <div className="sl-jewel-case">
                {/* Crystal Glass Reflection & Beveled Sheen */}
                <div className="sl-case-sheen" />
                <span className="sl-case-hinge hinge-top" />
                <span className="sl-case-hinge hinge-bottom" />

                {/* Top: J-Card Spine Fold with Clean Title & Status */}
                <div className="sl-case-jcard">
                  <div className="sl-jcard-left">
                    <span className="sl-jcard-num">
                      {String(tape.tapeNumber).padStart(2, '0')}
                    </span>
                    <span className="sl-jcard-title" title={tape.title}>
                      {tapeDisplayName}
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

                  {/* Tape Label Sticker with Full Cara A & Cara B Tracks */}
                  <div className="sl-case-tape-label">
                    <div className="sl-label-tracks">
                      <button
                        type="button"
                        className={`sl-case-track-pill pill-a ${isActive && activeSide === 'A' ? 'is-playing' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          CassetteSfx.playTapeSwitch();
                          onSelectCassette(idx, 'A');
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
                            CassetteSfx.playTapeSwitch();
                            onSelectCassette(idx, 'B');
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

                    {/* Analog Tape Film Strip with Scale Ticks */}
                    <div className="sl-case-tape-window">
                      <div className="sl-case-tape-ribbon" />
                      <div className="sl-case-ticks">
                        <span />
                        <span />
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

                  {/* Bottom Cassette Notch Area */}
                  <div className="sl-case-tape-notch">
                    <span className="notch-guide-pin" />
                    <span className="notch-felt-pad" />
                    <span className="notch-guide-pin" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
