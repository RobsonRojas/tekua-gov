## Why

O dashboard principal e a página de perfil já possuem uma boa responsividade, mas o Mural de Trabalho (Work Wall) ainda utiliza um sistema de abas que, embora agora deslizante, pode se tornar congestionado e difícil de navegar em smartphones com muitas categorias. Unificar o padrão de navegação mobile usando um menu de hambúrguer para filtros de status no Mural de Trabalho melhorará a experiência do usuário e a consistência visual.

## What Changes

- Substituição do componente de `Tabs` por um botão de menu (hambúrguer) no Mural de Trabalho quando visualizado em dispositivos móveis.
- Implementação de um `Menu` ou `Drawer` lateral/inferior para seleção do status da atividade (Abertas, Em Execução, etc.) no mobile.
- Manutenção das `Tabs` para visualização em Desktop/Tablet para aproveitar o espaço horizontal.
- Sincronização automática entre o estado do menu/tabs e os parâmetros de busca da URL.

## Capabilities

### New Capabilities
- `work-wall-responsive-navigation`: Define os requisitos de interface para a navegação contextual do Mural de Trabalho em diferentes tamanhos de tela.

### Modified Capabilities
- `navigation-interface`: Atualização para incluir padrões de navegação contextual por página em dispositivos móveis.

## Impact

- `src/pages/WorkWall.tsx`: Refatoração da lógica de abas para suportar o novo menu.
- `src/components/layout/WorkWallMenu.tsx`: Novo componente para o menu mobile.
- UX: Melhoria na navegação tátil e redução de ruído visual no topo da página de trabalho.
