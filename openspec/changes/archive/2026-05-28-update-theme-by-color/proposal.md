## Why

A aplicação requer uma atualização visual para se alinhar com a nova identidade baseada na paleta de cores fornecida (cores.jpeg). A implementação dessas cores nos temas claro e escuro melhorará a consistência visual, legibilidade e o senso de identidade do projeto Tekuá Gov.

## What Changes

Atualização completa dos tokens de cor do Material-UI (MUI) para utilizar a nova paleta especificada.
As cores serão mapeadas da seguinte forma (sujeito a ajustes no design):
- `#5f5142` (Marrom escuro / Taupe)
- `#262a18` (Verde muito escuro / Preto esverdeado)
- `#a2a45e` (Verde oliva claro)
- `#467048` (Verde floresta)
- `#da8923` (Laranja mostarda / Amarelo ocre)
- `#8d0c09` (Vermelho escuro / Carmesim)

Os temas claro e escuro (`src/theme/index.ts` ou arquivos similares) serão refatorados para utilizar estas cores em propriedades como `primary`, `secondary`, `background`, `text`, e `error`.

## Capabilities

### New Capabilities
- `theme-colors`: Atualização global das cores da interface para temas light e dark.

### Modified Capabilities
- N/A

## Impact

- Impacta todos os componentes visuais que utilizam o tema do MUI (MUI Theme Provider).
- Modificação no arquivo central de tema (geralmente `src/theme/index.ts` ou `src/App.tsx` onde o `createTheme` é configurado).
- Impacto nulo no backend (Supabase) ou lógica de negócio.
