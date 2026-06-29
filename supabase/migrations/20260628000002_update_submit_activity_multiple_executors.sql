-- Migration: Update submit_activity RPC to accept executor_ids array

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
  p_executor_ids UUID[] DEFAULT '{}'
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
    worker_id, -- Keep for backward compatibility or remove later
    executor_ids,
    status,
    validation_method,
    urgency,
    importance
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
    p_importance
  )
  RETURNING id INTO v_new_id;

  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, v_effective_executors[1], p_evidence_url);
  
  RETURN v_new_id;
END;
$$;
