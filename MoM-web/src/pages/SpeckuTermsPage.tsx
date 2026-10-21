import { Link } from 'react-router-dom';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import './SpeckuTerms.scss';

export function SpeckuTermsPage() {
  const { theme } = useTheme();
  const { t } = useLang();

  return (
    <div className="specku-terms" data-theme={theme}>
      <div className="st-topbar">
        <LumivoxBrand />
        <div className="st-topbar-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <header className="st-hero">
        <span className="st-badge">{t('specku.terms.badge')}</span>
        <h1>{t('specku.terms.title')}</h1>
        <p className="st-subtitle">{t('specku.terms.subtitle')}</p>
      </header>

      <main className="st-content">
        {/* Section 1: Process & Delivery */}
        <section className="st-card">
          <div className="st-card-header">
            <span className="st-step-num">1</span>
            <h2>{t('specku.terms.s1.title')}</h2>
          </div>

          <div className="st-block">
            <h3>{t('specku.terms.s1.delivery.title')}</h3>
            <p>{t('specku.terms.s1.delivery.text')}</p>
          </div>

          <div className="st-block">
            <h3>{t('specku.terms.s1.sketch.title')}</h3>
            <p>{t('specku.terms.s1.sketch.text')}</p>
          </div>

          <div className="st-block">
            <h3>{t('specku.terms.s1.payment.title')}</h3>
            <p>{t('specku.terms.s1.payment.text')}</p>
          </div>

          <div className="st-block">
            <h3>{t('specku.terms.s1.revisions.title')}</h3>
            <p>{t('specku.terms.s1.revisions.text')}</p>
          </div>
        </section>

        {/* Section 2: Permissions & Streaming */}
        <section className="st-card">
          <div className="st-card-header">
            <span className="st-step-num">2</span>
            <h2>{t('specku.terms.s2.title')}</h2>
          </div>
          <p className="st-card-intro">{t('specku.terms.s2.intro')}</p>

          <ul className="st-checklist">
            <li>
              <strong>{t('specku.terms.s2.stream.title')}</strong>
              <p>{t('specku.terms.s2.stream.text')}</p>
            </li>
            <li>
              <strong>{t('specku.terms.s2.socials.title')}</strong>
              <p>{t('specku.terms.s2.socials.text')}</p>
            </li>
            <li>
              <strong>{t('specku.terms.s2.portfolio.title')}</strong>
              <p>{t('specku.terms.s2.portfolio.text')}</p>
            </li>
          </ul>
        </section>

        {/* Section 3: Client Rights & Authorship */}
        <section className="st-card">
          <div className="st-card-header">
            <span className="st-step-num">3</span>
            <h2>{t('specku.terms.s3.title')}</h2>
          </div>
          <p className="st-card-intro">{t('specku.terms.s3.intro')}</p>

          <ul className="st-checklist">
            <li>
              <strong>{t('specku.terms.s3.ownership.title')}</strong>
              <p>{t('specku.terms.s3.ownership.text')}</p>
            </li>
            <li>
              <strong>{t('specku.terms.s3.permission.title')}</strong>
              <p>{t('specku.terms.s3.permission.text')}</p>
            </li>
            <li>
              <strong>{t('specku.terms.s3.authorship.title')}</strong>
              <p>{t('specku.terms.s3.authorship.text')}</p>
            </li>
          </ul>
        </section>

        {/* Bottom CTA to return */}
        <div className="st-cta-wrap">
          <Link to="/home/specku/comisiones" className="st-cta-btn">
            {t('specku.terms.ctaBack')}
          </Link>
        </div>
      </main>
    </div>
  );
}
