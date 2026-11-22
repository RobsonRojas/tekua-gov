-- Recompensa em surreais por interação com pautas (mineração a partir da tesouraria)
ALTER TABLE public.discussion_topics
  ADD COLUMN IF NOT EXISTS reward_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (reward_amount >= 0);

CREATE TABLE IF NOT EXISTS public.topic_interaction_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.discussion_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('vote', 'comment')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topic_id, user_id, kind)
);

ALTER TABLE public.topic_interaction_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own topic rewards" ON public.topic_interaction_rewards;
CREATE POLICY "Members read own topic rewards" ON public.topic_interaction_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Credita a recompensa (no máximo uma por pauta/membro/tipo). Retorna o valor creditado (0 se nada).
CREATE OR REPLACE FUNCTION public.grant_topic_reward(
  p_topic_id UUID,
  p_user_id UUID,
  p_kind TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount NUMERIC;
  v_status TEXT;
  v_reward_id UUID;
  v_treasury_wallet_id UUID;
  v_user_wallet_id UUID;
BEGIN
  IF p_kind NOT IN ('vote', 'comment') THEN
    RAISE EXCEPTION 'Invalid reward kind';
  END IF;

  SELECT reward_amount, status INTO v_amount, v_status
  FROM discussion_topics WHERE id = p_topic_id;

  IF v_amount IS NULL OR v_amount <= 0 OR v_status <> 'open' THEN
    RETURN 0;
  END IF;

  SELECT id INTO v_user_wallet_id FROM wallets WHERE profile_id = p_user_id FOR UPDATE;
  IF v_user_wallet_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT id INTO v_treasury_wallet_id FROM wallets WHERE profile_id IS NULL FOR UPDATE;
  IF v_treasury_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Treasury wallet not found';
  END IF;

  INSERT INTO topic_interaction_rewards (topic_id, user_id, kind, amount)
  VALUES (p_topic_id, p_user_id, p_kind, v_amount)
  ON CONFLICT (topic_id, user_id, kind) DO NOTHING
  RETURNING id INTO v_reward_id;

  IF v_reward_id IS NULL THEN
    RETURN 0; -- já recompensado
  END IF;

  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (NULL, p_user_id, v_amount, 'Recompensa por participação em pauta: ' || p_topic_id);

  PERFORM fn_record_ledger_entry(v_treasury_wallet_id, v_user_wallet_id, v_amount, 'topic_reward', v_reward_id);

  RETURN v_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_topic_reward(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_topic_reward(UUID, UUID, TEXT) TO service_role;
