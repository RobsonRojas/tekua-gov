## Context

O Mural de Trabalho (`WorkWall.tsx`) atualmente exibe filtros de status de atividade (Todas, Abertas, Em Execução, etc.) através de um componente `Tabs` horizontal. Em dispositivos móveis, essas abas ocupam um espaço vertical precioso e podem exigir rolagem lateral excessiva, o que prejudica a usabilidade.

## Goals / Non-Goals

**Goals:**
- Implementar uma navegação contextual para o Mural de Trabalho que se adapta ao tamanho da tela.
- Substituir as abas por um menu compacto (botão de hambúrguer/menu) em telas `xs`.
- Garantir que a transição entre Desktop (Tabs) e Mobile (Menu) seja transparente para o estado da aplicação.
- Melhorar a legibilidade do cabeçalho no mobile.

**Non-Goals:**
- Alterar o menu principal de navegação da aplicação (Sidebar/MobileDrawer).
- Alterar a lógica de filtragem ou os endpoints da API.
- Adicionar novos status de atividade.

## Decisions

- **Detecção de Tela:** Utilizar o hook `useMediaQuery(theme.breakpoints.down('sm'))` para alternar entre os modos de visualização.
- **Componente Mobile:** Utilizar um `Button` com o rótulo do status atual e um ícone de `Menu` (ou `FilterList`), disparando um componente `Menu` do Material UI.
- **Persistência de Estado:** O estado `tabIndex` continuará controlando qual filtro está ativo, independentemente do componente de UI utilizado (Tabs ou Menu).
- **Posicionamento:** O menu mobile será posicionado logo abaixo do título da página, substituindo a faixa de abas atual.

## Risks / Trade-offs

- **Visibilidade:** Usuários mobile podem não perceber imediatamente que existem outros filtros se o menu estiver fechado. Isso será mitigado exibindo o nome do filtro atual no botão.
- **Cliques Extras:** A mudança de filtro exigirá dois toques (abrir menu + selecionar) em vez de um toque direto na aba. No entanto, o ganho de espaço e organização compensa esse trade-off.
