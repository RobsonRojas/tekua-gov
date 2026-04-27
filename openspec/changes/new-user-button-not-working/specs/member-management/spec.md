## ADDED Requirements

### Requirement: Convite de Novos Membros
O sistema SHALL permitir que administradores enviem convites para novos membros via email para integração na plataforma.

#### Scenario: Envio de Convite com Sucesso
- **WHEN** o administrador abre o formulário de "Novo Membro", insere um email válido e clica em "Enviar Convite".
- **THEN** o sistema SHALL invocar o backend para disparar um convite via Supabase Auth.
- **THEN** o sistema SHALL exibir uma confirmação de sucesso para o administrador.
- **THEN** o novo membro SHALL aparecer na lista de usuários (ou a lista deve ser recarregada).

#### Scenario: Falha ao Enviar Convite (Email Duplicado ou Inválido)
- **WHEN** o administrador tenta convidar um email que já está cadastrado ou possui formato inválido.
- **THEN** o sistema SHALL exibir uma mensagem de erro clara explicando o motivo da falha.
