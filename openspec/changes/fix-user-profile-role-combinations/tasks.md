## 1. Backend e API

- [x] 1.1 Inspecionar a Edge Function `api-members` (especialmente `manageAdmin` / `update_member`) e garantir que receba um array `roles` ao invés de uma string única `role`, suportando combinações como 'member' e 'transversal_council'.
- [x] 1.2 Atualizar as chamadas a funções RPC de edição de membro (`update_member_roles` ou similares) no banco de dados Supabase para garantir que não subscrevam o array ou não filtrem combinações arbitrárias de 'member', 'admin' e 'transversal_council'.

## 2. Frontend - AdminPanel

- [x] 2.1 Modificar o menu "Tornar Membro/Conselho/Admin" em `src/pages/AdminPanel.tsx` para remover o comportamento de toggle que cicla e substitui a role atual por uma única string nova. 
- [x] 2.2 Transformar a ação rápida em opções individuais (ex: "Adicionar/Remover Conselho", "Adicionar/Remover Admin") que concatenam a nova role no array `roles` do usuário, OU redirecionar totalmente para a edição do `MemberEditModal`.

## 3. Frontend - MemberEditModal

- [x] 3.1 Revisar a lógica de salvamento de roles em `src/components/admin/MemberEditModal.tsx` (`finalRoles`). Certificar que alternar `isTransversalCouncil` não afeta se o usuário possui a role 'member' ou 'admin', combinando-as corretamente no array que é enviado para a API.
- [x] 3.2 Corrigir o formulário de edição para refletir de maneira clara (checkboxes ou switches) que múltiplos papéis de base podem estar ativos simultaneamente para o mesmo usuário.

## 4. Auditoria de Permissões

- [x] 4.1 Auditar no frontend ocorrências pontuais que possam checar `.role === 'admin'` ou similar assumindo exclusividade, e migrá-las para uma lógica baseada no array `.roles.includes('admin')`.
- [x] 4.2 Rodar build local (ex: `npm run build` e `npm run typecheck`) para confirmar a validação obrigatória conforme regras do workspace.
