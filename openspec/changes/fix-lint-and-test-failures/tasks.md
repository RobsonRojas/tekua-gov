## 1. Testes (Vitest)

- [ ] 1.1 Corrigir `usePWA must be used within a PWAProvider` (envolver com provider ou mock nos testes afetados)
- [ ] 1.2 Corrigir testes com mocks do supabase não chamados (`AuthContext`, `usePushNotifications`, `TasksBoard`, `SecurityTab`)
- [ ] 1.3 Corrigir `localStorage.clear` indefinido e demais falhas de ambiente (`ThemeContext` etc.)
- [ ] 1.4 Corrigir `Home`, `Profile`, `ProtectedRoute`, `TopicDetail`, `useMembers`, `useAdminActivity`, `api`
- [ ] 1.5 Fazer `admin-integration` pular quando faltarem variáveis de ambiente
- [ ] 1.6 Rodar `npm run test` 3 vezes seguidas sem falhas (sem flakiness)

## 2. Lint (ESLint)

- [ ] 2.1 Revisar `eslint.config.js`: ignorar `scratch/`, `dist/` e scripts avulsos que não são código de produto
- [ ] 2.2 Corrigir `no-unused-vars`, `prefer-const`, `no-require-imports`, `no-unsafe-function-type`
- [ ] 2.3 Corrigir `react-hooks/exhaustive-deps` e `react-refresh/only-export-components`
- [ ] 2.4 Substituir `no-explicit-any` em `src/` (por diretório)
- [ ] 2.5 Substituir `no-explicit-any` em `supabase/` e `tests/`
- [ ] 2.6 `npm run lint` com zero erros

## 3. Verificação final

- [ ] 3.1 `npm run build` passa (`tsc -b && vite build`)
- [ ] 3.2 `npm run test` e `npm run lint` verdes
