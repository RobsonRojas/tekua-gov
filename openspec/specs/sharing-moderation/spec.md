# sharing-moderation Specification

## Purpose
TBD - created by archiving change sharing-economy. Update Purpose after archive.
## Requirements
### Requirement: Item Moderation
The system SHALL allow administrators to remove published items from the marketplace, requiring a text justification for the removal.

#### Scenario: Admin removes an item
- **WHEN** an admin removes an item and provides a justification
- **THEN** the item is no longer visible in the marketplace and the owner receives a notification with the justification

### Requirement: Admin-Owner Messaging
The system SHALL allow administrators to communicate with the item owner via item-specific messages.

#### Scenario: Admin sends a message
- **WHEN** an admin sends a message on a specific item
- **THEN** the owner receives the message within the context of that item and can reply

