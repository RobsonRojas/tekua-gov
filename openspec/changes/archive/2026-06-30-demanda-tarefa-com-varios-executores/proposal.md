## Why

Atualmente, as tarefas e demandas na plataforma Tekuá Gov são restritas a um único executor. Isso limita a capacidade de colaboração e realização de projetos que exigem o esforço de múltiplas pessoas simultaneamente. Permitir vários executores incentiva o trabalho em equipe, distribui a carga de trabalho e assegura que todos os participantes sejam devidamente recompensados por suas contribuições.

## What Changes

- Permitir que qualquer membro crie demandas ou tarefas e atribua múltiplos membros da vila como executores.
- Atualizar a interface do Mural de Trabalho (Work Wall) para exibir múltiplos executores em uma tarefa.
- Quando uma tarefa for confirmada/concluída, o sistema deve dividir e creditar a recompensa em Surreais na carteira de todos os participantes selecionados.

## Capabilities

### New Capabilities
- `multi-executor-tasks`: Funcionalidade de múltiplos executores por tarefa, incluindo a lógica de divisão e crédito das recompensas nas carteiras dos participantes.

### Modified Capabilities
- `work-registration`: O registro de trabalho precisa permitir a seleção de múltiplos executores e a configuração da distribuição da recompensa.

## Impact

- **Frontend**: Formulário de criação de demanda, exibição de detalhes da tarefa e componentes do Work Wall para listar múltiplos avatares.
- **Backend (Supabase)**: O schema da tabela de tarefas precisará de alterações (ex: array de executores ou tabela de relacionamento). Edge functions ou triggers responsáveis pela distribuição da recompensa precisarão lidar com o rateio.
- **Economia**: A distribuição de surreais será dividida ou multiplicada pelos participantes, exigindo lógica transacional segura no banco de dados.
