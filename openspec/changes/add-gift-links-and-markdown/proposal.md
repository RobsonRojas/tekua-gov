## Why

Hoje a descrição de uma dádiva é texto puro (renderizada com `white-space: pre-wrap`): não aceita formatação e não permite apontar para um recurso externo (formulário, álbum, documento, localização). Quem oferece não consegue indicar como a pessoa acessa o item de forma clicável, e descrições longas podem vazar da área do card de detalhes, prejudicando a leitura.

## What Changes

- Adicionar campo opcional de **link** no formulário de cadastro de dádiva, validado como URL `http`/`https`.
- Exibir no card de detalhes da dádiva um **botão que abre o link em outra aba** (`target="_blank"` + `rel="noopener noreferrer"`), visível apenas quando a dádiva possui link.
- Tratar a **descrição como Markdown** tanto no campo do formulário de cadastro (menu/ajuda de sintaxe + pré-visualização) quanto na exibição (lista e detalhes), usando renderização segura (`SafeMarkdown`, com sanitização e bloqueio de protocolos perigosos).
- Aplicar **estilização de contenção** na descrição renderizada no card de detalhes: quebra de palavras longas, URLs longas, blocos de código, imagens e listas confinados à largura do card, sem estouro horizontal.
- **BREAKING** (dados): nova coluna em `public.gifts` e novo parâmetro em `createGift`; dádivas existentes ficam com link nulo (compatível, sem backfill).
- Novas strings de i18n (pt/en) para o campo de link, botão de abertura e ajuda de Markdown.

## Capabilities

### New Capabilities
<!-- Nenhuma: o comportamento novo pertence à área de dádivas já especificada. -->

### Modified Capabilities
- `gift-economy-area`: o cadastro de dádiva passa a aceitar link opcional e descrição em Markdown; a listagem/detalhes passam a renderizar a descrição como Markdown contido no card e a oferecer um botão para abrir o link da dádiva em outra aba.

## Impact

- `src/pages/GiftsArea.tsx` — campo de link, ajuda/pré-visualização de Markdown no formulário, renderização da descrição no card da listagem.
- `src/components/GiftDetailsModal.tsx` — botão de abertura de link em nova aba e estilização de contenção da descrição Markdown.
- `src/components/common/SafeMarkdown.tsx` — suporte a abrir links em nova aba e a estilização contida (props opcionais), sem quebrar os usos atuais (`AIAgent`, `AgenteChat`).
- `supabase/functions/api-gifts/index.ts` — `createGift` aceita/persiste `link_url`; `fetchGifts` já retorna `*` (inclui a nova coluna).
- Nova migration em `supabase/migrations/` — coluna `link_url TEXT NULL` em `public.gifts` (com RLS/políticas existentes preservadas).
- `src/locales/pt/translation.json` e `src/locales/en/translation.json` — novas chaves no namespace `gifts`.
- Testes: `src/components/common/SafeMarkdown.test.tsx` (novos props/estilos) e teste do modal/card de dádiva.
