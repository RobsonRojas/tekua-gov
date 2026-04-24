-- Migration: Platform Evolution Core
-- Date: 2026-04-25

-- 1. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can read audit logs
CREATE POLICY "Admins can view audit logs"
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

-- 2. Payout Lock Logic
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ;

-- Update existing activities to be available now
UPDATE public.activities SET available_at = created_at WHERE available_at IS NULL;

-- 3. Balance Calculation View or Function
-- We'll create a function to get "Available Balance"
CREATE OR REPLACE FUNCTION public.get_available_balance(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_credits NUMERIC;
  v_pending_credits NUMERIC;
BEGIN
  -- This is a placeholder logic. You should adapt it to your actual transaction/wallet schema.
  -- For now, let's assume we sum payouts from activities where available_at <= now()
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_credits
  FROM public.activities
  WHERE worker_id = p_user_id AND status = 'completed'; -- Adjust status as needed

  SELECT COALESCE(SUM(reward_amount), 0) INTO v_pending_credits
  FROM public.activities
  WHERE worker_id = p_user_id AND status = 'completed' AND available_at > now();

  RETURN v_total_credits - v_pending_credits;
END;
$$;

-- 4. Audit Triggers
CREATE OR REPLACE FUNCTION public.fn_audit_critical_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, old_data, new_data)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
    RETURN NEW;
END;
$$;

-- Apply audit to sensitive tables
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

-- 5. Trigger to set available_at on task confirmation
CREATE OR REPLACE FUNCTION public.fn_set_payout_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When task moves to a 'confirmed' state, set available_at to 24h from now
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        NEW.available_at := now() + interval '24 hours';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_payout_lock ON public.activities;
CREATE TRIGGER tr_set_payout_lock
BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.fn_set_payout_lock();
