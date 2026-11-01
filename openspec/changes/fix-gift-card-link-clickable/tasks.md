## 1. Card da lista

- [x] 1.1 Em `SafeMarkdown.tsx`, adicionar opção que interrompe a propagação do clique nos links
- [x] 1.2 Em `GiftsArea.tsx`, usar `linkTarget="_blank"` e a nova opção no `SafeMarkdown` da descrição do card

## 2. Validação

- [x] 2.1 Teste de renderização: URL solta vira link clicável com `target="_blank"` e `rel="noopener noreferrer"`
- [x] 2.2 Teste: clicar no link não dispara o clique do card, e clicar fora do link dispara
- [x] 2.3 Executar `npm run build` sem erros
