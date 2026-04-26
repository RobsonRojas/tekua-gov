## Context

Atualmente, o Mural de Trabalho (`WorkWall.tsx`) exibe uma lista linear de atividades sem distinção clara entre tarefas abertas e trabalhos concluídos. Com a nova capacidade de membros criarem demandas, é essencial que a interface permita a triagem e execução eficiente dessas tarefas.

## Goals / Non-Goals

**Goals:**
- Implementar um layout de colunas ou abas por status no Mural de Trabalho.
- Adicionar filtros por executor (worker), solicitante (requester) e tipo.
- Permitir que membros assumam tarefas abertas (claim) de forma atômica.

**Non-Goals:**
- Implementar um quadro Kanban arrastável (drag-and-drop) nesta fase.
- Implementar notificações em tempo real de novas demandas (será via pooling ou atualização manual).

## Decisions

- **Layout de Abas**: Utilizaremos `Tabs` do Material-UI para as colunas:
    - **Todas**: Visão geral.
    - **Abertas**: Demandas aguardando executor.
    - **Em Execução**: Tarefas com `worker_id` definido e status `in_progress`.
    - **Para Validar**: Tarefas concluídas aguardando confirmação social.
    - **Finalizadas**: Tarefas com status `completed`.
- **Componente de Filtro**: Novo componente `WorkFilters.tsx` posicionado acima da lista, permitindo filtragem combinada.
- **Ação de Claim**: 
    - No frontend: Botão "Assumir Tarefa" em cartões com status `open`.
    - No backend: Extensão da `api-work` com a ação `claimTask` que realiza um `UPDATE` condicional (`WHERE status = 'open'`) para evitar condições de corrida.

## Risks / Trade-offs

- **Complexidade da UI** → [Risco] A tela pode ficar poluída com muitos filtros. [Mitigação] Usar um painel de filtros expansível ou selects compactos.
- **Condição de Corrida** → [Risco] Dois membros clicarem em "Assumir" simultaneamente. [Mitigação] O backend validará se a tarefa ainda está 'open' antes de atribuir o executor.
