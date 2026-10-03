## MODIFIED Requirements

### Requirement: Multi-channel Delivery (Push and Email)
O sistema SHALL tentar entregar notificações via push multiplataforma e email simultaneamente para garantir visibilidade.

#### Scenario: Redundant Delivery
- **WHEN** um evento de alta prioridade (como tarefa finalizada) é processado.
- **THEN** o sistema SHALL disparar notificações push para todos os canais registrados do usuário (Web, PWA, Mobile nativo) e enviar o email transacional.
