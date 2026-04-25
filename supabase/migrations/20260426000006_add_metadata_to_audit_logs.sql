-- Migration: Add metadata column to audit_logs
-- Date: 2026-04-25
-- Purpose: Fix missing metadata column in unified audit logs table to prevent 400 errors.

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Ensure the view is also updated
CREATE OR REPLACE VIEW public.vw_audit_logs_all AS
SELECT * FROM public.audit_logs;
