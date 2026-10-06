## Why

Hoje, ao criar ou editar tarefas e demandas, o usuário define um valor sem saber claramente que esse valor será depositado na carteira de cada executor. Isso gera dúvidas e reduz a transparência sobre o destino dos recursos.

## What Changes

- Adicionar um aviso nos formulários de criação e edição de tarefas e de demandas informando: "O valor definido será depositado na carteira de cada um dos executores".

## Capabilities

### New Capabilities

### Modified Capabilities
- `gift-economy-tasks`: Exigir a exibição do aviso de depósito em carteira nos formulários de criação e edição de tarefas.
- `demand-multi-executors`: Exigir a exibição do aviso de depósito em carteira nos formulários de criação e edição de demandas.

## Impact

- Frontend: componentes de formulário de tarefas e demandas (criação e edição) precisarão exibir o aviso em destaque, próximo ao campo de valor.
- Sem alterações de banco de dados, APIs ou permissões.
