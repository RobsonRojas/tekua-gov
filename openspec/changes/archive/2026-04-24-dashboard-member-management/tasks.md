## 1. Navegação e Permissões do Dashboard

- [x] 1.1 Ativar o redirecionamento do botão "Acessar" no card de Membros do `src/pages/Home.tsx`.
- [x] 1.2 Implementar condicional no `Home.tsx` para exibir botão somente para `role === 'admin'`.
- [x] 1.3 Adicionar a nova rota em `src/router.tsx` protegida por `ProtectedRoute adminOnly`.

## 2. Construção da Interface de Gestão

- [x] 2.1 Criar a página `src/pages/MemberManagement.tsx`.
- [x] 2.2 Implementar tabela de listagem de usuários com dados de perfil.
- [x] 2.3 Adicionar busca por nome/email e filtros por Role.

## 3. Lógica de Gestão e Feedback

- [x] 3.1 Implementar modal de edição de perfil e papel do membro.
- [x] 3.2 Criar função para atualizar a role no Supabase (`profiles` table).
- [x] 3.3 Adicionar traduções (i18n) e alertas de sucesso após atualização.

## 4. Testes e Validação

- [x] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
