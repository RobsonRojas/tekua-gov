-- Migration: Make actor_id nullable in audit_logs to support service-role actions
-- Date: 2026-04-28

-- 1. Alter the main table
ALTER TABLE public.audit_logs ALTER COLUMN actor_id DROP NOT NULL;

-- 2. Update the trigger function to handle NULL auth.uid() gracefully
CREATE OR REPLACE FUNCTION public.fn_audit_critical_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, old_data, new_data, description)
    VALUES (
        auth.uid(), -- Will be NULL if using service role
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END,
        jsonb_build_object(
            'pt', 'Alteração em ' || TG_TABLE_NAME || ' (via Sistema)',
            'en', 'Change in ' || TG_TABLE_NAME || ' (via System)'
        )
    );
    RETURN NEW;
END;
$$;
