-- Migration: Transversal Council Approval Flow
-- Date: 2026-05-01
-- Purpose: Implement the moderation flow for Work Wall tasks.

-- 1. Add transversal_council role to profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('member', 'admin', 'transversal_council'));

-- 2. (Enum addition moved to separate migration 20260501172959_transversal_council_enum.sql)

-- 3. Update default status for new activities
ALTER TABLE public.activities ALTER COLUMN status SET DEFAULT 'pending_approval';

-- 4. Helper function for council/admin check
CREATE OR REPLACE FUNCTION public.is_transversal_council_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'transversal_council')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update activities RLS
DROP POLICY IF EXISTS "Activities are viewable by everyone." ON activities;
DROP POLICY IF EXISTS "Activities visibility policy" ON activities;

CREATE POLICY "Activities visibility policy" ON activities
  FOR SELECT USING (
    status != 'pending_approval' OR 
    auth.uid() = requester_id OR 
    public.is_transversal_council_or_admin()
  );

DROP POLICY IF EXISTS "Activities update policy" ON activities;
CREATE POLICY "Activities update policy" ON activities
  FOR UPDATE USING (
    auth.uid() = requester_id OR 
    auth.uid() = worker_id OR
    public.is_transversal_council_or_admin()
  );

-- 6. Helper function for moderation approval
CREATE OR REPLACE FUNCTION public.moderate_activity(p_activity_id UUID, p_action TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_transversal_council_or_admin() THEN
    RAISE EXCEPTION 'Only transversal council or admins can moderate activities';
  END IF;

  IF p_action = 'approve' THEN
    UPDATE public.activities 
    SET status = CASE 
        WHEN type = 'contribution' THEN 'pending_validation'::activity_status
        ELSE 'open'::activity_status
    END, 
    updated_at = now()
    WHERE id = p_activity_id AND status = 'pending_approval';
  ELSIF p_action = 'reject' THEN
    UPDATE public.activities 
    SET status = 'rejected', updated_at = now()
    WHERE id = p_activity_id AND status = 'pending_approval';
  ELSE
    RAISE EXCEPTION 'Invalid moderation action';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update submit_activity RPC to use pending_approval
CREATE OR REPLACE FUNCTION submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL,
  p_validation_method validation_method DEFAULT 'community_consensus'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO activities (
    title, 
    description, 
    reward_amount, 
    type,
    requester_id, 
    worker_id, 
    status,
    validation_method
  )
  VALUES (
    p_title, 
    p_description, 
    p_reward_amount, 
    'contribution'::activity_type,
    p_requester_id, 
    auth.uid(), 
    'pending_approval'::activity_status,
    p_validation_method
  )
  RETURNING id INTO v_new_id;

  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, auth.uid(), p_evidence_url);
  
  RETURN v_new_id;
END;
$$;
