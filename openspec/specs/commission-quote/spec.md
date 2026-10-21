# commission-quote Specification

## Purpose
Enables clients to build an itemized commission quote and directly dispatch it to artist Specku's Discord profile (ID: `984706414914187284`) via clipboard-ready formatted message and direct profile navigation.

## Requirements

### Requirement: Mandatory commission selections validation
The system SHALL require the client to select all mandatory commission options (style, size, and look) before enabling the direct Discord message action button.

#### Scenario: Button disabled when selections are incomplete
- **WHEN** the client has not picked a style, size, or look
- **THEN** the Discord action button remains disabled and an indicator prompts to complete the selections

#### Scenario: Button enabled when all selections are complete
- **WHEN** the client has chosen style, size, and look
- **THEN** the Discord action button becomes enabled

### Requirement: Commission quote itemization and total calculation
The system SHALL format all active commission selections into an itemized bullet list with individual prices, compute the total price in USD and local currency (MXN), and format the message text for direct transmission.

#### Scenario: Summary formatting and total aggregation
- **WHEN** the client selects a style at $21, size at $5, and look at $12
- **THEN** the quote compiles each selected item into bullet format `• Category: Selection ($Price USD)`
- **AND** the computed total equals $38 USD

### Requirement: Direct Discord profile dispatch and clipboard integration
The system SHALL automatically copy the assembled quote message to the client's clipboard and open artist Specku's Discord profile (`https://discord.com/users/984706414914187284`) in a new tab when the action button is triggered.

#### Scenario: Triggering direct Discord action
- **WHEN** the client clicks the Discord action button with complete selections
- **THEN** the formatted message is copied to the user's clipboard
- **AND** a new browser tab navigates to `https://discord.com/users/984706414914187284`
- **AND** visual confirmation informs the client that the quote is copied and ready to paste into Specku's chat
