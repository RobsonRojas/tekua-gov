# admin-panel Specification

## Purpose
TBD - created by archiving change portal-governanca-tekua. Update Purpose after archive.
## Requirements
### Requirement: Admin Access Control
Administrative areas SHALL be restricted to users with the 'admin' role.

#### Scenario: Unauthorized Access Attempt
- **GIVEN** A user with a 'member' role attempts to navigate to the admin panel URL.
- **THEN** The user is redirected to the home page or shown a 'Forbidden' message.

### Requirement: User Management
Administrators SHALL be able to list and manage all system users. The user list SHALL include each member's current Surreal (SR$) wallet balance as an additional data column.

#### Scenario: Toggle User Role
- **GIVEN** An administrator clicks the 'Tornar Administrador' action on a 'member' user.
- **THEN** The user's role is updated in the database and the UI reflects the change.

#### Scenario: Search Member
- **GIVEN** An administrator types 'Alice' into the search bar.
- **THEN** The list is filtered to only show users whose name contains 'Alice'.

#### Scenario: Surreal balance column visible in user list
- **WHEN** an administrator views the user management table
- **THEN** the system SHALL display a "Saldo SR$" column for each member showing their current wallet balance

### Requirement: Admin Security (Testing)
Administrative features SHALL include security verification to prevent unauthorized access.

#### Scenario: Integration - Edge Function Identity Check
- **GIVEN** A manual request is sent to the role update function with a user's JWT.
- **THEN** The function validates that the requesting user's profile is indeed an 'admin'.

### Requirement: AI Settings Management
Administrators SHALL be able to configure the default AI model to be used by the system.

#### Scenario: Update Default AI Model
- **WHEN** an administrator accesses the AI settings in the admin panel and selects a new default model
- **THEN** the system updates the configuration in the database and subsequent AI requests use the newly selected model by default.

