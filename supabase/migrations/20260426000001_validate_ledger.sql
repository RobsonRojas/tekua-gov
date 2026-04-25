-- Validation Script: Unified Wallet Ledger
-- Test Group 4

DO $$
DECLARE
    v_test_worker_id UUID;
    v_test_wallet_id UUID;
    v_test_activity_id UUID;
    v_initial_balance NUMERIC;
    v_final_balance NUMERIC;
    v_treasury_wallet_id UUID;
BEGIN
    -- 1. Setup Test Data
    -- Find a worker
    SELECT id INTO v_test_worker_id FROM public.profiles WHERE role = 'member' LIMIT 1;
    SELECT id, balance INTO v_test_wallet_id, v_initial_balance FROM public.wallets WHERE profile_id = v_test_worker_id;
    SELECT id INTO v_treasury_wallet_id FROM public.wallets WHERE profile_id IS NULL;

    RAISE NOTICE 'Initial Balance: %', v_initial_balance;

    -- 2. Simulate Payout (Task 4.1)
    -- Create dummy activity
    INSERT INTO public.activities (worker_id, title, description, type, status, reward_amount)
    VALUES (
        v_test_worker_id, 
        '{"pt": "Teste de Ledger", "en": "Ledger Test"}'::jsonb, 
        '{"pt": "Descrição de teste", "en": "Test description"}'::jsonb,
        'task'::activity_type,
        'completed', 
        50.00
    )
    RETURNING id INTO v_test_activity_id;

    -- Record in Ledger (Debit Treasury, Credit Worker)
    PERFORM public.fn_record_ledger_entry(
        v_treasury_wallet_id,
        v_test_wallet_id,
        50.00,
        'activity',
        v_test_activity_id
    );

    -- Check final balance
    SELECT balance INTO v_final_balance FROM public.wallets WHERE id = v_test_wallet_id;
    RAISE NOTICE 'Final Balance: %', v_final_balance;

    IF v_final_balance != v_initial_balance + 50.00 THEN
        RAISE EXCEPTION 'Balance mismatch! Expected %, got %', v_initial_balance + 50.00, v_final_balance;
    END IF;

    RAISE NOTICE 'Payout cycle test passed!';

    -- 3. Check Ledger Integrity (Task 4.3)
    IF EXISTS (SELECT 1 FROM public.verify_ledger_integrity()) THEN
        RAISE EXCEPTION 'Ledger integrity failed after test payout!';
    END IF;

    RAISE NOTICE 'Integrity check passed!';

END $$;
