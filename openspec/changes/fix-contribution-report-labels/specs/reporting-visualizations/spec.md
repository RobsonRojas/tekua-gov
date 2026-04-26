# Spec - Reporting Visualizations

## MODIFIED Requirements

### Requirement: Tradução de Rótulos e Ajuste de Legendas em Relatórios
Os títulos de botões, cabeçalhos de tabelas e títulos de gráficos **DEVERÃO (SHALL)** estar traduzidos corretamente. As legendas dos gráficos **NÃO DEVERÃO (SHALL NOT)** se sobrepor aos dados.

#### Scenario: Visualização do Relatório de Contribuições em Português
- **GIVEN** que o usuário está na tela de "Relatórios".
- **WHEN** o idioma está definido como Português.
- **THEN** os títulos dos gráficos devem ser exibidos em Português.
- **THEN** as legendas dos gráficos devem estar posicionadas de forma a não obstruir a visualização dos dados (ex: posicionamento inferior ou lateral com margem).
- **THEN** os botões de ação e cabeçalhos de tabela devem estar traduzidos.
