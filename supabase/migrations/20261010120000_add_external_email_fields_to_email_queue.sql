-- Migration: Extend email_queue to support generic external emails
--
-- Adds a type discriminator plus payload columns so external systems can
-- enqueue transactional emails via the `api-external-emails` Edge Function.
-- This migration is purely additive: existing rows default to 'invite',
-- no data is removed, and RLS/policies on email_queue are left untouched.

ALTER TABLE public.email_queue
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'invite',
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS from_email text,
  ADD COLUMN IF NOT EXISTS reply_to text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Existing rows keep the 'invite' default, preserving the current invite flow.
-- (Postgres fills existing rows with the COLUMN DEFAULT above.)
