## Why

No work wall, com muitas tarefas por coluna, fica difícil localizar um item específico. Não existe busca por nome dentro das colunas do quadro.

## What Changes

- Adicionar um campo de pesquisa em cada coluna do work wall, filtrando os itens daquela coluna pelo nome (título da tarefa/demanda).

## Capabilities

### New Capabilities

### Modified Capabilities
- `gift-economy-tasks`: Exigir campo de pesquisa por nome em cada coluna do work wall.

## Impact

- Frontend: `src/pages/WorkWall.tsx` — adicionar estado de busca por coluna e filtrar `getColumnActivities` pelo título.
- Sem alterações de backend/banco.
