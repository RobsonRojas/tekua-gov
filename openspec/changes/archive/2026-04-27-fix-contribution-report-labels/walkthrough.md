# Walkthrough - Fix Contribution Report Labels

Os labels técnicos que estavam vazando na tela de Relatórios de Contribuição foram corrigidos, e a visualização dos gráficos foi aprimorada para evitar sobreposição de legendas.

## Mudanças

### 1. Internacionalização (i18n)
- Adicionadas chaves de tradução ausentes para a seção administrativa e de trabalho.
- Corrigidos labels que exibiam chaves técnicas (ex: `admin.exportCSV`, `work.type`).
- Padronizados os nomes das colunas da tabela (ex: "Membro" em vez de "Contribuidor").

### 2. Refatoração de UI
- Atualizados os componentes `ReportsDashboard`, `ReportFilters`, `ReportingCharts` e `ContributionTable` para utilizar as novas chaves de tradução.
- Removidos fallbacks de texto "hardcoded" nos componentes, garantindo que o sistema use as traduções oficiais.

### 3. Ajuste nos Gráficos
- As legendas dos gráficos de pizza (Status e Tipo) foram movidas para a parte inferior com um espaçamento de 20px (`paddingTop`), eliminando a sobreposição com a área do gráfico.

## Resultados da Verificação
- Validado via subagente de navegação que todos os títulos, filtros e cabeçalhos de tabela estão em português correto.
- Confirmado que os valores das linhas da tabela (ex: "Tarefa") também estão traduzidos.
- Verificado visualmente que as legendas dos gráficos estão bem posicionadas.
