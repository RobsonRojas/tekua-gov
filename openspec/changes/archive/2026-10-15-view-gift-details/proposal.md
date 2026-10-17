## Why

Currently, users can see a list of gifts in the Gift Economy area, but the card might not display all necessary information if the description is long. Adding a detailed view will allow users to fully read and understand the offer before deciding to utilize it.

## What Changes

- The gift card on the Gift Economy page becomes clickable.
- Clicking a gift card opens a detailed view (e.g., a modal or a separate page) showing the full description, the provider's information, and the "Eu utilizei isso" button.

## Capabilities

### New Capabilities

### Modified Capabilities
- `gift-economy-area`: Add requirement to allow clicking a gift card to view its full details.

## Impact

- Frontend: `GiftEconomy` page components (specifically the gift card and a new detail view/modal).
