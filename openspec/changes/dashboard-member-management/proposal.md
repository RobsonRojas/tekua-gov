## Why

O dashboard principal do portal Tekuá possui um card para "Membros", mas o botão de acesso está inativo (placeholder). Para que a Associação possa gerenciar adequadamente sua comunidade, é necessário que administradores tenham uma interface para visualizar a lista de membros, validar novos cadastros, alterar papéis (roles) e, se necessário, desativar contas.

## What Changes

Implementar a funcionalidade de Gestão de Membros:
1.  Configuração do botão "Acessar" no card de Membros do `Home.tsx` para redirecionar para `/admin/members` (ou seção no Painel Admin).
2.  Criação da página ou componente `MemberManagement.tsx`.
3.  Implementação de tabela de listagem de usuários com busca e filtros.
4.  Formulário modal para edição de perfil do membro (apenas para administradores).
5.  Proteção de rota garantindo que apenas usuários com `role === 'admin'` acessem essa funcionalidade.

## Capabilities

### New Capabilities
- `member-management`: Interface administrativa para controle e gestão dos perfis de membros da associação.

### Modified Capabilities
- None

## Impact

- `src/pages/Home.tsx`: Ativação de links e lógica de permissão no card de Membros.
- `src/pages/AdminPanel.tsx`: Integração ou redirecionamento para a nova gestão.
- `AuthContext.tsx`: Garantir que a Role do usuário esteja disponível para checagem rápida de permissão.
- `translation.json`: Termos de gestão de usuários.
