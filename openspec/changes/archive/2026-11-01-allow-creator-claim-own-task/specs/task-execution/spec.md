## ADDED Requirements

### Requirement: Criador pode assumir a própria tarefa
O sistema SHALL permitir que o solicitante de uma tarefa aberta a assuma, da mesma forma que qualquer outro membro, tanto pelo detalhe da tarefa quanto pelo card do mural.

#### Scenario: Criador assume a própria tarefa
- **WHEN** o criador de uma tarefa com status `open` clica em "Assumir Tarefa"
- **THEN** a tarefa SHALL passar para `in_progress` com o criador como executor
- **AND** o sistema SHALL registrar a ação no histórico da tarefa

#### Scenario: Botão habilitado para o criador
- **WHEN** o criador visualiza a própria tarefa aberta
- **THEN** o botão "Assumir Tarefa" SHALL estar habilitado

#### Scenario: Servidor aceita a chamada do criador
- **WHEN** o servidor recebe `claimTask` do criador de uma tarefa aberta
- **THEN** o servidor SHALL aceitar a chamada e NOT recusá-la por o usuário ser o solicitante

#### Scenario: Tarefa já assumida continua protegida
- **WHEN** duas pessoas, incluindo o criador, tentam assumir a mesma tarefa
- **THEN** somente a primeira SHALL ter sucesso
- **AND** a outra SHALL receber o erro de tarefa já assumida ou não mais aberta
