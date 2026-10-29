import { useState } from 'react';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import './SamCommissions.scss';
import { IntranetShortcut } from '../components/IntranetShortcut';

// Mockup landing for Sam's commissions — retro diner "menu" layout.
// All copy is placeholder lorem ipsum (no real data — it must not bias any
// negotiation) and there are no emojis; reworked later with real content/art.

const ABOUT = [
  'Lorem ipsum dolor sit',
  'amet consectetur adipiscing',
  'elit sed do eiusmod',
  'tempor incididunt ut labore',
];

const INFO = [
  'Lorem ipsum dolor sit amet',
  'consectetur adipiscing elit',
  'sed do eiusmod tempor',
  'ut labore et dolore magna',
];

const SOCIALS = ['Lorem ipsum', 'Dolor sit', 'Amet', 'Consectetur', 'Adipiscing', 'Elit'];

const MENU = [
  'Lorem ipsum',
  'Dolor sit',
  'Amet nunc',
  'Consectetur',
  'Adipiscing',
  'Elit sed',
  'Eiusmod',
  'Tempor',
];

export function SamCommissionsPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const [pick, setPick] = useState<string | null>(null);
  const randomOc = (): void => setPick(MENU[Math.floor(Math.random() * MENU.length)]);

  return (
    <div className="sam-commissions" data-theme={theme}>
      <div className="sc-topbar">
        <LumivoxBrand />
        <div className="sc-topbar-actions">
          <IntranetShortcut />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="sc-frame">
        {/* Diner marquee sign */}
        <div className="sc-marquee" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {/* Hero */}
        <header className="sc-hero">
          <div className="sc-hero-awning" aria-hidden="true" />
          <div className="sc-portrait" aria-hidden="true" />
          <div className="sc-title">
            <h1>Sam</h1>
            <span className="sc-tag">{t('sam.tag')}</span>
          </div>
        </header>

        {/* Info cards */}
        <section className="sc-cards">
          <article className="sc-card">
            <div className="sc-plate">
              <span className="sc-plate-label">Lorem</span>
            </div>
            <ul>
              {ABOUT.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>

          <article className="sc-card">
            <div className="sc-plate">
              <span className="sc-plate-label">Ipsum</span>
            </div>
            <ul>
              {INFO.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>

          <article className="sc-card">
            <div className="sc-plate">
              <span className="sc-plate-label">Dolor</span>
            </div>
            <ul>
              {SOCIALS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        </section>

        {/* Menu */}
        <section className="sc-menu">
          <div className="sc-menu-head">
            <h2>Lorem ipsum</h2>
          </div>
          <div className="sc-menu-grid">
            {MENU.map((name) => (
              <div className="sc-dish" key={name}>
                <span className="sc-dish-ph" aria-hidden="true" />
                <span className="sc-dish-name">{name}</span>
              </div>
            ))}
          </div>
          <span className="sc-more">lorem ipsum</span>
        </section>

        {/* Random pick */}
        <button className="sc-random" type="button" onClick={randomOc}>
          {pick ? `lorem: ${pick}` : 'lorem ipsum dolor sit amet'}
        </button>
      </div>

      <p className="sc-note">{t('sam.note')}</p>
    </div>
  );
}
