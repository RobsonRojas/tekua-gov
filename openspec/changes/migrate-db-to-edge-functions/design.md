## Context

Currently, the Tekua Governance Portal uses the Supabase client directly in the frontend to perform CRUD operations on tables like `audit_logs`, `activities`, `wallets`, etc. While RLS provides a layer of security, complex business logic is often split between frontend hooks and database triggers. This design moves all database interactions to a centralized API layer using Supabase Edge Functions.

## Goals / Non-Goals

**Goals:**
- Zero direct database access from the frontend (except for Realtime subscriptions if necessary).
- Centralized validation and business logic in Edge Functions.
- Unified error handling and logging.
- Improved security by hiding the database schema from the client.

**Non-Goals:**
- Moving Realtime subscriptions to Edge Functions (Realtime requires direct client-side connection).
- Full rewrite of the database schema.
- Removing all RLS (RLS remains as a "defense in depth" layer).

## Decisions

### 1. Domain-Driven Function Structure
Instead of a single monolithic gateway or one function per table, we will use domain-driven functions:
- `api-audit`: Handles all audit log retrieval and creation.
- `api-governance`: Handles voting, topics, and policy configuration.
- `api-wallet`: Handles transactions, balances, and payouts.
- `api-members`: Handles profile management and roles.
- `api-work`: Handles work registration and validation.

**Rationale**: This balances maintainability, deployment speed, and logical grouping. It allows different domains to scale or be updated independently.

### 2. Request/Response Pattern
All functions will follow a standard JSON body structure:
- **Request**: `{ action: string, params: object }`
- **Response**: `{ data: any, error: string | null }`

**Rationale**: Simplifies the frontend client implementation and ensures consistent error handling.

### 3. Identity Verification
Functions will use the Supabase `auth.getUser(jwt)` method to verify the caller's identity using the `Authorization` header passed from the frontend.

**Rationale**: Ensures that Edge Functions are just as secure as RLS but allow for more complex multi-step validation.

### 4. Database Access within Functions
Edge Functions will use the `service_role` key ONLY for operations that require higher privileges than the user has, but will default to using a user-scoped client when possible to maintain RLS benefits.

**Rationale**: Minimizes "God-mode" access while allowing functions to perform privileged tasks like updating roles or cross-table validations.

## Risks / Trade-offs

- **[Risk] Cold Starts** → Edge functions may introduce a 100-500ms delay on initial calls. **Mitigation**: Use warm instances for critical paths or keep functions small.
- **[Risk] Increased Complexity** → Simple queries become API calls. **Mitigation**: Provide a unified `apiClient` utility in the frontend to abstract the `invoke` calls.
- **[Risk] Maintenance Overhead** → Deployment of functions is separate from frontend. **Mitigation**: Use the Supabase CLI for integrated CI/CD.
