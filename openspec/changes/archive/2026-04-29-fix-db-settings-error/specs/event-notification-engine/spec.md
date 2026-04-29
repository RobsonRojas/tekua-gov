## MODIFIED Requirements

### Requirement: Despacho de Eventos Assíncrono e Resiliente
O sistema SHALL disparar notificações baseadas em eventos de banco de dados de forma assíncrona e resiliente a falhas de infraestrutura.

#### Scenario: Falha de Configuração de Notificação
- **WHEN** ocorre um evento de governança (ex: criação de demanda) mas as chaves de API de notificação não estão configuradas no banco de dados.
- **THEN** o sistema SHALL permitir que a transação de governança seja concluída com sucesso e registrar um aviso no log do banco de dados, priorizando a disponibilidade da funcionalidade principal sobre a entrega da notificação.
