## ADDED Requirements

### Requirement: Handover Evidence Registration
The system SHALL allow the borrower to register evidence (e.g., photo) of receiving the item in the app.

#### Scenario: Borrower registers delivery evidence
- **WHEN** the borrower uploads evidence upon receiving the item
- **THEN** the transaction status updates to "delivered" and the owner is notified

### Requirement: Owner Return Confirmation
The system SHALL allow the owner to confirm the receipt of the item when it is returned by the borrower.

#### Scenario: Owner confirms return
- **WHEN** the owner confirms the item has been returned
- **THEN** the transaction status updates to "completed" and the final hourly charge is calculated and processed via the wallet system
