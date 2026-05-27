## ADDED Requirements

### Requirement: Admin Controls on Work Cards
The system SHALL provide inline administrative controls on work/demand cards to allow administrators to directly modify critical validation parameters without navigating to the admin panel.

#### Scenario: Admin editing validation threshold
- **WHEN** an administrator views a work card on the work wall.
- **THEN** the system SHALL display an editable field or control for the `validation_threshold`.
- **AND** any changes made SHALL immediately update the `min_confirmations` required for that specific activity in the database.
- **AND** non-admin users SHALL NOT see or interact with this control.
