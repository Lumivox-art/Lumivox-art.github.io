# Spec Delta: artist-intranet

## Purpose

Enables authenticated artists to manage their public cards, profiles, social links, and custom action workflows directly in Firebase RTDB through an intranet portal.

## ADDED Requirements

### Requirement: Protected artist intranet dashboard
The system SHALL provide a private management dashboard at `/intranet` accessible only to authenticated artists.

#### Scenario: Authenticated artist views tailored dashboard
- **WHEN** an authenticated artist accesses `/intranet`
- **THEN** the system displays their customized artist workspace, identifying their handle, display name, and quick-action tools

#### Scenario: Unauthenticated visitor redirected away
- **WHEN** an unauthenticated visitor attempts to navigate directly to `/intranet` or any subroute
- **THEN** the system denies access and redirects the visitor to the public home page (`/home`)

### Requirement: Profile and card metadata editing
The intranet SHALL allow the artist to update their public card metadata, including hook, discipline, bio description, and theme accent color.

#### Scenario: Artist edits profile text fields
- **WHEN** an artist modifies their tagline, discipline, or biography text and saves changes
- **THEN** the system persists the updated fields to Firebase RTDB under the artist's node and displays confirmation feedback

#### Scenario: Realtime synchronization on public site
- **WHEN** profile changes are saved in the intranet
- **THEN** the public artist card displays the updated text and colors, updating the local cache without requiring code redeployments

### Requirement: Social media links management
The intranet SHALL provide an interface for artists to add, edit, remove, and toggle visibility of their social profile links.

#### Scenario: Artist updates social handle or URL
- **WHEN** an artist updates their Discord tag or YouTube channel URL and commits changes
- **THEN** the updated social entry is written to Firebase RTDB and renders on their public card

#### Scenario: Artist toggles visibility of a social entry
- **WHEN** an artist marks a social network entry as hidden
- **THEN** the public card conceals the platform button while preserving the stored configuration in the database

### Requirement: Artist-specific action shortcuts
The intranet dashboard SHALL present specialized action cards and tool shortcuts based on the authenticated artist's identity.

#### Scenario: Specku accesses PayPal payment link generator
- **WHEN** the authenticated user is Specku
- **THEN** the intranet dashboard surfaces a direct shortcut button to the PayPal Payment Link Generator (`/home/specku/cobrar`) and Gallery Manager

#### Scenario: Other artists view their tailored capabilities
- **WHEN** another artist logs in
- **THEN** the dashboard displays shortcuts relevant to their specific features and pages
