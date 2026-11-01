## Why

Quando o solicitante de uma tarefa ou demanda também é um dos executores, o botão **Confirmar Tarefa** não habilita na tela de detalhe, mesmo com o método de validação `requester_approval` e o solicitante sendo o beneficiário indicado. A spec `community-validation` diz que, nesse método, o beneficiário indicado pode confirmar o trabalho. O bloqueio acontece em duas camadas:

- **Frontend** (`src/pages/TaskDetail.tsx`): o botão está com `disabled` quando `isWorker` é verdadeiro, e `isWorker` vale também para quem está em `executor_ids`, sem considerar se o usuário é o solicitante.
- **Banco** (RPC `confirm_activity`, migração `20261021000000_remove_pending_approval_from_activity_status.sql`): a função rejeita com "You cannot confirm your own work" qualquer usuário em `worker_id` ou `executor_ids`, antes de verificar o método de validação. Mesmo que o botão fosse habilitado, a confirmação falharia.

A regra de não se autoconfirmar é correta para o caso geral (executor não aprova o próprio trabalho), mas não deve impedir o solicitante de aprovar quando ele é também o executor.

## What Changes

- A RPC `confirm_activity` deixa de bloquear o usuário que é o solicitante da atividade. A proibição de autoconfirmação continua valendo para os executores que não são solicitantes e para o método `community_consensus`. A exceção para administradores vale apenas em `requester_approval`, como prevê a spec.
- A tela de detalhe (`TaskDetail.tsx`) passa a habilitar o botão de confirmação para o solicitante mesmo quando ele também é executor, mantendo desabilitado para executores que não são solicitantes e para atividades já confirmadas pelo usuário.
- A regra passa a ser explícita na spec `community-validation` (requisito de validação social), com cenário para o solicitante-executor.
- Migração nova que substitui a função `confirm_activity` com a correção, preservando o restante do comportamento (contagem de confirmações, pagamento aos executores, mensagens de erro).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `community-validation`: o requisito de validação social passa a deixar explícito que, em `requester_approval`, o beneficiário indicado pode confirmar mesmo quando também é executor da atividade. Executores que não são o solicitante continuam impedidos de confirmar o próprio trabalho.

## Impact

- **Banco de dados**: nova migração com `CREATE OR REPLACE FUNCTION public.confirm_activity`. Precisa ser aplicada no projeto Supabase de produção (`rhpcenqbelifilylwujy`).
- **Frontend**: `src/pages/TaskDetail.tsx` (condição de `disabled` do botão de confirmação). Afeta tarefas e demandas, pois ambas usam a mesma tela.
- **Testes**: testes de `TaskDetail` e, se existirem, de regras da RPC.
- **Sem impacto em**: pagamentos (fluxo de `execute_currency_transfer` inalterado), método `community_consensus`, fluxo de submissão de evidências e a confirmação forçada por administrador.
