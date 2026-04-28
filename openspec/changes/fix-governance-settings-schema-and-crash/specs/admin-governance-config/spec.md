## ADDED Requirements

### Requirement: Persistence of Governance Parameters
The system SHALL persist all governance parameters in a centralized `governance_settings` table to ensure consistent behavior across the platform.

#### Scenario: Singleton Settings Record
- **WHEN** the system is initialized.
- **THEN** it MUST ensure a single record with ID 'current' exists in the `governance_settings` table.

#### Scenario: Read Settings on App Startup
- **WHEN** the platform services (e.g., Voting, Work Registration) load.
- **THEN** they MUST fetch the 'current' governance settings to apply validation rules correctly.
