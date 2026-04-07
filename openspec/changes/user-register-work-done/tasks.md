## 1. Banco de Dados e Segurança (Supabase)

- [ ] 1.1 Criar migração para a tabela `contributions` (incluindo status enum e RLS).
- [ ] 1.2 Criar migração para a tabela `contribution_confirmations` com restrição de unicidade (user_id, contribution_id).
- [ ] 1.3 Criar migração para a tabela `governance_settings` e inserir o valor padrão de `min_confirmations`.
- [ ] 1.4 Implementar função RPC `submit_contribution` com validação básica de campos obrigatórios.
- [ ] 1.5 Implementar função RPC `confirm_contribution` que inclui a lógica de contagem de votos e gatilho de pagamento automático (reutilizando `admin_mint_currency` internamente).

## 2. Interface de Registro e Mural (Frontend)

- [ ] 2.1 Desenvolver a página de formulário `src/pages/RegisterWork.tsx` com upload de evidências.
- [ ] 2.2 Criar o componente `ContributionCard` para exibição detalhada de tarefas no mural.
- [ ] 2.3 Implementar a página de "Mural de Trabalho" `src/pages/WorkWall.tsx` para visualização e confirmação social.
- [ ] 2.4 Adicionar navegação para as novas páginas no menu principal/Sidebar.

## 3. Gestão e Configuração (Admin)

- [ ] 3.1 Adicionar seção de "Configurações de Governança" no painel administrativo para ajuste do threshold.
- [ ] 3.2 Implementar visualização de log de auditoria para pagamentos automáticos realizados.

## 4. Testes e Validação

- [ ] 4.1 Implementar testes unitários para a lógica de transição de status da contribuição (Vitest).
- [ ] 4.2 Criar testes E2E (Playwright) cobrindo o fluxo: Registro -> Confirmações -> Pagamento Automático -> Saldo Atualizado.
- [ ] 4.3 Validar políticas de RLS para impedir que usuários modifiquem status de tarefas alheias manualmente.
