## ADDED Requirements

### Requirement: Equipment Listing
The system SHALL allow members to register and publish equipment items available for sharing, specifying a title, description, and hourly price in "surreias".

#### Scenario: Successful item publication
- **WHEN** a member submits the new item form with valid details and an hourly rate
- **THEN** the system creates the item and displays it in the public marketplace

### Requirement: Private Items
The system SHALL allow the item owner to toggle an item's visibility to private.

#### Scenario: Toggling privacy
- **WHEN** an owner marks an active item as private
- **THEN** the item is removed from the public marketplace but remains visible to the owner

### Requirement: Public Sharable Link
The system SHALL provide a unique, shareable public URL for each published item.

#### Scenario: Accessing public link
- **WHEN** any user (authenticated or not) accesses the public URL of an active public item
- **THEN** the system displays the item details
