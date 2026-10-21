# commission-quote Specification

## Purpose
Enables clients to build an itemized commission quote and automatically submit it to artist Joph's Discord channel via Webhook.

## Requirements

### Requirement: Client Discord identifier validation
The system SHALL require the client to provide a valid Discord username or numeric ID before allowing the commission quote to be submitted.

#### Scenario: Submission blocked when Discord identifier is missing
- **WHEN** the client selects all commission options but leaves the Discord username or ID empty
- **THEN** the submission button remains disabled and an indicator prompts for the Discord identifier

#### Scenario: Submission allowed with complete selections and Discord identifier
- **WHEN** the client has selected style, size, and look options, and entered a non-empty Discord username or ID
- **THEN** the submission button becomes enabled

### Requirement: Commission quote itemization and total calculation
The system SHALL format all active commission selections into an itemized Markdown bullet list with individual prices, compute the total price in USD, and associate the request with artist Joph's Discord ID (984706414914187284).

#### Scenario: Summary formatting and total aggregation
- **WHEN** the client selects a style at $21, size at $5, and look at $12
- **THEN** the quote summary compiles each selected item into bullet format `• Category: Selection ($Price USD)`
- **AND** the computed total equals $38 USD

### Requirement: Discord Webhook submission and state handling
The system SHALL transmit the structured commission embed payload to the Discord Webhook via an HTTP POST request and provide clear visual feedback while preventing duplicate submissions.

#### Scenario: Successful quote transmission
- **WHEN** the client submits the form and the Discord Webhook returns HTTP 200 or 204
- **THEN** the submission button disables while in flight
- **AND** a success message confirms the quote was sent and that artist Joph will contact the client on Discord

#### Scenario: Submission failure handling
- **WHEN** the HTTP POST request to the Webhook fails or returns an error status
- **THEN** the system displays an error alert allowing the client to retry
- **AND** re-enables the submission button
