-- Migration: Add activity_id to transactions and convert topic_comments to JSONB
-- Date: 2026-04-10

-- 1. Update transactions table
ALTER TABLE transactions 
ADD COLUMN activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_activity_id ON transactions(activity_id);

-- 2. Update topic_comments table
-- 2.1 Rename old column
ALTER TABLE topic_comments RENAME COLUMN content TO content_old;

-- 2.2 Add new JSONB column
ALTER TABLE topic_comments ADD COLUMN content JSONB;

-- 2.3 Migrate data (wrapping old text in i18n object)
UPDATE topic_comments 
SET content = jsonb_build_object('pt', content_old, 'en', content_old)
WHERE content_old IS NOT NULL;

-- 2.4 Set constraints
ALTER TABLE topic_comments ALTER COLUMN content SET NOT NULL;

-- 2.5 (Optional) Drop old column or keep for safety?
-- We'll keep it for now but it's considered deprecated.
