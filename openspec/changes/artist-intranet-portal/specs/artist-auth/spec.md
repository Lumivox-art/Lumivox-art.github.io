# Spec Delta: artist-auth

## Purpose

Provides a discrete, invite-only authentication mechanism for artists with a hidden 8-click easter egg entry on the brand logo, eliminating visible public admin clutter while securing private intranet access.

## ADDED Requirements

### Requirement: Secret logo activation threshold
The Lumivox brand logo SHALL detect 8 consecutive user clicks within a 4-second rolling window to unlock the hidden intranet login interface.

#### Scenario: Eight rapid clicks trigger secret gateway
- **WHEN** a user clicks the Lumivox logo 8 times within 4 seconds
- **THEN** the logo flashes a brief visual activation pulse and navigates the user to the secret intranet login route (`/intranet/login`)

#### Scenario: Normal clicks navigate to home
- **WHEN** a user clicks the Lumivox logo fewer than 8 times
- **THEN** each click acts as standard brand navigation, redirecting to the home page (`/home`) without revealing login controls

### Requirement: Invite-only authentication without registration
The system SHALL authenticate artists using pre-provisioned credentials via Firebase Authentication without presenting public registration or sign-up options.

#### Scenario: Artist logs in with valid credentials
- **WHEN** an artist submits registered email and password credentials
- **THEN** the system authenticates the user, stores their secure session, and redirects to the artist intranet dashboard (`/intranet`)

#### Scenario: Login fails with invalid credentials
- **WHEN** an unrecognized email or incorrect password is submitted
- **THEN** the system rejects authentication, retains the login view, and displays an actionable error message in Spanish

#### Scenario: Absence of public sign-up
- **WHEN** any user views the intranet login page
- **THEN** the interface displays only login inputs, with no public registration, account creation, or self-service sign-up links

### Requirement: Persistent artist session management
The system SHALL persist the authenticated artist session across page reloads and browser restarts until explicit sign-out or session expiration.

#### Scenario: Session survives page refresh
- **WHEN** an authenticated artist reloads any page or navigates between routes
- **THEN** the system retains the authenticated artist identity and permissions without prompting for credentials

#### Scenario: Artist signs out
- **WHEN** an authenticated artist selects the sign-out option in the intranet
- **THEN** the system invalidates the local session, clears authentication state, and redirects to the public home page
