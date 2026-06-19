-- ============================================================
-- Fix: Relacionamento entre gifts e profiles
-- Aplica as migrations ao banco de dados manualmente
-- ============================================================

-- 1. Corrigir FK gifts.provider_id (migration 20260619000001)
ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_provider_id_fkey;
ALTER TABLE public.gifts ADD CONSTRAINT gifts_provider_id_fkey 
  FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Corrigir FK gift_usages.consumer_id (migration 20260619000002)
ALTER TABLE public.gift_usages DROP CONSTRAINT IF EXISTS gift_usages_consumer_id_fkey;
ALTER TABLE public.gift_usages ADD CONSTRAINT gift_usages_consumer_id_fkey 
  FOREIGN KEY (consumer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Recarregar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
