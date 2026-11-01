## Why

No card da lista de dádivas, o link do WhatsApp aparecia cortado na borda do card. A mudança `add-gift-links-and-markdown` já passou a mostrar URLs soltas como link curto (nome do site) dentro da largura do card, mas o link ainda não funciona bem ali: o card inteiro abre o modal de detalhes ao ser clicado, e o link do Markdown não define `target`. Clicar no link abre o modal ao mesmo tempo e navega na mesma aba, tirando o membro do app.

## What Changes

- No card da lista, links da descrição abrem em outra aba (`target="_blank"`, `rel="noopener noreferrer"`).
- Clicar no link não abre o modal de detalhes do card; clicar no resto do card continua abrindo.
- O texto cortado na imagem só aparece em builds anteriores à mudança dos links; a nova versão precisa estar publicada para o membro ver o link curto.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `gift-economy-area`: os links da descrição no card da lista são clicáveis sem acionar o modal.

## Impact

- `src/pages/GiftsArea.tsx`: `linkTarget="_blank"` no `SafeMarkdown` do card e parada da propagação do clique no link.
- `src/components/common/SafeMarkdown.tsx`: opção para interromper a propagação do clique nos links.
- Teste de renderização do card.
- Sem mudança de API, banco ou dependências.
