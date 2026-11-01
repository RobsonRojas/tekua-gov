## Context

Ver `proposal.md` — Why. Estado atual relevante:

- O enum `activity_status` foi criado em `20260409000004_implement_unified_activities.sql` com `('open', 'in_progress', 'pending_validation', 'completed', 'rejected')` e recebeu `pending_approval` depois, via `ALTER TYPE activity_status ADD VALUE IF NOT EXISTS 'pending_approval' BEFORE 'open'` (`20260501172959_transversal_council_enum.sql`). Hoje o tipo é `('pending_approval', 'open', 'in_progress', 'pending_validation', 'completed', 'rejected')`.
- A etapa de moderação foi removida em `20261016000000_remove_moderation_flow.sql`. Essa migração migrou as atividades que estavam em `pending_approval` (tarefas/demandas → `open`, contribuições → `pending_validation`), removeceu a RPC `moderate_activity`, deixou `submit_activity` gravando `pending_validation` e — deliberadamente — **mantive** o valor no enum, com o comentário de que ele é legado e não deve mais ser produzido. Este change executa a limpeza adiada.
- A aplicação (frontend `src/`, edge functions `supabase/functions/`) não referencia `pending_approval` em lugar nenhum: é um valor órfão, alcançável apenas por SQL direto.
- A única função viva que ainda compara o status contra `pending_approval` é `public.confirm_activity`, na versão definida em `20260902000000_update_payment_model_and_admin_wallet.sql`:
  `IF v_activity.status != 'pending_validation' AND v_activity.status != 'pending_approval' THEN RAISE EXCEPTION 'Activity is not pending validation or approval'; END IF;`
- `public.activities.status` é a única coluna do tipo `activity_status`. Não há índice, view, domínio ou função com `activity_status` na assinatura que dependam do tipo.
- Os triggers vivos em `public.activities` são: `tr_notify_on_activity_update` (AFTER UPDATE), `tr_audit_activities` (AFTER UPDATE, `WHEN (OLD.status IS DISTINCT FROM NEW.status)`), `tr_set_payout_lock` (BEFORE UPDATE), `tr_notify_activity_insert` (AFTER INSERT) e `tr_notify_activity_update` (AFTER UPDATE, `WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.worker_id IS DISTINCT FROM NEW.worker_id)`).
- As RLS policies vigentes em `public.activities` são: "Activities are viewable by everyone." (SELECT), "Users can create activities." (INSERT), "Users can update their own activities or activities they are working on." (UPDATE), "Activities update policy" (UPDATE) e "Executors in array can update activities" (UPDATE). Nenhuma delas referencia a coluna `status` — a única que já referenciou (`status != 'pending_approval'`) foi substituída por `USING (TRUE)` em `20261016000000`.

## Goals / Non-Goals

**Goals:**
- Remover `pending_approval` do tipo `activity_status`, deixando-o com exatamente `('open', 'in_progress', 'pending_validation', 'completed', 'rejected')` — a mesma ordem relativa dos valores válidos de hoje.
- Manter `public.activities.status` como coluna do tipo `activity_status` (não virar TEXT), preservando a ordenação e as comparações por status.
- Não deixar nenhuma atividade presa no valor removido e não quebrar as regras de acesso da tabela.
- Fechar a última referência viva ao valor legado (`confirm_activity`), que passaria a estourar em runtime depois da troca do tipo.

**Non-Goals:**
- Não alterar o fluxo funcional de criação/validação de atividades (coberto por `remove-moderation-column`).
- Não mexer nos enums `activity_type` e `validation_method`, nem em `audit_status` (que é TEXT).
- Não reescrever o histórico das migrações já aplicadas: o valor continua sendo adicionado em `20260501172959` e continua sendo referenciado pelos arquivos antigos, que são registro do que foi rodado.

## Decisions

**1. Trocar o tipo do enum em vez de recriar a tabela.**
- *Decisão:* `ALTER TYPE ... RENAME` → `CREATE TYPE` novo → `ALTER TABLE ... ALTER COLUMN status TYPE ... USING status::text::activity_status` → `DROP TYPE` do tipo antigo.
- *Alternativas:* (a) converter a coluna para TEXT e deixar assim — quebra a ordenação do enum (`ORDER BY status` passa a ser alfabético) e muda o contrato público da coluna; (b) editar `pg_enum` direto — não é suportado pelo Postgres e corrompe o cache do tipo; (c) recriar a tabela `activities` — desproporcional e destrutivo (FKs de `activity_evidence`, `activity_confirmations`, `activity_interactions`, `activity_attachments`, `activity_history`, `audit_logs`...).
- *Por quê:* é o caminho suportado pelo Postgres para "remover" um valor de enum, mantém o tipo e a coluna, e o round-trip por texto é seguro porque, antes da troca, garantimos que nenhuma linha usa o valor removido.

**2. Remover a checagem de `pending_approval` do `confirm_activity` antes da troca do tipo.**
- *Decisão:* recriar `public.confirm_activity` (mesma assinatura `p_activity_id UUID`, corpo idêntico ao de `20260902000000` exceto pela guarda de status) com a guarda become `IF v_activity.status != 'pending_validation' THEN`.
- *Alternativas:* deixar a guarda como está — o literal `'pending_approval'` deixaria de existir no tipo e a comparação passaria a levantar `invalid input value for enum activity_status: "pending_approval"` em tempo de execução, quebrando toda confirmação de atividade; (b) trocar por comparação textual (`v_activity.status::text != 'pending_approval'`) — a coluna deixa de ser do tipo enum e a checagem perde sentido.
- *Por quê:* a guarda nova é mais fiel à realidade pós-moderação: só existe um estado aguardando validação (`pending_validation`). A mensagem de erro também é ajustada ("not pending validation").

**3. Recriar o tipo com o mesmo *default* de coluna e a mesma ordenação.**
- *Decisão:* `DROP DEFAULT` → troca de tipo → `SET DEFAULT 'open'::activity_status`. O novo tipo é criado com a ordem `('open', 'in_progress', 'pending_validation', 'completed', 'rejected')`, que é a ordem relativa que o tipo tem hoje sem o valor legado (o `pending_approval` foi inserido `BEFORE 'open'` e portanto não altera a ordem relativa dos demais).
- *Por quê:* `ALTER COLUMN TYPE` tenta converter o default antigo; sem o `DROP DEFAULT` explícito a migração pode falhar com "default for column cannot be cast automatically to type". E a ordenação preservada mantém o comportamento de `ORDER BY status` e de qualquer ordenação por kanban.

**4. Preservar as RLS policies e os triggers de `public.activities` durante a troca do tipo.**
- *Decisão:* antes de trocar o tipo, capturar e remover (a) todas as policies de `public.activities` de `pg_policies` (nome, `permissive`, `roles`, `cmd`, `qual`, `with_check`) e (b) todos os triggers não-internos da tabela via `pg_get_triggerdef(tg.oid)`; depois da troca, recriá-los a partir das capturas.
- *Alternativas:* (a) confiar que nada referencia `status` e aceitar o `DROP TYPE` — qualquer policy ou trigger que referencie a coluna carrega dependência `AUTO` sobre o tipo e **seria removido silenciosamente** pelo `DROP TYPE`; (b) recriar à mão as policies e triggers conhecidos — frágil frente a drift entre o banco e o histórico de migrações; (c) manter o tipo antigo indefinidamente — o objetivo do change é justamente removê-lo.
- *Por quê:* RLS habilitado com zero policies significa tabela inacessível (fail-closed), e triggers perdidos silenciosamente quebram auditoria e notificações. Capturar/restaurar garante que o conjunto final é exatamente o mesmo de antes da troca, e que as expressões são reanalisadas contra o tipo novo.
- *Descoberta durante a implementação:* o Postgres **recusa** alterar o tipo de uma coluna usada por uma policy ou por um trigger:
  - `ERROR: cannot alter type of a column used in a policy definition`
  - `ERROR: cannot alter type of a column used in a trigger definition`
  Remover as policies e os triggers antes da troca não é apenas higiene — é **pré-requisito** do `ALTER COLUMN TYPE`. Os triggers de `public.activities` são exatamente os que têm `WHEN` sobre a coluna: `tr_audit_activities` (`WHEN (OLD.status IS DISTINCT FROM NEW.status)`) e `tr_notify_activity_update` (`WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.worker_id IS DISTINCT FROM NEW.worker_id)`). O `pg_get_triggerdef` devolve o `CREATE TRIGGER` completo e reexecutável, incluindo o `WHEN` e o estado `ENABLE`/`DISABLE`, então a recriação é fiel.

**5. Migração de dados defensiva antes da troca.**
- *Decisão:* `UPDATE` de `pending_approval` → `open` (tarefas/demandas) / `pending_validation` (contribuições), repetindo a regra de `20261016000000`. É um no-op em um banco já migrado, mas protege o caso de uma base onde a migração anterior não rodou ou rodou parcialmente.
- *Por quê:* a coluna não pode ser convertida para o tipo novo enquanto ainda houver linhas com o valor removido — o `USING status::text::activity_status` falharia com "invalid input value for enum".

**6. Verificação por script de SQL, não por teste de aplicação.**
- *Decisão:* incluir `supabase/tests/verify_pending_approval_removed.sql`, executável no SQL Editor do Supabase, que confirma: o range do enum, a ausência de linhas com o valor removido, a presença das policies e a rejeição de uma escrita com o valor removido (dentro de `BEGIN`/`ROLLBACK`).
- *Alternativas:* teste Vitest/E2E — não há ambiente de Postgres no CI deste projeto (`supabase/tests/` já segue esse padrão com `verify_reminders.sql`).
- *Por quê:* a mudança é 100% de banco; o teste automatizado de aplicação não exercita o enum.

**7. O delta de spec é aditivo e não conflita com `remove-moderation-column`.**
- *Decisão:* o delta deste change usa `## ADDED Requirements` com nomes de requirement novos ("Activity Status Has No Pending Approval Value" e "Activity Access Rules Survive The Status Type Change"), em vez de `MODIFIED` sobre os requirements que `remove-moderation-column` remove.
- *Por quê:* os dois changes mexem na capability `activity-moderation`, mas em requirements disjuntos. Verificado na prática: o arquivamento deste change funciona tanto antes quanto depois do arquivamento de `remove-moderation-column` (`openspec archive` emite apenas um aviso quando um `REMOVED` não encontra o alvo, tratá-lo como "já removido"). Com delta `MODIFIED`, a ordem passaria a importar e o `MODIFIED` perderia detalhe no archive.
- *Observação:* o arquivamento de `remove-moderation-column` falha hoje por um motivo alheio a este change (o delta `gift-economy-tasks` dele descarta dois scenarios que existem no spec principal). Isso não bloqueia este change e não foi corrigido aqui.

## Risks / Trade-offs

- **`DROP TYPE` falha por dependência inesperada** → a migração inteira é transacional (o CLI do Supabase aplica cada arquivo em uma transação), então falha sem deixar o banco pela metade. As dependências conhecidas (default da coluna, tipo da coluna, policies e triggers que referenciam a coluna) são tratadas explicitamente.
- **`ALTER COLUMN TYPE` falha se uma policy ou um trigger referenciar a coluna** → policies e triggers são capturados e removidos antes da troca e recriados depois; qualquer objeto novo que referencie `status` entre a captura e a restauração seria perdido (janela pequena, dentro da mesma migração).
- **Policy restaurada com semântica diferente** → a restauração usa a definição textual vinda de `pg_policies` (a mesma que o Postgres usa em `pg_get_expr`), reanalisada no momento do `CREATE POLICY`. O script de verificação confere a contagem e os nomes das policies antes/depois.
- **Regressão em `confirm_activity`** → a recriação mantém a assinatura e o corpo idêntico ao da versão vigente, exceto pela guarda de status. O diff foi conferido contra a função viva reconstruída a partir da cadeia real de migrações: a única diferença é a guarda (`AND v_activity.status != 'pending_approval'` removido) e a mensagem de erro.
- **Downtime** → `ALTER TABLE ... ALTER COLUMN TYPE` reescreve a tabela (`activities`) e recria os índices. Com o volume atual da base é aceitável; em bases grandes, avaliar `ALTER TYPE ... ADD VALUE` + redeploy, ou fazer a troca em janela de manutenção.
- **Rollback** → o tipo antigo só existe durante a migração; depois dela, o rollback exige recriar o enum com `pending_approval` (caminho inverso, sem dados a reverter, já que nenhuma linha usa o valor). O código da aplicação não precisa ser revertido: ele nunca usou o valor.

## Migration Plan

1. Aplicar a migração `supabase/migrations/20261021000000_remove_pending_approval_from_activity_status.sql`:
   migração de dados defensiva → recriação de `public.confirm_activity` → captura e remoção das policies e dos triggers → troca do tipo → recriação das policies e dos triggers → recriação do default.
2. Rodar `supabase/tests/verify_pending_approval_removed.sql` no SQL Editor para confirmar o estado final.
3. Nenhum deploy de frontend ou de edge function é necessário: a aplicação nunca produziu `pending_approval`.
4. **Rollback:** recriar o enum com o valor legado (mesmo caminho da migração, com `pending_approval` na lista) e restaurar a guarda anterior de `confirm_activity`. Nenhum dado precisa ser revertido.

## Open Questions

- Nenhuma.
