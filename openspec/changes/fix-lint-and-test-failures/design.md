## Context

Baseline medida em 2026-11-21: eslint 518 problemas; vitest 13 arquivos falhando (`admin-integration`, `ProtectedRoute`, `AuthContext`, `ThemeContext`, `useAdminActivity`, `useMembers`, `usePushNotifications`, `api`, `SecurityTab`, `Home`, `Profile`, `TasksBoard`, `TopicDetail`). O número de falhas oscila entre execuções, o que indica testes instáveis (ordem, estado global, timers).

## Decisions

- **Testes primeiro, lint depois**, em PRs/commits separados por área, para não misturar correção de comportamento com tipagem.
- **`no-explicit-any`:** trocar por tipos reais ou `unknown` com narrowing onde barato; em mocks de teste e payloads de edge functions, tipos mínimos locais. Se um diretório for lixo (`scratch/`, scripts avulsos), ignorá-lo no ESLint em vez de tipá-lo.
- **Testes instáveis:** isolar estado (`localStorage`, providers, mocks resetados em `beforeEach`) em vez de aumentar timeouts.
- **Testes de integração** que exigem env: pular explicitamente quando as variáveis faltarem, em vez de falhar.
- Sem `eslint-disable` em massa; qualquer supressão deve ser pontual e justificada.

## Risks

- Tipar `any` pode revelar bugs reais; corrigi-los é aceitável, mas deve ser registrado no commit.
- Diff grande: dividir por diretório.
