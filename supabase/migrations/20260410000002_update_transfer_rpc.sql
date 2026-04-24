-- Migration: Update execute_currency_transfer to use activity_id
-- Date: 2026-04-10

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
  -- Now using the dedicated activity_id column
  INSERT INTO transactions (from_id, to_id, amount, description, activity_id)
  VALUES (p_from_wallet, p_to_wallet, p_amount, 'Activity reward: ' || p_activity_id, p_activity_id);
END;
$$;
