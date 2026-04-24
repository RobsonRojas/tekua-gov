## 1. Infraestrutura e Segurança (Database)

- [ ] 1.1 Criar tabela `audit_logs` e configurar políticas de RLS (apenas leitura para admins).
- [ ] 1.2 Adicionar coluna `available_at` na tabela `activities` (ou tabela de transações correspondente).
- [ ] 1.3 Atualizar a lógica de cálculo de saldo no banco de dados para considerar apenas créditos com `available_at <= now()`.
- [ ] 1.4 Implementar trigger de auditoria para capturar mudanças críticas de balanço e status.

## 2. Reatividade e UX (Frontend)

- [ ] 2.1 Refatorar `AuthContext.tsx` para incluir uma subscrição em tempo real na tabela `profiles`.
- [ ] 2.2 Desenvolver componentes de `Skeleton` para `ActivityCard` e `TopicCard`.
- [ ] 2.3 Aplicar estados de loading com Skeletons no `WorkWall.tsx` e `Dashboard`.
- [ ] 2.4 Adicionar animações de entrada e transição (ex: Framer Motion) nas listas de atividades.

## 3. Inteligência Artificial (Edge Functions)

- [ ] 3.1 Criar Supabase Edge Function `ai-handler` com proxy para o modelo de linguagem e injeção de `system_prompt`.
- [ ] 3.2 Refatorar `AIAgent.tsx` para consumir a Edge Function em vez de chamadas diretas ou mocks.
- [ ] 3.3 Implementar filtros de segurança básicos na Edge Function para sanitizar a entrada do usuário.

## 4. Validação Final

- [ ] 4.1 Validar que o saldo atualiza instantaneamente ao ser alterado no banco.
- [ ] 4.2 Verificar se payouts de tarefas aparecem como "bloqueados" por 24h.
- [ ] 4.3 Testar a segurança da IA tentando burlar o prompt de sistema.
