## ADDED Requirements

### Requirement: Dashboard Admin Shortcuts
The system SHALL ensure that administrative cards on the dashboard point to the correct sections of the unified Admin Panel.

#### Scenario: Member Management Shortcut
- **WHEN** the user clicks "Access" on the "Member Management" dashboard card
- **THEN** the system SHALL navigate to the `/admin-panel?tab=users` route
