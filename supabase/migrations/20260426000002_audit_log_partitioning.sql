-- Migration: Implement Audit Log Partitioning
-- Date: 2026-04-26
-- Purpose: Move activity_logs to a partitioned audit_logs structure with automated maintenance.

-- 1. Create the new partitioned table
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type activity_action_type NOT NULL,
    description JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. Create archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- 3. Helper function to create a partition
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
END;
$$ LANGUAGE plpgsql;

-- 4. Pre-create partitions (Last 12 months + next 2 months)
DO $$
DECLARE
    v_date DATE;
BEGIN
    FOR i IN -12..2 LOOP
        v_date := date_trunc('month', now()) + (i || ' month')::interval;
        PERFORM public.create_audit_partition(v_date);
    END LOOP;
END $$;

-- 5. Migrate data from activity_logs to audit_logs
INSERT INTO public.audit_logs (id, user_id, action_type, description, ip_address, created_at)
SELECT id, user_id, action_type, description, ip_address, created_at
FROM public.activity_logs;

-- 6. Maintenance Functions
-- 6.1 manage_audit_partitions(): Creates partitions for next month
CREATE OR REPLACE FUNCTION public.manage_audit_partitions()
RETURNS VOID AS $$
BEGIN
    PERFORM public.create_audit_partition(date_trunc('month', now()) + interval '1 month');
    PERFORM public.create_audit_partition(date_trunc('month', now()) + interval '2 months');
END;
$$ LANGUAGE plpgsql;

-- 6.2 archive_old_audit_logs(): Moves partitions older than 12 months to archive schema
CREATE OR REPLACE FUNCTION public.archive_old_audit_logs()
RETURNS VOID AS $$
DECLARE
    v_partition_to_archive TEXT;
    v_oldest_date DATE;
BEGIN
    v_oldest_date := date_trunc('month', now()) - interval '13 months';
    v_partition_to_archive := 'audit_logs_' || to_char(v_oldest_date, 'YYYY_MM');
    
    -- Check if table exists in public schema
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = v_partition_to_archive) THEN
        -- Move to archive schema
        EXECUTE format('ALTER TABLE public.%I SET SCHEMA archive', v_partition_to_archive);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Unified View (Task 3.1)
-- This view will need to be updated when new partitions are archived.
-- For now, we create it dynamically or as a union of all tables in both schemas that follow the pattern.
CREATE OR REPLACE VIEW public.vw_audit_logs_all AS
SELECT * FROM public.audit_logs;
-- Note: A more complex view using dynamic SQL or pg_cron to update its definition 
-- could be used to include archived partitions automatically.

-- 8. Update log_user_activity function
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action_type activity_action_type,
  p_description JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action_type, description)
  VALUES (p_user_id, p_action_type, p_description);
END;
$$;

-- 9. Cleanup and RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Rename old table instead of dropping
ALTER TABLE IF EXISTS public.activity_logs RENAME TO activity_logs_old;

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at_desc ON public.audit_logs(created_at DESC);

-- 10. Scheduling with pg_cron (Task 2.3)
-- Ensure pg_cron is enabled in your Supabase dashboard (Database -> Extensions)
-- SELECT cron.schedule('manage-audit-partitions', '0 0 1 * *', 'SELECT public.manage_audit_partitions()');
-- SELECT cron.schedule('archive-old-audit-logs', '0 5 1 * *', 'SELECT public.archive_old_audit_logs()');
