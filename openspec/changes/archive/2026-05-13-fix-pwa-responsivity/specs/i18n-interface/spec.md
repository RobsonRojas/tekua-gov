## ADDED Requirements

### Requirement: Layout-Related Translation Resolution
The system SHALL ensure that all translation keys used in the layout (e.g., navigation labels, page titles) are properly defined and resolved in all supported languages, preventing raw keys (like `layout.notifications`) from being visible to the user.

#### Scenario: Unresolved Key Fallback
- **WHEN** a translation key is missing in the current language.
- **THEN** the system SHALL fallback to the default language (PT-BR) or a human-readable label instead of showing the raw dot-notated key.
- **AND** on mobile navigation, labels for "Notifications" SHALL be correctly translated to "Notificações" or "Notifications".
