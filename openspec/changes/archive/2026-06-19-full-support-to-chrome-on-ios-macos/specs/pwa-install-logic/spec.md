## MODIFIED Requirements

### Requirement: PWA Installation Prompts
The application SHALL prompt the user to install the PWA, providing context-aware instructions for unsupported or restricted environments (like iOS).

#### Scenario: iOS Safari Installation
- **GIVEN** a user is on an iOS device using the Safari browser.
- **WHEN** the `InstallPrompt` is rendered.
- **THEN** the application provides Safari-specific instructions displaying the Safari share icon and text.

#### Scenario: iOS Chrome Installation
- **GIVEN** a user is on an iOS device using the Chrome browser (`crios`).
- **WHEN** the `InstallPrompt` is rendered.
- **THEN** the application provides Chrome-specific instructions displaying the top-right share/menu icon and text.

#### Scenario: macOS Chrome Installation
- **GIVEN** a user is on a macOS device using the Chrome browser.
- **WHEN** the `beforeinstallprompt` event fires.
- **THEN** the application detects it as `desktop` platform and enables the native installation flow.
