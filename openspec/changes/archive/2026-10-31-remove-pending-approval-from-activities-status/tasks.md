## 1. Banco de dados — migração do enum

- [x] 1.1 Criar `supabase/migrations/20261021000000_remove_pending_approval_from_activity_status.sql` com a migração de dados defensiva (`pending_approval` → `open` para `task`/`demand`, → `pending_validation` para `contribution`), idempotente.
- [x] 1.2 No mesmo arquivo, recriar `public.confirm_activity` (mesma assinatura `p_activity_id UUID`, corpo idêntico ao de `20260902000000_update_payment_model_and_admin_wallet.sql`) trocando a guarda `IF v_activity.status != 'pending_validation' AND v_activity.status != 'pending_approval'` por `IF v_activity.status != 'pending_validation'` e ajustando a mensagem de erro.
- [x] 1.3 No mesmo arquivo, capturar as RLS policies de `public.activities` de `pg_policies` (nome, `permissive`, `roles`, `cmd`, `qual`, `with_check`) em uma tabela temporária e removê-las, para que o `DROP TYPE` não as apague silenciosamente.
- [x] 1.4 No mesmo arquivo, capturar também os triggers não-internos de `public.activities` via `pg_get_triggerdef(tg.oid)` e removê-los — o `ALTER COLUMN TYPE` falha com `cannot alter type of a column used in a trigger definition` enquanto `tr_audit_activities` / `tr_notify_activity_update` tiverem `WHEN` sobre `status`.
- [x] 1.5 No mesmo arquivo, executar a troca do tipo: `ALTER TYPE public.activity_status RENAME TO activity_status_legacy` → `CREATE TYPE public.activity_status AS ENUM ('open','in_progress','pending_validation','completed','rejected')` → `ALTER TABLE public.activities ALTER COLUMN status DROP DEFAULT` → `ALTER COLUMN status TYPE public.activity_status USING status::text::public.activity_status` → `DROP TYPE public.activity_status_legacy` → `SET DEFAULT 'open'::public.activity_status`.
- [x] 1.6 No mesmo arquivo, recriar as policies capturadas em 1.3 e os triggers capturados em 1.4 a partir da captura (reanalisados contra o tipo novo) e descartar as tabelas temporárias.
- [x] 1.7 Conferir que a migração não deixa nenhuma referência viva a `pending_approval` no schema final: `grep -rn "pending_approval" supabase/migrations/` só pode acusar as migrações históricas (anteriores a esta) e o bloco de migração de dados dentro do novo arquivo.

## 2. Verificação em banco

- [x] 2.1 Criar `supabase/tests/verify_pending_approval_removed.sql` (executável no SQL Editor do Supabase, com `BEGIN`/`ROLLBACK`) conferindo: range do enum `activity_status`, ausência de linhas com o valor removido, presença das policies e dos triggers de `public.activities` e rejeição de uma escrita com `pending_approval`. Incluir uma checagem informativa que lista qualquer outro objeto que ainda referencie a coluna `status` (constraint, índice parcial, view).
- [x] 2.2 Validar a migração contra um Postgres 15 real (container Docker), aplicando-a duas vezes seguidas: a segunda execução é um no-op e o schema final permanece correto.
- [x] 2.3 Validar contra um Postgres 15 com o **schema real**, reconstruído aplicando a cadeia completa de `supabase/migrations/` (102 arquivos) num banco limpo: a migração aplica sem erro, as 5 policies e os 5 triggers reais de `public.activities` sobrevivem, e o script de verificação passa nas 10 checagens. Confirmar também o caminho inverso: o script de verificação **falha** em um banco com a cadeia aplicada sem esta migração, e passa depois de aplicá-la.

## 3. Documentação e consistência

- [x] 3.1 Confirmar que nenhuma linha de `src/`, `supabase/functions/` ou `tests/` referencia `pending_approval` (varredura por `grep -rn "pending_approval" src supabase/functions tests`).
- [x] 3.2 Atualizar o comentário de legado em `supabase/migrations/20261016000000_remove_moderation_flow.sql` para apontar que a remoção do valor foi feita em `20261021000000_remove_pending_approval_from_activity_status.sql` (o texto original dizia que o valor seria mantido para sempre).
- [x] 3.3 Rodar `openspec validate remove-pending-approval-from-activities-status --strict` e confirmar 0 issues.

## 4. Verificação executada

- [x] 4.1 Reproduzir em Postgres 15 o schema relevante (enums, `activities`, `activity_confirmations`, `profiles`, as 5 RLS policies vigentes + 1 policy extra que referencia `status`, e os 5 triggers reais de `public.activities`) e confirmar os dois erros do Postgres: `cannot alter type of a column used in a policy definition` e `cannot alter type of a column used in a trigger definition` (este é o erro reportado em produção).
- [x] 4.2 Após a migração, confirmar: range do enum = `open, in_progress, pending_validation, completed, rejected`; `activities.status` mantém o tipo `activity_status` e o default `'open'`; nenhuma linha com o valor removido; as 6 policies e os 5 triggers preservados (com os `WHEN` clauses reanalisados); escrita com o valor removido rejeitada; `confirm_activity` aceita `pending_validation` e rejeita `open` com "Activity is not pending validation"; ordenação por status continua sendo a do enum (não alfabética); os triggers restaurados continuam disparando em um `UPDATE`.
- [x] 4.3 Confirmar que `openspec archive remove-pending-approval-from-activities-status` funciona com o delta aditivo, antes ou depois do arquivamento de `remove-moderation-column`.
- [x] 4.4 Conferir por `diff` que o corpo de `public.confirm_activity` recriado pela migração é byte-idêntico ao que estava vivo, exceto pela guarda de status (`pending_approval` removida) e pela mensagem de erro; e que em runtime a função recusa `open` ("Activity is not pending validation") e aceita `pending_validation` (`{"success": true, "completed": true, "confirmations": 1}`).
