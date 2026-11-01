## Context

Ver `proposal.md` — Why. Estado atual relevante:

- `src/pages/WorkWall.tsx` define as colunas em `columnDefs` (linhas ~138-180); a primeira é `moderation` (`statuses: ['pending_approval']`, `adminOnly: true`). `handleDropCard` (linhas ~188-232) trata a transição `pending_approval → open/completed` chamando `api-work` `moderateActivity`, restrita a `isCouncilOrAdmin`.
- `src/components/ActivityCard.tsx` mostra os botões Aprovar/Rejeitar quando `status === 'pending_approval'` e o usuário é `admin`/`transversal_council`, chamando `moderateActivity`.
- `api-work` `createActivity` (linhas ~208-227) insere todo novo `task`/`demand` com `status: 'pending_approval'`. `submitActivity` (linhas ~350-392) chama a RPC `submit_activity`, que cria `contribution` com `status: 'pending_approval'`.
- Migração `20260501173000_transversal_council_approval.sql` define o default de `activities.status` como `'pending_approval'`, a policy RLS que oculta `pending_approval` de não-criadores/não-moderadores, e a RPC `moderate_activity` (approve: `task/demand → open`, `contribution → pending_validation`; reject: `→ rejected`).
- O enum `activity_status` contém `pending_approval` (adicionado em `20260501172959_transversal_council_enum.sql`).
- Contribuições de trabalho já concluídas (RegisterWork) usam `submit_activity`; o estado "pós-moderação" natural delas é `pending_validation`, não `open`.

## Goals / Non-Goals

**Goals:**
- Eliminar a coluna Moderação e todo o fluxo de aprovação/rejeição por Conselho Transversal no Mural.
- Fazer novas tarefas e demandas nascerem `open` e visíveis a todos imediatamente.
- Preservar as contribuições de trabalho já executado, encaminhando-as direto para validação (sem passar por `open`).
- Não deixar nenhuma atividade "presa" em `pending_approval`.

**Non-Goals:**
- Remover a role `transversal_council` ou outras funções de governança que não sejam moderação do Mural.
- Remover a remoção/arquivamento administrativo de atividades (mecanismo separado de `rejected`/arquivo).
- Redesenhar as colunas restantes (`open`, `in_progress`, `pending_validation`, `completed`).

## Decisions

**1. Status inicial na criação: `open` para tarefas/demandas, `pending_validation` para contribuições.**
- *Decisão:* `createActivity` passa a inserir `status: 'open'`. A RPC `submit_activity` (contribuições) passa a inserir `'pending_validation'`, que era o estado resultante da aprovação de uma contribuição.
- *Alternativas:* colocar tudo em `open` (contribuições já são trabalho executado; `open` as ofereceria para "assumir tarefa", o que está errado); criar uma coluna "Open" que misture contribuições pendentes de validação (quebra o significado das colunas).
- *Por quê:* preserva o significado de cada coluna e a regra existente de que contribuições vão para validação.

**2. Remover a coluna `moderation` do `columnDefs`.**
- *Decisão:* apagar a entrada `moderation` de `src/pages/WorkWall.tsx` e o ramo `pending_approval` de `handleDropCard`; remover o campo `adminOnly` de `ColumnDef` se ficar sem uso. Remover os botões Aprovar/Rejeitar de `ActivityCard`.
- *Alternativas:* manter a coluna oculta por role (`adminOnly`) — deixaria código morto e o status sem fluxo de saída.
- *Por quê:* a etapa deixa de existir; o frontend não deve renderizar nem permitir transições para/desde um estado não usado.

**3. Default do banco volta para `'open'`.**
- *Decisão:* nova migração faz `ALTER TABLE activities ALTER COLUMN status SET DEFAULT 'open'`.
- *Por quê:* garante que qualquer inserção fora do `api-work` (RPCs/rotinas) não recrie o estado de moderação.

**4. Migração de dados das atividades existentes em `pending_approval`.**
- *Decisão:* `UPDATE activities SET status = 'open' WHERE status = 'pending_approval' AND type IN ('task','demand')`; `UPDATE activities SET status = 'pending_validation' WHERE status = 'pending_approval' AND type = 'contribution'`. Manter quem já está `rejected`.
- *Por quê:* nenhuma atividade fica presa num estado sem coluna; cada tipo vai para o estágio que teria após aprovação hoje.

**5. Manter o valor `pending_approval` no enum `activity_status`.**
- *Decisão:* não remover o valor do enum Postgres; apenas parar de produzi-lo (default, RPCs, função). 
- *Alternativas:* recriar o tipo `activity_status` sem o valor, convertendo colunas/constraints dependentes — migração arriscada e com downtime no Postgres.
- *Por quê:* remover valor de enum exige recriar o tipo e todos os usos; o ganho não compensa o risco. O estado deixa de ser alcançável pelas rotas da aplicação.

**6. Ajustar a RLS para não ocultar mais `pending_approval`.**
- *Decisão:* a policy de SELECT de `activities` deixa de ter a cláusula `status != 'pending_approval' OR ...`; passa a ocultar apenas `rejected` (comportamento de mural). A função `is_transversal_council_or_admin()` pode permanecer para outras policies de UPDATE, se ainda usada.
- *Por quê:* se o estado não é produzido, a cláusula só esconderia dados legados; a visibilidade pública deve voltar a valer para `open`.

**7. Remover a ação `moderateActivity` e a RPC `moderate_activity`.**
- *Decisão:* remover o caso `moderateActivity` de `api-work` e substituir/derrubar a função `public.moderate_activity` numa migração. Atualizar os mocks/E2E que a usavam.
- *Alternativas:* manter a RPC como no-op — confuso e permite transições para `pending_approval` inexistente na UI.
- *Por quê:* elimina a superfície do fluxo removido.

**8. i18n e testes.**
- *Decisão:* remover as chaves `work.moderation`, `work.pending_approval` e `work.moderationSuccess` dos locales; manter `work.invalidTransition`. Substituir `WorkWallModeration.test.tsx` por um teste que garanta a ausência da coluna Moderação e a presença das demais, e ajustar os E2E (`tests/transversal-council.spec.ts`, `tests/beneficiary-confirmation.spec.ts`) que mockam `moderateActivity`.
- *Por quê:* impede que a suíte continue afirmando um comportamento removido.

## Risks / Trade-offs

- **Atividades presas em `pending_approval`** → migração de dados as move para `open`/`pending_validation`; rodar a migração antes do deploy do frontend.
- **Integrações que ainda chamam `moderateActivity`** → a ação deixa de existir; se houver consumidor externo, ele passará a receber erro. Verificar antes do deploy (nenhum consumidor além do frontend/ testes foi encontrado).
- **Enum com valor órfão (`pending_approval`)** → inofensivo, mas pode reaparecer se alguma rotina antiga inserir o valor; o novo default + remoção das RPCs mitiga.
- **Contribuições mudarem de destino** (`pending_validation` em vez de `open`) → comportamento intencional; validar com o fluxo de `RegisterWork` e com a validação social.
- **Testes E2E e snapshots quebrados** → atualizar no mesmo PR da remoção.

## Migration Plan

1. Aplicar migração: default `status = 'open'`, UPDATE das atividades `pending_approval`, policy de SELECT sem a cláusula de pending, `submit_activity` gravando `pending_validation`, remoção/neutralização de `moderate_activity`.
2. Deploy da Edge Function `api-work` (`createActivity` com `status: 'open'`; remoção do caso `moderateActivity`).
3. Deploy do frontend (coluna/card/locales/testes).
4. **Rollback:** reverter o deploy do frontend e da função; como os dados migrados viraram `open`/`pending_validation`, uma reversão completa exigiria re-marcar as atividades afetadas — aceitável porque `open` é um estado válido e não destrutivo.
