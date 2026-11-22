## Why

`npm run lint` reporta 518 problemas (495 erros) e `npm run test` falha em 13 arquivos / 38 testes, já na linha de base. Isso esconde regressões reais e impede usar lint e testes como critério de conclusão (ex.: tarefa 2.3 de `fix-forum-topic-status-check`).

## What Changes

- Zerar os erros do `eslint .`: 457 `no-explicit-any`, 27 `no-unused-vars`, 17 `exhaustive-deps`, 6 `only-export-components`, 6 `prefer-const`, 4 `no-require-imports`, 1 `no-unsafe-function-type`. Concentrados em `src/` (110 arquivos), `supabase/` (24) e `tests/` (7).
- Corrigir os 13 arquivos de teste do Vitest que falham (ex.: `usePWA must be used within a PWAProvider`, mocks do supabase não chamados, `localStorage.clear` indefinido, testes de integração sem variáveis de ambiente).
- Decidir, por regra, entre corrigir o código ou ajustar a config do ESLint (ex.: escopo de `scratch/`, `scripts/` e testes). Sem mudança de comportamento do produto.
- Excluir `*.test.ts` do Deno em `supabase/functions` do Vitest, se aplicável.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

(nenhuma — refatoração/ferramental; `skip_specs: true`)

## Impact

- `src/**`, `tests/**`, `supabase/functions/**`, `eslint.config.js`, `vite.config.ts` (config de teste)
- Nenhuma mudança de API ou schema.
