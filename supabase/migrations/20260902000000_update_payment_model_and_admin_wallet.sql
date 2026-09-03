-- Migration: Update payment model and add admin wallet
-- Date: 2026-09-02

-- Disable trigger during migration updates
ALTER TABLE public.wallets DISABLE TRIGGER tr_prevent_direct_balance_update;

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
  v_executor_id UUID;
  v_num_executors INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role, roles INTO v_user_role, v_user_roles FROM profiles WHERE id = v_user_id;
  v_is_admin := (v_user_role = 'admin') OR ('admin' = ANY(v_user_roles));

  -- 1. Get activity info
  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id FOR UPDATE;

  -- Allow both pending_validation and pending_approval
  IF v_activity.status != 'pending_validation' AND v_activity.status != 'pending_approval' THEN
    RAISE EXCEPTION 'Activity is not pending validation or approval';
  END IF;

  IF v_user_id = v_activity.worker_id OR v_user_id = ANY(v_activity.executor_ids) THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Logic based on validation method
  IF v_activity.validation_method = 'requester_approval' THEN
    IF v_user_id != v_activity.requester_id AND NOT v_is_admin THEN
      RAISE EXCEPTION 'Only the requester or an administrator can approve this activity';
    END IF;
    
    -- Record confirmation for the UI progress bar (0 -> 1)
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id)
    ON CONFLICT DO NOTHING;

    -- Approve and payout from Treasury (NULL)
    UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
    
    v_num_executors := array_length(v_activity.executor_ids, 1);
    IF v_num_executors > 0 THEN
      -- Do not split amount, give full amount to each executor
      FOREACH v_executor_id IN ARRAY v_activity.executor_ids
      LOOP
        PERFORM execute_currency_transfer(NULL, v_executor_id, v_activity.reward_amount, p_activity_id);
      END LOOP;
    ELSIF v_activity.worker_id IS NOT NULL THEN
      PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
    END IF;
    
    RETURN jsonb_build_object('success', TRUE, 'completed', TRUE, 'confirmations', 1);
  
  ELSIF v_activity.validation_method = 'community_consensus' THEN
    -- Record confirmation
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Check threshold
    SELECT COUNT(*)::INTEGER INTO v_confirm_count FROM activity_confirmations WHERE activity_id = p_activity_id;
    
    IF v_confirm_count >= v_activity.min_confirmations THEN
       UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
       
       -- Payout from Treasury (NULL)
       v_num_executors := array_length(v_activity.executor_ids, 1);
       IF v_num_executors > 0 THEN
         -- Do not split amount, give full amount to each executor
         FOREACH v_executor_id IN ARRAY v_activity.executor_ids
         LOOP
           PERFORM execute_currency_transfer(NULL, v_executor_id, v_activity.reward_amount, p_activity_id);
         END LOOP;
       ELSIF v_activity.worker_id IS NOT NULL THEN
         PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
       END IF;

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


CREATE OR REPLACE FUNCTION public.admin_adjust_wallet_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_justification TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
  v_admin_roles TEXT[];
  v_target_wallet_id UUID;
  v_treasury_wallet_id UUID;
  v_from_wallet UUID;
  v_to_wallet UUID;
  v_amount NUMERIC;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role, roles INTO v_admin_role, v_admin_roles FROM profiles WHERE id = v_admin_id;
  IF (v_admin_role != 'admin' AND NOT ('admin' = ANY(v_admin_roles))) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_amount = 0 THEN
    RAISE EXCEPTION 'Amount cannot be zero';
  END IF;

  -- 1. Get and lock wallets
  SELECT id INTO v_treasury_wallet_id FROM public.wallets WHERE profile_id IS NULL FOR UPDATE;
  IF v_treasury_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Treasury wallet not found';
  END IF;

  SELECT id INTO v_target_wallet_id FROM public.wallets WHERE profile_id = p_user_id FOR UPDATE;
  IF v_target_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Target user wallet not found';
  END IF;

  v_amount := abs(p_amount);

  IF p_amount > 0 THEN
    v_from_wallet := NULL; -- Treasury
    v_to_wallet := p_user_id;
  ELSE
    v_from_wallet := p_user_id;
    v_to_wallet := NULL; -- Treasury
    
    -- Check balance for burn
    IF (SELECT balance FROM public.wallets WHERE id = v_target_wallet_id) < v_amount THEN
      RAISE EXCEPTION 'Insufficient balance in user wallet';
    END IF;
  END IF;

  -- Log legacy transaction
  INSERT INTO public.transactions (from_id, to_id, amount, description)
  VALUES (v_from_wallet, v_to_wallet, v_amount, 'Admin adjustment: ' || p_justification);

  -- Ledger entry (Trigger will update balances automatically)
  PERFORM public.fn_record_ledger_entry(
      CASE WHEN p_amount > 0 THEN v_treasury_wallet_id ELSE v_target_wallet_id END,
      CASE WHEN p_amount > 0 THEN v_target_wallet_id ELSE v_treasury_wallet_id END,
      v_amount,
      'admin_adjustment',
      NULL
  );

  RETURN jsonb_build_object('success', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- Re-enable trigger
ALTER TABLE public.wallets ENABLE TRIGGER tr_prevent_direct_balance_update;
