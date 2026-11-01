## MODIFIED Requirements

### Requirement: Transversal Council Role
The system SHALL support a specific user role named `transversal_council`.

#### Scenario: Role assignment
- **WHEN** an admin assigns the `transversal_council` role to a user.
- **THEN** the user SHALL keep any other governance capabilities associated with the role, but SHALL NOT gain moderation (approve/reject) powers over Work Wall tasks, since that stage no longer exists.

## REMOVED Requirements

### Requirement: Moderation Dashboard
**Reason**: A etapa de moderação foi removida; o Mural de Trabalho não possui mais coluna/aba de Moderação para nenhum perfil.
**Migration**: Não há ação necessária. Usuários que acessavam o dashboard de moderação deixam de ver a coluna; as atividades que estavam em `pending_approval` são migradas para `open` (tarefas/demandas) ou `pending_validation` (contribuições).

### Requirement: Task Approval Action
**Reason**: Não existe mais fluxo de aprovação de tarefas pendentes; novas atividades já nascem `open`.
**Migration**: Atividades `pending_approval` existentes são migradas diretamente para `open`/`pending_validation`. Nenhuma aprovação manual é necessária.

### Requirement: Task Rejection Action
**Reason**: Não existe mais etapa de moderação e, portanto, não há ação de rejeição via moderação.
**Migration**: Nenhuma. Ocultação/remoção administrativa de atividades continua disponível pelos mecanismos administrativos existentes, sem depender do fluxo de moderação.

### Requirement: Automated Validation
**Reason**: O workflow de aprovação do Conselho Transversal que esta cobertura de testes validava foi removido.
**Migration**: A cobertura de testes passa a validar que novas tarefas/demandas nascem em `open` e que a coluna Moderação não é renderizada (ver delta de `gift-economy-tasks`).
