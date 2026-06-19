## 1. Database Migration

- [x] 1.1 Create migration file `supabase/migrations/20260605000003_fix_documents_admin_policy.sql` to redefine the `Admins can manage documents` policy on the `public.documents` table to check the `roles` array.
- [x] 1.2 Apply the database migration to the remote database.

## 2. Verification

- [x] 2.1 Verify that an admin user with `'admin'` only in their `roles` array (and not in the main `role` field) can successfully register and delete records in the `documents` table.
- [x] 2.2 Verify that a non-admin user is blocked by RLS from modifying the `documents` table.
