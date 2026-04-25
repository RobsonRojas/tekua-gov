-- Migration: Unified Wallet Ledger
-- Date: 2026-04-26

-- 1. Ledger Entries Table
-- 1a. Relax wallets balance constraint to allow system wallets to be negative (double-entry source)
DO $$ 
BEGIN 
    -- Drop any existing balance check constraints to allow ledger-managed balances
    EXECUTE (
        SELECT 'ALTER TABLE public.wallets DROP CONSTRAINT ' || quote_ident(conname)
        FROM pg_constraint 
        WHERE conrelid = 'public.wallets'::regclass 
        AND contype = 'c' 
        AND (conname LIKE '%balance%' OR pg_get_constraintdef(oid) LIKE '%balance%')
    );
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'No balance constraint found to drop or error occurred';
END $$;

ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_check CHECK (profile_id IS NULL OR balance >= 0);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL, -- Positive for Credit, Negative for Debit
    reference_type TEXT NOT NULL, -- 'activity', 'transfer', 'fee', 'mint'
    reference_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indices for performance
CREATE INDEX IF NOT EXISTS idx_ledger_wallet_id ON public.ledger_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference_id ON public.ledger_entries(reference_id);

-- 3. System Wallets Initialization
-- Allowing NULL profile_id for system accounts (like Treasury)
ALTER TABLE public.wallets ALTER COLUMN profile_id DROP NOT NULL;

DO $$
DECLARE
    v_treasury_wallet_id UUID;
BEGIN
    -- Create Treasury Wallet with NULL profile_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE profile_id IS NULL) THEN
        INSERT INTO public.wallets (profile_id, balance)
        VALUES (NULL, 1000000) -- Initial Treasury Balance
        RETURNING id INTO v_treasury_wallet_id;
    END IF;
END $$;

-- 4. Double-Entry Recording Function
CREATE OR REPLACE FUNCTION public.fn_record_ledger_entry(
    p_from_wallet_id UUID,
    p_to_wallet_id UUID,
    p_amount NUMERIC(15, 2),
    p_type TEXT,
    p_ref_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Debit from source
    IF p_from_wallet_id IS NOT NULL THEN
        INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id)
        VALUES (p_from_wallet_id, -p_amount, p_type, p_ref_id);
    END IF;

    -- Credit to destination
    IF p_to_wallet_id IS NOT NULL THEN
        INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id)
        VALUES (p_to_wallet_id, p_amount, p_type, p_ref_id);
    END IF;
END;
$$;

-- 5. Trigger to Sync Materialized Balance
CREATE OR REPLACE FUNCTION public.fn_sync_wallet_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.wallets
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_wallet_balance ON public.ledger_entries;
CREATE TRIGGER tr_sync_wallet_balance
AFTER INSERT ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_wallet_balance();

-- 6. Refactored perform_transfer RPC
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
  v_transaction_id UUID;
BEGIN
  v_from_id := auth.uid();
  
  -- 1. Basic validation
  IF v_from_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF p_to_id = v_from_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  -- 2. Get and lock wallets
  SELECT id, balance INTO v_from_wallet_id, v_from_balance
  FROM public.wallets
  WHERE profile_id = v_from_id
  FOR UPDATE;

  SELECT id INTO v_to_wallet_id
  FROM public.wallets
  WHERE profile_id = p_to_id
  FOR UPDATE;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Log legacy transaction for UI compatibility
  INSERT INTO public.transactions (from_id, to_id, amount, description)
  VALUES (v_from_id, p_to_id, p_amount, p_description)
  RETURNING id INTO v_transaction_id;

  -- 4. Record in Ledger (Trigger will update balances)
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

-- 7. Historical Data Migration (Task 3.1)
DO $$
DECLARE
    v_treasury_wallet_id UUID;
BEGIN
    -- Find Treasury Wallet
    SELECT id INTO v_treasury_wallet_id FROM public.wallets WHERE profile_id IS NULL LIMIT 1;

    -- 7a. Disable balance sync trigger during migration
    ALTER TABLE public.ledger_entries DISABLE TRIGGER tr_sync_wallet_balance;
    ALTER TABLE public.wallets DISABLE TRIGGER tr_prevent_direct_balance_update;

    -- 7b. Migrate Transactions (Double Entry)
    -- From non-system wallets
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        w_from.id as wallet_id,
        -t.amount as amount,
        'transfer' as reference_type,
        t.id as reference_id,
        t.created_at
    FROM public.transactions t
    JOIN public.wallets w_from ON w_from.profile_id = t.from_id
    WHERE t.from_id IS NOT NULL;

    -- From Treasury (where from_id IS NULL)
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        v_treasury_wallet_id,
        -t.amount as amount,
        'transfer' as reference_type,
        t.id as reference_id,
        t.created_at
    FROM public.transactions t
    WHERE t.from_id IS NULL;

    -- Credit destinations
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        w_to.id as wallet_id,
        t.amount as amount,
        'transfer' as reference_type,
        t.id as reference_id,
        t.created_at
    FROM public.transactions t
    JOIN public.wallets w_to ON w_to.profile_id = t.to_id;

    -- 7c. Migrate Activities (Rewards from Treasury to Worker)
    -- Debit Treasury
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        v_treasury_wallet_id,
        -reward_amount,
        'activity',
        id,
        created_at
    FROM public.activities
    WHERE status = 'completed';

    -- Credit Worker
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        w.id,
        a.reward_amount,
        'activity',
        a.id,
        a.created_at
    FROM public.activities a
    JOIN public.wallets w ON w.profile_id = a.worker_id
    WHERE a.status = 'completed';

    -- 7d. Reset Balances and Re-calculate from Ledger
    UPDATE public.wallets w
    SET balance = COALESCE((
        SELECT SUM(amount)
        FROM public.ledger_entries
        WHERE wallet_id = w.id
    ), 0);

    -- 7e. Re-enable triggers
    ALTER TABLE public.ledger_entries ENABLE TRIGGER tr_sync_wallet_balance;
    ALTER TABLE public.wallets ENABLE TRIGGER tr_prevent_direct_balance_update;
END $$;

-- 8. Reconciliation Service (Task 3.2)
CREATE OR REPLACE FUNCTION public.verify_ledger_integrity()
RETURNS TABLE (
    wallet_id UUID,
    profile_id UUID,
    materialized_balance NUMERIC,
    ledger_sum NUMERIC,
    discrepancy NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.profile_id,
        w.balance,
        COALESCE(SUM(l.amount), 0) as ledger_sum,
        w.balance - COALESCE(SUM(l.amount), 0) as discrepancy
    FROM public.wallets w
    LEFT JOIN public.ledger_entries l ON l.wallet_id = w.id
    GROUP BY w.id, w.profile_id, w.balance
    HAVING w.balance != COALESCE(SUM(l.amount), 0);
END;
$$;

-- 9. Balance Protection Trigger (Task 4.2)
CREATE OR REPLACE FUNCTION public.fn_prevent_direct_balance_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the update is coming from our sync function
    -- We use a session variable to flag authorized updates
    IF current_setting('app.authorized_ledger_sync', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF OLD.balance IS DISTINCT FROM NEW.balance THEN
        RAISE EXCEPTION 'Direct balance updates are forbidden. Use the ledger system.';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_direct_balance_update ON public.wallets;
CREATE TRIGGER tr_prevent_direct_balance_update
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_direct_balance_update();

-- Update sync function to set the flag
CREATE OR REPLACE FUNCTION public.fn_sync_wallet_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.authorized_ledger_sync', 'on', true);
    
    UPDATE public.wallets
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
    
    PERFORM set_config('app.authorized_ledger_sync', 'off', true);
    
    RETURN NEW;
END;
$$;
