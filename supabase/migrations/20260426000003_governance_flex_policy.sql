-- Migration: Governance Flex Policy
-- Date: 2026-04-26
-- Purpose: Implement variable payout locks and manual audit requirements.

-- 1. Create governance_policies table
CREATE TABLE IF NOT EXISTS public.governance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'task', 'contribution'
    min_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    lock_hours INTEGER NOT NULL DEFAULT 24,
    requires_manual_audit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add columns to activities for audit tracking
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS requires_audit BOOLEAN DEFAULT FALSE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT 'approved' CHECK (audit_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS auditor_id UUID REFERENCES public.profiles(id);

-- 3. Initial Policies
-- We use a TRUNCATE to ensure we start fresh if re-run
TRUNCATE public.governance_policies;
INSERT INTO public.governance_policies (category, min_amount, lock_hours, requires_manual_audit)
VALUES 
    ('task', 0, 24, FALSE),            -- Standard tasks: 24h lock, no audit
    ('task', 500, 48, TRUE),           -- High value tasks: 48h lock, needs audit
    ('contribution', 0, 24, FALSE),    -- Standard contributions: 24h lock
    ('contribution', 1000, 72, TRUE);  -- High value contributions: 72h lock, needs audit

-- 4. Update fn_set_payout_lock to use dynamic policies
CREATE OR REPLACE FUNCTION public.fn_set_payout_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_policy RECORD;
BEGIN
    -- When task moves to a 'completed' state
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Find the best matching policy (highest min_amount that is <= reward_amount)
        SELECT * INTO v_policy
        FROM public.governance_policies
        WHERE category = NEW.type::TEXT
          AND min_amount <= NEW.reward_amount
        ORDER BY min_amount DESC
        LIMIT 1;

        IF v_policy IS NOT NULL THEN
            NEW.available_at := now() + (v_policy.lock_hours || ' hours')::interval;
            NEW.requires_audit := v_policy.requires_manual_audit;
        ELSE
            -- Fallback to default
            NEW.available_at := now() + interval '24 hours';
            NEW.requires_audit := FALSE;
        END IF;
        
        -- Set audit status
        IF NEW.requires_audit THEN
            NEW.audit_status := 'pending';
        ELSE
            NEW.audit_status := 'approved';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Update get_available_balance to respect audit status
CREATE OR REPLACE FUNCTION public.get_available_balance(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_credits NUMERIC;
  v_pending_credits NUMERIC;
BEGIN
  -- Sum all completed rewards
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_credits
  FROM public.activities
  WHERE worker_id = p_user_id AND status = 'completed';

  -- Subtract rewards that are still locked by time OR pending audit
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_pending_credits
  FROM public.activities
  WHERE worker_id = p_user_id 
    AND status = 'completed' 
    AND (
      available_at > now() 
      OR (requires_audit = TRUE AND audit_status = 'pending')
    );

  RETURN v_total_credits - v_pending_credits;
END;
$$;

-- 6. RPC approve_payout(activity_id, status)
CREATE OR REPLACE FUNCTION public.approve_payout(p_activity_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve payouts';
    END IF;

    IF p_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Invalid status. Use approved or rejected.';
    END IF;

    UPDATE public.activities
    SET 
        audit_status = p_status,
        auditor_id = auth.uid(),
        updated_at = now()
    WHERE id = p_activity_id;
    
    -- Log to audit_logs
    PERFORM public.log_user_activity(
        auth.uid(),
        'profile_update', -- Using an existing action type
        jsonb_build_object(
            'action', 'payout_audit',
            'activity_id', p_activity_id,
            'status', p_status,
            'pt', 'Auditoria de payout: ' || p_status || ' para atividade ' || p_activity_id,
            'en', 'Payout audit: ' || p_status || ' for activity ' || p_activity_id
        )
    );
END;
$$;

-- Enable RLS on governance_policies
ALTER TABLE public.governance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Policies viewable by authenticated users" ON public.governance_policies
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only admins can modify policies" ON public.governance_policies
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
