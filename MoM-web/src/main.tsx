import { StrictMode, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { PageTransition } from './components/PageTransition';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { LanguageProvider } from './i18n';
import { AuthProvider, useAuth } from './components/AuthContext';
import { IntranetFloatingBadge } from './components/IntranetShortcut';
import { LumivoxHomePage } from './pages/LumivoxHomePage';
import { ArtistsPage } from './pages/ArtistsPage';
import { SamCommissionsPage } from './pages/SamCommissionsPage';
import { SunlightCommissionsPage } from './pages/SunlightCommissionsPage';
import { SpeckuCommissionsPage } from './pages/SpeckuCommissionsPage';
import { SpeckuTermsPage } from './pages/SpeckuTermsPage';
import { SpeckuGalleryPage } from './pages/SpeckuGalleryPage';
import { SpeckuPayGeneratorPage } from './pages/SpeckuPayGeneratorPage';
import { SpeckuPayCheckoutPage } from './pages/SpeckuPayCheckoutPage';
import { IntranetLoginPage } from './pages/intranet/IntranetLoginPage';
import { IntranetDashboardPage } from './pages/intranet/IntranetDashboardPage';
import { setupWakeupSync } from './utils/wakeupSync';

// Initialize tab visibility change and network wake-up listeners to prevent frozen/zombie connections
setupWakeupSync();

function AppThemeSync() {
  const { theme } = useTheme();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
  return null;
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

// Root layout: mounts the page-transition overlay above every route within a global error boundary.
function RootLayout() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppThemeSync />
            <PageTransition />
            <IntranetFloatingBadge />
            <AppErrorBoundary>
              <Outlet />
            </AppErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}

// Route convention: /home/{artist}/{page} — see docs/arc42 (ADR-0001).
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: (
      <AppErrorBoundary>
        <Navigate to="/home" replace />
      </AppErrorBoundary>
    ),
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <LumivoxHomePage /> },
      { path: '/artistas', element: <ArtistsPage /> },
      { path: '/artistas/:handle', element: <ArtistsPage /> },
      { path: '/intranet/login', element: <IntranetLoginPage /> },
      {
        path: '/intranet',
        element: (
          <AuthGuard>
            <IntranetDashboardPage />
          </AuthGuard>
        ),
      },
      { path: '/home/sam/comisiones', element: <SamCommissionsPage /> },
      { path: '/home/sunlight-blue/comisiones', element: <SunlightCommissionsPage /> },
      { path: '/sunlight-blue/comisiones', element: <Navigate to="/home/sunlight-blue/comisiones" replace /> },
      { path: '/home/sunlight/comisiones', element: <Navigate to="/home/sunlight-blue/comisiones" replace /> },
      { path: '/sunlight/comisiones', element: <Navigate to="/home/sunlight-blue/comisiones" replace /> },
      { path: '/home/specku/comisiones', element: <SpeckuCommissionsPage /> },
      { path: '/home/specku/terminos', element: <SpeckuTermsPage /> },
      { path: '/home/specku/galeria', element: <SpeckuGalleryPage /> },
      { path: '/home/specku/cobrar', element: <SpeckuPayGeneratorPage /> },
      { path: '/home/specku/pagar', element: <SpeckuPayCheckoutPage /> },
      { path: '/specku/cobrar', element: <Navigate to="/home/specku/cobrar" replace /> },
      { path: '/specku/pagar', element: <Navigate to="/home/specku/pagar" replace /> },
      { path: '/specku/pay', element: <Navigate to="/home/specku/pagar" replace /> },
      { path: '/home/specku/pay', element: <Navigate to="/home/specku/pagar" replace /> },
      { path: '/home/specku/gallery', element: <Navigate to="/home/specku/galeria" replace /> },
      { path: '/home/specku/tos', element: <Navigate to="/home/specku/terminos" replace /> },
      { path: '/home/specku/terms', element: <Navigate to="/home/specku/terminos" replace /> },
      { path: '/home/joz/comisiones', element: <Navigate to="/home/specku/comisiones" replace /> },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  </StrictMode>,
);
