-- Migration: Create Work Registration & Community Validation System
-- Date: 2026-04-07

-- 1. Governance Settings Table (e.g., threshold for confirmations)
CREATE TABLE governance_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default threshold
INSERT INTO governance_settings (key, value)
VALUES ('min_contribution_confirmations', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Contributions Table
CREATE TYPE contribution_status AS ENUM ('pending', 'completed', 'rejected');

CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL = Tekuá Treasury
  amount_suggested NUMERIC(15, 2) NOT NULL CHECK (amount_suggested > 0),
  description TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  status contribution_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Contribution Confirmations (Social Validation)
CREATE TABLE contribution_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES public.contributions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contribution_id, user_id) -- One vote per member
);

-- 4. RLS Policies
ALTER TABLE governance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_confirmations ENABLE ROW LEVEL SECURITY;

-- 4.1 Governance Settings: Viewable by all, update by admin only
CREATE POLICY "Governance settings are viewable by everyone." ON governance_settings
  FOR SELECT USING (TRUE);

-- 4.2 Contributions: Viewable by all, insert by authenticated
CREATE POLICY "Contributions are viewable by everyone." ON contributions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can submit their own contributions." ON contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.3 Confirmations: Viewable by all, insert by authenticated (except owner)
CREATE POLICY "Confirmations are viewable by everyone." ON contribution_confirmations
  FOR SELECT USING (TRUE);

-- Validation that user is not the owner is handled in the RPC for better feedback
CREATE POLICY "Users can confirm contributions." ON contribution_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. RPC Functions

-- 5.1 Submit Contribution (Helper to ensure metadata)
CREATE OR REPLACE FUNCTION submit_contribution(
  p_description TEXT,
  p_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_beneficiary_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO contributions (user_id, description, amount_suggested, evidence_url, beneficiary_id)
  VALUES (auth.uid(), p_description, p_amount, p_evidence_url, p_beneficiary_id)
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- 5.2 Confirm Contribution & Auto-Payout
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get contribution info
  SELECT user_id, amount_suggested, status INTO v_contribution_user_id, v_amount, v_status
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

    -- Execute internal minting (reusing logic from admin_mint_currency)
    UPDATE wallets SET balance = balance + v_amount, updated_at = NOW()
    WHERE profile_id = v_contribution_user_id;

    -- Log transaction (Treasury -> User)
    INSERT INTO transactions (from_id, to_id, amount, description)
    VALUES (NULL, v_contribution_user_id, v_amount, 'Automated payout for validated contribution: ' || p_contribution_id);
    
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
