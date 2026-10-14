-- Migration: Add p_category_id to submit_activity RPC
-- Persists the optional work area (área de atuação) chosen when registering a contribution.

-- Drop previous overloads so the RPC resolves unambiguously once the new parameter is added.
-- (Each prior evolution used CREATE OR REPLACE with a different argument list, which left
--  older signatures behind as separate overloads.)
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
    'pending_approval'::activity_status,
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
