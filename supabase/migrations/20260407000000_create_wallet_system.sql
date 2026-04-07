-- Migration: Create Wallet System (Surreal)
-- Date: 2026-04-07

-- 1. Wallets Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(15, 2) DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL from_id = Minting from Treasury
  to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3.1 Wallet Policies (Owner can see their own balance, no manual updates)
CREATE POLICY "Users can view their own wallet." ON wallets
  FOR SELECT USING (auth.uid() = profile_id);

-- 3.2 Transaction Policies (Users can see their sent/received transactions)
CREATE POLICY "Users can view their transactions." ON transactions
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

-- 4. Atomic Transfer RPC Function
CREATE OR REPLACE FUNCTION perform_transfer(
  p_to_id UUID,
  p_amount NUMERIC(15, 2),
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions
AS $$
DECLARE
  v_from_id UUID;
  v_from_balance NUMERIC;
BEGIN
  v_from_id := auth.uid();
  
  -- 1. Basic validation
  IF v_from_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF p_to_id = v_from_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  -- 2. Check and lock from wallet
  SELECT balance INTO v_from_balance
  FROM wallets
  WHERE profile_id = v_from_id
  FOR UPDATE;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Perform atomic operations
  -- 3a. Debit
  UPDATE wallets SET balance = balance - p_amount, updated_at = NOW()
  WHERE profile_id = v_from_id;

  -- 3b. Credit
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_to_id;

  -- 3c. Log transaction
  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (v_from_id, p_to_id, p_amount, p_description);

  RETURN jsonb_build_object('success', TRUE, 'new_balance', v_from_balance - p_amount);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- 5. Treasury Function (Admin Only)
CREATE OR REPLACE FUNCTION admin_mint_currency(
  p_recipient_id UUID,
  p_amount NUMERIC(15, 2),
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role TEXT;
BEGIN
  -- 1. Verify admin role
  SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can mint currency';
  END IF;

  -- 2. Update recipient balance
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_recipient_id;

  -- 3. Log transaction (from_id NULL = Treasury)
  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (NULL, p_recipient_id, p_amount, p_description);

  RETURN jsonb_build_object('success', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- 6. Trigger to auto-create wallets for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (profile_id, balance)
  VALUES (new.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

-- 7. Initialize wallets for existing users
INSERT INTO wallets (profile_id, balance)
SELECT id, 0 FROM profiles
ON CONFLICT (profile_id) DO NOTHING;
