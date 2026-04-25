-- Migration: Unify Audit and Activity Logs
-- Date: 2026-04-26
-- Purpose: Unify activity_logs and audit_logs into a single partitioned table and restore triggers.

-- 1. Update audit_logs table schema (partitioned)
-- Drop dependent view first to allow schema changes
DROP VIEW IF EXISTS public.vw_audit_logs_all;

-- Rename columns to match platform evolution audit style but keep activity functionality
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN user_id TO actor_id;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action_type') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN action_type TO action;
        -- Change to TEXT for flexibility
        ALTER TABLE public.audit_logs ALTER COLUMN action TYPE TEXT;
    END IF;
END $$;

-- Add missing columns from platform evolution
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS old_data JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS new_data JSONB;

-- 2. Update log_user_activity function to use unified columns
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
    INSERT INTO public.audit_logs (actor_id, action, description, metadata)
    VALUES (p_user_id, p_action_type, p_description, p_metadata);
END;
$$;

-- 3. Restore Platform Evolution Audit Triggers
CREATE OR REPLACE FUNCTION public.fn_audit_critical_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, old_data, new_data, description)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END,
        jsonb_build_object(
            'pt', 'Alteração em ' || TG_TABLE_NAME,
            'en', 'Change in ' || TG_TABLE_NAME
        )
    );
    RETURN NEW;
END;
$$;

-- Re-apply triggers to critical tables
DROP TRIGGER IF EXISTS tr_audit_wallets ON public.wallets;
CREATE TRIGGER tr_audit_wallets
AFTER UPDATE ON public.wallets
FOR EACH ROW WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
EXECUTE FUNCTION public.fn_audit_critical_changes();

DROP TRIGGER IF EXISTS tr_audit_activities ON public.activities;
CREATE TRIGGER tr_audit_activities
AFTER UPDATE ON public.activities
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_audit_critical_changes();

DROP TRIGGER IF EXISTS tr_audit_profiles ON public.profiles;
CREATE TRIGGER tr_audit_profiles
AFTER UPDATE ON public.profiles
FOR EACH ROW WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.fn_audit_critical_changes();

-- 4. Unified RLS policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Update View
CREATE OR REPLACE VIEW public.vw_audit_logs_all AS
SELECT * FROM public.audit_logs;
