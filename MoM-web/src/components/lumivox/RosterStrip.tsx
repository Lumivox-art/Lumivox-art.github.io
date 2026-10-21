import { useRef } from 'react';
import type { Artist } from '../../data/artists';
import { LumivoxDbImage } from '../LumivoxDbImage';

type RosterStripProps = {
  artists: Artist[];
  activeHandle: string;
  onSelect: (handle: string) => void;
  tabIdFor: (handle: string) => string;
  panelIdFor: (handle: string) => string;
};

export function RosterStrip({
  artists,
  activeHandle,
  onSelect,
  tabIdFor,
  panelIdFor,
}: RosterStripProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const dir = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + dir + artists.length) % artists.length;
      const nextHandle = artists[nextIndex].handle;
      onSelect(nextHandle);
      refs.current[nextHandle]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      const first = artists[0].handle;
      onSelect(first);
      refs.current[first]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = artists[artists.length - 1].handle;
      onSelect(last);
      refs.current[last]?.focus();
    }
  }

  return (
    <div className="lumivox-roster" role="tablist" aria-label="Lumivox roster">
      {artists.map((artist, index) => {
        const isActive = artist.handle === activeHandle;
        return (
          <button
            key={artist.handle}
            ref={(el) => {
              refs.current[artist.handle] = el;
            }}
            id={tabIdFor(artist.handle)}
            type="button"
            className="lumivox-roster-item"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelIdFor(artist.handle)}
            tabIndex={isActive ? 0 : -1}
            title={artist.displayName}
            onClick={() => onSelect(artist.handle)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <div
              className="lumivox-roster-icon"
              style={{ backgroundColor: artist.accentColor }}
            >
              <LumivoxDbImage
                src={artist.icon}
                alt={artist.displayName}
                circleSize={22}
                compactError={true}
              />
            </div>
            <span className="lumivox-roster-name">{artist.displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
