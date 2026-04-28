## ADDED Requirements

### Requirement: Email Notification Templates
O sistema SHALL suportar templates de email dinâmicos para diferentes tipos de alertas de governança.

#### Scenario: Rendering Task Notification Email
- **WHEN** o motor de notificações processa um alerta de "Nova Demanda".
- **THEN** o email enviado SHALL conter o título da demanda, o valor sugerido em Surreais e um link direto para a tarefa no portal.

### Requirement: Multi-channel Delivery (Push and Email)
O sistema SHALL tentar entregar notificações via push e email simultaneamente para garantir visibilidade.

#### Scenario: Redundant Delivery
- **WHEN** um evento de alta prioridade (como tarefa finalizada) é processado.
- **THEN** o sistema SHALL disparar tanto a notificação Web Push quanto o email transacional.
