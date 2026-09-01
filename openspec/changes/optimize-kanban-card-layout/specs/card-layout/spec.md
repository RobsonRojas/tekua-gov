# Capability: Unclipped Kanban Card Layout

## Requirements

### Requirement: Full Visibility of Card Information Without Overflow
Cards on the Kanban board MUST fit all headers, badges, titles, descriptions, confirmation bars, and action buttons cleanly within card boundaries without horizontal or vertical clipping.

#### Scenario: Displaying task card with long status label
- **Given** an activity with status `pending_validation` ("Aguardando Validação") or `pending_approval` ("Aguardando Aprovação")
- **When** the card is rendered on the Kanban board
- **Then** the status chip and reward badge MUST fit inside the card header without truncating or overlapping
- **And** moderation buttons MUST remain fully clickable and contained inside the card boundaries.
