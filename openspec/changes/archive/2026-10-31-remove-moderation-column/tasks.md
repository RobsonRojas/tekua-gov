## 1. Banco de dados (migração)

- [x] 1.1 Criar migração que altera o default de `public.activities.status` para `'open'::activity_status`.
- [x] 1.2 Migrar os dados existentes: `tasks`/`demands` com `status = 'pending_approval'` → `'open'`; `contributions` com `status = 'pending_approval'` → `'pending_validation'`.
- [x] 1.3 Atualizar a policy de SELECT de `activities` para não ocultar mais `pending_approval` (manter ocultação de `rejected` para não-criadores/não-admins).
- [x] 1.4 Atualizar a RPC `submit_activity` para gravar `status = 'pending_validation'` (contribuições já executadas) mantendo os demais parâmetros existentes.
- [x] 1.5 Remover ou neutralizar a função `public.moderate_activity` (o fluxo de aprovação/rejeição deixa de existir).
- [x] 1.6 Manter o valor `pending_approval` no enum `activity_status` (não recriar o tipo) e registrar em comentário na migração que ele é legado.

## 2. Edge Function api-work

- [x] 2.1 Em `createActivity`, trocar `status: 'pending_approval'` por `status: 'open'`.
- [x] 2.2 Remover o caso `moderateActivity` do switch de `supabase/functions/api-work/index.ts`.
- [x] 2.3 Confirmar que `submitActivity` continua apenas chamando a RPC `submit_activity` (o status agora vem da RPC).

## 3. Frontend

- [x] 3.1 Remover a entrada `moderation` de `columnDefs` em `src/pages/WorkWall.tsx` e o campo `adminOnly` de `ColumnDef` se não houver mais uso.
- [x] 3.2 Remover o ramo `pending_approval` de `handleDropCard` e a variável `isCouncilOrAdmin` se ficar sem uso.
- [x] 3.3 Remover de `src/components/ActivityCard.tsx` os botões Aprovar/Rejeitar e a função `handleModeration`.
- [x] 3.4 Ajustar `src/pages/TaskDetail.tsx` para não tratar mais `pending_approval` (chip de status, condições de confirmação/edição).
- [x] 3.5 Remover as chaves `work.moderation`, `work.pending_approval` e `work.moderationSuccess` de `src/locales/pt/translation.json` e `src/locales/en/translation.json`.

## 4. Testes

- [x] 4.1 Reescrever `src/pages/WorkWallModeration.test.tsx` para garantir que a coluna "Moderação" NÃO é renderizada e que as colunas Open/Em Execução/Para Validar/Concluídas continuam presentes.
- [x] 4.2 Atualizar `tests/transversal-council.spec.ts` e `tests/beneficiary-confirmation.spec.ts`, removendo os mocks de `moderateActivity` e o cenário de aprovação.
- [x] 4.3 Varrer o repositório por usos remanescentes de `moderateActivity`/`work.moderation` e remover/ajustar.

## 5. Verificação

- [x] 5.1 Rodar a suíte de testes (`npm run test`) e o `npm run build`; corrigir regressões.
- [x] 5.2 Verificado por teste automatizado (`src/pages/WorkWallModeration.test.tsx`): tarefa e demanda com `status = 'open'` renderizam imediatamente na coluna "Open" (e em nenhuma outra), sem coluna Moderação. Inserção server-side (`createActivity` → `status: 'open'`) confirmada por revisão de código + build. _(Verificação E2E manual em ambiente com Supabase ativo permanece recomendada.)_
- [x] 5.3 Confirmado por teste automatizado (`src/pages/WorkWallModeration.test.tsx`): contribuição com `status = 'pending_validation'` cai em "Para Validar" e não em "Open"; a RPC `submit_activity` grava `pending_validation` (ver migração `20261016000000_remove_moderation_flow.sql`). _(Verificação E2E manual em ambiente com Supabase ativo permanece recomendada.)_
- [x] 5.4 Rodar `openspec validate remove-moderation-column` e confirmar 0 issues.

