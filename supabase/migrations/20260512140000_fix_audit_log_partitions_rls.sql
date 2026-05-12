-- Migration: Fix Audit Log Partitions RLS
-- Date: 2026-05-12
-- Purpose: Ensures that Row-Level Security (RLS) is explicitly enabled on dynamically created partitions for audit_logs.

-- 1. Update the partition creation function to automatically enable RLS
CREATE OR REPLACE FUNCTION public.create_audit_partition(p_date DATE)
RETURNS VOID AS $$
DECLARE
    v_partition_name TEXT;
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := date_trunc('month', p_date);
    v_end_date := v_start_date + interval '1 month';
    v_partition_name := 'audit_logs_' || to_char(v_start_date, 'YYYY_MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.audit_logs FOR VALUES FROM (%L) TO (%L)',
        v_partition_name, v_start_date, v_end_date
    );
    
    -- Ensure RLS is enabled on the newly created partition table
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_partition_name);
END;
$$ LANGUAGE plpgsql;

-- 2. Retroactively enforce RLS on any existing partitions that do not have it enabled
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT c.relname
        FROM pg_class c
        JOIN pg_inherits i ON c.oid = i.inhrelid
        JOIN pg_class p ON i.inhparent = p.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE p.relname = 'audit_logs'
          AND n.nspname = 'public'
          AND c.relrowsecurity = false
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);
        RAISE NOTICE 'Enabled RLS on existing partition: %', r.relname;
    END LOOP;
END $$;
