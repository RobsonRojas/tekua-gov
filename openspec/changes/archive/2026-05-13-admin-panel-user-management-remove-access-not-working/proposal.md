## Why

O botão "Remove Access" no Painel Admin é fundamental para a gestão de segurança e membros da associação. Atualmente, o botão não está executando a ação de remoção conforme esperado. Além disso, a interface de confirmação apresenta uma falha visual onde o nome do usuário a ser removido não é exibido corretamente ("remove access for ?"), indicando um problema de sincronização de estado no componente frontend.

## What Changes

- Correção do estado `selectedUser` no `AdminPanel.tsx` para garantir que as informações do usuário estejam disponíveis no diálogo de confirmação.
- Verificação e ajuste da chamada à Edge Function `api-members` (ação `removeMember`) para garantir que o payload seja processado corretamente pelo backend.
- Melhoria no feedback visual: o diálogo de confirmação só deve fechar após o início ou conclusão da operação, e erros devem ser exibidos de forma clara para o administrador.
- Validação das constraints de banco de dados para garantir que a remoção em cascata (Auth -> Profiles -> Outras tabelas) esteja funcionando sem bloqueios.

## Capabilities

### Modified Capabilities
- `admin-user-management`: Correção do fluxo de remoção de acesso de membros para garantir integridade e funcionalidade.

## Impact

- `src/pages/AdminPanel.tsx`: Ajuste na lógica de gerenciamento de estado e handlers de remoção.
- `supabase/functions/api-members/index.ts`: (Se necessário) Ajuste no tratamento de erros da ação `removeMember`.
