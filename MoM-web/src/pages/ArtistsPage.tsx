import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtistShowcase } from '../components/lumivox/ArtistShowcase';
import { LumivoxMark } from '../components/lumivox/LumivoxMark';
import { RosterStrip } from '../components/lumivox/RosterStrip';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
import { useLang } from '../i18n';
import { artists, type Artist } from '../data/artists';
import { ArtistMediaService } from '../services/ArtistMediaService';
import { ArtistProfileService } from '../services/ArtistProfileService';

// Artist roster: pick an artist and see their full card (socials + special
// buttons). Optional /:handle pre-selects an artist (used by the home cards).
const tabIdFor = (handle: string) => `roster-tab-${handle}`;
const panelIdFor = (handle: string) => `showcase-${handle}`;

export function ArtistsPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const { handle } = useParams();
  const { currentUser, artistHandle } = useAuth();

  const [artistList, setArtistList] = useState<Artist[]>(() =>
    ArtistProfileService.GetHydratedProfiles(ArtistMediaService.GetHydratedArtists(artists)),
  );
  const initial =
    artistList.find((a) => a.handle === handle)?.handle ?? artistList[0]?.handle ?? '';
  const [activeHandle, setActiveHandle] = useState<string>(initial);
  const activeArtist = artistList.find((a) => a.handle === activeHandle) ?? artistList[0];

  useEffect(() => {
    // Media subscription (icons and splashes)
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
          }),
        );
      }
    });

    // Remote profiles fetch
    ArtistProfileService.LoadAllProfiles((profilesMap) => {
      setArtistList((prev) =>
        prev.map((a) => {
          const found = profilesMap.get(a.handle);
          return found ? ArtistProfileService.HydrateArtist(a, found) : a;
        }),
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="lumivox-shell" data-theme={theme}>
      <div className="lumivox-topbar">
        <div className="lumivox-topbar-left">
          <Link className="lumivox-back" to="/home">
            ← {t('artists.back')}
          </Link>
          <LumivoxMark />
        </div>
        <div className="lumivox-topbar-right">
          {currentUser && (
            <Link
              to="/intranet"
              className="lumivox-intranet-shortcut"
              title="Ir a mi panel de intranet"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-accent, #8D3E2E)',
                textDecoration: 'none',
                background: 'rgba(224, 122, 111, 0.15)',
                padding: '0.35rem 0.7rem',
                borderRadius: '8px',
                marginRight: '0.5rem',
              }}
            >
              🛠️ Intranet ({artistHandle})
            </Link>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <main className="lumivox-stage">
        <div className="lumivox-roster-wrap">
          <RosterStrip
            artists={artistList}
            activeHandle={activeArtist.handle}
            onSelect={setActiveHandle}
            tabIdFor={tabIdFor}
            panelIdFor={panelIdFor}
          />
        </div>

        <div className="lumivox-deck">
          <ArtistShowcase
            artist={activeArtist}
            panelId={panelIdFor(activeArtist.handle)}
            labelledBy={tabIdFor(activeArtist.handle)}
          />
        </div>
      </main>
    </div>
  );
}
