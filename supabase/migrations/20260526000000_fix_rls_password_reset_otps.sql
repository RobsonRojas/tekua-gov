-- Fix critical security vulnerability: enable Row-Level Security on password_reset_otps
--
-- Context: The original migration (20260525000000) disabled RLS with the intention of
-- restricting access to service_role only. However, disabling RLS means the table is
-- publicly accessible to anyone with the project URL via the anon key.
--
-- Correct approach: Enable RLS (deny-all for anon/authenticated by default).
-- The service_role key bypasses RLS entirely by design in Supabase, so Edge Functions
-- that use SUPABASE_SERVICE_ROLE_KEY continue to work without any policy needed.
--
-- This resolves the Supabase critical alert: rls_disabled_in_public
-- Project: tekua-gov (rhpcenqbelifilylwujy)
-- Detected: 2026-05-25

ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;
