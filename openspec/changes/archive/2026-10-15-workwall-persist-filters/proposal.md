## Why

No work wall, os filtros escolhidos pelo usuário são perdidos a cada recarga da página, e não há indicação visual clara de que filtros estão ativos. Isso causa retrabalho e confusão sobre quais itens estão sendo exibidos.

## What Changes

- Persistir os filtros aplicados no work wall no `localStorage`.
- Ao carregar o work wall, aplicar automaticamente os filtros persistidos.
- Evidenciar visualmente na UI que existem filtros aplicados (ex.: badge/contador no botão de filtros ou indicação no painel de filtros/lista).

## Capabilities

### New Capabilities

### Modified Capabilities
- `work-wall-responsive-navigation`: Adicionar persistência dos filtros e indicação visual de filtros ativos.

## Impact

- Frontend: `src/pages/WorkWall.tsx` (estado `filters`, sincronização com localStorage) e possivelmente `src/components/WorkFilters.tsx` (indicação de filtros ativos).
- Sem alterações de backend/banco.
