# Gift Economy Area — Schema Fix

**Idempotent SQL** para corrigir as FKs que apontam para `auth.users` em vez de `profiles`.

```sql
-- 1. Fix gifts.provider_id
ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_provider_id_fkey;
ALTER TABLE public.gifts ADD CONSTRAINT gifts_provider_id_fkey 
  FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Fix gift_usages.consumer_id
ALTER TABLE public.gift_usages DROP CONSTRAINT IF EXISTS gift_usages_consumer_id_fkey;
ALTER TABLE public.gift_usages ADD CONSTRAINT gift_usages_consumer_id_fkey 
  FOREIGN KEY (consumer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

## Pré-condições

- Todos os `provider_id` em `gifts` devem existir em `profiles.id`
- Todos os `consumer_id` em `gift_usages` devem existir em `profiles.id`

## Verificação

Após aplicar, o join `provider:profiles!provider_id` no `fetchGifts` deve resolver corretamente.
