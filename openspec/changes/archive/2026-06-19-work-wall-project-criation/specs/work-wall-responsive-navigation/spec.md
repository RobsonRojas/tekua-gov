## MODIFIED Requirements

### Requirement: Filtros Rápidos de Visualização
O sistema SHALL disponibilizar chips e menus na interface de navegação (topo do mural) para alternar rapidamente entre subconjuntos relevantes de atividades e filtrar a listagem com base em status ou projetos específicos.

#### Scenario: Filtragem por Projeto
- **WHEN** o usuário seleciona um projeto na lista de filtros (dropdown ou chips).
- **THEN** a lista de tarefas visível no Work Wall SHALL ser recarregada exibindo apenas tarefas cujo `project_id` corresponda ao filtro selecionado.

#### Scenario: Remoção de Filtro por Projeto
- **WHEN** o usuário limpa a seleção de projeto (opção "Todos os Projetos").
- **THEN** a lista de tarefas SHALL retornar ao estado padrão, exibindo todas as tarefas conforme a aba (Mural, Em Progresso, Finalizadas) sem restrição de projeto.
