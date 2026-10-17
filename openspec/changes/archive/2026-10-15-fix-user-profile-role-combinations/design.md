## Context

A plataforma utiliza componentes como `AdminPanel` e `MemberEditModal` para gerenciar perfis de usuários. Atualmente, o frontend do `AdminPanel.tsx` no menu rápido e partes da lógica da UI (e possivelmente do backend em Edge Functions / Supabase) limitam ou forçam a seleção de um único papel de base (ex: ciclando entre 'member', 'transversal_council', 'admin'), sobrescrevendo papéis anteriores. Isso viola a proposta de que um usuário possa deter múltiplos papéis de base simultaneamente (veja proposal.md para motivação).

## Goals / Non-Goals

**Goals:**
- Ajustar a API e banco de dados (Edge Functions como `api-members` e RPCs/tabelas no Supabase) para garantir que aceitem e persistam múltiplas roles (`roles: text[]`) sem restrições de exclusividade mútua entre perfis básicos.
- Atualizar a interface do `AdminPanel.tsx` e `MemberEditModal.tsx` para que seja possível adicionar/remover o papel de 'Conselho Transversal', 'Membro' e 'Admin' de forma aditiva/subtrativa, sem que a seleção de um remova automaticamente os outros.

**Non-Goals:**
- Mudar a arquitetura geral de autenticação ou RLS da plataforma (isso já deve estar coberto pelas especificações originais de `multi-profile-management`).
- Criar novos tipos de papéis.

## Decisions

- **Remoção de ciclo de papel único:** O método `handleToggleRole` no `AdminPanel.tsx` cicla em um array limitando o usuário a apenas 1 desses três papéis. Substituiremos esse atalho por opções de menu independentes de toggle (ex: "Adicionar/Remover Admin", "Adicionar/Remover Conselho Transversal") ou dependeremos integralmente do `MemberEditModal` para edição de `roles`.
- **`MemberEditModal.tsx` Sync:** As roles são sincronizadas através de switches (`isTransversalCouncil`, etc.). O estado deve preencher corretamente a requisição com todas as roles ativas, sem filtrar agressivamente outras roles.
- **Backend Role Check:** Garantir que o backend (ex: Edge Functions) que processa a edição de perfil suporte a fusão das escolhas no array `roles`, removendo eventuais lógicas `setRole` que usam strings fixas no lugar do array.

## Risks / Trade-offs

- **Risk**: Verificações de permissão em algumas partes do frontend ou policies RLS do banco de dados ainda dependem de verificar uma suposta coluna single-string `role` (ex: `user.role === 'admin'`) ao invés do array `roles` (`user.roles.includes('admin')`).
  - *Mitigação*: Será necessário verificar nas tarefas se ainda existem referências problemáticas a `selectedUser?.role` ao invés de `selectedUser?.roles` e corrigi-las.
