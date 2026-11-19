## Why

O mural de trabalho (Kanban) só pode ser refinado por filtros de seleção (projeto, executor, área, solicitante, tipo). Não há como localizar rapidamente uma demanda por palavra-chave, e com várias colunas e dezenas de cartões o membro precisa rolar o quadro procurando visualmente.

## Changes

- Adicionar um campo de pesquisa geral na área de filtros do mural, visível sem precisar expandir os filtros secundários.
- A pesquisa considera o conteúdo de todos os cartões, em todas as colunas (Aberta, Em Execução, Para Validar, Concluída), e mostra apenas os cartões que correspondem ao texto digitado.
- Os contadores das colunas e dos chips de navegação refletem o resultado da pesquisa.
- O campo tem botão de limpar e é considerado pelo botão "Limpar" de filtros.
- A pesquisa combina com os filtros existentes (E lógico) e não altera a consulta ao servidor.

## Capabilities

### New Capabilities

- `work-wall-search`: pesquisa de texto livre sobre os cartões do mural de trabalho, em todas as colunas.

### Modified Capabilities

<!-- Nenhuma: os requisitos das specs existentes não mudam. -->

## Impact

- `src/components/WorkFilters.tsx`: novo campo de texto e estado de pesquisa.
- `src/pages/WorkWall.tsx`: filtragem dos cartões por colunas e contadores.
- `src/locales/*/translation.json`: novos textos (rótulo/placeholder, limpar).
- Sem mudanças de API, banco de dados ou dependências.
