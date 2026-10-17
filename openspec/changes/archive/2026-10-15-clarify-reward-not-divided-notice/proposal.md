## Why

Nos formulários de cadastro e edição de tarefas e demandas, o aviso atual ("O valor definido será depositado na carteira de cada um dos executores") não deixa explícito que o valor **não é dividido** entre os executores — cada um recebe o valor integral. Isso gera dúvidas sobre o destino e a distribuição dos recursos. Além disso, o spec `multi-executor-tasks` ainda descreve o comportamento antigo (divisão do valor), contradizendo tanto o código atual (`full_reward_multiple_executors`) quanto o spec `gift-economy-tasks`.

## What Changes

- Atualizar o aviso nos formulários de criação e edição de tarefas e de demandas para acrescentar que **o valor não é dividido entre os executores e que cada executor recebe o valor integral**: manter "O valor definido será depositado na carteira de cada um dos executores" e adicionar "Este valor não é dividido entre os executores; cada um recebe o valor integral."
- Reconciliar o spec `multi-executor-tasks` para refletir o comportamento real já implementado: o valor total da recompensa é creditado integralmente na carteira de cada executor, sem divisão.

## Capabilities

### New Capabilities

### Modified Capabilities
- `gift-economy-tasks`: exigir que o aviso nos formulários de criação e edição de tarefas deixe explícito que o valor não é dividido entre os executores (cada um recebe o valor integral).
- `demand-multi-executors`: exigir o mesmo aviso, com a mesma clareza de não divisão, nos formulários de criação e edição de demandas.
- `multi-executor-tasks`: corrigir o requisito de distribuição de recompensas para múltiplos executores, que hoje descreve divisão do valor, passando a exigir o crédito do valor total (integral) a cada executor.

## Impact

- Frontend: `src/pages/CreateTask.tsx`, `src/pages/CreateDemand.tsx` e `src/pages/TaskDetail.tsx` (fluxo de criação/edição de tarefas e demandas) terão o texto do aviso atualizado.
- Specs: delta em `multi-executor-tasks` reconcilia o requisito de distribuição com o comportamento já implementado; nenhuma mudança de banco de dados, API ou permissões.
- Sem impacto na lógica de pagamento existente (já credita o valor integral por executor).
