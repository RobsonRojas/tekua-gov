# work-wall-responsive-navigation Specification

## Purpose
Esta especificação define o comportamento responsivo da navegação de filtros no Mural de Trabalho, garantindo consistência entre a visualização de abas em desktop e o menu de hambúrguer/contextual em dispositivos móveis.
## Requirements
### Requirement: Work Wall Category Filtering UI
O Mural de Trabalho **SHALL** fornecer uma interface de filtragem por status que se adapta ao dispositivo do usuário.

#### Scenario: Mobile Mode (xs)
- **WHEN** a tela é visualizada em um smartphone (largura < 600px).
- **THEN** as abas horizontais **SHALL** ser ocultadas.
- **AND** um botão de "Menu de Status" **SHALL** ser exibido abaixo do título da página.
- **AND** o botão **SHALL** conter um ícone representativo (ex: `Menu` ou `FilterList`) e o rótulo do status ativo.

#### Scenario: Desktop Mode (sm+)
- **WHEN** a tela é visualizada em tablets ou desktops (largura >= 600px).
- **THEN** o sistema **SHALL** exibir o componente de `Tabs` horizontal.
- **AND** o botão de menu mobile **SHALL** ser ocultado.

### Requirement: Navigation Sync
A seleção de filtros no componente responsivo **SHALL** manter a sincronia com a lógica de negócio e a URL.

#### Scenario: Selection via Mobile Menu
- **GIVEN** o menu mobile aberto.
- **WHEN** o usuário seleciona um novo status (ex: "Em Execução").
- **THEN** o menu **SHALL** ser fechado.
- **AND** a lista de atividades **SHALL** ser filtrada imediatamente.
- **AND** o rótulo do botão de menu **SHALL** ser atualizado para o novo status.

### Requirement: Ocultação de Tarefas Pendentes
O Mural de Trabalho **SHALL** ocultar tarefas em status `pending_approval` e `rejected` para usuários comuns, garantindo que apenas tarefas aprovadas ou em andamento sejam visíveis.

#### Scenario: Visualização do mural por usuário padrão
- **WHEN** um usuário padrão (sem a role `admin` ou `transversal_council`) acessa a aba "Todos" no Mural de Trabalho.
- **THEN** nenhuma tarefa com o status `pending_approval` ou `rejected` **SHALL** ser exibida, a menos que o usuário seja o criador (`requester_id`) da tarefa.

#### Scenario: Visualização do mural por conselheiro transversal
- **WHEN** um conselheiro transversal acessa o Mural de Trabalho.
- **THEN** ele **SHALL** ser capaz de ver as tarefas pendentes, seja em sua aba dedicada ("Moderação") ou misturadas (dependendo da lógica da aba Todos).

### Requirement: Work Wall Filter Persistence
The system SHALL persist the filters applied by the user on the work wall in `localStorage`, and SHALL restore and apply them automatically whenever the work wall loads.

#### Scenario: Filters persist across reload
- **WHEN** a user applies filters on the work wall and reloads the page
- **THEN** the same filters SHALL be loaded from `localStorage` and applied to the displayed items

#### Scenario: Default state without saved filters
- **WHEN** the user loads the work wall for the first time (no saved filters)
- **THEN** the board SHALL behave with default (no filters)

### Requirement: Active Filters Indicator
The system SHALL clearly indicate in the UI when filters are currently applied on the work wall.

#### Scenario: Filtros aplicados evidenciados
- **WHEN** at least one filter is active (different from the default)
- **THEN** the UI SHALL show a visible indicator (e.g., badge with count or highlighted filter state)

#### Scenario: Nenhum filtro ativo
- **WHEN** all filters are in their default state
- **THEN** the active-filters indicator SHALL NOT be shown

