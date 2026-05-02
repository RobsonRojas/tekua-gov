## ADDED Requirements

### Requirement: Custom PWA Install Prompt
The system SHALL provide an explicit UI component (e.g., button or banner) to allow users to install the application as a PWA, beyond the browser's native prompts.

#### Scenario: Install Button Visibility
- **WHEN** the user accesses the platform via a PWA-compatible browser on a mobile device.
- **AND** the application is not yet installed.
- **THEN** the system SHALL display a "Install App" button in the navigation or settings menu.

#### Scenario: Triggering Installation
- **WHEN** the user clicks the "Install App" button.
- **THEN** the system SHALL trigger the browser's `beforeinstallprompt` event.
- **AND** if the user confirms, the application SHALL be installed on the device.

#### Scenario: Hiding Button after Installation
- **WHEN** the application is already installed or the user has dismissed the prompt.
- **THEN** the "Install App" button SHALL be hidden from the UI.
