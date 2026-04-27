-- Migration: Security Rate Limiting Infrastructure
-- Date: 2026-04-27

-- 1. Rate Limit Logs Table
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL, -- Format: 'domain:action:identifier' (e.g., 'ai:chat:user-id' or 'api:wallet:ip')
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    request_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indices for performance
-- We use a composite index for fast lookup of active windows
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup ON public.security_rate_limits (key, window_start);
-- Index for cleanup job
CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at ON public.security_rate_limits (created_at);

-- 3. Security: Restricted Access
-- This table is for system use only. No RLS required as we don't grant any permissions to public/anon.
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies mean no access for non-superusers/service_role.

-- 4. Cleanup Job (requires pg_cron)
-- Enable the extension if it doesn't exist (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job conditionally
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'cleanup-security-rate-limits',
            '0 * * * *', -- Every hour
            $$ DELETE FROM public.security_rate_limits WHERE created_at < now() - interval '24 hours' $$
        );
    END IF;
END $$;

-- Comment on table
COMMENT ON TABLE public.security_rate_limits IS 'Stores request frequency logs for application-level rate limiting in Edge Functions.';
