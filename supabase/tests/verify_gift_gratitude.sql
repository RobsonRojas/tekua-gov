-- Verificação de gift-gratitude (change gift-gratitude).
-- ATENÇÃO: executar apenas em banco de teste. Insere dados de teste e termina em ROLLBACK.
-- Pré-requisito: migração 20261027000000_gift_gratitude aplicada.

BEGIN;

-- Fixtures: duas pessoas, uma dádiva da Bia.
INSERT INTO auth.users (id) VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bia'),
  ('22222222-2222-2222-2222-222222222222', 'Ana'),
  ('33333333-3333-3333-3333-333333333333', 'Caio')
ON CONFLICT DO NOTHING;
INSERT INTO public.wallets (profile_id, gift_points) VALUES ('11111111-1111-1111-1111-111111111111', 0)
ON CONFLICT DO NOTHING;
INSERT INTO public.gifts (id, provider_id, title) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '"Cesta"')
ON CONFLICT DO NOTHING;

-- 1. Mensagem pública de gratidão é gravada; mensagem privada fica fora da visão de outra pessoa.
SELECT public.award_gift_points('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Obrigada!', ARRAY['🙏'], false);
DO $$
DECLARE n integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM public.gift_usages WHERE thanks_message IS NOT NULL;
  RESET ROLE;
  IF n <> 0 THEN RAISE EXCEPTION 'FALHA 1: mensagem privada visível para outra pessoa (%)', n; END IF;
  RAISE NOTICE 'OK 1: mensagem privada oculta para outra pessoa';
END $$;

-- 2. Ingratidão é sempre privada, mesmo quando o autor pede público.
SELECT public.award_gift_points('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Não gostei', NULL, true, 'ingratitude');
DO $$
DECLARE pub boolean;
BEGIN
  SELECT is_public INTO pub FROM public.gift_usages WHERE consumer_id = '33333333-3333-3333-3333-333333333333' AND sentiment = 'ingratitude';
  IF pub IS NOT false THEN RAISE EXCEPTION 'FALHA 2: ingratidão gravada como pública'; END IF;
  RAISE NOTICE 'OK 2: ingratidão gravada como privada';
END $$;

-- 3. Não é possível tornar uma ingratidão pública depois (restrição do banco).
DO $$
BEGIN
  UPDATE public.gift_usages SET is_public = true WHERE sentiment = 'ingratitude';
  RAISE EXCEPTION 'FALHA 3: ingratidão tornada pública';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'OK 3: ingratidão não pode ser tornada pública';
END $$;

-- 4. Lembrete: quem usou sem agradecer entra; quem já agradeceu, ou só registrou ingratidão, não entra.
INSERT INTO auth.users (id) VALUES ('44444444-4444-4444-4444-444444444444') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name) VALUES ('44444444-4444-4444-4444-444444444444', 'Dani') ON CONFLICT DO NOTHING;
-- Caio usa sem agradecimento (candidato); Dani registra só ingratidão (não é candidata)
SELECT public.award_gift_points('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', NULL, NULL, true, 'gratitude');
SELECT public.award_gift_points('aaaaaaaa-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Não gostei', NULL, false, 'ingratitude');
DO $$
DECLARE ids text;
BEGIN
  SELECT string_agg(id::text, ',') INTO ids FROM public.gift_gratitude_reminder_candidates() AS id;
  IF ids IS NULL OR ids NOT LIKE '%33333333%' THEN RAISE EXCEPTION 'FALHA 4a: Caio (usou sem agradecer) deveria ser candidato: %', ids; END IF;
  IF ids LIKE '%22222222%' THEN RAISE EXCEPTION 'FALHA 4b: Ana (já agradeceu) apareceu como candidata'; END IF;
  IF ids LIKE '%44444444%' THEN RAISE EXCEPTION 'FALHA 4c: Dani (só ingratidão) apareceu como candidata'; END IF;
  RAISE NOTICE 'OK 4: candidatos corretos (Caio sim; Ana e Dani não)';
END $$;

-- 5. Limites do banco: mensagem de até 280 caracteres e até 5 emojis.
DO $$
BEGIN
  PERFORM public.award_gift_points('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', repeat('a', 281), NULL, true);
  RAISE EXCEPTION 'FALHA 5a: mensagem de 281 caracteres aceita';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'OK 5a: mensagem acima de 280 recusada';
END $$;
DO $$
BEGIN
  PERFORM public.award_gift_points('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'x', ARRAY['a','b','c','d','e','f'], true);
  RAISE EXCEPTION 'FALHA 5b: seis itens aceitos';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'OK 5b: mais de cinco emojis recusados';
END $$;

ROLLBACK;
