## 1. Database

- [x] 1.1 Migration `20260619000001_fix_gifts_provider_id_fk.sql` — arquivo já existe, precisa ser executada no banco
- [x] 1.2 Migration `20260619000002_fix_gift_usages_consumer_id_fk.sql` — criada em `supabase/migrations/`
- [x] 1.3 Executar as migrations no banco (via Supabase Dashboard SQL Editor ou `supabase migration up`)
- [x] 1.4 Recarregar schema cache do PostgREST (`NOTIFY pgrst, 'reload schema'`)

## SQL para executar no Supabase Dashboard

```sql
-- 1. Corrigir FK gifts.provider_id
ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_provider_id_fkey;
ALTER TABLE public.gifts ADD CONSTRAINT gifts_provider_id_fkey 
  FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Corrigir FK gift_usages.consumer_id
ALTER TABLE public.gift_usages DROP CONSTRAINT IF EXISTS gift_usages_consumer_id_fkey;
ALTER TABLE public.gift_usages ADD CONSTRAINT gift_usages_consumer_id_fkey 
  FOREIGN KEY (consumer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Recarregar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
```

## 2. Verificação

- [x] 2.1 Acessar `/gifts` e confirmar que a listagem carrega sem erro HTTP 400
- [x] 2.2 Confirmar que o join `provider:profiles!provider_id` retorna `full_name` e `avatar_url` corretamente
- [x] 2.3 Criar gift e registrar uso para garantir que `recordUsage` continua funcionando
