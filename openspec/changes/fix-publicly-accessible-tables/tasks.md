## 1. Audit and Identification

- [ ] 1.1 Perform a database-wide audit to identify all tables in the `public` schema missing `ENABLE ROW LEVEL SECURITY`.
- [ ] 1.2 List all identified tables and cross-reference with existing policies in older migrations.

## 2. Database Hardening

- [ ] 2.1 Create a new migration file `supabase/migrations/20260505140000_security_hardening.sql`.
- [ ] 2.2 Add `ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;` (specifically identified as missing).
- [ ] 2.3 Add `ALTER TABLE` statements for any other identified tables to enable RLS.
- [ ] 2.4 Review and ensure every table with RLS enabled has at least one policy or a default deny state.
- [ ] 2.5 Verify RLS on `audit_logs` parent and investigate if partitions require explicit enablement.

## 3. Verification

- [ ] 3.1 Run the `check_rls.sh` script to verify that all tables created in migrations now have RLS enablement in the same or later files.
- [ ] 3.2 Perform a manual check of the Supabase dashboard for the `rls_disabled_in_public` warning.
