-- Migration: Add audit logging for contribution payouts
-- Date: 2026-04-24

-- Helper function to log activity from PL/pgSQL
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action_type activity_action_type,
  p_description JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action_type, description)
  VALUES (p_user_id, p_action_type, p_description);
END;
$$;

-- Update confirm_contribution to log when a payout happens
CREATE OR REPLACE FUNCTION confirm_contribution(
  p_contribution_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_contribution_user_id UUID;
  v_amount NUMERIC;
  v_status contribution_status;
  v_confirm_count INTEGER;
  v_threshold INTEGER;
  v_desc_text TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get contribution info
  SELECT user_id, amount_suggested, status, description 
  INTO v_contribution_user_id, v_amount, v_status, v_desc_text
  FROM contributions WHERE id = p_contribution_id;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'This contribution is no longer pending';
  END IF;

  IF v_user_id = v_contribution_user_id THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Record confirmation
  INSERT INTO contribution_confirmations (contribution_id, user_id)
  VALUES (p_contribution_id, v_user_id);

  -- 3. Check threshold
  SELECT COUNT(*)::INTEGER INTO v_confirm_count
  FROM contribution_confirmations
  WHERE contribution_id = p_contribution_id;

  -- Get setting
  SELECT (value->>0)::INTEGER INTO v_threshold
  FROM governance_settings
  WHERE key = 'min_contribution_confirmations';

  -- 4. Trigger payout if reached
  IF v_confirm_count >= v_threshold THEN
    -- Update status
    UPDATE contributions SET status = 'completed', updated_at = NOW()
    WHERE id = p_contribution_id;

    -- Execute internal minting
    UPDATE wallets SET balance = balance + v_amount, updated_at = NOW()
    WHERE profile_id = v_contribution_user_id;

    -- Log transaction
    INSERT INTO transactions (from_id, to_id, amount, description)
    VALUES (NULL, v_contribution_user_id, v_amount, 'Automated payout for validated contribution: ' || p_contribution_id);
    
    -- LOG ACTIVITY for the recipient (Task completed/rewarded)
    PERFORM log_user_activity(
      v_contribution_user_id,
      'task',
      jsonb_build_object(
        'pt', 'Pagamento automático recebido por: ' || v_desc_text,
        'en', 'Automated payout received for: ' || v_desc_text
      )
    );

    -- LOG ACTIVITY for the validator (Audit trail)
    PERFORM log_user_activity(
      v_user_id,
      'vote',
      jsonb_build_object(
        'pt', 'Você forneceu a validação final para: ' || v_desc_text,
        'en', 'You provided the final validation for: ' || v_desc_text
      )
    );
    
    RETURN jsonb_build_object('success', TRUE, 'payout_executed', TRUE, 'current_confirmations', v_confirm_count);
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'payout_executed', FALSE, 'current_confirmations', v_confirm_count);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You have already confirmed this work');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
