-- Migration: Create submit_activity RPC to support i18n and unified activities
-- Date: 2026-04-10

CREATE OR REPLACE FUNCTION submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL, -- beneficiary_id in contributions context
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
    'pending_validation'::activity_status,
    p_validation_method
  )
  RETURNING id INTO v_new_id;

  -- Log evidence immediately
  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, auth.uid(), p_evidence_url);
  
  RETURN v_new_id;
END;
$$;
