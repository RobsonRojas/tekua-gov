## ADDED Requirements

### Requirement: Task State Change Events
O sistema SHALL emitir eventos de sistema rastreáveis sempre que o estado de uma tarefa for alterado.

#### Scenario: Emit event on claim
- **WHEN** um membro clica em "Assumir Tarefa".
- **THEN** o sistema SHALL garantir que a mudança de status dispare o gatilho de notificação para o solicitante.

#### Scenario: Emit event on validation request
- **WHEN** o executor submete a tarefa para validação.
- **THEN** o sistema SHALL garantir que o gatilho de notificação seja disparado para as partes interessadas.
