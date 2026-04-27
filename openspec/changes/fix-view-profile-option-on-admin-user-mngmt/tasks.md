## 1. Roteamento

- [x] 1.1 Atualizar `src/router.tsx` para aceitar um parâmetro opcional na rota de perfil: `path: 'profile/:id?'`.

## 2. Página de Perfil

- [x] 2.1 Modificar `src/pages/Profile.tsx` para extrair o `id` da URL usando `useParams`.
- [x] 2.2 Implementar lógica para buscar dados do perfil do `targetId` (se presente) usando `apiClient.invoke('api-members', 'fetchUser', { userId: targetId })`.
- [x] 2.3 Adicionar verificação de segurança: se o usuário não for admin e tentar ver o perfil de outro ID, redirecionar para `/profile`.
- [x] 2.4 Esconder botões de edição ("Editar Perfil", "Alterar Senha") quando estiver visualizando o perfil de outro usuário.

## 3. Painel Administrativo

- [x] 3.1 Em `src/pages/AdminPanel.tsx`, atualizar o menu de ações do usuário.
- [x] 3.2 Implementar navegação no item "Ver Perfil": `navigate(\`/profile/\${selectedUser.id}\`)`.

## 4. Verificação

- [x] 4.1 Acessar o Painel Admin como administrador.
- [x] 4.2 Clicar em "Ver Perfil" de um usuário da lista e confirmar o redirecionamento.
- [x] 4.3 Confirmar que os dados exibidos pertencem ao usuário selecionado.
- [x] 4.4 Tentar acessar um perfil de outro usuário com uma conta de "Membro" comum e confirmar o bloqueio/redirecionamento.
