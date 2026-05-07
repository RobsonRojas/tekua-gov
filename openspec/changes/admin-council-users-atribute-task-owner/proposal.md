## Why

Atualmente, as tarefas no Mural de Trabalho são abertas para que qualquer membro as assuma. No entanto, em certos cenários, administradores e membros do Conselho Transversal precisam atribuir uma tarefa específica a um membro diretamente no momento da criação ou edição, para garantir que atividades críticas sejam executadas pelas pessoas certas.

## What Changes

- Adição de um seletor de "Executor/Dono" nas interfaces de criação de demanda (`CreateDemand`) e edição de tarefas.
- Restrição de visibilidade e uso deste seletor apenas para usuários com perfil de `admin` ou `transversal_council`.
- Atualização da lógica de backend para persistir o `worker_id` no momento da criação.
- Ajuste no fluxo de status: se uma tarefa for criada com um executor já atribuído, seu status inicial pode pular para `in_progress` (após aprovação da demanda, se aplicável).

## Capabilities

### New Capabilities
- `task-owner-attribution`: Interface e lógica para seleção e atribuição de membros a tarefas específicas por perfis autorizados.

### Modified Capabilities
- `task-execution`: Atualização do ciclo de vida da tarefa para suportar o estado de "atribuída" desde a origem.

## Impact

- **Frontend**: `CreateDemand.tsx`, novos componentes de seleção de usuário.
- **Backend**: Edge Function `api-work` e RPC `submit_activity`.
- **Database**: Tabela `activities` (já possui `worker_id`, mas a lógica de preenchimento muda).
