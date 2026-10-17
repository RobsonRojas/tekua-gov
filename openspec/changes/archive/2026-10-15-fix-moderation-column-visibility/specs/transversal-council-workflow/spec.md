## MODIFIED Requirements

### Requirement: Moderation Dashboard
The system SHALL provide a moderation interface (column/dashboard) accessible to all members for editing purposes, but the approval and rejection actions SHALL be restricted to `transversal_council` members and `admin` members.

#### Scenario: Accessing moderation dashboard as transversal council
- **WHEN** a `transversal_council` member navigates to the moderation section.
- **THEN** the system SHALL display a list of all tasks and demands with `pending_approval` status, and SHALL allow them to approve or reject the tasks.

#### Scenario: Accessing moderation dashboard as a regular member
- **WHEN** a regular `member` navigates to the moderation section.
- **THEN** the system SHALL display the tasks, and SHALL allow them to view and suggest edits, but SHALL NOT allow them to approve or reject tasks.
