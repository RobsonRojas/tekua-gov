# Proposal: App-Wide Mobile Responsiveness

## Why
Usuários relatam que, em telas menores (smartphones) ou janelas redimensionadas, a aplicação apresenta cortes visuais e scroll horizontal indesejado. Elementos como botões perdem suas extremidades, e o layout não se ajusta fluidamente às dimensões reduzidas. É necessário garantir que **toda a aplicação** detecte corretamente o ambiente mobile e limite o `overflow` global, impedindo que componentes isolados forcem a largura da página para além de `100vw`.

## What
- Implementar uma restrição global na estrutura de layout da aplicação (`MainLayout` e `App`) que force os elementos filhos a respeitarem a largura máxima da viewport (`overflow-x: hidden`, `minWidth: 0`).
- Adicionar ou refinar o uso do hook `useMediaQuery` (já disponível no MUI) em conjunto com a detecção de User-Agent (quando necessário) para aplicar comportamentos específicos em telas móveis e tablets.
- Corrigir a adaptação de caixas de botões e formulários (usando flexbox em modo colunar `flex-direction: column` no breakpoint `xs` em vez de `flexWrap` com metragens fixas ou relativas não controladas).
