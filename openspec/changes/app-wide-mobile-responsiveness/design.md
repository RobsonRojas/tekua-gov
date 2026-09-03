# Design: App-Wide Mobile Responsiveness

## Architecture & Layout Constraints
- **Global Container Protection:** Em `src/layouts/MainLayout.tsx`, os contêineres principais de flexbox que envolvem os componentes roteados (`<main>`) devem declarar explicitamente `minWidth: 0` e `overflowX: 'hidden'`. Isso anula a capacidade de componentes filhos de esticarem agressivamente o eixo cruzado do layout flex no nível da raiz.
- **Form Controls & Action Bars:** Padronizar grupos horizontais (`row`) que contenham elementos de ação (como `<Button>`) para mudarem a propriedade `flexDirection` para `column` em breakpoints `< sm` (mobile). Isso é superior ao uso de `flexWrap` com larguras em `%`, pois dispensa cálculos de padding/margin que extrapolam a caixa do contêiner.

## Specific Implementations
1. **`MainLayout.tsx`**: Adicionar `minWidth: 0` e confirmar `overflowX: 'hidden'` em todo o contêiner `main` e `Box` base.
2. **`WorkWall.tsx` & Similares**: 
   - A box que contém botões (ex: "Criar Demanda", "Registrar") usará `<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } ... }}>`. 
   - Todos os botões internos usarão `width: { xs: '100%', sm: 'auto' }` e dispensarão as regras confusas de `flex: '1 1 100%'`.
