-- Migration: Enable RLS on ledger_entries
-- Date: 2026-04-27

-- 1. Enable RLS
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- 2. Policies

-- 2a. Users can view their own ledger entries (via their wallet)
CREATE POLICY "Users can view own ledger entries" 
ON public.ledger_entries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.wallets 
        WHERE public.wallets.id = public.ledger_entries.wallet_id 
        AND public.wallets.profile_id = auth.uid()
    )
);

-- 2b. Admins can view all ledger entries
CREATE POLICY "Admins can view all ledger entries" 
ON public.ledger_entries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    )
);

-- 2c. System operations (Edge Functions via service_role)
-- service_role bypasses RLS, so no explicit policy needed for INSERT/UPDATE/DELETE.
-- However, we explicitly deny these to authenticated users to prevent direct manipulation.

CREATE POLICY "Disallow insert for authenticated" ON public.ledger_entries FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "Disallow update for authenticated" ON public.ledger_entries FOR UPDATE TO authenticated WITH CHECK (false);
CREATE POLICY "Disallow delete for authenticated" ON public.ledger_entries FOR DELETE TO authenticated USING (false);

-- Comment on security status
COMMENT ON TABLE public.ledger_entries IS 'Immutable financial ledger. Access restricted to owners and admins via RLS.';
