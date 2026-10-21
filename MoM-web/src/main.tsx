import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import { PageTransition } from './components/PageTransition';
import { ThemeProvider } from './components/ThemeContext';
import { LanguageProvider } from './i18n';
import { LumivoxHomePage } from './pages/LumivoxHomePage';
import { ArtistsPage } from './pages/ArtistsPage';
import { SamCommissionsPage } from './pages/SamCommissionsPage';
import { SpeckuCommissionsPage } from './pages/SpeckuCommissionsPage';

// Root layout: mounts the page-transition overlay above every route.
function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <PageTransition />
        <Outlet />
      </ThemeProvider>
    </LanguageProvider>
  );
}

// Route convention: /home/{artist}/{page} — see docs/arc42 (ADR-0001).
// The Multiverse of Madness portal now lives at its own site
// (multiverseofmadness.me); Luis.M's card links out to it.
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <LumivoxHomePage /> },
      { path: '/artistas', element: <ArtistsPage /> },
      { path: '/artistas/:handle', element: <ArtistsPage /> },
      { path: '/home/sam/comisiones', element: <SamCommissionsPage /> },
      { path: '/home/specku/comisiones', element: <SpeckuCommissionsPage /> },
      { path: '/home/joz/comisiones', element: <Navigate to="/home/specku/comisiones" replace /> },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
