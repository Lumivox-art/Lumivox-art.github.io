import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LumivoxBrand } from '../../components/LumivoxBrand';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTheme } from '../../components/ThemeContext';
import { useAuth } from '../../components/AuthContext';
import { useLang } from '../../i18n';
import './IntranetLogin.scss';

export function IntranetLoginPage() {
  const { theme } = useTheme();
  const { t } = useLang();
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to intranet dashboard
  if (currentUser) {
    navigate('/intranet', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    if (!trimmedId || !password) {
      setErrorMessage(
        t('intranet.login.error.empty') || 'Por favor ingresa tu usuario o correo y tu contraseña.',
      );
      return;
    }

    try {
      setLoading(true);
      await login(trimmedId, password);
      navigate('/intranet', { replace: true });
    } catch (err: unknown) {
      console.error('[IntranetLogin] Error:', err);
      const code = (err as { code?: string })?.code || '';

      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setErrorMessage(
            t('intranet.login.error.credentials') ||
              'Credenciales no reconocidas. Verifica tu usuario y contraseña.',
          );
          break;
        case 'auth/too-many-requests':
          setErrorMessage(
            t('intranet.login.error.rate_limit') ||
              'Demasiados intentos fallidos. Por seguridad, espera unos momentos antes de reintentar.',
          );
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage(
            'El método de autenticación con contraseña no está habilitado en Firebase Console.',
          );
          break;
        default:
          setErrorMessage(
            t('intranet.login.error.general') ||
              'No se pudo conectar al servidor de autenticación. Intenta de nuevo.',
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intranet-login" data-theme={theme}>
      {/* Topbar */}
      <div className="inl-topbar">
        <LumivoxBrand />
        <div className="inl-topbar-actions">
          <Link to="/home" className="inl-back-link">
            ← {t('artists.back') || 'Inicio'}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <main className="inl-container">
        <div className="inl-card">
          <header className="inl-header">
            <div className="inl-emblem">🔒</div>
            <span className="inl-badge">ACCESO PRIVADO</span>
            <h1 className="inl-title">
              {t('intranet.login.title') || 'Intranet de Artistas'}
            </h1>
            <p className="inl-subtitle">
              {t('intranet.login.subtitle') ||
                'Portal exclusivo para que los creadores de Lumivox administren sus perfiles, enlaces y herramientas.'}
            </p>
          </header>

          {errorMessage && (
            <div className="inl-error-alert animate-shake">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          <form className="inl-form" onSubmit={handleSubmit}>
            <div className="inl-field-group">
              <label htmlFor="inl-identifier" className="inl-label">
                Usuario o Correo Electrónico:
              </label>
              <input
                id="inl-identifier"
                type="text"
                className="inl-input"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ej. specku o usuario@lumivox.art"
                disabled={loading}
                required
              />
            </div>

            <div className="inl-field-group">
              <label htmlFor="inl-password" className="inl-label">
                Contraseña:
              </label>
              <input
                id="inl-password"
                type="password"
                className="inl-input"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="inl-btn-submit" disabled={loading}>
              {loading
                ? t('intranet.login.loading') || 'Iniciando sesión...'
                : t('intranet.login.btn') || 'Ingresar a mi Panel'}
            </button>
          </form>

          <footer className="inl-footer">
            <p className="inl-closed-notice">
              🛡️ <strong>Acceso cerrado:</strong> Este portal no admite registro público. Si eres
              un artista miembro del colectivo, solicita tu cuenta al administrador.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
