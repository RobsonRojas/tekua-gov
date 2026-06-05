## 1. Database Migration

- [x] 1.1 Create the migration file `supabase/migrations/20260605000001_spatial_ref_sys_rls.sql` that enables RLS on `public.spatial_ref_sys` and adds the select policy.
- [x] 1.2 Apply the database migration to the local development database.

## 2. Verification

- [x] 2.1 Verify that `public.spatial_ref_sys` has RLS enabled.
- [x] 2.2 Verify that read access (SELECT) works publicly/authed, and that write access is denied.
