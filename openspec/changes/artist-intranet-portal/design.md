# Design

## Context

The application is a Vite + React 19 single-page application hosted on GitHub Pages with Firebase Realtime Database for media and gallery storage. Profile information and socials are currently split between hardcoded records in `MoM-web/src/data/artists.ts`, localized strings in `i18n.tsx`, and binary images in RTDB (`artista_medio`).

To implement the intranet, we need a lightweight authentication layer, a hidden trigger on the brand logo, and an artist dashboard capable of mutating RTDB nodes that public cards subscribe or fallback to.

See `proposal.md` for motivation and scope.

## Goals / Non-Goals

**Goals:**
- Provide a hidden entrance triggered strictly by 8 rapid clicks on the Lumivox logo within 4 seconds.
- Provide a private, invite-only login screen (`/intranet/login`) without any sign-up or registration form.
- Provide an artist dashboard at `/intranet` allowing authenticated artists to modify their profile data (bio, tagline, discipline, accent color, and socials).
- Provide artist-specific tools on their intranet dashboard (e.g. Specku's shortcut to `/home/specku/cobrar`).
- Keep public page load fast (p95 <= 3s) using stale-while-revalidate caching and instant fallback to `artists.ts`.

**Non-Goals:**
- Public user registration or social login (Google/GitHub/Twitter OAuth).
- Multi-tenant role permissions beyond artist-owned profile partitioning.
- Real-time collaborative multi-user editing.

## Decisions

### 1. 8-Click Logo Easter Egg Detector
- **Decision**: Implement a click-timestamp rolling array in `LumivoxBrand.tsx`. Each click appends `Date.now()`. If 8 clicks occur within 4,000 ms, the counter resets, triggers a CSS pulse animation (`animate-secret-pulse`), and calls `navigate('/intranet/login')`.
- **Alternatives considered**:
  - *Keyboard shortcut (e.g., Ctrl+Shift+A)*: Not usable on mobile or tablet devices.
  - *Footer admin link*: Clutters public portfolio branding.

### 2. Closed Firebase Authentication
- **Decision**: Use `firebase/auth` (`signInWithEmailAndPassword` and `onAuthStateChanged`). Accounts are created exclusively in Firebase Console (or via administrative seeding script), using email format `<handle>@lumivox.art`.
- **Rationale**: Firebase Auth handles secure session persistence (IndexedDB/WebStorage), token refresh, and brute-force protection without exposing credentials in client code.
- **Alternatives considered**:
  - *Custom hardcoded PINs in RTDB*: Insecure and vulnerable to inspection.

### 3. Data Architecture in Firebase RTDB
- **Decision**: Model artist profiles under `/artistas_perfiles/{handle}`:
  ```json
  {
    "handle": "specku",
    "displayName": "Specku",
    "tagline": "Todo gran universo comienza con un solo concepto.",
    "discipline": "Ilustrador · Narrador visual",
    "bio": "¡Hola! Soy Specku...",
    "accentColor": "#8D3E2E",
    "socials": [
      { "platform": "discord", "url": "https://discord.com/users/984706414914187284", "label": "Discord: @specku", "hidden": false }
    ],
    "updatedAt": 1793200000000
  }
  ```
- **Fallback**: Public components query `/artistas_perfiles/{handle}.json` over HTTPS REST. If the network fails or record is empty, fallback to `artists.ts` occurs instantly with zero UI disruption.

### 4. Protected Route Layout (`<IntranetLayout>`)
- **Decision**: Wrap `/intranet` routes inside an `AuthGuard` component that checks `currentUser`. If unauthenticated and auth loading is false, it redirects to `/home`.

## Risks / Trade-offs

- **[Risk]** Firebase Auth email/password provider might not be enabled in Firebase Console.
  - → **Mitigation**: Detect auth configuration state; display clear setup instructions if `auth/operation-not-allowed` is returned.
- **[Risk]** Visitors accidentally triggering 8 clicks.
  - → **Mitigation**: 8 clicks in 4 seconds requires deliberate, rapid tapping. Even if triggered, without valid artist credentials access to `/intranet` is impossible.
- **[Risk]** Overwriting hardcoded translations in `i18n.tsx`.
  - → **Mitigation**: The dynamic RTDB profile takes precedence for the artist's card; fallback keys in `i18n.tsx` remain available for English/Spanish default rendering.

## Migration Plan

1. Enable Email/Password authentication in Firebase Console for project `multiverseofmadness21-fefd9`.
2. Seed initial artist accounts (`specku@lumivox.art`, `nix@lumivox.art`, `sunlight@lumivox.art`).
3. Deploy new frontend routes and components to GitHub Pages via `main` branch.
