## 1. Banco de dados e API

- [x] 1.1 Criar migration `supabase/migrations/<timestamp>_add_link_url_to_gifts.sql` com `ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS link_url TEXT NULL;` (sem alterar RLS)
- [x] 1.2 Em `supabase/functions/api-gifts/index.ts`, aceitar `linkUrl` (ou `link_url`) em `createGift`, normalizar com `trim` e validar que é URL absoluta `http`/`https` (rejeitar demais protocolos e valores inválidos)
- [x] 1.3 Persistir `link_url` no insert de `createGift`, gravando `null` quando vazio
- [x] 1.4 Confirmar que `fetchGifts` retorna `link_url` (via `select('*')`) sem alteração de schema/serialização

## 2. Renderizador de Markdown seguro

- [x] 2.1 Estender `src/components/common/SafeMarkdown.tsx` com props opcionais para abrir links em nova aba (`target="_blank"` + `rel="noopener noreferrer"` via `components.a`) e para estilização do container
- [x] 2.2 Garantir que os usos existentes (`AIAgent`, `AgenteChat`) permaneçam inalterados quando as novas props não são informadas
- [x] 2.3 Aplicar regras de contenção no container do Markdown (`overflowWrap: 'anywhere'`, `'& *': { maxWidth: '100%' }`, `'& pre'`/`'& table'` com `overflowX: 'auto'`, `'& img': { maxWidth: '100%', height: 'auto' }`)
- [x] 2.4 Adicionar testes em `src/components/common/SafeMarkdown.test.tsx` cobrindo abertura de links em nova aba, `rel="noopener noreferrer"` e manutenção do bloqueio de protocolos perigosos

## 3. Formulário de cadastro

- [x] 3.1 Adicionar estado e `TextField` opcional para o link no diálogo de cadastro em `src/pages/GiftsArea.tsx`, com `type="url"` e validação de URL `http`/`https`
- [x] 3.2 Bloquear o envio quando o link estiver preenchido e inválido, exibindo `helperText`/erro
- [x] 3.3 Enviar o link em `apiClient.invoke('api-gifts', 'createGift', { title, description, linkUrl })` e limpar o campo após sucesso
- [x] 3.4 Adicionar `helperText` indicando suporte a Markdown no campo de descrição
- [x] 3.5 Exibir pré-visualização Markdown da descrição dentro do diálogo (usando `SafeMarkdown`), atualizada conforme o usuário digita (com textos traduzidos)

## 4. Listagem e detalhes

- [x] 4.1 Em `src/pages/GiftsArea.tsx`, renderizar a descrição do card com `SafeMarkdown` (mantendo quebra de linha e contenção dentro do card)
- [x] 4.2 Em `src/components/GiftDetailsModal.tsx`, substituir o texto puro por `SafeMarkdown` com `linkTarget="_blank"` e as regras de contenção
- [x] 4.3 Adicionar, no card de detalhes, o botão de abrir o link da dádiva em nova aba (`component="a"`/`window.open`, `target="_blank"`, `rel="noopener noreferrer"`), exibido somente quando `link_url` existir
- [x] 4.4 Garantir `minWidth: 0`/largura controlada no encadeamento do `DialogContent` para que o conteúdo Markdown não estoure o card
- [x] 4.5 Validar visualmente com descrição contendo palavras longas, URL longa, tabela, imagem e bloco de código que nada ultrapassa a área do card

## 5. Internacionalização

- [x] 5.1 Adicionar chaves no namespace `gifts` em `src/locales/pt/translation.json` (campo de link, botão de abrir link, erro de link inválido, ajuda/pré-visualização de Markdown)
- [x] 5.2 Adicionar as mesmas chaves em `src/locales/en/translation.json`
- [x] 5.3 Conferir que nenhum texto novo ficou hardcoded nas telas alteradas

## 6. Verificação

- [x] 6.1 Rodar `npm run build` e a suíte de testes do frontend (`npm test`/vitest) sem regressões
- [x] 6.2 Testar fluxo manual: cadastrar dádiva com link válido, com link inválido (deve bloquear) e sem link (botão não aparece)
- [x] 6.3 Confirmar que o botão abre o link em outra aba e que a página de Dádivas permanece intacta
- [x] 6.4 Rodar `openspec validate add-gift-links-and-markdown --strict`
