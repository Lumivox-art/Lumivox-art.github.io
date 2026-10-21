import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtistShowcase } from '../components/lumivox/ArtistShowcase';
import { LumivoxMark } from '../components/lumivox/LumivoxMark';
import { RosterStrip } from '../components/lumivox/RosterStrip';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLang } from '../i18n';
import { artists, type Artist } from '../data/artists';
import { ArtistMediaService } from '../services/ArtistMediaService';

// Artist roster: pick an artist and see their full card (socials + special
// buttons). Optional /:handle pre-selects an artist (used by the home cards).
const tabIdFor = (handle: string) => `roster-tab-${handle}`;
const panelIdFor = (handle: string) => `showcase-${handle}`;

export function ArtistsPage() {
  const { t } = useLang();
  const { handle } = useParams();
  const [artistList, setArtistList] = useState<Artist[]>(artists);
  const initial = artistList.find((a) => a.handle === handle)?.handle ?? artistList[0]?.handle ?? '';
  const [activeHandle, setActiveHandle] = useState<string>(initial);
  const activeArtist = artistList.find((a) => a.handle === activeHandle) ?? artistList[0];

  useEffect(() => {
    const unsubscribe = ArtistMediaService.Subscribe((response) => {
      if (response.Result && response.Result.length > 0) {
        const mediaMap = new Map(response.Result.map((m) => [m.Key, m]));
        setArtistList((prev) =>
          prev.map((a) => {
            const found = mediaMap.get(a.handle);
            if (found) {
              return {
                ...a,
                splash: found.SplashBinary ?? a.splash,
                icon: found.IconBinary ?? a.icon,
              };
            }
            return a;
          })
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="lumivox-shell">
      <div className="lumivox-topbar">
        <div className="lumivox-topbar-left">
          <Link className="lumivox-back" to="/home">
            ← {t('artists.back')}
          </Link>
          <LumivoxMark />
          <LanguageToggle />
        </div>
        <span className="lumivox-tagline-top">{t('artists.tagline')}</span>
      </div>

      {activeArtist ? (
        <>
          <ArtistShowcase
            artist={activeArtist}
            panelId={panelIdFor(activeArtist.handle)}
            labelledBy={tabIdFor(activeArtist.handle)}
          />
          <RosterStrip
            artists={artistList}
            activeHandle={activeArtist.handle}
            onSelect={setActiveHandle}
            tabIdFor={tabIdFor}
            panelIdFor={panelIdFor}
          />
        </>
      ) : (
        <p style={{ padding: '2rem', textAlign: 'center' }}>{t('artists.empty')}</p>
      )}
    </div>
  );
}
