-- Fix gift_usages.consumer_id FK to reference profiles instead of auth.users
-- This prevents potential PostgREST join errors in the future

ALTER TABLE public.gift_usages DROP CONSTRAINT IF EXISTS gift_usages_consumer_id_fkey;
ALTER TABLE public.gift_usages ADD CONSTRAINT gift_usages_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
