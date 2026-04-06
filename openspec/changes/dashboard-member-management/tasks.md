## 1. Navegação e Permissões do Dashboard

- [ ] 1.1 Ativar o redirecionamento do botão "Acessar" no card de Membros do `src/pages/Home.tsx`.
- [ ] 1.2 Implementar condicional no `Home.tsx` para exibir botão somente para `role === 'admin'`.
- [ ] 1.3 Adicionar a nova rota em `src/router.tsx` protegida por `ProtectedRoute adminOnly`.

## 2. Construção da Interface de Gestão

- [ ] 2.1 Criar a página `src/pages/MemberManagement.tsx`.
- [ ] 2.2 Implementar tabela de listagem de usuários com dados de perfil.
- [ ] 2.3 Adicionar busca por nome/email e filtros por Role.

## 3. Lógica de Gestão e Feedback

- [ ] 3.1 Implementar modal de edição de perfil e papel do membro.
- [ ] 3.2 Criar função para atualizar a role no Supabase (`profiles` table).
- [ ] 3.3 Adicionar traduções (i18n) e alertas de sucesso após atualização.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
