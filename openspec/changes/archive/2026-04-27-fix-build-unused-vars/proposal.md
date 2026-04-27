## Why

O build da aplicação está falhando devido a erros do TypeScript (`TS6133`) relacionados a variáveis e importações declaradas mas nunca utilizadas. Esta mudança visa limpar o código para garantir que o processo de build (`npm run build`) seja concluído com sucesso.

## What Changes

- **Limpeza de Código**: Remover importações e variáveis não utilizadas nos componentes afetados.
- **Correção do Build**: Garantir que o comando `tsc -b && vite build` execute sem erros de "unused variables".

## Capabilities

### New Capabilities
- `technical-integrity`: Garantia de que o código segue as regras do linter e do compilador TypeScript, permitindo o build sem erros.

### Modified Capabilities
- None

## Impact

- `src/components/LanguageSelector.tsx`: Remoção do import `Box`.
- `src/components/Navigation/Sidebar.tsx`: Remoção do import `Languages` e da variável `i18n`.
