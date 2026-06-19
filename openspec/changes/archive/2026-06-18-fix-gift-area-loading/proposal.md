## Why

Ao acessar a Área de Dádivas, a listagem de gifts falha com HTTP 400 porque a FK de `gifts.provider_id` referencia `auth.users` em vez de `profiles`, impedindo o PostgREST de resolver o join com `profiles`. Além disso, as chaves de tradução do namespace `gifts` não foram adicionadas aos arquivos de locale, deixando botões, títulos e labels sem tradução em português e inglês.

## What Changes

- Alterar a FK de `gifts.provider_id` de `REFERENCES auth.users` para `REFERENCES profiles` para permitir o join com `profiles`
- Adicionar o namespace `gifts` nos arquivos `pt/translation.json` e `en/translation.json` com todas as chaves usadas no frontend
- Remover fallbacks inline (`|| 'texto'`) que agora serão supridas pelas traduções

## Capabilities

### New Capabilities
_(none — this is a fix, not a new capability)_

### Modified Capabilities
- `gift-economy-area`: Correção na query de listagem de dádivas (join com profiles) e adição de suporte a i18n

## Impact

- `supabase/migrations/20260614103232_create_gift_economy.sql`: alterar FK de `auth.users` para `profiles.id`
- `supabase/functions/api-gifts/index.ts`: query `fetchGifts` com join `profiles!provider_id` passará a funcionar
- `src/pages/GiftsArea.tsx`: fallbacks inline (`||`) removidos após adição das traduções
- `src/locales/pt/translation.json`: adicionar namespace `gifts`
- `src/locales/en/translation.json`: adicionar namespace `gifts`
