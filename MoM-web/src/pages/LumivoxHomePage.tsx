import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DayMark, NightMark } from '../components/LumivoxLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
import { useLang } from '../i18n';
import { ArtistShowcase } from '../components/lumivox/ArtistShowcase';
import { RosterStrip } from '../components/lumivox/RosterStrip';
import { artists, type Artist } from '../data/artists';
import { ArtistMediaService } from '../services/ArtistMediaService';
import { ArtistProfileService } from '../services/ArtistProfileService';
import './LumivoxHome.scss';

// Lumivox homepage — brand landing (day/night logo) with the artist roster
// embedded: pick an artist and see their card (socials + special buttons)
// without leaving the main page.

const tabIdFor = (handle: string) => `roster-tab-${handle}`;
const panelIdFor = (handle: string) => `showcase-${handle}`;

export function LumivoxHomePage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const { currentUser, artistHandle } = useAuth();

  const [artistList, setArtistList] = useState<Artist[]>(() =>
    ArtistProfileService.GetHydratedProfiles(ArtistMediaService.GetHydratedArtists(artists)),
  );
  const [activeHandle, setActiveHandle] = useState<string>(() => artistList[0]?.handle ?? '');
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
          }),
        );
      }
    });

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
    <div className="lumivox-site" data-theme={theme}>
      <header className="lvx-top">
        <div className="lvx-top-left">
          <Link className="lvx-home-brand" to="/home" aria-label="Lumivox — recargar">
            <span className="lvx-home-marks">
              <DayMark />
              <NightMark />
            </span>
            <span className="lvx-home-word">lumivox</span>
          </Link>
        </div>
        <div className="lvx-top-right">
          {currentUser && (
            <Link
              to="/intranet"
              className="lvx-intranet-shortcut"
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
      </header>

      <section className="lvx-hero-zone">
        <h1 className="lvx-hero-headline">
          <span className="lvx-hero-line">{t('home.hero.l1')}</span>
          <span className="lvx-hero-line">{t('home.hero.l2')}</span>
          <span className="lvx-hero-line lvx-hero-accent">{t('home.hero.accent')}</span>
        </h1>
      </section>

      <section className="lvx-roster-zone">
        <div className="lvx-roster-headline">
          <span className="lvx-roster-title">{t('home.artists')}</span>
        </div>

        <div className="lvx-roster-strip-wrap">
          <RosterStrip
            artists={artistList}
            activeHandle={activeArtist.handle}
            onSelect={setActiveHandle}
            tabIdFor={tabIdFor}
            panelIdFor={panelIdFor}
          />
        </div>

        <div className="lvx-stage-wrap">
          <ArtistShowcase
            artist={activeArtist}
            panelId={panelIdFor(activeArtist.handle)}
            labelledBy={tabIdFor(activeArtist.handle)}
          />
        </div>
      </section>
    </div>
  );
}
