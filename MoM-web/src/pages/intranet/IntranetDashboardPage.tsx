import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LumivoxBrand } from '../../components/LumivoxBrand';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTheme } from '../../components/ThemeContext';
import { useAuth } from '../../components/AuthContext';
import { useLang } from '../../i18n';
import { ArtistProfileService } from '../../services/ArtistProfileService';
import type { ArtistProfile } from '../../models/Artist';
import type { SocialEntry, SocialPlatform } from '../../data/artists';
import './IntranetDashboard.scss';

const COLOR_PRESETS = ['#8D3E2E', '#3B5673', '#3A63A8', '#6FA8AB', '#E5A63B', '#5A3E7A'];

const PLATFORM_OPTIONS: { id: SocialPlatform; label: string }[] = [
  { id: 'discord', label: 'Discord' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'artstation', label: 'ArtStation' },
  { id: 'behance', label: 'Behance' },
  { id: 'github', label: 'GitHub' },
  { id: 'other', label: 'Otro Sitio Web' },
];

export function IntranetDashboardPage() {
  const { theme } = useTheme();
  const { currentUser, artistHandle, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [bio, setBio] = useState('');
  const [brief, setBrief] = useState('');
  const [accentColor, setAccentColor] = useState('#8D3E2E');
  const [socials, setSocials] = useState<SocialEntry[]>([]);

  // Load artist profile
  useEffect(() => {
    if (!artistHandle) return;

    let isMounted = true;
    ArtistProfileService.GetProfile(artistHandle).then((res) => {
      if (!isMounted) return;
      const data = res.Result;
      if (data) {
        setDisplayName(data.displayName || '');
        setTagline(t(data.tagline || ''));
        setDiscipline(t(data.discipline || ''));
        setBio(t(data.bio || ''));
        setBrief(data.brief ? t(data.brief) : '');
        setAccentColor(data.accentColor || '#8D3E2E');
        setSocials(data.socials || []);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [artistHandle]);

  const handleLogout = async () => {
    await logout();
    navigate('/home', { replace: true });
  };

  const handleAddSocial = () => {
    setSocials([
      ...socials,
      { platform: 'discord', url: 'https://', label: '@usuario', hidden: false },
    ]);
  };

  const handleUpdateSocial = (index: number, patch: Partial<SocialEntry>) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], ...patch };
    setSocials(updated);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!artistHandle) return;

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: ArtistProfile = {
      handle: artistHandle,
      displayName: displayName.trim(),
      tagline: tagline.trim(),
      discipline: discipline.trim(),
      bio: bio.trim(),
      brief: brief.trim() || undefined,
      accentColor,
      socials,
      updatedAt: Date.now(),
    };

    try {
      const idToken = await currentUser?.getIdToken();
      const res = await ArtistProfileService.SaveProfile(payload, idToken);

      if (res.CodeNumber === 200) {
        setSuccessMessage(`✓ ${t('intranet.dashboard.success')}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.Message || 'No se pudo guardar los cambios en el servidor.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="intranet-dashboard" data-theme={theme}>
        <div className="ind-loading-screen">
          <div className="ind-spinner" />
          <p>{t('intranet.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const isSpecku = artistHandle === 'specku';

  return (
    <div className="intranet-dashboard" data-theme={theme}>
      {/* Topbar */}
      <header className="ind-topbar">
        <LumivoxBrand />
        <div className="ind-user-controls">
          <div className="ind-user-badge">
            <span className="ind-status-dot" />
            <span className="ind-username">
              {displayName || artistHandle} ({currentUser?.email?.split('@')[0]})
            </span>
          </div>
          <Link to={`/artistas/${artistHandle}`} className="ind-view-public-btn">
            {t('intranet.dashboard.view_public')}
          </Link>
          <button type="button" className="ind-btn-logout" onClick={handleLogout}>
            {t('intranet.dashboard.logout')}
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="ind-container">
        {/* Hero Title */}
        <div className="ind-hero">
          <div className="ind-hero-badge">{t('intranet.dashboard.badge')}</div>
          <h1>{t('intranet.dashboard.welcome')}{displayName || t('intranet.shortcut.artist')}</h1>
          <p className="ind-hero-subtitle">
            {t('intranet.dashboard.subtitle')}
          </p>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="ind-alert-success animate-fade-in">
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="ind-alert-error animate-fade-in">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Artist-Specific Tools Section (Task 3.3) */}
        {isSpecku && (
          <section className="ind-special-tools-card">
            <h2 className="ind-card-title">
              {t('intranet.dashboard.tools.specku_title')}
            </h2>
            <div className="ind-tools-grid">
              <div className="ind-tool-item">
                <div className="ind-tool-header">

                  <div>
                    <h3>{t('intranet.dashboard.tools.pay_title')}</h3>
                    <p>{t('intranet.dashboard.tools.pay_desc')}</p>
                  </div>
                </div>
                <Link to="/home/specku/cobrar" className="ind-tool-btn">
                  {t('intranet.dashboard.tools.pay_btn')}
                </Link>
              </div>

              <div className="ind-tool-item">
                <div className="ind-tool-header">

                  <div>
                    <h3>{t('intranet.dashboard.tools.gallery_title')}</h3>
                    <p>{t('intranet.dashboard.tools.gallery_desc')}</p>
                  </div>
                </div>
                <Link to="/home/specku/galeria" className="ind-tool-btn">
                  {t('intranet.dashboard.tools.gallery_btn')}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Profile Editor Form (Task 3.1 & 3.2) */}
        <form className="ind-editor-form" onSubmit={handleSaveProfile}>
          <div className="ind-form-layout">
            {/* Left Column: Profile fields */}
            <div className="ind-form-column">
              <div className="ind-card">
                <h2 className="ind-card-title">
                  {t('intranet.dashboard.card_info')}
                </h2>

                <div className="ind-field">
                  <label htmlFor="ind-name" className="ind-label">
                    {t('intranet.dashboard.display_name')}
                  </label>
                  <input
                    id="ind-name"
                    type="text"
                    className="ind-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="ind-field">
                  <label htmlFor="ind-tagline" className="ind-label">
                    {t('intranet.dashboard.tagline')}
                  </label>
                  <input
                    id="ind-tagline"
                    type="text"
                    className="ind-input"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Ej. Todo gran universo comienza con un solo concepto."
                  />
                </div>

                <div className="ind-field">
                  <label htmlFor="ind-discipline" className="ind-label">
                    {t('intranet.dashboard.discipline')}
                  </label>
                  <input
                    id="ind-discipline"
                    type="text"
                    className="ind-input"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    placeholder="Ej. Ilustrador · Narrador visual"
                  />
                </div>

                <div className="ind-field">
                  <label htmlFor="ind-bio" className="ind-label">
                    {t('intranet.dashboard.bio')}
                  </label>
                  <textarea
                    id="ind-bio"
                    className="ind-textarea"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe tu visión y experiencia artística..."
                  />
                </div>

                <div className="ind-field">
                  <label htmlFor="ind-brief" className="ind-label">
                    {t('intranet.dashboard.brief')}
                  </label>
                  <textarea
                    id="ind-brief"
                    className="ind-textarea"
                    rows={3}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Información sobre disponibilidad o cómo iniciar una comisión..."
                  />
                </div>

                {/* Accent Color */}
                <div className="ind-field">
                  <label className="ind-label">{t('intranet.dashboard.accent_color')}</label>
                  <div className="ind-color-picker-row">
                    <input
                      type="color"
                      className="ind-color-input"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                    />
                    <span className="ind-color-hex">{accentColor}</span>
                    <div className="ind-color-presets">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`ind-color-swatch ${accentColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setAccentColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Social Media Links (Task 3.2) */}
            <div className="ind-form-column">
              <div className="ind-card">
                <div className="ind-card-header-flex">
                  <h2 className="ind-card-title mb-0">
                    {t('intranet.dashboard.socials')}
                  </h2>
                  <button
                    type="button"
                    className="ind-btn-add-social"
                    onClick={handleAddSocial}
                  >
                    {t('intranet.dashboard.add_social')}
                  </button>
                </div>

                {socials.length === 0 ? (
                  <p className="ind-empty-socials">
                    No tienes redes configuradas aún. Haz clic en <strong>+ Agregar Red</strong> para vincular tus perfiles.
                  </p>
                ) : (
                  <div className="ind-socials-list">
                    {socials.map((social, index) => (
                      <div key={index} className="ind-social-item">
                        <div className="ind-social-row">
                          <select
                            className="ind-select ind-social-platform"
                            value={social.platform}
                            onChange={(e) =>
                              handleUpdateSocial(index, {
                                platform: e.target.value as SocialPlatform,
                              })
                            }
                          >
                            {PLATFORM_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <label className="ind-checkbox-label" title="Ocultar de la vista pública">
                            <input
                              type="checkbox"
                              checked={Boolean(social.hidden)}
                              onChange={(e) =>
                                handleUpdateSocial(index, { hidden: e.target.checked })
                              }
                            />
                            <span>{t('intranet.dashboard.hide')}</span>
                          </label>

                          <button
                            type="button"
                            className="ind-btn-remove-social"
                            onClick={() => handleRemoveSocial(index)}
                            title={t('intranet.dashboard.remove')}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="ind-social-inputs-row">
                          <input
                            type="text"
                            className="ind-input"
                            value={social.label || ''}
                            onChange={(e) =>
                              handleUpdateSocial(index, { label: e.target.value })
                            }
                            placeholder="Etiqueta / Usuario (ej. @specku)"
                          />
                          <input
                            type="url"
                            className="ind-input"
                            value={social.url}
                            onChange={(e) =>
                              handleUpdateSocial(index, { url: e.target.value })
                            }
                            placeholder="https://..."
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ind-submit-wrapper">
                  <button type="submit" className="ind-btn-save-primary" disabled={saving}>
                    {saving ? t('intranet.dashboard.saving') : t('intranet.dashboard.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
