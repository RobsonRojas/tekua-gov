## 1. Traduções

- [x] 1.1 Adicionar `work.searchColumnPlaceholder` ("Pesquisar...") em `src/locales/pt/translation.json`
- [x] 1.2 Adicionar `work.searchColumnPlaceholder` ("Search...") em `src/locales/en/translation.json`
- [x] 1.3 Em `src/components/work/KanbanColumn.tsx`, trocar `t('work.searchColumnPlaceholder') || 'Pesquisar...'` por `t('work.searchColumnPlaceholder', 'Pesquisar...')`

## 2. Validação

- [x] 2.1 Verificar que os dois JSON continuam válidos e que nenhuma outra chave `t('work.*')` usada em `src/components/work/` está ausente nos locales
- [x] 2.2 Executar `npm run build` e confirmar que passa sem erros
