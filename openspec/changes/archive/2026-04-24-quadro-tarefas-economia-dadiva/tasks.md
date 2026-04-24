## 1. Infraestrutura Financeira e de Tarefas

- [x] 1.1 Criar migração SQL para tabelas: `tasks`, `task_submissions`, `user_wallets` e `surreal_transactions`.
- [x] 1.2 Implementar funções para transferência de saldo em Surreais (RPC no Supabase).
- [x] 1.3 Configurar bucket `task-evidence` para armazenamento de fotos de provas.

## 2. Quadro de Tarefas e Cadastro

- [x] 2.1 Criar a página `src/pages/TasksBoard.tsx` (Lista de tarefas).
- [x] 2.2 Desenvolver o formulário de cadastro de nova tarefa com geolocalização.
- [x] 2.3 Implementar funcionalidade de assumir tarefa (In-progress).

## 3. Provas de Trabalho e Pagamento

- [x] 3.1 Implementar campo de upload georreferenciado (anexar coordenadas à imagem no frontend).
- [x] 3.2 Desenvolver tela de aprovação de prova para o requisitante.
- [x] 3.3 Adicionar dashboard de carteira (Wallet) no perfil do usuário.
- [x] 3.4 Adicionar traduções (i18n) para o ecossistema Surreal no `translation.json`.

## 4. Testes e Validação Final

- [x] 4.1 Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] 4.2 Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] 4.3 Validar o build final e a conformidade com as especificações.
