## 1. Banco de Dados (Migration)

- [x] 1.1 Criar arquivo de migração `supabase/migrations/<timestamp>_create_gift_economy.sql`.
- [x] 1.2 Alterar a tabela `wallets` para adicionar a coluna `gift_points INTEGER DEFAULT 0`.
- [x] 1.3 Criar tabela `gifts` (`id`, `provider_id`, `title`, `description`, `status`, `created_at`) e habilitar RLS.
- [x] 1.4 Criar tabela `gift_usages` (`id`, `gift_id`, `consumer_id`, `created_at`) e habilitar RLS.
- [x] 1.5 Criar função RPC `award_gift_points(p_gift_id UUID, p_consumer_id UUID)` que insere na `gift_usages` e incrementa os `gift_points` na carteira do provider_id.

## 2. Backend (Edge Function)

- [x] 2.1 Criar nova Edge Function `api-gifts` (ou incluir em `api-work`) implementando rate limiting e verificação de auth.
- [x] 2.2 Implementar action `createGift` para inserir novo registro em `gifts`.
- [x] 2.3 Implementar action `fetchGifts` para listar dádivas ativas.
- [x] 2.4 Implementar action `recordUsage` que chama a RPC `award_gift_points`.

## 3. Frontend (Interface e Rotas)

- [x] 3.1 Criar página `src/pages/GiftsArea.tsx` com a listagem de dádivas e o botão de "Cadastrar Dádiva".
- [x] 3.2 Criar os modais/formulários para "Cadastrar Dádiva".
- [x] 3.3 No card da dádiva em `GiftsArea.tsx`, adicionar o botão "Eu utilizei isso" que aciona a API `recordUsage`.
- [x] 3.4 Adicionar a rota `/gifts` no `src/App.tsx`.
- [x] 3.5 Atualizar o `Sidebar` e `BottomNav` para incluir o link para a nova área de Dádivas.
- [x] 3.6 Atualizar o `src/pages/Wallet.tsx` (ou o dashboard principal) para exibir o saldo de `gift_points` ao lado do saldo de Surreais.
