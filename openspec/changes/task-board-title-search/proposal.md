## Why

No quadro de tarefas nem sempre fica claro o título de cada tarefa e não existe campo de pesquisa, apenas filtros. Isso dificulta localizar rapidamente uma tarefa específica.

## What Changes

- Exibir o título da tarefa nos cards do quadro de tarefas.
- Adicionar um campo de pesquisa (texto) no quadro de tarefas para filtrar tarefas pelo título/conteúdo, além dos filtros existentes.

## Capabilities

### New Capabilities

### Modified Capabilities
- `gift-economy-tasks`: Exigir exibição do título nas tarefas do quadro e incluir um campo de pesquisa no quadro de tarefas.

## Impact

- Frontend: `src/pages/TasksBoard.tsx` (e/ou componentes de card de tarefa) — renderizar título no card e adicionar campo de busca que filtra a lista.
- Sem alterações de backend/banco.
