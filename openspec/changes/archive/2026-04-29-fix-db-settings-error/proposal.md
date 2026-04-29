## Why

A criação de demandas e a atualização de tarefas estão falhando com erro 400 (`Bad Request`). O log do Supabase indica que a trigger de notificações (`handle_task_notification_event`) tenta acessar parâmetros de configuração (`app.settings.supabase_url`) que não estão definidos no ambiente do banco de dados. Isso causa uma exceção fatal que interrompe a transação de banco de dados, impedindo o funcionamento do sistema de governança.

## What Changes

- Refatoração da função Postgres `notifications.handle_task_notification_event` para tratar a ausência de configurações de forma graciosa.
- Implementação de verificação de existência dos parâmetros antes da execução do `net.http_post`.
- Garantia de que falhas na entrega de notificações não bloqueiem operações de escrita no banco de dados (fail-safe).
- Documentação/Migração para facilitar a configuração correta dos parâmetros `app.settings.*`.

## Capabilities

### Modified Capabilities
- `event-notification-engine`: Melhoria na robustez do motor de despacho de eventos.

## Impact

- **Disponibilidade**: Correção imediata do bloqueio na criação de demandas.
- **Resiliência**: O sistema passará a ser resiliente a erros de configuração de infraestrutura de notificações.
- **Observabilidade**: Adição de `RAISE NOTICE` para alertar sobre configurações ausentes sem interromper o fluxo do usuário.
