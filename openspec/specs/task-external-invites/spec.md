# task-external-invites Specification

## Purpose
TBD - created by archiving change invite-link-with-surreal-reward. Update Purpose after archive.
## Requirements
### Requirement: Task Invite Generation
The system SHALL allow administrators to generate a unique invitation link and a QR code for any active task.

#### Scenario: Admin generates invite link
- **WHEN** an admin views a task detail page
- **THEN** the system displays a unique invitation link and a corresponding QR code for the task

### Requirement: External User Onboarding via Invite
The system SHALL provide a dedicated onboarding flow for external users who access an invitation link.

#### Scenario: User accesses invite link
- **WHEN** an unauthenticated user navigates to the invitation link
- **THEN** they see a landing page with task details and a prompt to register

#### Scenario: User registers via invite
- **WHEN** a user successfully creates an account after following an invite link
- **THEN** they are automatically added as a participant to the associated task

### Requirement: Reward Notification
The system SHALL clearly communicate the Surreal reward associated with the task during the onboarding flow.

#### Scenario: Reward visibility
- **WHEN** a user views the task invite landing page
- **THEN** the system displays the amount of Surreais they will earn upon successful completion of the task

