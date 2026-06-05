## 1. Database Migration

- [x] 1.1 Create the migration file `supabase/migrations/20260605000000_audit_logs_view_security_invoker.sql` that drops the existing view and recreates it with `WITH (security_invoker = true)`.
- [x] 1.2 Apply the migration to the local development database.

## 2. Verification

- [x] 2.1 Query the view as a regular member and verify that the results only return the querying user's own audit logs (enforcing RLS).
- [x] 2.2 Query the view as an administrator and verify that all audit logs are visible.
