import { useState, useEffect, useRef, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // Easter Egg: 8 rapid clicks within 4 seconds unlocks the secret Intranet portal
  const clicksRef = useRef<number[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter((timestamp) => now - timestamp < 4000), now];

    if (clicksRef.current.length >= 8) {
      e.preventDefault();
      clicksRef.current = [];
      setIsPulsing(true);

      setTimeout(() => {
        setIsPulsing(false);
        navigate('/intranet/login');
      }, 350);
    }
  };

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
        <Link
          className={`lvx-brand ${isPulsing ? 'is-secret-pulsing' : ''}`}
          to="/home"
          aria-label="Lumivox — inicio"
          onClick={handleLogoClick}
        >
          <div className="lvx-logo-mark markstack" aria-hidden="true">
            <DayMark />
            <NightMark />
          </div>
          <span className="lvx-word">lumivox</span>
        </Link>

        <div className="lvx-actions">
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
              }}
            >
              🛠️ Intranet ({artistHandle})
            </Link>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <section className="lvx-hero">
        <div className="lvx-hero-text">
          <h1>
            {t('home.hero.l1')}
            <br />
            {t('home.hero.l2')}{' '}
            <span className="lvx-accent">{t('home.hero.accent')}</span>.
          </h1>
        </div>

        <div className="lvx-hero-mark markstack" aria-hidden="true">
          <DayMark />
          <NightMark stars />
        </div>
      </section>

      <section className="lvx-artists" id="artistas">
        <h2 className="lvx-section-title">{t('home.artists')}</h2>
        {activeArtist && (
          <div className="lvx-roster">
            <RosterStrip
              artists={artistList}
              activeHandle={activeArtist.handle}
              onSelect={setActiveHandle}
              tabIdFor={tabIdFor}
              panelIdFor={panelIdFor}
            />
            <ArtistShowcase
              artist={activeArtist}
              panelId={panelIdFor(activeArtist.handle)}
              labelledBy={tabIdFor(activeArtist.handle)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
