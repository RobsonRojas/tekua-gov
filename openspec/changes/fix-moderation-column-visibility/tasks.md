## 1. Frontend - Alteração da Visibilidade da Coluna

- [x] 1.1 Em `src/pages/WorkWall.tsx`, remover a verificação `isCouncilOrAdmin ?` que encapsula a definição da coluna `moderation` no array `columnDefs`, garantindo que a coluna seja exibida para todos os membros (e manter a prop `adminOnly` ou a checagem no `ActivityCard` para proteger a aprovação).

## 2. Backend - Ajuste do Filtro de Leitura

- [x] 2.1 Em `supabase/functions/api-work/index.ts`, remover a linha `query = query.or('status.neq.pending_approval,requester_id.eq.${user.id}')` ou ajustá-la para que as tarefas com status `pending_approval` retornem no GET para todos os usuários (para popular a coluna de moderação), mantendo a ocultação das tarefas com status `rejected`.

## 3. Validação

- [x] 3.1 Executar os comandos de validação (`npm run typecheck` e `npm run build`) para garantir que as mudanças foram aplicadas corretamente sem quebrar o build.
