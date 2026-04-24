## ADDED Requirements

### Requirement: Validação Social de Contribuições
Membros da Vila **SHALL** confirmar a realização de trabalhos publicados no mural para garantir a transparência e consenso.

#### Scenario: Confirmação realizada por terceiro
- **WHEN** Um membro visualiza a evidência de outro usuário e clica em "Confirmar".
- **THEN** Uma nova entrada é criada e a contagem de validações da contribuição é incrementada.

#### Scenario: Prevenção de auto-confirmação
- **WHEN** O autor da tarefa tenta confirmar sua própria contribuição.
- **THEN** O sistema impede a ação e exibe uma mensagem de indisponibilidade.

#### Scenario: Revogação de confirmação
- **WHEN** Um usuário que já confirmou deseja desfazer sua ação (dentro de um prazo de 24h).
- **THEN** A confirmação é removida e o progresso da contribuição volta um nível.

#### Scenario: Validação de perfil (Sybil prevention)
- **WHEN** Um usuário com permissões de 'visitante' tenta validar uma tarefa.
- **THEN** O sistema nega a validação, permitindo apenas membros reconhecidos ('member', 'admin').
