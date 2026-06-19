## ADDED Requirements

### Requirement: Notificações de Transferência Financeira
O sistema de notificações SHALL suportar o tipo de evento `finance` para alertas relacionados à carteira digital.

#### Scenario: Alerta de Recebimento de Surreais
- **WHEN** um usuário recebe uma transferência de Surreais.
- **THEN** uma notificação do tipo `finance` é gerada e o ícone de sino no header exibe um badge numérico atualizado.
