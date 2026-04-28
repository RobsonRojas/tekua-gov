## ADDED Requirements

### Requirement: Centralized Event Mapping
O sistema SHALL possuir um mecanismo centralizado para mapear eventos ocorridos no banco de dados para notificações específicas.

#### Scenario: Mapping Task Created Event
- **WHEN** um evento de inserção ocorre na tabela de demandas (`demands`).
- **THEN** o motor de notificações SHALL identificar todos os membros ativos e enfileirar notificações push e email para cada um.

#### Scenario: Mapping Task Claimed Event
- **WHEN** o campo `worker_id` de uma tarefa é atualizado (tarefa assumida).
- **THEN** o motor de notificações SHALL disparar um alerta para o criador da demanda (`creator_id`).

#### Scenario: Mapping Task Submission Event
- **WHEN** o status de uma tarefa muda para `pending_validation`.
- **THEN** o motor de notificações SHALL disparar alertas para o solicitante e para o grupo de validadores.
