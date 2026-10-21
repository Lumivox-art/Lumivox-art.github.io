import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import './SpeckuGallery.scss';

export interface GalleryItem {
  id: string;
  title: string;
  src: string;
  alt: string;
  category?: string;
}

export const SPECKU_GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 'anima',
    title: 'Anima',
    src: '/lumivox-media/joph-anima.webp',
    alt: 'Specku - Anima style artwork',
    category: 'Illustration',
  },
  {
    id: 'semi-real',
    title: 'Semi-Real',
    src: '/lumivox-media/joph-semi-real.webp',
    alt: 'Specku - Semi-Real style artwork',
    category: 'Illustration',
  },
  {
    id: 'cutsey',
    title: 'Cutsey',
    src: '/lumivox-media/joph-cutsey.webp',
    alt: 'Specku - Cutsey style artwork',
    category: 'Style Sample',
  },
  {
    id: 'chibi',
    title: 'Chibi+',
    src: '/lumivox-media/joph-chibi.webp',
    alt: 'Specku - Chibi+ style artwork',
    category: 'Style Sample',
  },
  {
    id: 'dull-eyes',
    title: 'Dull-Eyes',
    src: '/lumivox-media/joph-dull-eyes.webp',
    alt: 'Specku - Dull-Eyes style artwork',
    category: 'Style Sample',
  },
  {
    id: 'noodle',
    title: 'Noodle',
    src: '/lumivox-media/joph-noodle.webp',
    alt: 'Specku - Noodle style artwork',
    category: 'Style Sample',
  },
];

export function SpeckuGalleryPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    if (selectedItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem]);

  return (
    <div className="specku-gallery" data-theme={theme}>
      <div className="sg-topbar">
        <div className="sg-topbar-left">
          <Link to="/home/specku/comisiones" className="sg-back-link">
            ← {t('specku.gallery.back')}
          </Link>
          <LumivoxBrand />
        </div>
        <div className="sg-topbar-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <header className="sg-hero">
        <span className="sg-badge">{t('specku.gallery.badge')}</span>
        <h1>{t('specku.gallery.title')}</h1>
        <p className="sg-subtitle">{t('specku.gallery.subtitle')}</p>
      </header>

      <main className="sg-content">
        <section className="sg-grid" aria-label={t('specku.gallery.title')}>
          {SPECKU_GALLERY_IMAGES.map((item) => (
            <article
              key={item.id}
              className="sg-card"
              onClick={() => setSelectedItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedItem(item);
                }
              }}
              aria-label={`${item.title} - ${t('specku.gallery.view')}`}
            >
              <div className="sg-card-media">
                <img src={item.src} alt={item.alt} loading="lazy" />
                <div className="sg-card-overlay">
                  <span className="sg-view-hint">🔍 {t('specku.gallery.view')}</span>
                </div>
              </div>
              <div className="sg-card-meta">
                <h2 className="sg-card-title">{item.title}</h2>
                {item.category && <span className="sg-card-category">{item.category}</span>}
              </div>
            </article>
          ))}
        </section>

        {/* Bottom CTA block */}
        <section className="sg-cta-card">
          <div className="sg-cta-body">
            <h3>{t('specku.gallery.ctaCard')}</h3>
            <p>{t('specku.subtitle')}</p>
          </div>
          <Link to="/home/specku/comisiones" className="sg-cta-btn">
            {t('specku.gallery.ctaCommissions')}
          </Link>
        </section>
      </main>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="sg-modal-backdrop"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div className="sg-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sg-modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label={t('specku.gallery.close')}
            >
              ✕
            </button>
            <div className="sg-modal-image-wrapper">
              <img src={selectedItem.src} alt={selectedItem.alt} />
            </div>
            <div className="sg-modal-footer">
              <h3>{selectedItem.title}</h3>
              {selectedItem.category && (
                <span className="sg-modal-category">{selectedItem.category}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
