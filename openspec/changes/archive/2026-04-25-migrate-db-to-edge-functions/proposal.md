## Why

The current architecture relies heavily on direct Supabase database queries from the frontend. While Row Level Security (RLS) is in place, this approach increases the attack surface, exposes database schema details to the client, and can lead to performance bottlenecks and complex frontend logic for data validation. Centralizing these operations into secure, independent Edge Functions will improve security, maintainability, and allow for better logging and auditing at the API level.

## What Changes

- **Refactor**: All direct `supabase.from()` calls in the frontend will be replaced with `supabase.functions.invoke()` calls.
- **Backend**: Implement a suite of Edge Functions to handle CRUD and complex business logic for all platform modules.
- **Security**: Move business validation logic from frontend/triggers to Edge Functions where appropriate.
- **Architecture**: Move from a "thick client" DB-heavy model to a "thin client" API-driven model.
- **BREAKING**: Existing frontend hooks and services will change their internal implementation to call functions instead of querying tables directly.

## Capabilities

### New Capabilities
- `edge-api-gateway`: A centralized set of Edge Functions that act as the primary interface for all database operations, ensuring unified security and validation.
- `secure-data-access`: Policy-driven data access layer within Edge Functions to replace or augment RLS with more complex business rules.

### Modified Capabilities
- `activity-history`: Requirements for logging and retrieval now include mandatory processing through Edge Functions.
- `wallet-system`: Financial transactions must be exclusively handled by secure backend functions to prevent race conditions and client-side manipulation.
- `governance-payout-automation`: Validation and payout logic centralized in Edge Functions for better auditability.

## Impact

- **Frontend**: `src/hooks`, `src/pages`, and `src/context` modules.
- **Backend**: New folder structure in `supabase/functions/`.
- **Infrastructure**: Increased usage of Supabase Edge Functions.
- **Testing**: Frontend tests will need to mock function invocations instead of DB queries.
