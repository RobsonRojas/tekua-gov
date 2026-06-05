-- Recreate public.vw_audit_logs_all view with security_invoker = true to respect base table RLS
DROP VIEW IF EXISTS public.vw_audit_logs_all;

CREATE OR REPLACE VIEW public.vw_audit_logs_all
WITH (security_invoker = true)
AS
SELECT * FROM public.audit_logs;
