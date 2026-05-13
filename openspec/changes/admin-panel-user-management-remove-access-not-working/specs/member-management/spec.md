## MODIFIED Requirements

### Requirement: Remoção de Membros
O sistema **SHALL** permitir que administradores revoguem permanentemente o acesso de membros e removam suas contas da plataforma de forma segura.

#### Scenario: Remoção de Usuário com Diálogo de Confirmação
- **GIVEN** que o administrador está visualizando a lista de membros.
- **WHEN** o administrador seleciona a opção "Remover Acesso" para um usuário específico.
- **THEN** o sistema **SHALL** exibir um diálogo de confirmação contendo o nome ou email do usuário selecionado explicitamente na mensagem.
- **AND** o sistema **SHALL** manter os dados do usuário selecionado em memória durante a exibição do diálogo.
- **WHEN** o administrador confirma a ação no diálogo.
- **THEN** o sistema **SHALL** invocar o backend para excluir o registro do perfil do usuário e sua respectiva conta no Supabase Auth.
- **AND** o sistema **SHALL** exibir um alerta de sucesso e recarregar a lista de usuários após a conclusão da operação.

#### Scenario: Proteção contra Auto-Exclusão
- **WHEN** um administrador tenta acionar a opção "Remover Acesso" para sua própria conta através do painel.
- **THEN** o sistema **SHALL** impedir a ação (seja desabilitando/ocultando o botão ou exibindo um erro de validação), garantindo que um administrador não remova seu próprio acesso acidentalmente.
