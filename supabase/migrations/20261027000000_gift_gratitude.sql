-- Agradecimento opcional ao usar uma dádiva (change gift-gratitude).
-- Mensagem e emojis são opcionais; is_public controla a exibição no dashboard público.

ALTER TABLE public.gift_usages
  ADD COLUMN IF NOT EXISTS thanks_message TEXT
    CHECK (thanks_message IS NULL OR char_length(thanks_message) BETWEEN 1 AND 280),
  ADD COLUMN IF NOT EXISTS thanks_emojis TEXT[]
    CHECK (thanks_emojis IS NULL OR cardinality(thanks_emojis) BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sentiment TEXT NOT NULL DEFAULT 'gratitude'
    CHECK (sentiment IN ('gratitude', 'ingratitude')),
  -- Ingratidões são sempre privadas (por enquanto), inclusive em alterações posteriores
  ADD CONSTRAINT gift_usages_ingratitude_is_private CHECK (sentiment <> 'ingratitude' OR is_public = false);

-- A política antiga expunha todas as colunas (inclusive mensagens privadas) a qualquer cliente.
-- Agora: registros públicos ou do próprio consumidor. Não há código que leia esta tabela
-- diretamente; as leituras passam pela api-gifts (service role com checagem de dono).
DROP POLICY IF EXISTS "Gift usages are viewable by everyone." ON public.gift_usages;
CREATE POLICY "Public gratitude or own usages are viewable"
  ON public.gift_usages FOR SELECT
  USING (is_public OR consumer_id = auth.uid());

-- Substitui award_gift_points: mesma contabilização de pontos, agora com agradecimento opcional.
DROP FUNCTION IF EXISTS public.award_gift_points(UUID, UUID);

CREATE OR REPLACE FUNCTION public.award_gift_points(
  p_gift_id UUID,
  p_consumer_id UUID,
  p_thanks_message TEXT DEFAULT NULL,
  p_thanks_emojis TEXT[] DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true,
  p_sentiment TEXT DEFAULT 'gratitude'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider_id UUID;
BEGIN
  -- 1. Registro de uso (com agradecimento opcional)
  INSERT INTO public.gift_usages (gift_id, consumer_id, thanks_message, thanks_emojis, is_public, sentiment)
  VALUES (
    p_gift_id,
    p_consumer_id,
    p_thanks_message,
    p_thanks_emojis,
    CASE WHEN COALESCE(p_sentiment, 'gratitude') = 'ingratitude' THEN false ELSE COALESCE(p_is_public, true) END,
    COALESCE(p_sentiment, 'gratitude')
  );

  -- 2. Provedor
  SELECT provider_id INTO v_provider_id
  FROM public.gifts
  WHERE id = p_gift_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  -- 3. Pontos de Dádiva do provedor (inalterado)
  UPDATE public.wallets
  SET gift_points = COALESCE(gift_points, 0) + 1,
      updated_at = now()
  WHERE profile_id = v_provider_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Controle do lembrete semanal: um envio por membro e por semana.
CREATE TABLE IF NOT EXISTS public.gift_gratitude_reminders (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

-- Sem policies: apenas a função agendada (service role) lê e escreve.
ALTER TABLE public.gift_gratitude_reminders ENABLE ROW LEVEL SECURITY;

-- Membros com uso nos últimos 7 dias que ainda não agradeceram nenhum deles.
CREATE OR REPLACE FUNCTION public.gift_gratitude_reminder_candidates()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT u.consumer_id
  FROM public.gift_usages u
  WHERE u.created_at >= now() - interval '7 days'
    AND u.sentiment = 'gratitude'
    AND u.thanks_message IS NULL
    AND (u.thanks_emojis IS NULL OR cardinality(u.thanks_emojis) = 0);
$$;

REVOKE ALL ON FUNCTION public.gift_gratitude_reminder_candidates() FROM PUBLIC, anon, authenticated;
