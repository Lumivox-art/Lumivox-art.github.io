# Proposal

## Why

Currently, all artist profiles, biographies, social links, and custom action shortcuts are statically defined in code or manually seeded into Firebase RTDB, requiring developer intervention and code commits for simple changes (updating Discord tags, changing bio copy, adding social links).

An internal artist portal (intranet) allows verified community artists (such as Specku, Nix, and Sunlight Blue) to manage their public cards, profiles, and custom tools autonomously, while keeping the public-facing site clean and free of visible admin clutter through a hidden 8-click Easter Egg entrance on the Lumivox logo and closed, invite-only authentication.

## What Changes

- **Hidden Entrance (8-Click Easter Egg)**: Detects 8 rapid clicks on the Lumivox brand logo within 4 seconds, triggering a secret gateway to the artist login view without exposing public login buttons.
- **Closed Artist Authentication**: Login-only authentication powered by Firebase Auth (`signInWithEmailAndPassword`) with zero public registration or sign-up forms; artist accounts are provisioned internally.
- **Artist Intranet Dashboard (`/intranet`)**: Private management dashboard tailored to the authenticated artist.
- **Profile & Card Management**: Allows artists to edit their hook/tagline, bio, discipline, accent color, and upload card/splash images directly to Firebase RTDB.
- **Socials & Links Manager**: Allows artists to add, edit, reorder, or toggle visibility of their social profiles (Discord, YouTube, Twitter, portfolio).
- **Artist Custom Actions**: Dynamic shortcuts based on artist identity (e.g., direct access for Specku to the PayPal Payment Link Generator and Gallery manager).
- **Public Site Sync**: Realtime or cached synchronization between Firebase RTDB artist profiles and the public artist cards, preserving offline fallback.

## Capabilities

### New Capabilities
- `artist-auth`: Hidden 8-click logo entrance, invite-only Firebase authentication (login without public sign-up), and secure artist session management.
- `artist-intranet`: Private artist portal for editing profile metadata, managing social links, accessing artist-specific workflows (e.g., Specku PayPal generator), and updating public card state in Firebase RTDB.

### Modified Capabilities
<!-- None: existing capability commission-quote is unmodified -->

## Impact

- **Frontend Application (`MoM-web`)**:
  - `components/LumivoxBrand.tsx`: Integration of the 8-click threshold detector and visual pulse.
  - `context/AuthContext.tsx`: New authentication state provider consuming Firebase Auth.
  - `pages/intranet/*`: New intranet login and dashboard pages and styles.
  - `services/ArtistProfileService.ts`: Realtime Database CRUD operations for artist profile metadata.
  - `main.tsx`: Protected `/intranet` routes.
- **Firebase**:
  - Firebase Authentication enabled for email/password provider.
  - Firebase RTDB rules updated for authenticated artist write access to their respective `/artistas/{handle}` nodes.
