-- Migration: Add external URL support to documents
-- Date: 2026-05-27

ALTER TABLE public.documents ALTER COLUMN file_path DROP NOT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS external_url TEXT;
