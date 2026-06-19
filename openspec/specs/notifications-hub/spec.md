# notifications-hub Specification

## Purpose
TBD - created by archiving change system-notifications-hub. Update Purpose after archive.
## Requirements
### Requirement: Central de Notificações In-App
O sistema **SHALL** prover um hub centralizado para que os usuários visualizem alertas importantes sobre sua participação na plataforma.

#### Scenario: Recebimento de alerta de comentário
- **WHEN** Outro usuário comenta em uma pauta onde o usuário participou ou que o usuário criou.
- **THEN** Uma notificação é gerada e o ícone de sino no header exibe um indicador visual (badge).

#### Scenario: Navegação via notificação
- **WHEN** O usuário clica em uma notificação de "Atividade Confirmada".
- **THEN** O sistema redireciona o usuário diretamente para a página de detalhes da atividade correspondente.

#### Scenario: Limpeza de notificações
- **WHEN** O usuário clica em "Marcar todas como lidas".
- **THEN** O sistema atualiza o status de todos os alertas pendentes para `is_read: true` e remove o badge do header.

### Requirement: Notificações de Transferência Financeira
O sistema de notificações SHALL suportar o tipo de evento `finance` para alertas relacionados à carteira digital.

#### Scenario: Alerta de Recebimento de Surreais
- **WHEN** um usuário recebe uma transferência de Surreais.
- **THEN** uma notificação do tipo `finance` é gerada e o ícone de sino no header exibe um badge numérico atualizado.

