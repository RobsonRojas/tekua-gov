-- Migration: Activity RPC Functions for Gift Economy
-- Follows openspec/changes/user-surreal-digital-currency-wallet/framework-design.md

-- 1. Execute Currency Transfer (Internal helper)
CREATE OR REPLACE FUNCTION execute_currency_transfer(
  p_from_wallet UUID, -- profile_id or NULL for Treasury
  p_to_wallet UUID,   -- profile_id
  p_amount NUMERIC,
  p_activity_id UUID,
  p_type TEXT DEFAULT 'reward'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Update recipient balance
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_to_wallet;

  -- 2. Update sender balance (if not treasury)
  IF p_from_wallet IS NOT NULL THEN
    UPDATE wallets SET balance = balance - p_amount, updated_at = NOW()
    WHERE profile_id = p_from_wallet;
    
    -- Check for negative balance
    IF EXISTS (SELECT 1 FROM wallets WHERE profile_id = p_from_wallet AND balance < 0) THEN
      RAISE EXCEPTION 'Insufficient balance in source wallet';
    END IF;
  END IF;

  -- 3. Log to ledger (transactions table)
  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (p_from_wallet, p_to_wallet, p_amount, 'Activity reward: ' || p_activity_id);
END;
$$;

-- 2. Process Activity Validation (Social or Requester)
CREATE OR REPLACE FUNCTION confirm_activity(
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_activity RECORD;
  v_confirm_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get activity info
  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id FOR UPDATE;

  IF v_activity.status != 'pending_validation' THEN
    RAISE EXCEPTION 'Activity is not pending validation';
  END IF;

  IF v_user_id = v_activity.worker_id THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Logic based on validation method
  IF v_activity.validation_method = 'requester_approval' THEN
    IF v_user_id != v_activity.requester_id THEN
      RAISE EXCEPTION 'Only the requester can approve this activity';
    END IF;
    
    -- Approve and payout
    UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
    PERFORM execute_currency_transfer(v_activity.requester_id, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
    
    RETURN jsonb_build_object('success', TRUE, 'completed', TRUE);
  
  ELSIF v_activity.validation_method = 'community_consensus' THEN
    -- Record confirmation
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id);
    
    -- Check threshold
    SELECT COUNT(*)::INTEGER INTO v_confirm_count FROM activity_confirmations WHERE activity_id = p_activity_id;
    
    IF v_confirm_count >= v_activity.min_confirmations THEN
       UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
       -- Payout from Treasury (NULL)
       PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
       RETURN jsonb_build_object('success', TRUE, 'completed', TRUE, 'confirmations', v_confirm_count);
    END IF;
    
    RETURN jsonb_build_object('success', TRUE, 'completed', FALSE, 'confirmations', v_confirm_count);
  END IF;

  RETURN jsonb_build_object('success', FALSE, 'error', 'Unknown validation method');
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You have already confirmed this activity');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
