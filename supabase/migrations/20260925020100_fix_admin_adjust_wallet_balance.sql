-- Migration: Fix admin_adjust_wallet_balance - remove internal auth.uid() check
-- Date: 2026-09-25
-- Context: The RPC is called via supabaseAdmin (service role key) from the Edge
-- Function api-wallet, which already performs the admin authorization check before
-- invoking this RPC. The auth.uid() call inside this SECURITY DEFINER function
-- returns NULL when called via service role, causing all adjustments to silently
-- fail with { success: false, error: 'Not authenticated' } despite HTTP 200.

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
BEGIN
  -- NOTE: Admin authorization is enforced by the calling Edge Function (api-wallet)
  -- before invoking this RPC via the service role client. Do not re-check auth.uid()
  -- here as it will always be NULL when called via supabaseAdmin (service role).

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
