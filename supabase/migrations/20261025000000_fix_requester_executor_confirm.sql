-- Allow the requester, or an administrator under requester_approval, to confirm an activity
-- they also execute. Other executors remain blocked from confirming their own work.

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

  -- Only activities awaiting validation can be confirmed
  IF v_activity.status != 'pending_validation' THEN
    RAISE EXCEPTION 'Activity is not pending validation';
  END IF;

  IF (v_user_id = v_activity.worker_id OR v_user_id = ANY(v_activity.executor_ids))
     AND v_user_id IS DISTINCT FROM v_activity.requester_id
     AND NOT (v_is_admin AND v_activity.validation_method = 'requester_approval') THEN
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
