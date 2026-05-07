-- Migration: Add p_worker_id to submit_activity RPC

CREATE OR REPLACE FUNCTION public.submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL,
  p_validation_method validation_method DEFAULT 'community_consensus',
  p_urgency BOOLEAN DEFAULT FALSE,
  p_importance BOOLEAN DEFAULT FALSE,
  p_worker_id UUID DEFAULT NULL
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
    COALESCE(p_worker_id, auth.uid()), 
    'pending_approval'::activity_status,
    p_validation_method,
    p_urgency,
    p_importance
  )
  RETURNING id INTO v_new_id;

  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, COALESCE(p_worker_id, auth.uid()), p_evidence_url);
  
  RETURN v_new_id;
END;
$$;
