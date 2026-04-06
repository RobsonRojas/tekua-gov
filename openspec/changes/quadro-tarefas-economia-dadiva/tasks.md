## 1. Infraestrutura Financeira e de Tarefas

- [ ] 1.1 Criar migração SQL para tabelas: `tasks`, `task_submissions`, `user_wallets` e `surreal_transactions`.
- [ ] 1.2 Implementar funções para transferência de saldo em Surreais (RPC no Supabase).
- [ ] 1.3 Configurar bucket `task-evidence` para armazenamento de fotos de provas.

## 2. Quadro de Tarefas e Cadastro

- [ ] 2.1 Criar a página `src/pages/TasksBoard.tsx` (Lista de tarefas).
- [ ] 2.2 Desenvolver o formulário de cadastro de nova tarefa com geolocalização.
- [ ] 2.3 Implementar funcionalidade de assumir tarefa (In-progress).

## 3. Provas de Trabalho e Pagamento

- [ ] 3.1 Implementar campo de upload georreferenciado (anexar coordenadas à imagem no frontend).
- [ ] 3.2 Desenvolver tela de aprovação de prova para o requisitante.
- [ ] 3.3 Adicionar dashboard de carteira (Wallet) no perfil do usuário.
- [ ] 3.4 Adicionar traduções (i18n) para o ecossistema Surreal no `translation.json`.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
