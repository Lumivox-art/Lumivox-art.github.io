import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
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
  order?: number;
}

export const SPECKU_GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 'anima',
    title: 'Anima',
    src: '/lumivox-media/joph-anima.webp',
    alt: 'Specku - Anima style artwork',
    category: 'Illustration',
    order: 1,
  },
  {
    id: 'semi-real',
    title: 'Semi-Real',
    src: '/lumivox-media/joph-semi-real.webp',
    alt: 'Specku - Semi-Real style artwork',
    category: 'Illustration',
    order: 2,
  },
  {
    id: 'cutsey',
    title: 'Cutsey',
    src: '/lumivox-media/joph-cutsey.webp',
    alt: 'Specku - Cutsey style artwork',
    category: 'Style Sample',
    order: 3,
  },
  {
    id: 'chibi',
    title: 'Chibi+',
    src: '/lumivox-media/joph-chibi.webp',
    alt: 'Specku - Chibi+ style artwork',
    category: 'Style Sample',
    order: 4,
  },
  {
    id: 'dull-eyes',
    title: 'Dull-Eyes',
    src: '/lumivox-media/joph-dull-eyes.webp',
    alt: 'Specku - Dull-Eyes style artwork',
    category: 'Style Sample',
    order: 5,
  },
  {
    id: 'noodle',
    title: 'Noodle',
    src: '/lumivox-media/joph-noodle.webp',
    alt: 'Specku - Noodle style artwork',
    category: 'Style Sample',
    order: 6,
  },
];

const ITEMS_PER_SHEET = 6;

export function SpeckuGalleryPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const [items, setItems] = useState<GalleryItem[]>(SPECKU_GALLERY_IMAGES);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Touch gesture refs for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  // Listen for real-time updates from Firebase RTDB Specku_Gallery
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const galleryRef = ref(db, 'Specku_Gallery');
      unsubscribe = onValue(
        galleryRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            let parsedItems: GalleryItem[] = [];
            if (Array.isArray(data)) {
              parsedItems = data.filter(Boolean);
            } else if (typeof data === 'object' && data !== null) {
              parsedItems = Object.entries(data).map(([key, val]: [string, any]) => ({
                id: val?.id || key,
                title: val?.title || key,
                src: val?.src || val?.url || '',
                alt: val?.alt || val?.title || 'Specku artwork',
                category: val?.category || 'Artwork',
                order: val?.order ?? 999,
              }));
              parsedItems.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            }
            if (parsedItems.length > 0) {
              setItems(parsedItems);
            }
          }
        },
        (error) => {
          // If locked by security rules or connection fails, default images remain active
          console.warn('Specku_Gallery Firebase sync info:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firebase RTDB error:', err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Split gallery items into binder sheets of strictly 6 items (3 columns x 2 rows)
  const totalSheets = Math.ceil(items.length / ITEMS_PER_SHEET) || 1;
  const sheets: GalleryItem[][] = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_SHEET) {
    sheets.push(items.slice(i, i + ITEMS_PER_SHEET));
  }

  const activePage = Math.min(currentPage, totalSheets - 1);

  const goToNextSheet = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalSheets - 1));
  };

  const goToPrevSheet = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  // Touch / Swipe listeners for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Only consider horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
      touchDeltaX.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const swipeThreshold = 45;
    if (touchDeltaX.current < -swipeThreshold) {
      goToNextSheet();
    } else if (touchDeltaX.current > swipeThreshold) {
      goToPrevSheet();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
  };

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
        <LumivoxBrand />
        <div className="sg-topbar-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <header className="sg-hero">
        <h1>{t('specku.gallery.title')}</h1>
        <p className="sg-subtitle">{t('specku.gallery.subtitle')}</p>
      </header>

      <main className="sg-content">
        {/* Card sheet slider (3 columns x 2 rows per sheet) */}
        <section
          className="sg-carousel"
          aria-label={t('specku.gallery.title')}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="sg-viewport">
            <div
              className="sg-track"
              style={{ transform: `translateX(-${activePage * 100}%)` }}
            >
              {sheets.map((sheet, sheetIndex) => (
                <div
                  key={sheetIndex}
                  className="sg-sheet"
                  aria-hidden={sheetIndex !== activePage}
                >
                  {sheet.map((item) => (
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
                      aria-label={`${item.title} - Zoom in`}
                    >
                      <div className="sg-card-media">
                        <img src={item.src} alt={item.alt} loading="lazy" />
                        <div className="sg-card-overlay">
                          <span className="sg-view-hint">🔍 Zoom in</span>
                        </div>
                      </div>
                      <div className="sg-card-meta">
                        <h2 className="sg-card-title">{item.title}</h2>
                        {item.category && (
                          <span className="sg-card-category">{item.category}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation controls activated when there is more than 1 sheet */}
          {totalSheets > 1 && (
            <div className="sg-nav-bar">
              <button
                type="button"
                className="sg-nav-btn sg-nav-btn--prev"
                onClick={goToPrevSheet}
                disabled={activePage === 0}
                aria-label={t('specku.gallery.prev')}
              >
                ← {t('specku.gallery.prev')}
              </button>

              <div className="sg-nav-dots" role="tablist" aria-label="Sheet indicators">
                {sheets.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`sg-dot${idx === activePage ? ' is-active' : ''}`}
                    onClick={() => setCurrentPage(idx)}
                    aria-label={`${t('specku.gallery.sheet')} ${idx + 1}`}
                    aria-selected={idx === activePage}
                    role="tab"
                  />
                ))}
              </div>

              <button
                type="button"
                className="sg-nav-btn sg-nav-btn--next"
                onClick={goToNextSheet}
                disabled={activePage === totalSheets - 1}
                aria-label={t('specku.gallery.next')}
              >
                {t('specku.gallery.next')} →
              </button>
            </div>
          )}
        </section>

        {/* Bottom CTA card */}
        <section className="sg-cta-card">
          <div className="sg-cta-body">
            <h3>{t('specku.gallery.ctaCard')}</h3>
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
