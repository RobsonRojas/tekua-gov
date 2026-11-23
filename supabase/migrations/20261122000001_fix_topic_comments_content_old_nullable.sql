-- Fix: allow content_old to be NULL in topic_comments.
-- The column was created by migration 20260410000001 (renamed from the original
-- `content` column) and kept NOT NULL. New inserts use the JSONB `content`
-- column and do not populate `content_old`, causing a 400 error.
ALTER TABLE topic_comments ALTER COLUMN content_old DROP NOT NULL;
