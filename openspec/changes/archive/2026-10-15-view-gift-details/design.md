## Context

See `proposal.md` for motivation. The current `GiftsArea.tsx` lists gifts, but their descriptions might be cut off. We need a way to display the full information of a gift.

## Goals / Non-Goals

**Goals:**
- Allow users to click on a gift card in `GiftsArea`.
- Show a modal or a dialog containing the full details of the gift.

**Non-Goals:**
- Modifying the underlying data schema for gifts.
- Adding a dedicated `/gifts/:id` URL route.

## Decisions

**Decision 1: Use a Modal instead of a new Route**
- **Rationale**: The Gift Economy area is currently a single exploratory page. Opening a modal maintains the context of the list underneath and is quicker than navigating to a separate route.
- **Alternatives Considered**: A new page route (`/gifts/:id`). This would be better for direct linking, but slightly more complex and disrupts the browsing flow.

## Risks / Trade-offs

- **Risk**: Long descriptions might cause the modal to overflow.
  **Mitigation**: Ensure the modal content area has a max-height and scrolling enabled.
