-- Migration: Remove the Work Wall moderation flow
-- Date: 2026-10-16
-- Purpose: The moderation stage no longer exists. New tasks/demands are created directly as
-- 'open'; contributions already executed go straight to 'pending_validation'. Existing
-- activities stuck in 'pending_approval' are migrated to their post-approval state.
--
-- NOTE: The enum value 'pending_approval' in activity_status was kept here for backward
-- compatibility (removing a value from a Postgres enum requires recreating the type). It was
-- LEGACY and MUST NOT be produced by the application anymore.
-- The value itself was finally removed in
-- 20261021000000_remove_pending_approval_from_activity_status.sql, which recreates the type
-- without it. This file is left untouched as the historical record of what was applied.

-- 1. New activities default to 'open' again.
ALTER TABLE public.activities ALTER COLUMN status SET DEFAULT 'open'::activity_status;

-- 2. Migrate activities currently stuck in the moderation state.
UPDATE public.activities
SET status = 'open'::activity_status,
    updated_at = now()
WHERE status = 'pending_approval'::activity_status
  AND type <> 'contribution'::activity_type;

UPDATE public.activities
SET status = 'pending_validation'::activity_status,
    updated_at = now()
WHERE status = 'pending_approval'::activity_status
  AND type = 'contribution'::activity_type;

-- 3. Activities are viewable by everyone again (the moderation-aware policy hid pending tasks).
--    The API layer continues to hide 'rejected' activities from non-owners.
DROP POLICY IF EXISTS "Activities visibility policy" ON public.activities;
CREATE POLICY "Activities are viewable by everyone." ON public.activities
  FOR SELECT USING (TRUE);

-- 4. Contributions (work already performed) skip moderation and go straight to validation.
DROP FUNCTION IF EXISTS public.submit_activity(JSONB, JSONB, NUMERIC, TEXT, UUID, validation_method);
DROP FUNCTION IF EXISTS public.submit_activity(JSONB, JSONB, NUMERIC, TEXT, UUID, validation_method, BOOLEAN, BOOLEAN);
DROP FUNCTION IF EXISTS public.submit_activity(JSONB, JSONB, NUMERIC, TEXT, UUID, validation_method, BOOLEAN, BOOLEAN, UUID);
DROP FUNCTION IF EXISTS public.submit_activity(JSONB, JSONB, NUMERIC, TEXT, UUID, validation_method, BOOLEAN, BOOLEAN, UUID, UUID[]);

CREATE OR REPLACE FUNCTION public.submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL,
  p_validation_method validation_method DEFAULT 'community_consensus',
  p_urgency BOOLEAN DEFAULT FALSE,
  p_importance BOOLEAN DEFAULT FALSE,
  p_worker_id UUID DEFAULT NULL,
  p_executor_ids UUID[] DEFAULT '{}',
  p_category_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
  v_effective_executors UUID[];
BEGIN
  -- Determine effective executors
  IF array_length(p_executor_ids, 1) > 0 THEN
    v_effective_executors := p_executor_ids;
  ELSIF p_worker_id IS NOT NULL THEN
    v_effective_executors := ARRAY[p_worker_id];
  ELSE
    v_effective_executors := ARRAY[auth.uid()];
  END IF;

  INSERT INTO activities (
    title,
    description,
    reward_amount,
    type,
    requester_id,
    worker_id,
    executor_ids,
    status,
    validation_method,
    urgency,
    importance,
    category_id
  )
  VALUES (
    p_title,
    p_description,
    p_reward_amount,
    'contribution'::activity_type,
    p_requester_id,
    v_effective_executors[1], -- Set first executor as worker_id for backward compatibility
    v_effective_executors,
    'pending_validation'::activity_status,
    p_validation_method,
    p_urgency,
    p_importance,
    p_category_id
  )
  RETURNING id INTO v_new_id;

  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, v_effective_executors[1], p_evidence_url);

  RETURN v_new_id;
END;
$$;

-- 5. The moderation RPC is gone; there is no approve/reject stage.
DROP FUNCTION IF EXISTS public.moderate_activity(UUID, TEXT);
