# reporting-visualizations Specification

## Purpose
TBD - created by archiving change relatorios-de-resultados-tarefas. Update Purpose after archive.
## Requirements
### Requirement: Interactive Bar Charts
The system SHALL provide interactive bar charts that visualize contribution metrics (e.g., total amount by contributor or count by status).

#### Scenario: Update chart based on filter
- **WHEN** the user applies a status filter
- **THEN** the bar chart SHALL automatically update to reflect the distribution of the filtered data

### Requirement: Interactive Pie Charts
The system SHALL provide interactive pie charts to show proportional distributions of selected categories.

#### Scenario: Switch chart metric
- **WHEN** the user selects a different metric for the pie chart (e.g., "Status Distribution")
- **THEN** the pie chart SHALL re-render showing the percentage breakdown of each status category

### Requirement: Visualization Column Selection
The system SHALL allow users to select which table columns to use as dimensions or metrics for the charts.

#### Scenario: Select chart column
- **WHEN** the user selects the "Contributor" column for the X-axis of a bar chart
- **THEN** the chart SHALL group and sum contribution amounts by contributor name

### Requirement: Tradução de Rótulos e Ajuste de Legendas em Relatórios
Os títulos de botões, cabeçalhos de tabelas e títulos de gráficos **DEVERÃO (SHALL)** estar traduzidos corretamente. As legendas dos gráficos **NÃO DEVERÃO (SHALL NOT)** se sobrepor aos dados.

#### Scenario: Visualização do Relatório de Contribuições em Português
- **GIVEN** que o usuário está na tela de "Relatórios".
- **WHEN** o idioma está definido como Português.
- **THEN** os títulos dos gráficos devem ser exibidos em Português.
- **THEN** as legendas dos gráficos devem estar posicionadas de forma a não obstruir a visualização dos dados (ex: posicionamento inferior ou lateral com margem).
- **THEN** os botões de ação e cabeçalhos de tabela devem estar traduzidos.
