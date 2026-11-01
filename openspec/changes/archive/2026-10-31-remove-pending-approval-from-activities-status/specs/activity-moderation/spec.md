## ADDED Requirements

### Requirement: Activity Status Has No Pending Approval Value
The `activity_status` type exposed by the database SHALL contain exactly the values `open`, `in_progress`, `pending_validation`, `completed` and `rejected`. The legacy value `pending_approval` SHALL NOT be part of the type, and no activity SHALL be able to be stored with that status.

#### Scenario: Enum range does not contain the removed value
- **WHEN** the set of values of the `activity_status` type is inspected.
- **THEN** it SHALL contain exactly `open`, `in_progress`, `pending_validation`, `completed` and `rejected`.
- **AND** it SHALL NOT contain `pending_approval`.

#### Scenario: Writing the removed value is rejected
- **WHEN** an insert or an update tries to assign the status `pending_approval` to an activity.
- **THEN** the database SHALL reject the statement as an invalid value for the `activity_status` type.
- **AND** the activity SHALL NOT be created nor modified.

#### Scenario: No activity is left with the removed status
- **WHEN** the removal of the value has been applied to the database.
- **THEN** no row of the activities table SHALL have the status `pending_approval`.
- **AND** every existing activity SHALL keep a status that is still valid (`open`, `in_progress`, `pending_validation`, `completed` or `rejected`).

#### Scenario: Activities keep being created with the supported statuses
- **WHEN** a task or a demand is created by an authenticated member.
- **THEN** the activity SHALL be registered with the status `open`.
- **WHEN** a contribution (work already performed) is registered.
- **THEN** the activity SHALL be registered with the status `pending_validation`.

#### Scenario: Confirmation only accepts activities awaiting validation
- **WHEN** a user confirms an activity.
- **THEN** the confirmation SHALL be accepted only for activities whose status is `pending_validation`.
- **AND** the confirmation of an activity in any other status SHALL be rejected with an error.

### Requirement: Activity Access Rules Survive The Status Type Change
The access control rules of the activities table SHALL remain in force after the `activity_status` type is replaced, so that removing the legacy status value SHALL NOT change who can read, create or update activities.

#### Scenario: Activities stay readable by every user
- **WHEN** any user reads the activities table.
- **THEN** the system SHALL apply the same visibility rules that were in force before the type replacement.

#### Scenario: Activities keep their write rules
- **WHEN** a user updates an activity.
- **THEN** the system SHALL apply the same requester, worker, executor and role based rules that were in force before the type replacement.

#### Scenario: Access rules are not silently dropped
- **WHEN** the removal of the value has been applied to the database.
- **THEN** the access control rules of the activities table SHALL still be present.
- **AND** no rule SHALL have been removed as a side effect of replacing the `activity_status` type.
