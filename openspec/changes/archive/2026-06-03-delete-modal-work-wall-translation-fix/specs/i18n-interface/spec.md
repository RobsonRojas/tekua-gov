## MODIFIED Requirements

### Requirement: Layout-Related Translation Resolution
The system SHALL ensure that all translation keys used in the layout (e.g., navigation labels, page titles, deletion modal elements) are properly defined and resolved in all supported languages, preventing raw keys from being visible to the user.

#### Scenario: Unresolved Key Fallback
- **WHEN** a translation key is missing in the current language.
- **THEN** the system SHALL fallback to the default language (PT-BR) or a human-readable label instead of showing the raw dot-notated key.
- **AND** on mobile navigation, labels for "Notifications" SHALL be correctly translated to "Notificações" or "Notifications".

#### Scenario: Deletion Modal Translation Resolution
- **WHEN** the deletion modal for work wall tasks is rendered.
- **THEN** the title, confirm message, justification field label, and delete button label SHALL be translated correctly in the active language (PT or EN).
- **AND** if a translation key is missing, the system SHALL fallback to a human-readable default label instead of the raw dot-notated key.
