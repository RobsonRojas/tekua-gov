-- Migration: Surreal Creation on Work Confirmation
-- Date: 2026-06-10
-- Update execute_currency_transfer to use the ledger and confirm_activity to payout tasks from Treasury.

-- Disable trigger during migration updates
ALTER TABLE public.wallets DISABLE TRIGGER tr_prevent_direct_balance_update;

CREATE OR REPLACE FUNCTION public.execute_currency_transfer(
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
DECLARE
  v_from_wallet_id UUID;
  v_to_wallet_id UUID;
  v_from_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- 1. Get and lock destination wallet
  SELECT id INTO v_to_wallet_id FROM public.wallets WHERE profile_id = p_to_wallet FOR UPDATE;
  IF v_to_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Destination wallet not found';
  END IF;
  
  -- 2. Get and lock source wallet (if not treasury)
  IF p_from_wallet IS NOT NULL THEN
    SELECT id, balance INTO v_from_wallet_id, v_from_balance FROM public.wallets WHERE profile_id = p_from_wallet FOR UPDATE;
    IF v_from_wallet_id IS NULL THEN
      RAISE EXCEPTION 'Source wallet not found';
    END IF;
    IF v_from_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance in source wallet';
    END IF;
  ELSE
    SELECT id INTO v_from_wallet_id FROM public.wallets WHERE profile_id IS NULL FOR UPDATE;
    IF v_from_wallet_id IS NULL THEN
      RAISE EXCEPTION 'Treasury wallet not found';
    END IF;
  END IF;

  -- 3. Log legacy transaction for UI compatibility
  INSERT INTO public.transactions (from_id, to_id, amount, description, activity_id)
  VALUES (p_from_wallet, p_to_wallet, p_amount, 'Activity reward: ' || p_activity_id, p_activity_id)
  RETURNING id INTO v_transaction_id;

  -- 4. Record in Ledger (Trigger will update balances automatically)
  PERFORM public.fn_record_ledger_entry(
      v_from_wallet_id,
      v_to_wallet_id,
      p_amount,
      'activity',
      p_activity_id
  );
END;
$$;


CREATE OR REPLACE FUNCTION public.confirm_activity(
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
  v_user_role TEXT;
  v_user_roles TEXT[];
  v_is_admin BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role, roles INTO v_user_role, v_user_roles FROM profiles WHERE id = v_user_id;
  v_is_admin := (v_user_role = 'admin') OR ('admin' = ANY(v_user_roles));

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
    IF v_user_id != v_activity.requester_id AND NOT v_is_admin THEN
      RAISE EXCEPTION 'Only the requester or an administrator can approve this activity';
    END IF;
    
    -- Approve and payout from Treasury (NULL)
    UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
    PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
    
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

-- Re-enable trigger
ALTER TABLE public.wallets ENABLE TRIGGER tr_prevent_direct_balance_update;
