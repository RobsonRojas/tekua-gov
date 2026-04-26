## Why

Atualmente, o sistema foca no registro de trabalhos já realizados (através do `RegisterWork`). Para dinamizar a economia da Tekuá, é necessário que os membros também possam **demandar** serviços e tarefas que precisam ser realizados, oferecendo uma recompensa em Surreal. Isso transforma o Mural de Trabalho em um verdadeiro marketplace de demandas comunitárias.

## What Changes

- **Criação de Demandas**: Implementação de uma nova interface/modal para criar uma tarefa pendente.
- **Definição de Valor**: O proponente define o valor em Surreal que está disposto a pagar (que será descontado de sua carteira ao finalizar o serviço).
- **Visibilidade**: As demandas aparecerão no Mural de Trabalho como "Abertas" para que outros membros possam se candidatar ou realizá-las.

## Capabilities

### New Capabilities
- `task-creation`: Capacidade de membros criarem novas demandas/tarefas no sistema, definindo título, descrição e valor de recompensa.

### Modified Capabilities
- `api-work`: Atualização da API de trabalho para suportar a criação de tarefas no estado 'open' (aberta) com um proponente (requester_id) definido.

## Impact

- **Database**: A tabela `activities` (ou `audit_logs` dependendo da implementação unificada) precisará suportar o estado inicial 'open'.
- **Frontend**: Novo formulário ou página `/create-task` e atualização do `WorkWall` para exibir essas demandas.
- **Edge Functions**: Atualização da `api-work` para validar saldo do proponente ao criar uma demanda (opcional, ou apenas no fechamento).
