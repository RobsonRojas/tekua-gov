## 1. Aviso nos Formulários

- [x] 1.1 Em `src/pages/CreateTask.tsx`, atualizar o texto do `Alert` próximo ao campo de valor (`rewardAmount`) para: "O valor definido será depositado na carteira de cada um dos executores. Este valor não é dividido entre os executores; cada um recebe o valor integral."
- [x] 1.2 Em `src/pages/CreateDemand.tsx`, atualizar o texto do `Alert` próximo ao campo de valor (`amount`) com a mesma mensagem.
- [x] 1.3 Em `src/pages/TaskDetail.tsx` (fluxo de edição de tarefas e demandas), atualizar o texto do `Alert` próximo ao campo de valor (`editAmount`) com a mesma mensagem.
- [x] 1.4 Verificar que o aviso aparece na criação e na edição, tanto de tarefas quanto de demandas.

## 2. Reconciliação das Specs

- [x] 2.1 Confirmar que o código de pagamento (`supabase/migrations/20260630000000_full_reward_multiple_executors.sql`, função `confirm_activity`) credita o valor total por executor, sem divisão, alinhado ao delta de `multi-executor-tasks`.
- [x] 2.2 Antes de arquivar esta mudança, arquivar a mudança pendente `add-wallet-deposit-notice` para evitar requisito duplicado de aviso de depósito.

## 3. Validação

- [x] 3.1 Executar `npm run typecheck` e `npm run build` para garantir que nada quebrou.
- [x] 3.2 Executar `openspec validate clarify-reward-not-divided-notice --strict`.
- [x] 3.3 Verificar manualmente o texto do aviso nos formulários de criação e edição de tarefas e demandas.
