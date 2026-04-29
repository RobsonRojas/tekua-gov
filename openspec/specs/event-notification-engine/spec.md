# event-notification-engine Specification

## Purpose
TBD - created by archiving change task-demand-creation-notify-members. Update Purpose after archive.
## Requirements
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

### Requirement: Despacho de Eventos Assíncrono e Resiliente
O sistema SHALL disparar notificações baseadas em eventos de banco de dados de forma assíncrona e resiliente a falhas de infraestrutura.

#### Scenario: Falha de Configuração de Notificação
- **WHEN** ocorre um evento de governança (ex: criação de demanda) mas as chaves de API de notificação não estão configuradas no banco de dados.
- **THEN** o sistema SHALL permitir que a transação de governança seja concluída com sucesso e registrar um aviso no log do banco de dados, priorizando a disponibilidade da funcionalidade principal sobre a entrega da notificação.

