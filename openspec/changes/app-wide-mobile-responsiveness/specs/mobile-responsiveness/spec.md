# Spec: App-Wide Mobile Responsiveness

## Requirements

1. **Global Overflow Prevention:**
   - A raiz da aplicação (ou `MainLayout`) deve possuir restrições (`overflowX: hidden`, `minWidth: 0`, e max-width baseada em `100vw`) para impedir que qualquer elemento filho estique o body e crie uma barra de rolagem horizontal nativa do navegador que corte a UI.

2. **Mobile Layout Constraints (Buttons & Forms):**
   - Agrupamentos de botões de ação e filtros (em páginas principais como WorkWall, Dashboard, etc.) devem empilhar-se verticalmente (`column`) em larguras `xs` (smartphones), ocupando 100% da largura útil sem ultrapassar o contêiner.

3. **Dynamic Device Detection:**
   - O uso do redimensionamento dinâmico via `useMediaQuery` (`theme.breakpoints.down('md')` e `'sm'`) deve ditar a organização flexbox, garantindo suporte fluido para janelas de navegadores que são ativamente redimensionadas.
