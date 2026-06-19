## Why

Ao acessar a Área de Dádivas (`/gifts`), o carregamento falha com erro HTTP 400:

```
{"data":null,"error":"Could not find a relationship between 'gifts' and 'profiles' in the schema cache"}
```

A migration `20260619000001_fix_gifts_provider_id_fk.sql` foi criada no commit `dc292ff` mas **nunca foi aplicada ao banco de dados**. A FK de `gifts.provider_id` continua apontando para `auth.users` em vez de `profiles`, impedindo o PostgREST de resolver o join `provider:profiles!provider_id` no `fetchGifts`.

## What Changes

- Aplicar a migration existente `20260619000001_fix_gifts_provider_id_fk.sql` ao banco de dados
- Recarregar o schema cache do PostgREST para que a nova FK seja reconhecida
- Corrigir também a FK de `gift_usages.consumer_id` que tem o mesmo problema (aponta para `auth.users` em vez de `profiles`), prevenindo erros futuros

## Capabilities

### New Capabilities
_(none — fix only)_

### Modified Capabilities
- `gift-economy-area`: correção na listagem de gifts

## Impact

- `supabase/migrations/20260619000001_fix_gifts_provider_id_fk.sql`: já existe, precisa ser executada no banco
- `supabase/migrations/`: pode ser necessária nova migration para `gift_usages.consumer_id`
- Schema cache do PostgREST: recarregar via SQL `NOTIFY pgrst, 'reload schema'`
