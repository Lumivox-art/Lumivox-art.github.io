# Tasks

## 1. Authentication Scaffolding & 8-Click Secret Trigger

- [x] 1.1 Implement 8-click rolling timestamp detector and CSS pulse animation in `LumivoxBrand.tsx` that navigates to `/intranet/login` upon 8 clicks within 4 seconds; verify normal single clicks still navigate to `/home`.
- [x] 1.2 Export `getAuth(app)` from `MoM-web/src/firebase.ts` and create `MoM-web/src/components/AuthContext.tsx` providing `currentUser`, `artistHandle`, `login()`, `logout()`, and auth loading state; verify TypeScript compilation passes.
- [x] 1.3 Create `IntranetLoginPage.tsx` and `IntranetLogin.scss` featuring closed sign-in form without registration or sign-up links, handling Firebase Auth errors in actionable Spanish; verify form validation and error display.

## 2. Artist Profile Service & Data Model

- [x] 2.1 Create `MoM-web/src/services/ArtistProfileService.ts` with methods to fetch and patch `/artistas_perfiles/{handle}` via Firebase HTTPS REST with `LocalCache` integration; verify cache-first and write behaviors.
- [x] 2.2 Create seeding script `MoM-web/scripts/seed-artist-profiles.js` to initialize Firebase RTDB profile records for existing artists (Specku, Nix, Sunlight Blue); verify successful seed execution.

## 3. Artist Intranet Dashboard

- [x] 3.1 Create `IntranetDashboardPage.tsx` and `IntranetDashboard.scss` with artist profile editor (tagline, discipline, bio, accent color); verify editing and saving updates the RTDB node.
- [x] 3.2 Build social links editor inside the dashboard allowing adding, editing, deleting, and toggling visibility of social media platforms; verify changes persist to Firebase RTDB.
- [x] 3.3 Implement conditional artist tool shortcuts (displaying the "💳 Generar Orden de Cobro PayPal" shortcut and gallery manager specifically when logged in as Specku); verify identity-based shortcut rendering.

## 4. Public Site Integration & Route Protection

- [x] 4.1 Register `/intranet/login` and `/intranet` inside `MoM-web/src/main.tsx` wrapped in an `AuthGuard` that redirects unauthenticated visitors to `/home`; verify protected route redirection.
- [x] 4.2 Connect `ArtistsPage.tsx` and public card components to read from `ArtistProfileService` with instant fallback to `artists.ts`; verify cards render updated database values smoothly without layout shift.
- [x] 4.3 Add bilingual i18n keys for intranet dashboard and authentication views in `MoM-web/src/i18n.tsx`; verify full build `npm --prefix MoM-web run build:gh-pages` succeeds with 0 errors.
