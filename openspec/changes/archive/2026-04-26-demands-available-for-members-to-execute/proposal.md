## Why

Com a implementação da criação de demandas por membros, o Mural de Trabalho agora precisa evoluir de uma simples lista de registros para um painel operacional. Atualmente, não há uma forma organizada de visualizar o que está pendente, o que está sendo feito e o que já foi concluído, dificultando a colaboração e a execução de tarefas pela comunidade.

## What Changes

- **Organização por Colunas**: O Mural de Trabalho será reestruturado em colunas de status: "Todos", "Em execução", "Para validar" e "Finalizadas".
- **Sistema de Filtragem**: Adição de filtros avançados por membro executor, demandante (requester), tipo de atividade e intervalo de datas.
- **Ação de Execução**: Implementação da capacidade de um membro "Assumir" uma demanda aberta, mudando seu status para "Em execução" e vinculando-se como executor (worker).

## Capabilities

### New Capabilities
- `task-execution`: Permite que membros assumam tarefas abertas, gerenciem o progresso e transicionem o status da atividade.

### Modified Capabilities
- `work-registration`: Atualização dos requisitos de visualização do Mural de Trabalho para suportar o novo layout de colunas e filtragem dinâmica.

## Impact

- **Frontend**: Reformulação completa do componente `WorkWall.tsx` para adotar um layout de colunas/tabs e integração dos novos filtros.
- **API (Edge Functions)**: A `api-work` será estendida para suportar filtragem avançada nas consultas e a ação de `claimTask`.
- **Banco de Dados**: Otimização de consultas na tabela `activities` para suportar os novos filtros e estados.
