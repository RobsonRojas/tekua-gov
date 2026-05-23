## Context

The platform wants to introduce a sharing economy marketplace where members can rent or share their tools/equipment with other members. This requires new database tables for listings, moderation, Q&A, and transaction/handover records. The marketplace will use the existing "surreias" currency for renting equipment per hour.

## Goals / Non-Goals

**Goals:**
- Implement a marketplace interface for listing, browsing, and renting equipment.
- Allow owners to set hourly prices in surreias.
- Enable moderation with justification and messaging.
- Provide a Q&A section on listings.
- Track handover (delivery and return) with evidence.
- Support public, shareable links.

**Non-Goals:**
- Escrow system for real-world currency.
- Dispute resolution process beyond simple admin moderation.
- Automated insurance for damaged tools.

## Decisions

- **Data Model**: We will create an `equipment_items` table linked to user profiles, a `sharing_transactions` table to track rentals and handovers, and `equipment_questions` / `equipment_moderation_logs` tables.
- **Currency Integration**: Integration with the `wallet_system` to transfer "surreias" from the borrower to the owner based on the hourly rate and duration recorded in `sharing_transactions`.
- **Image/Evidence Upload**: Handover evidence will use Supabase Storage (already used in the project for avatars/project images). The evidence will be tied to a specific state in the `sharing_transactions` table (e.g., delivered, returned).
- **Public Links**: We will use a dedicated React/Next.js dynamic route (e.g., `/sharing/:itemId`) that can be accessed without auth if the item is public, though interactions (renting, Q&A) will require auth.

## Risks / Trade-offs

- [Risk] Dispute over tool condition -> Mitigation: Require both borrower and owner to capture evidence (photos) during handover.
- [Risk] Unmoderated inappropriate listings -> Mitigation: Implement admin moderation tools with justification and messaging before scale.
