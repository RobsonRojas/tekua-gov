## Context

O modal de transferência na tela de carteira falha ao ser aberto ("Ao clicar em transferir") devido a um erro no React de manipulação de DOM (`insertBefore`). Esse erro é causado por aninhamento inválido de HTML e componentes do Material UI.

## Goals / Non-Goals

**Goals:**
- Identificar e corrigir os pontos de aninhamento inválido (ex: tags de bloco dentro de tags incompatíveis, ou fragmentos passados indevidamente para componentes do MUI) em `src/pages/Wallet.tsx`.
- Restaurar a usabilidade do envio de transferências.

**Non-Goals:**
- Refatoração de lógicas de negócio no frontend.
- Mudanças no fluxo ou layout de telas, além da estabilidade.

## Decisions

- **Substituir o Fragmento no Input do Autocomplete por `InputAdornment`:** Fragmentos não preservam a árvore esperada pelo Material UI no `TextField`, causando quebra de ref ou renderização interna, gerando o crash.
- **Corrigir aninhamento no `DialogTitle`:** Mudar o `Typography variant="h3"` para utilizar `component="span"` ou semelhante se estiver inserido dentro de um elemento de título conflitante ou gerando invalid DOM.

## Risks / Trade-offs

- **[Risco]** Extensões do navegador continuarem interferindo no React -> **Mitigação:** Utilizar o encapsulamento em elementos consistentes que resistem à injeção (ex: evitar renderização condicional fragmentada em áreas vulneráveis).
