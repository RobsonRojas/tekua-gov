# Proposal: refactor-integrity-i18n-unification

## Objective
Unify user-generated content structure to support multiple languages consistently, strengthen the traceability between financial transactions and governance activities, and consolidate validation logic into a single source of truth.

## Rationale
The current implementation has divergent data types for similar content (JSONB vs TEXT) and lacks strong referential integrity between the wallet and activity systems. This refactoring will prevent technical debt and enable robust analytics.

## Scope
- **Database**: 
    - Convert `topic_comments.content` to JSONB.
    - Add `activity_id` to `transactions`.
- **RPCs**:
    - Update `execute_currency_transfer` to link transactions to activities.
    - Formalize `confirm_activity` as the only validation RPC.
- **Frontend**:
    - Update `TopicDetail.tsx` and relevant components to handle localized objects.
