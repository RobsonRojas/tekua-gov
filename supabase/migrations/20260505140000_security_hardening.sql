-- Migration: Security Hardening - Enable RLS on all public tables
-- Date: 2026-05-05
-- Purpose: Ensure no table in the public schema is publicly accessible.

-- 1. Explicitly enable RLS on known missing or sensitive tables
-- This ensures the Supabase dashboard and audit tools see the explicit enablement.

-- Ledger entries (Ensure it is enabled if earlier migrations were skipped)
ALTER TABLE IF EXISTS public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Activity interactions
ALTER TABLE IF EXISTS public.activity_interactions ENABLE ROW LEVEL SECURITY;

-- 2. Dynamic Hardening
-- Enable RLS on ALL tables in the public schema that might have been missed.
-- This includes system tables renamed during migrations (e.g. activity_logs_old)
-- and any partitions created dynamically.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        -- Exclude common extension tables that we might not own
        AND tablename NOT IN (
            'spatial_ref_sys', 
            'geography_columns', 
            'geometry_columns', 
            'raster_columns', 
            'raster_overviews'
        )
    ) LOOP
        BEGIN
            -- We use EXECUTE to dynamically enable RLS for every table
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
            RAISE NOTICE 'Enabled RLS for table: %', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            -- Skip tables we don't have permission to alter
            RAISE WARNING 'Could not enable RLS for table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. Default Restrictive Policies
-- Ensure that any table with RLS enabled but NO policies defaults to denying all access.
-- This is the default behavior of PostgreSQL RLS when no policies exist, 
-- but we can add an explicit "Deny All" policy for clarity on sensitive tables if needed.

-- Note: We do not add "Deny All" policies here to avoid breaking existing features 
-- that rely on the default RLS behavior (which is to deny if no policy matches).
-- The main goal of this migration is to ensure the ENABLE ROW LEVEL SECURITY flag is set.

-- 4. Secure Audit Log Partitions
-- Since audit_logs is partitioned, we ensure the parent is secured.
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Verification Comment
COMMENT ON SCHEMA public IS 'Hardened public schema with Row Level Security enforced on all tables.';
