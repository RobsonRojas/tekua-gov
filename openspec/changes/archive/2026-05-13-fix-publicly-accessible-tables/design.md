## Context

The project uses Supabase as its backend infrastructure. Supabase relies heavily on PostgreSQL's Row-Level Security (RLS) to enforce data access rules at the database level. A security audit (and Supabase dashboard alerts) has indicated that some tables in the `public` schema have RLS disabled, which means they are bypassable by any client with the project's public API key.

## Goals / Non-Goals

**Goals:**
- Ensure 100% RLS coverage for all tables in the `public` schema.
- Resolve the `rls_disabled_in_public` critical issue.
- Implement a standardized set of policies for common table types (e.g., user-owned, admin-only, public-read).
- Secure the `audit_logs` partitioned table system.

**Non-Goals:**
- Refactoring the database schema or changing column names.
- Implementing application-level authorization logic (this remains in RLS and Edge Functions).

## Decisions

- **Comprehensive Hardening Migration**: Instead of patching old migrations, we will create a new migration (`XXXXXX_security_hardening.sql`) that explicitly enables RLS on all current tables. This ensures that the current state of the database is secure regardless of how it reached its current state.
- **Explicit Deny-All by Default**: For tables where access requirements are ambiguous, we will enable RLS but provide no policies, effectively denying all access until requirements are clarified.
- **Service Role Bypass**: Acknowledge that `service_role` and internal system functions (marked `SECURITY DEFINER`) will continue to bypass RLS, which is necessary for background tasks and complex operations.
- **Partitioned Table Strategy**: RLS will be enabled on the parent `audit_logs` table. We will verify if child partitions require explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` calls or if parent-level enforcement is sufficient for the Supabase dashboard's audit tool.

## Risks / Trade-offs

- **Risk: Breaking Frontend Access** → If a table used by the frontend (e.g., `announcements`) is locked down without a `SELECT` policy for `anon` or `authenticated` users, the UI will fail to load data. 
  - *Mitigation*: Perform a cross-reference check of frontend service files (e.g., `src/services/`) to identify which tables require public or authenticated read access.
- **Risk: Performance Overhead** → Highly complex RLS policies (with many `EXISTS` checks) can slow down queries.
  - *Mitigation*: Use simple, index-backed policies where possible (e.g., `auth.uid() = user_id`).
