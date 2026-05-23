## Why

A platform needs to facilitate the sharing, borrowing, and renting of equipment (tools like hammers, drills, etc.) among its members. This creates a circular economy, optimizes resource utilization within the community, and provides members with new ways to earn "surreias" (the platform's currency) while fostering collaboration.

## What Changes

- Create a new "Sharing" tab/marketplace in the platform for members to browse available equipment.
- Allow members to register and publish items they want to share/rent, setting a price in "surreias" per hour of use.
- Enable administrators to moderate published items, including the ability to remove items with a justification and communicate with the owner via item-specific messages.
- Add a Q&A feature allowing other members to ask questions about published items.
- Provide item owners with the ability to toggle their items as private.
- Generate shareable public links for published items.
- Implement a handover workflow: the borrower registers evidence of item delivery in the app, and the owner confirms receipt when the item is returned.

## Capabilities

### New Capabilities
- `equipment-sharing`: Covers the core marketplace for listing, renting, and managing shared equipment, including pricing in surreias, privacy toggles, and public links.
- `sharing-moderation`: Covers admin moderation capabilities for shared items, including removal with justification and admin-owner messaging.
- `sharing-qa`: Covers the question and answer functionality for members on published items.
- `sharing-handover`: Covers the evidence capture for delivery and return confirmation workflow between borrower and owner.

### Modified Capabilities

## Impact

- **UI/Navigation**: A new tab/section will be added to the main navigation for the sharing marketplace.
- **Database**: New tables for items, item questions/answers, rental transactions/handovers, and moderation logs.
- **Wallet/Ledger System**: Integration with the existing `wallet-system` to handle transactions in "surreias" per hour.
- **Notifications**: Notifications for Q&A, moderation actions, and handover updates.
