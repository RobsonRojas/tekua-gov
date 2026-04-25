-- Migration: Add partitions for 2026 and index for performance
-- Date: 2026-04-26
-- Purpose: Ensure the partitioned table has partitions for the current year (2026) and improve query performance.

-- 1. Create partitions for 2026
DO $$ 
DECLARE
    v_date DATE;
BEGIN
    -- Start from January 2026 up to December 2026
    v_date := '2026-01-01'::date;
    LOOP
        PERFORM public.create_audit_partition(v_date);
        v_date := v_date + interval '1 month';
        EXIT WHEN v_date > '2026-12-01'::date;
    END LOOP;
END $$;

-- 2. Add index on actor_id (essential for partitioning performance and filtering)
-- Note: Indexes on partitioned tables are automatically created on all existing and future partitions in PostgreSQL 11+
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs (actor_id);

-- 3. Also add index on action for filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

-- 4. Re-verify log_user_activity to handle potential failures gracefully
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_action_type TEXT,
    p_description JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Use a sub-transaction or just a direct insert
    -- If a partition is missing, this will fail, but we've added partitions for 2026 now
    INSERT INTO public.audit_logs (actor_id, action, description, metadata)
    VALUES (p_user_id, p_action_type, p_description, p_metadata);
EXCEPTION WHEN OTHERS THEN
    -- Log error to Postgres log but don't crash the calling transaction if possible
    -- However, for activity logs we usually want to know if it fails.
    RAISE NOTICE 'Failed to log activity for user %: %', p_user_id, SQLERRM;
END;
$$;
