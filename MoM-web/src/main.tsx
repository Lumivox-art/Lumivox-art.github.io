import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { PageTransition } from './components/PageTransition';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { LanguageProvider } from './i18n';
import { LumivoxHomePage } from './pages/LumivoxHomePage';
import { ArtistsPage } from './pages/ArtistsPage';
import { SamCommissionsPage } from './pages/SamCommissionsPage';
import { SpeckuCommissionsPage } from './pages/SpeckuCommissionsPage';
import { SpeckuTermsPage } from './pages/SpeckuTermsPage';
import { SpeckuGalleryPage } from './pages/SpeckuGalleryPage';
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

// Root layout: mounts the page-transition overlay above every route within a global error boundary.
function RootLayout() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AppThemeSync />
          <PageTransition />
          <AppErrorBoundary>
            <Outlet />
          </AppErrorBoundary>
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
      { path: '/home/sam/comisiones', element: <SamCommissionsPage /> },
      { path: '/home/specku/comisiones', element: <SpeckuCommissionsPage /> },
      { path: '/home/specku/terminos', element: <SpeckuTermsPage /> },
      { path: '/home/specku/galeria', element: <SpeckuGalleryPage /> },
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
