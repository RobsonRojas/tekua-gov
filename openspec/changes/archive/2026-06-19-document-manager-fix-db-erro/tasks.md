## 1. Database Migration

- [x] 1.1 Create the migration file `supabase/migrations/20260605000002_fix_official_docs_admin_policy.sql` to redefine the `official-docs-admin` RLS policy with support for the `roles` array check.
- [x] 1.2 Apply the database migration to the local development database.

## 2. Verification

- [x] 2.1 Verify that an admin user whose main `role` is not 'admin' but has 'admin' in their `roles` array can successfully upload documents to `official-docs`.
- [x] 2.2 Verify that a non-admin user is blocked from uploading files to `official-docs`.
