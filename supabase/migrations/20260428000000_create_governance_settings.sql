-- 1. Drop dependent objects first
DROP FUNCTION IF EXISTS public.confirm_contribution(UUID);
DROP TABLE IF EXISTS public.governance_settings CASCADE;

-- 2. Create modern governance_settings table (Singleton)
CREATE TABLE public.governance_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    voting_duration_days INTEGER DEFAULT 7 NOT NULL,
    quorum_percentage INTEGER DEFAULT 50 NOT NULL,
    min_contribution_confirmations INTEGER DEFAULT 3 NOT NULL, -- Migrated from old key/value
    min_reward_amount NUMERIC(10,2) DEFAULT 1.00 NOT NULL,
    max_reward_amount NUMERIC(10,2) DEFAULT 1000.00 NOT NULL,
    auto_approve_small_tasks BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT singleton_check CHECK (id = 'current')
);

-- Enable RLS
ALTER TABLE public.governance_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone authenticated can read settings"
ON public.governance_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can update settings"
ON public.governance_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Insert singleton record
INSERT INTO public.governance_settings (id)
VALUES ('current')
ON CONFLICT (id) DO NOTHING;

-- 3. Recreate confirm_contribution using the new Singleton schema
CREATE OR REPLACE FUNCTION public.confirm_contribution(
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
  v_desc_text TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get contribution info
  SELECT user_id, amount_suggested, status, description 
  INTO v_contribution_user_id, v_amount, v_status, v_desc_text
  FROM public.contributions WHERE id = p_contribution_id;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'This contribution is no longer pending';
  END IF;

  IF v_user_id = v_contribution_user_id THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Record confirmation
  INSERT INTO public.contribution_confirmations (contribution_id, user_id)
  VALUES (p_contribution_id, v_user_id);

  -- 3. Check threshold
  SELECT COUNT(*)::INTEGER INTO v_confirm_count
  FROM public.contribution_confirmations
  WHERE contribution_id = p_contribution_id;

  -- Get setting from Singleton table
  SELECT min_contribution_confirmations INTO v_threshold
  FROM public.governance_settings
  WHERE id = 'current';

  -- 4. Trigger payout if reached
  IF v_confirm_count >= v_threshold THEN
    -- Update status
    UPDATE public.contributions SET status = 'completed', updated_at = NOW()
    WHERE id = p_contribution_id;

    -- Execute internal minting
    UPDATE public.wallets SET balance = balance + v_amount, updated_at = NOW()
    WHERE profile_id = v_contribution_user_id;

    -- Log transaction
    INSERT INTO public.transactions (from_id, to_id, amount, description)
    VALUES (NULL, v_contribution_user_id, v_amount, 'Automated payout for validated contribution: ' || p_contribution_id);
    
    -- LOG ACTIVITY for the recipient
    PERFORM public.log_user_activity(
      v_contribution_user_id,
      'task',
      jsonb_build_object(
        'pt', 'Pagamento automático recebido por: ' || v_desc_text,
        'en', 'Automated payout received for: ' || v_desc_text
      )
    );

    -- LOG ACTIVITY for the validator
    PERFORM public.log_user_activity(
      v_user_id,
      'vote',
      jsonb_build_object(
        'pt', 'Você forneceu a validação final para: ' || v_desc_text,
        'en', 'You provided the final validation for: ' || v_desc_text
      )
    );
    
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
