## Why

Foi reportado um erro crítico de segurança e funcionalidade na área administrativa do perfil de membros. Atualmente, quando um administrador visualiza o perfil de outro membro e tenta alterar sua senha (clicando em "Segurança e Senha"), a plataforma está alterando a senha do **próprio administrador** em vez de redefinir a senha do membro alvo. Isso causa bloqueio de acesso inadvertido do admin e não atende à necessidade de suporte ao membro.

## What Changes

- Modificar o formulário/ação de alteração de senha quando visualizado no perfil de terceiros.
- Em vez de chamar a função padrão de atualização do próprio usuário (`supabase.auth.updateUser`), se o contexto for de administrador visualizando outro usuário, a chamada deverá usar uma Edge Function segura (ou via `supabase.auth.admin.updateUserById` utilizando uma chave de serviço no backend).
- Ocultar essa opção de redefinição de senha no perfil alheio para usuários que não sejam administradores.

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin-activity-management`: Modificação para garantir que administradores possuam suporte correto à edição forçada de credenciais de membros via Server Actions seguras.

## Impact

- **Frontend**: O componente `ResetPassword` ou similar na página `/profile/[id]` precisará diferenciar se está editando o próprio perfil ou o perfil de um terceiro.
- **Backend/Supabase**: Criação de uma Server Action dedicada (ex: `adminResetUserPassword`) utilizando a Service Role Key do Supabase para ter permissões de alterar a senha de contas que não são do usuário logado.
