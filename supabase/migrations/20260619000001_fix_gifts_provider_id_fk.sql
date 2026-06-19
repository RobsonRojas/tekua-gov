-- Fix gifts.provider_id FK to reference profiles instead of auth.users
-- This allows PostgREST to resolve the join provider:profiles!provider_id

ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_provider_id_fkey;
ALTER TABLE public.gifts ADD CONSTRAINT gifts_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
