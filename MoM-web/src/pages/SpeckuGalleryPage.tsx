/**
 * Specku Gallery Page (View / ViewModel presentation layer).
 * Implements Constitution Brendup Title VII (MVVM architecture).
 * Delegates all data access to SpeckuGalleryService; contains zero raw HTTP or database calls.
 */

import { useState, useEffect, useRef } from 'react';
import type { TouchEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { LumivoxBrand } from '../components/LumivoxBrand';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTheme } from '../components/ThemeContext';
import { useLang } from '../i18n';
import { SpeckuGalleryService } from '../services/SpeckuGalleryService';
import { LumivoxDbImage } from '../components/LumivoxDbImage';
import { LumivoxLoadingCircle } from '../components/LumivoxLoadingCircle';
import { ConnectionFailurePlaceholder } from '../components/ConnectionFailurePlaceholder';
import type { GalleryItemBase } from '../models/Gallery';
import './SpeckuGallery.scss';

const ITEMS_PER_SHEET = 6;

/// <summary>
/// SpeckuGalleryPage component representing the presentation layer for Specku's art gallery.
/// Manages view state, sheet pagination, touch gestures, and lightbox modal interactions.
/// </summary>
export function SpeckuGalleryPage() {
  const { theme } = useTheme();
  const { t } = useLang();

  // Reactive state properties
  const [items, setItems] = useState<GalleryItemBase[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItemBase | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Private touch gesture tracking refs for mobile swipe navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  /// <summary>
  /// Subscribes to real-time updates from SpeckuGalleryService upon mounting.
  /// </summary>
  useEffect(() => {
    const unsubscribe = SpeckuGalleryService.Subscribe((response) => {
      setIsLoading(false);
      if (response.Result && response.Result.length > 0) {
        setItems(response.Result);
        setIsError(false);
      } else if (response.CodeNumber && response.CodeNumber >= 400) {
        setIsError(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Split gallery items into binder sheets of strictly 6 items (3 columns x 2 rows)
  const totalSheets = Math.ceil(items.length / ITEMS_PER_SHEET) || 1;
  const sheets: GalleryItemBase[][] = [];
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

  // Touch gesture handlers for mobile swipe navigation
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Only register horizontal swipes
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

  // Lightbox modal keyboard dismissal (Escape key)
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
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
      {/* Top navigation bar */}
      <div className="sg-topbar">
        <LumivoxBrand />
        <div className="sg-topbar-actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Hero header */}
      <header className="sg-hero">
        <h1>{t('specku.gallery.title')}</h1>
        <p className="sg-subtitle">{t('specku.gallery.subtitle')}</p>
      </header>

      {/* Main presentation area */}
      <main className="sg-content">
        {isLoading && items.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '340px',
              gap: '1.25rem',
            }}
          >
            <LumivoxLoadingCircle size={72} />
            <span style={{ fontSize: '0.95rem', color: 'var(--lvx-sub, #8D3E2E)', fontWeight: 500 }}>
              Cargando obras desde la base de datos...
            </span>
          </div>
        ) : isError && items.length === 0 ? (
          <div style={{ maxWidth: 440, margin: '2rem auto' }}>
            <ConnectionFailurePlaceholder
              onRetry={() => {
                setIsLoading(true);
                SpeckuGalleryService.List().then((res) => {
                  setIsLoading(false);
                  if (res.Result && res.Result.length > 0) {
                    setItems(res.Result);
                    setIsError(false);
                  }
                });
              }}
            />
          </div>
        ) : (
          /* Binder sheet carousel: strictly 3 columns x 2 rows per sheet */
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
                        key={item.Key ?? item.GalleryItemID ?? Math.random()}
                        className="sg-card"
                        onClick={() => setSelectedItem(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedItem(item);
                          }
                        }}
                        aria-label={`${item.Title ?? 'Artwork'} - Zoom in`}
                      >
                        <div className="sg-card-media">
                          <LumivoxDbImage
                            src={item.ImageBinary}
                            alt={item.AltText ?? item.Title ?? 'Specku artwork'}
                            circleSize={48}
                          />
                          <div className="sg-card-overlay">
                            <span className="sg-view-hint">🔍 Zoom in</span>
                          </div>
                        </div>
                        <div className="sg-card-meta">
                          <h2 className="sg-card-title">{item.Title}</h2>
                          {item.Category && (
                            <span className="sg-card-category">{item.Category}</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation controls rendered when more than 1 sheet exists */}
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
        )}

        {/* Bottom CTA card pointing back to commissions */}
        <section className="sg-cta-card">
          <div className="sg-cta-body">
            <h3>{t('specku.gallery.ctaCard')}</h3>
          </div>
          <Link to="/home/specku/comisiones" className="sg-cta-btn">
            {t('specku.gallery.ctaCommissions')}
          </Link>
        </section>
      </main>

      {/* Lightbox modal for enlarged artwork inspection */}
      {selectedItem && (
        <div
          className="sg-modal-backdrop"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.Title ?? 'Artwork'}
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
              <LumivoxDbImage
                src={selectedItem.ImageBinary}
                alt={selectedItem.AltText ?? selectedItem.Title ?? 'Artwork'}
                circleSize={64}
              />
            </div>
            <div className="sg-modal-footer">
              <h3>{selectedItem.Title}</h3>
              {selectedItem.Category && (
                <span className="sg-modal-category">{selectedItem.Category}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
