## Why

O formulário de cadastro de dádiva exibe as chaves de tradução em vez dos textos esperados:

- `common.title` aparece no label do campo título
- `common.description` aparece no label do campo descrição
- `common.publish` aparece no botão de publicar

Isso acontece porque:

1. `t('common.title')` retorna a string `'common.title'` (comportamento padrão do i18next quando a chave não existe)
2. O fallback `|| 'Título da Dádiva'` não funciona porque a string retornada por `t()` é truthy
3. As chaves `title`, `description` e `publish` não existem no namespace `common` dos arquivos de locale

## What Changes

- Adicionar `title`, `description` e `publish` ao namespace `common` em pt e en
- Remover fallbacks `|| '...'` nos labels, substituindo pelo defaultValue do i18next quando necessário

## Capabilities

### New Capabilities
_(none — fix only)_

### Modified Capabilities
- `gift-economy-area`: labels do formulário de criação de gifts traduzidos corretamente

## Impact

- `src/locales/pt/translation.json`: adicionar `common.title`, `common.description`, `common.publish`
- `src/locales/en/translation.json`: adicionar `common.title`, `common.description`, `common.publish`
- `src/pages/GiftsArea.tsx`: remover `||` fallbacks
