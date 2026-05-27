## MODIFIED Requirements

### Requirement: Central de Auditoria Global
O portal SHALL fornecer aos administradores uma interface para monitorar todas as interações de todos os membros e gerenciar seus perfis. Esta interface SHALL estar integrada como uma aba no Painel Administrativo e também disponível na visualização individual do perfil do membro. Administradores **MUST** ter a capacidade de redefinir as credenciais de segurança (senha) de qualquer usuário sem afetar sua própria conta.

#### Scenario: Admin redefinindo senha de membro
- **WHEN** um administrador acessa a página de perfil de outro membro (`/profile/[id]`).
- **AND** navega até a aba de Segurança e Senha.
- **AND** preenche uma nova senha e submete o formulário.
- **THEN** o sistema SHALL atualizar a senha do membro visualizado via privilégios administrativos.
- **AND** a senha da conta do administrador SHALL permanecer inalterada.

#### Scenario: Prevenção de alteração por não-admin
- **WHEN** um usuário com nível de privilégio comum tenta alterar a senha de outro usuário.
- **THEN** o sistema SHALL bloquear a requisição e a aba de Segurança e Senha não deve ser renderizada na interface pública do perfil de terceiros.
