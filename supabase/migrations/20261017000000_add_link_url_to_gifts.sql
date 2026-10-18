-- Migration: Add an optional external access link to gifts
--
-- Providers of a "dádiva" (gift) need a clickable way to point to an external
-- resource (form, album, document, location). This is purely additive:
-- the new column is nullable with no default, so existing rows keep working
-- with a NULL (absent) link and no backfill is required.
-- RLS and existing policies on public.gifts are left untouched.

ALTER TABLE public.gifts
  ADD COLUMN IF NOT EXISTS link_url TEXT NULL;
