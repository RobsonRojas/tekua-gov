-- Verificação de surreal-reservation (change reserve-surreais-on-demand-work).
-- ATENÇÃO: executar apenas em banco de teste. Insere dados de teste e termina em ROLLBACK.
-- Pré-requisito: migração 20261102000000_surreal_reservations aplicada.
BEGIN;

INSERT INTO auth.users (id) VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Beneficiaria'),
  ('22222222-2222-2222-2222-222222222222', 'Executor')
ON CONFLICT DO NOTHING;
INSERT INTO public.wallets (profile_id, balance) VALUES
  ('11111111-1111-1111-1111-111111111111', 0),
  ('22222222-2222-2222-2222-222222222222', 0)
ON CONFLICT DO NOTHING;

-- Fundos: 100 para a beneficiária, via ledger (Tesouraria -> carteira).
SELECT public.fn_record_ledger_entry(
  (SELECT id FROM public.wallets WHERE profile_id IS NULL LIMIT 1),
  (SELECT id FROM public.wallets WHERE profile_id = '11111111-1111-1111-1111-111111111111'),
  100, 'mint', gen_random_uuid());

-- Helper: cria demanda de 60 para a beneficiária (reserva) ou para a aldeia (sem reserva).
CREATE TEMP TABLE _t (k TEXT PRIMARY KEY, v UUID);

DO $$
DECLARE
  v_a public.activities;
  v_avail NUMERIC;
BEGIN
  -- 1. Saldo suficiente: reserva 60, disponível 40, total 100.
  v_a := public.create_activity_with_reservation(
    '{"pt":"d1"}', '{"pt":"d1"}', 60, 'task', '11111111-1111-1111-1111-111111111111', TRUE,
    FALSE, 1, FALSE, FALSE, ARRAY['22222222-2222-2222-2222-222222222222']::uuid[], NULL, NULL, NULL);
  INSERT INTO _t VALUES ('a1', v_a.id);
  v_avail := public.get_member_available_balance('11111111-1111-1111-1111-111111111111');
  IF v_avail <> 40 THEN RAISE EXCEPTION 'FALHA 1: disponível esperado 40, obtido %', v_avail; END IF;
  RAISE NOTICE 'OK 1: reserva de 60 deixa 40 disponíveis';
END $$;

DO $$
BEGIN
  -- 2. Saldo insuficiente: recusa e não cria atividade nem reserva.
  BEGIN
    PERFORM public.create_activity_with_reservation(
      '{"pt":"d2"}', '{"pt":"d2"}', 60, 'task', '11111111-1111-1111-1111-111111111111', TRUE,
      FALSE, 1, FALSE, FALSE, '{}'::uuid[], NULL, NULL, NULL);
    RAISE EXCEPTION 'FALHA 2: deveria recusar por saldo insuficiente';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'INSUFFICIENT_AVAILABLE_BALANCE%' THEN RAISE; END IF;
  END;
  IF (SELECT count(*) FROM public.activities WHERE title->>'pt' = 'd2') <> 0 THEN
    RAISE EXCEPTION 'FALHA 2: atividade criada apesar do erro';
  END IF;
  RAISE NOTICE 'OK 2: saldo insuficiente recusa e não deixa resíduo';
END $$;

DO $$
DECLARE v_res JSONB;
BEGIN
  -- 3. Transferência acima do disponível é recusada (total 100, reservado 60).
  PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  v_res := public.perform_transfer('22222222-2222-2222-2222-222222222222', 50, 'teste');
  IF (v_res->>'success')::boolean THEN RAISE EXCEPTION 'FALHA 3: transferência de 50 deveria falhar'; END IF;
  v_res := public.perform_transfer('22222222-2222-2222-2222-222222222222', 40, 'teste');
  IF NOT (v_res->>'success')::boolean THEN RAISE EXCEPTION 'FALHA 3: transferência de 40 deveria passar: %', v_res; END IF;
  RAISE NOTICE 'OK 3: transferência respeita o disponível';
END $$;

DO $$
DECLARE
  v_res JSONB;
  v_a UUID := (SELECT v FROM _t WHERE k = 'a1');
  v_exec_before NUMERIC;
  v_treasury_before NUMERIC;
BEGIN
  -- 4. Confirmação: beneficiária paga o executor direto; Tesouraria não é movimentada.
  UPDATE public.activities SET status = 'pending_validation' WHERE id = v_a;
  SELECT balance INTO v_exec_before FROM public.wallets WHERE profile_id = '22222222-2222-2222-2222-222222222222';
  SELECT balance INTO v_treasury_before FROM public.wallets WHERE profile_id IS NULL LIMIT 1;

  PERFORM set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  v_res := public.confirm_activity(v_a);
  IF NOT (v_res->>'success')::boolean THEN RAISE EXCEPTION 'FALHA 4: %', v_res; END IF;

  IF (SELECT balance FROM public.wallets WHERE profile_id = '22222222-2222-2222-2222-222222222222') <> v_exec_before + 60 THEN
    RAISE EXCEPTION 'FALHA 4: executor deveria receber 60';
  END IF;
  IF (SELECT balance FROM public.wallets WHERE profile_id IS NULL LIMIT 1) <> v_treasury_before THEN
    RAISE EXCEPTION 'FALHA 4: Tesouraria não deveria ser movimentada';
  END IF;
  IF (SELECT reserved_balance FROM public.wallets WHERE profile_id = '11111111-1111-1111-1111-111111111111') <> 0 THEN
    RAISE EXCEPTION 'FALHA 4: reserva deveria estar zerada';
  END IF;
  IF (SELECT status FROM public.surreal_reservations WHERE activity_id = v_a) <> 'consumed' THEN
    RAISE EXCEPTION 'FALHA 4: reserva deveria estar consumed';
  END IF;
  RAISE NOTICE 'OK 4: confirmação paga da carteira do beneficiário';
END $$;

DO $$
DECLARE
  v_a public.activities;
BEGIN
  -- 5. Rejeição libera a reserva (saldo da beneficiária: 0 após 60 pagos + 40 transferidos; refunda 50).
  PERFORM public.fn_record_ledger_entry(
    (SELECT id FROM public.wallets WHERE profile_id IS NULL LIMIT 1),
    (SELECT id FROM public.wallets WHERE profile_id = '11111111-1111-1111-1111-111111111111'),
    50, 'mint', gen_random_uuid());
  v_a := public.create_activity_with_reservation(
    '{"pt":"d5"}', '{"pt":"d5"}', 50, 'task', '11111111-1111-1111-1111-111111111111', TRUE,
    FALSE, 1, FALSE, FALSE, '{}'::uuid[], NULL, NULL, NULL);
  IF public.get_member_available_balance('11111111-1111-1111-1111-111111111111') <> 0 THEN
    RAISE EXCEPTION 'FALHA 5: disponível deveria ser 0 com reserva de 50';
  END IF;
  UPDATE public.activities SET status = 'rejected' WHERE id = v_a.id;
  IF public.get_member_available_balance('11111111-1111-1111-1111-111111111111') <> 50 THEN
    RAISE EXCEPTION 'FALHA 5: reserva deveria ter sido liberada';
  END IF;
  RAISE NOTICE 'OK 5: rejeição libera a reserva';
END $$;

DO $$
DECLARE
  v_a public.activities;
BEGIN
  -- 6. Executor adicional exige reserva extra (sync) e falha sem saldo.
  v_a := public.create_activity_with_reservation(
    '{"pt":"d6"}', '{"pt":"d6"}', 30, 'task', '11111111-1111-1111-1111-111111111111', TRUE,
    FALSE, 1, FALSE, FALSE, '{}'::uuid[], NULL, NULL, NULL); -- reserva 30, disponível 20
  UPDATE public.activities SET executor_ids = ARRAY['22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111']::uuid[]
  WHERE id = v_a.id; -- precisa de 60: faltam 30, disponível 20
  BEGIN
    PERFORM public.sync_activity_reservation(v_a.id);
    RAISE EXCEPTION 'FALHA 6: sync deveria falhar por saldo insuficiente';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'INSUFFICIENT_AVAILABLE_BALANCE%' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'OK 6: executor adicional sem saldo é recusado';
END $$;

DO $$
DECLARE
  v_a public.activities;
  v_treasury_before NUMERIC;
BEGIN
  -- 7. Aldeia: sem reserva e sem exigência de saldo; paga pela Tesouraria.
  v_a := public.create_activity_with_reservation(
    '{"pt":"d7"}', '{"pt":"d7"}', 500, 'task', '22222222-2222-2222-2222-222222222222', FALSE,
    FALSE, 1, FALSE, FALSE, ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], NULL, NULL, NULL);
  IF EXISTS (SELECT 1 FROM public.surreal_reservations WHERE activity_id = v_a.id) THEN
    RAISE EXCEPTION 'FALHA 7: aldeia não deve gerar reserva';
  END IF;
  SELECT balance INTO v_treasury_before FROM public.wallets WHERE profile_id IS NULL LIMIT 1;
  UPDATE public.activities SET status = 'pending_validation' WHERE id = v_a.id;
  PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  IF NOT (public.confirm_activity(v_a.id)->>'success')::boolean THEN RAISE EXCEPTION 'FALHA 7: confirmação falhou'; END IF;
  IF (SELECT balance FROM public.wallets WHERE profile_id IS NULL LIMIT 1) <> v_treasury_before - 500 THEN
    RAISE EXCEPTION 'FALHA 7: Tesouraria deveria pagar 500';
  END IF;
  RAISE NOTICE 'OK 7: aldeia paga pela Tesouraria sem reserva';
END $$;

DO $$
BEGIN
  -- 8. Membro comum não pode nomear outro membro como beneficiário em submit_activity.
  PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  BEGIN
    PERFORM public.submit_activity('{"pt":"d8"}', '{"pt":"d8"}', 10, NULL,
      '11111111-1111-1111-1111-111111111111', 'requester_approval', FALSE, FALSE, NULL,
      ARRAY['22222222-2222-2222-2222-222222222222']::uuid[], NULL);
    RAISE EXCEPTION 'FALHA 8: membro comum não deveria nomear outro beneficiário';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'FORBIDDEN_BENEFICIARY%' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'OK 8: nomear outro beneficiário exige admin/conselho';
END $$;

ROLLBACK;
