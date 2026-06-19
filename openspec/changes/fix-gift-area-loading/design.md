## Context

O `fetchGifts` na edge function `api-gifts` faz um join `provider:profiles!provider_id` que falha porque a FK de `gifts.provider_id` aponta para `auth.users`, não para `profiles`. O PostgREST não encontra a relação no schema cache. Além disso, as chaves de tradução do namespace `gifts` nunca foram adicionadas aos arquivos de locale, então o frontend depende de fallbacks inline.

## Goals / Non-Goals

**Goals:**
- Corrigir o erro HTTP 400 ao carregar a lista de gifts
- Adicionar suporte completo a i18n para o namespace `gifts` em pt e en
- Remover fallbacks inline no componente `GiftsArea`

**Non-Goals:**
- Não alterar a lógica de criação ou uso de gifts
- Não alterar o schema de `gift_usages` ou `wallets`
- Não adicionar novas funcionalidades à área de dádivas

## Decisions

### 1. FK Fix: `profiles` em vez de `auth.users`

**Decisão:** Alterar a FK `gifts.provider_id` de `REFERENCES auth.users` para `REFERENCES profiles(id)`.

**Rationale:** `profiles.id` já é FK para `auth.users.id`, então a integridade referencial é mantida. O PostgREST consegue resolver o join `profiles!provider_id` corretamente quando a FK aponta para `profiles`.

**Alternativa considerada:** Usar `supabaseAdmin` em vez de `supabaseClient` para fazer a query com join manual. Rejeitada porque mascara o problema real de schema e não segue o padrão do projeto (outras edge functions usam joins similares com sucesso, ex: api-work).

### 2. Migration: alteração in-place na migration existente ou nova migration

**Decisão:** Criar uma **nova migration** (`ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT ...`) em vez de editar a migration existente.

**Rationale:** A migration `20260614103232_create_gift_economy.sql` já foi aplicada no banco. Criar uma nova migration é a abordagem correta para ambientes com migration runner.

## Risks / Trade-offs

- **[Registros órfãos]** Se existirem `profiles.id` que não correspondem a `auth.users.id` — improvável porque `profiles.id` tem FK para `auth.users`.
- **[Rollback]** A migration de correção da FK é reversível com `DROP CONSTRAINT` seguido de `ADD CONSTRAINT ... REFERENCES auth.users`.
