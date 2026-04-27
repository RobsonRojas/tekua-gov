## ADDED Requirements

### Requirement: Admin Dashboard Card Visibility
The system SHALL ensure that administrative dashboard cards (e.g., Member Management) are only rendered for users with administrative privileges.

#### Scenario: Admin User Dashboard Rendering
- **GIVEN** an authenticated user with the 'admin' role
- **WHEN** the dashboard page is loaded
- **THEN** administrative cards SHALL be visible and interactive

#### Scenario: Member User Dashboard Rendering
- **GIVEN** an authenticated user with the 'member' role
- **WHEN** the dashboard page is loaded
- **THEN** administrative cards SHALL be completely removed from the UI (not just disabled)
