## Why

Nas colunas do mural de trabalho, o campo de busca exibe o texto cru `work.searchColumnPlaceholder` em vez de um texto traduzido. A chave é usada em `KanbanColumn.tsx`, mas não existe nos arquivos de tradução `pt` e `en`. O fallback `|| 'Pesquisar...'` nunca age, porque o `t()` do i18next devolve a própria chave quando ela falta, e não um valor vazio.

## What Changes

- Adicionar a chave `work.searchColumnPlaceholder` em `src/locales/pt/translation.json` ("Pesquisar...") e em `src/locales/en/translation.json` ("Search...").
- Trocar o fallback inútil em `KanbanColumn.tsx` por um valor padrão passado ao `t()`, para que uma chave ausente no futuro não exiba o texto cru.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `i18n-interface`: todo texto de interface visível ao usuário passa a ter chave nos dois idiomas suportados.

## Impact

- `src/locales/pt/translation.json` e `src/locales/en/translation.json`: uma chave nova em cada.
- `src/components/work/KanbanColumn.tsx`: uma linha.
- Sem mudança de API, banco ou dependências.
