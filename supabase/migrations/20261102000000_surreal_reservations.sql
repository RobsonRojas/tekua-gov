-- Migration: Surreal reservations (change reserve-surreais-on-demand-work)
-- Date: 2026-11-02
--
-- Demands and registered works whose beneficiary is a member (not the village) are paid
-- from the beneficiary's wallet. The reward is RESERVED in the beneficiary's wallet when the
-- activity is created: it stays in the total balance but is unavailable for transfers, new
-- reservations and administrative debits. On confirmation the reservation is consumed as a
-- direct transfer beneficiary -> each executor. On rejection/removal it is released.
-- Village beneficiary (requester without reservation) and legacy open activities keep being
-- paid by the Treasury.

-- ---------------------------------------------------------------------------
-- 1. Wallet column + invariant
-- ---------------------------------------------------------------------------
ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS reserved_balance NUMERIC(15, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_reserved_balance_check;
ALTER TABLE public.wallets
  ADD CONSTRAINT wallets_reserved_balance_check CHECK (reserved_balance >= 0);

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_reserved_within_balance_check;
ALTER TABLE public.wallets
  ADD CONSTRAINT wallets_reserved_within_balance_check
  CHECK (profile_id IS NULL OR balance >= reserved_balance);

-- NOTE: tr_prevent_direct_balance_update only guards the `balance` column, so the
-- SECURITY DEFINER RPCs below can write `reserved_balance` without bypassing it.

-- ---------------------------------------------------------------------------
-- 2. Reservations table (audit trail). Writes happen only through the RPCs.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surreal_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL UNIQUE REFERENCES public.activities(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'consumed', 'released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_surreal_reservations_wallet ON public.surreal_reservations(wallet_id);

ALTER TABLE public.surreal_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads own reservations" ON public.surreal_reservations;
CREATE POLICY "Owner reads own reservations" ON public.surreal_reservations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.wallets w
    WHERE w.id = surreal_reservations.wallet_id AND w.profile_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- 3. Helpers
-- ---------------------------------------------------------------------------
-- Only admins and transversal-council members may name ANOTHER member as beneficiary.
-- NULL caller (service role) is trusted: the Edge Function already enforced the rule.
CREATE OR REPLACE FUNCTION public.fn_assert_can_name_beneficiary(p_caller UUID, p_beneficiary UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_roles TEXT[];
BEGIN
  IF p_caller IS NULL OR p_beneficiary IS NULL OR p_beneficiary = p_caller THEN
    RETURN;
  END IF;

  SELECT role, roles INTO v_role, v_roles FROM public.profiles WHERE id = p_caller;
  IF v_role IN ('admin', 'transversal_council')
     OR 'admin' = ANY(COALESCE(v_roles, '{}'))
     OR 'transversal_council' = ANY(COALESCE(v_roles, '{}')) THEN
    RETURN;
  END IF;

  RAISE EXCEPTION 'FORBIDDEN_BENEFICIARY: only admins or council members can name another member as beneficiary';
END;
$$;

REVOKE ALL ON FUNCTION public.fn_assert_can_name_beneficiary(UUID, UUID) FROM PUBLIC, anon, authenticated;

-- Amount that must be held for an activity: the reward for each executor (full reward each).
CREATE OR REPLACE FUNCTION public.fn_required_reservation(
  p_reward NUMERIC,
  p_executor_ids UUID[]
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_reward * GREATEST(1, COALESCE(array_length(p_executor_ids, 1), 0));
$$;

CREATE OR REPLACE FUNCTION public.get_member_available_balance(p_profile_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT balance - reserved_balance FROM public.wallets WHERE profile_id = p_profile_id), 0);
$$;

REVOKE ALL ON FUNCTION public.get_member_available_balance(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_member_available_balance(UUID) TO authenticated, service_role;

-- Reserve p_amount in the wallet of p_profile_id for the activity.
CREATE OR REPLACE FUNCTION public.reserve_surreais(
  p_activity_id UUID,
  p_profile_id UUID,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance NUMERIC;
  v_reserved NUMERIC;
BEGIN
  IF p_profile_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN;
  END IF;

  SELECT id, balance, reserved_balance INTO v_wallet_id, v_balance, v_reserved
  FROM public.wallets WHERE profile_id = p_profile_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_AVAILABLE_BALANCE: wallet not found (available=0, required=%)', p_amount;
  END IF;

  IF v_balance - v_reserved < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_AVAILABLE_BALANCE: available=%, required=%', v_balance - v_reserved, p_amount;
  END IF;

  INSERT INTO public.surreal_reservations (activity_id, wallet_id, amount)
  VALUES (p_activity_id, v_wallet_id, p_amount);

  UPDATE public.wallets SET reserved_balance = reserved_balance + p_amount WHERE id = v_wallet_id;
END;
$$;

-- Release a held reservation (rejected/removed activity).
CREATE OR REPLACE FUNCTION public.release_reservation(p_activity_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_res RECORD;
BEGIN
  SELECT wallet_id INTO v_wallet_id FROM public.surreal_reservations
  WHERE activity_id = p_activity_id AND status = 'held';
  IF v_wallet_id IS NULL THEN
    RETURN;
  END IF;

  PERFORM 1 FROM public.wallets WHERE id = v_wallet_id FOR UPDATE;

  SELECT * INTO v_res FROM public.surreal_reservations
  WHERE activity_id = p_activity_id AND status = 'held' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.wallets SET reserved_balance = reserved_balance - v_res.amount WHERE id = v_wallet_id;
  UPDATE public.surreal_reservations
  SET status = 'released', resolved_at = now(), updated_at = now()
  WHERE id = v_res.id;
END;
$$;

-- Re-align a held reservation with reward x executors (executor added/removed, reward edited).
-- Growing requires available balance; shrinking frees the difference. No-op without a held reservation.
CREATE OR REPLACE FUNCTION public.sync_activity_reservation(p_activity_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_res RECORD;
  v_act RECORD;
  v_required NUMERIC;
  v_delta NUMERIC;
  v_balance NUMERIC;
  v_reserved NUMERIC;
BEGIN
  SELECT wallet_id INTO v_wallet_id FROM public.surreal_reservations
  WHERE activity_id = p_activity_id AND status = 'held';
  IF v_wallet_id IS NULL THEN
    RETURN;
  END IF;

  SELECT balance, reserved_balance INTO v_balance, v_reserved
  FROM public.wallets WHERE id = v_wallet_id FOR UPDATE;

  SELECT * INTO v_res FROM public.surreal_reservations
  WHERE activity_id = p_activity_id AND status = 'held' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT reward_amount, executor_ids INTO v_act FROM public.activities WHERE id = p_activity_id;
  v_required := public.fn_required_reservation(v_act.reward_amount, v_act.executor_ids);
  v_delta := v_required - v_res.amount;

  IF v_delta = 0 THEN
    RETURN;
  END IF;

  IF v_delta > 0 AND v_balance - v_reserved < v_delta THEN
    RAISE EXCEPTION 'INSUFFICIENT_AVAILABLE_BALANCE: available=%, required=%', v_balance - v_reserved, v_delta;
  END IF;

  UPDATE public.wallets SET reserved_balance = reserved_balance + v_delta WHERE id = v_wallet_id;
  UPDATE public.surreal_reservations SET amount = v_required, updated_at = now() WHERE id = v_res.id;
END;
$$;

-- Internal RPCs: only the service role (Edge Functions) and other definer functions call them.
REVOKE ALL ON FUNCTION public.reserve_surreais(UUID, UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_reservation(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_activity_reservation(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_surreais(UUID, UUID, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_reservation(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_activity_reservation(UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Release on rejection / hard delete, whatever the code path
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_release_reservation_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.release_reservation(OLD.id);
    RETURN OLD;
  END IF;

  IF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' THEN
    PERFORM public.release_reservation(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_release_reservation_on_reject ON public.activities;
CREATE TRIGGER tr_release_reservation_on_reject
AFTER UPDATE OF status ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.fn_release_reservation_on_activity();

DROP TRIGGER IF EXISTS tr_release_reservation_on_delete ON public.activities;
CREATE TRIGGER tr_release_reservation_on_delete
BEFORE DELETE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.fn_release_reservation_on_activity();

-- ---------------------------------------------------------------------------
-- 5. Create demand + reservation in one transaction
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_activity_with_reservation(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC,
  p_type TEXT,
  p_requester_id UUID,
  p_reserve BOOLEAN,
  p_geo_required BOOLEAN,
  p_min_confirmations INTEGER,
  p_urgency BOOLEAN,
  p_importance BOOLEAN,
  p_executor_ids UUID[],
  p_project_id UUID,
  p_category_id UUID,
  p_protocol_id UUID
)
RETURNS public.activities
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity public.activities;
BEGIN
  INSERT INTO public.activities (
    title, description, reward_amount, type, requester_id, status, geo_required,
    validation_method, min_confirmations, urgency, importance, executor_ids,
    project_id, category_id, protocol_id
  )
  VALUES (
    p_title, p_description, p_reward_amount, p_type::activity_type, p_requester_id, 'open', p_geo_required,
    'requester_approval', p_min_confirmations, p_urgency, p_importance, COALESCE(p_executor_ids, '{}'),
    p_project_id, p_category_id, p_protocol_id
  )
  RETURNING * INTO v_activity;

  IF p_reserve THEN
    PERFORM public.reserve_surreais(
      v_activity.id,
      p_requester_id,
      public.fn_required_reservation(p_reward_amount, v_activity.executor_ids)
    );
  END IF;

  RETURN v_activity;
END;
$$;

REVOKE ALL ON FUNCTION public.create_activity_with_reservation(JSONB, JSONB, NUMERIC, TEXT, UUID, BOOLEAN, BOOLEAN, INTEGER, BOOLEAN, BOOLEAN, UUID[], UUID, UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_activity_with_reservation(JSONB, JSONB, NUMERIC, TEXT, UUID, BOOLEAN, BOOLEAN, INTEGER, BOOLEAN, BOOLEAN, UUID[], UUID, UUID, UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- 6. submit_activity: reserve in the member requester's wallet (same 11-parameter signature)
-- ---------------------------------------------------------------------------
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
  PERFORM public.fn_assert_can_name_beneficiary(auth.uid(), p_requester_id);

  IF array_length(p_executor_ids, 1) > 0 THEN
    v_effective_executors := p_executor_ids;
  ELSIF p_worker_id IS NOT NULL THEN
    v_effective_executors := ARRAY[p_worker_id];
  ELSE
    v_effective_executors := ARRAY[auth.uid()];
  END IF;

  INSERT INTO activities (
    title, description, reward_amount, type, requester_id, worker_id, executor_ids,
    status, validation_method, urgency, importance, category_id
  )
  VALUES (
    p_title, p_description, p_reward_amount, 'contribution'::activity_type, p_requester_id,
    v_effective_executors[1], v_effective_executors,
    'pending_validation'::activity_status, p_validation_method, p_urgency, p_importance, p_category_id
  )
  RETURNING id INTO v_new_id;

  -- A member beneficiary must cover the reward for every executor; raises when unavailable
  -- and the whole transaction (activity included) is rolled back.
  IF p_requester_id IS NOT NULL THEN
    PERFORM public.reserve_surreais(
      v_new_id,
      p_requester_id,
      public.fn_required_reservation(p_reward_amount, v_effective_executors)
    );
  END IF;

  IF p_evidence_url IS NOT NULL AND btrim(p_evidence_url) <> '' THEN
    INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
    VALUES (v_new_id, v_effective_executors[1], p_evidence_url);
  END IF;

  RETURN v_new_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. Payout helper: reservation -> beneficiary pays each executor; otherwise Treasury
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_payout_activity(p_activity_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity RECORD;
  v_res RECORD;
  v_wallet_id UUID;
  v_executor_id UUID;
  v_payer UUID := NULL; -- NULL = Treasury
BEGIN
  SELECT * INTO v_activity FROM public.activities WHERE id = p_activity_id;

  SELECT wallet_id INTO v_wallet_id FROM public.surreal_reservations
  WHERE activity_id = p_activity_id AND status = 'held';

  IF v_wallet_id IS NOT NULL THEN
    PERFORM 1 FROM public.wallets WHERE id = v_wallet_id FOR UPDATE;
    SELECT * INTO v_res FROM public.surreal_reservations
    WHERE activity_id = p_activity_id AND status = 'held' FOR UPDATE;

    IF FOUND THEN
      -- Unlock first so the balance >= reserved invariant holds while debiting.
      UPDATE public.wallets SET reserved_balance = reserved_balance - v_res.amount WHERE id = v_wallet_id;
      UPDATE public.surreal_reservations
      SET status = 'consumed', resolved_at = now(), updated_at = now()
      WHERE id = v_res.id;
      v_payer := v_activity.requester_id;
    END IF;
  END IF;

  IF COALESCE(array_length(v_activity.executor_ids, 1), 0) > 0 THEN
    -- Full reward for each executor (current payment model)
    FOREACH v_executor_id IN ARRAY v_activity.executor_ids
    LOOP
      PERFORM public.execute_currency_transfer(v_payer, v_executor_id, v_activity.reward_amount, p_activity_id);
    END LOOP;
  ELSIF v_activity.worker_id IS NOT NULL THEN
    PERFORM public.execute_currency_transfer(v_payer, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_payout_activity(UUID) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. confirm_activity: same rules as 20261025000000, payout through fn_payout_activity
-- ---------------------------------------------------------------------------
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

  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id FOR UPDATE;

  IF v_activity.status != 'pending_validation' THEN
    RAISE EXCEPTION 'Activity is not pending validation';
  END IF;

  IF (v_user_id = v_activity.worker_id OR v_user_id = ANY(v_activity.executor_ids))
     AND v_user_id IS DISTINCT FROM v_activity.requester_id
     AND NOT (v_is_admin AND v_activity.validation_method = 'requester_approval') THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  IF v_activity.validation_method = 'requester_approval' THEN
    IF v_user_id != v_activity.requester_id AND NOT v_is_admin THEN
      RAISE EXCEPTION 'Only the requester or an administrator can approve this activity';
    END IF;

    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id)
    ON CONFLICT DO NOTHING;

    UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;

    PERFORM public.fn_payout_activity(p_activity_id);

    RETURN jsonb_build_object('success', TRUE, 'completed', TRUE, 'confirmations', 1);

  ELSIF v_activity.validation_method = 'community_consensus' THEN
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id)
    ON CONFLICT DO NOTHING;

    SELECT COUNT(*)::INTEGER INTO v_confirm_count FROM activity_confirmations WHERE activity_id = p_activity_id;

    IF v_confirm_count >= v_activity.min_confirmations THEN
      UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;

      PERFORM public.fn_payout_activity(p_activity_id);

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

-- ---------------------------------------------------------------------------
-- 9. Debits respect the AVAILABLE balance (total - reserved)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.perform_transfer(
  p_to_id UUID,
  p_amount NUMERIC(15, 2),
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_id UUID;
  v_from_wallet_id UUID;
  v_to_wallet_id UUID;
  v_from_balance NUMERIC;
  v_from_reserved NUMERIC;
  v_transaction_id UUID;
BEGIN
  v_from_id := auth.uid();

  IF v_from_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_to_id = v_from_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  SELECT id, balance, reserved_balance INTO v_from_wallet_id, v_from_balance, v_from_reserved
  FROM public.wallets
  WHERE profile_id = v_from_id
  FOR UPDATE;

  SELECT id INTO v_to_wallet_id
  FROM public.wallets
  WHERE profile_id = p_to_id
  FOR UPDATE;

  IF v_from_balance - v_from_reserved < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO public.transactions (from_id, to_id, amount, description)
  VALUES (v_from_id, p_to_id, p_amount, p_description)
  RETURNING id INTO v_transaction_id;

  PERFORM public.fn_record_ledger_entry(
      v_from_wallet_id,
      v_to_wallet_id,
      p_amount,
      'transfer',
      v_transaction_id
  );

  RETURN jsonb_build_object('success', TRUE, 'new_balance', v_from_balance - p_amount);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

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
  v_from_reserved NUMERIC;
  v_transaction_id UUID;
BEGIN
  SELECT id INTO v_to_wallet_id FROM public.wallets WHERE profile_id = p_to_wallet FOR UPDATE;
  IF v_to_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Destination wallet not found';
  END IF;

  IF p_from_wallet IS NOT NULL THEN
    SELECT id, balance, reserved_balance INTO v_from_wallet_id, v_from_balance, v_from_reserved
    FROM public.wallets WHERE profile_id = p_from_wallet FOR UPDATE;
    IF v_from_wallet_id IS NULL THEN
      RAISE EXCEPTION 'Source wallet not found';
    END IF;
    IF v_from_balance - v_from_reserved < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance in source wallet';
    END IF;
  ELSE
    SELECT id INTO v_from_wallet_id FROM public.wallets WHERE profile_id IS NULL FOR UPDATE;
    IF v_from_wallet_id IS NULL THEN
      RAISE EXCEPTION 'Treasury wallet not found';
    END IF;
  END IF;

  INSERT INTO public.transactions (from_id, to_id, amount, description, activity_id)
  VALUES (p_from_wallet, p_to_wallet, p_amount, 'Activity reward: ' || p_activity_id, p_activity_id)
  RETURNING id INTO v_transaction_id;

  PERFORM public.fn_record_ledger_entry(
      v_from_wallet_id,
      v_to_wallet_id,
      p_amount,
      'activity',
      p_activity_id
  );
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
  v_target_wallet_id UUID;
  v_treasury_wallet_id UUID;
  v_from_wallet UUID;
  v_to_wallet UUID;
  v_amount NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- NOTE: Admin authorization is enforced by the calling Edge Function (api-wallet)
  -- before invoking this RPC via the service role client. Do not re-check auth.uid() here.

  IF p_amount = 0 THEN
    RAISE EXCEPTION 'Amount cannot be zero';
  END IF;

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

    -- Burn only from the available balance (reserved surreais are untouchable)
    IF (SELECT balance - reserved_balance FROM public.wallets WHERE id = v_target_wallet_id) < v_amount THEN
      RAISE EXCEPTION 'Insufficient balance in user wallet';
    END IF;
  END IF;

  INSERT INTO public.transactions (from_id, to_id, amount, description)
  VALUES (v_from_wallet, v_to_wallet, v_amount, 'Admin adjustment: ' || p_justification)
  RETURNING id INTO v_transaction_id;

  PERFORM public.fn_record_ledger_entry(
      CASE WHEN p_amount > 0 THEN v_treasury_wallet_id ELSE v_target_wallet_id END,
      CASE WHEN p_amount > 0 THEN v_target_wallet_id ELSE v_treasury_wallet_id END,
      v_amount,
      'admin_adjustment',
      v_transaction_id
  );

  RETURN jsonb_build_object('success', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
