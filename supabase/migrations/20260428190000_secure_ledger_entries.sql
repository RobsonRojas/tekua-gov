-- Migration: Secure Ledger Entries with RLS
-- Date: 2026-04-28

-- 1. Enable RLS
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for SELECT
-- Members can view their own ledger entries
DROP POLICY IF EXISTS "Users can view their own ledger entries" ON public.ledger_entries;
CREATE POLICY "Users can view their own ledger entries"
ON public.ledger_entries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.wallets
        WHERE wallets.id = ledger_entries.wallet_id
        AND wallets.profile_id = auth.uid()
    )
);

-- Admins can view all ledger entries
DROP POLICY IF EXISTS "Admins can view all ledger entries" ON public.ledger_entries;
CREATE POLICY "Admins can view all ledger entries"
ON public.ledger_entries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Restrict INSERT/UPDATE/DELETE
-- Ledger is managed by SECURITY DEFINER functions only.
DROP POLICY IF EXISTS "Disallow insert for authenticated" ON public.ledger_entries;
DROP POLICY IF EXISTS "Disallow update for authenticated" ON public.ledger_entries;
DROP POLICY IF EXISTS "Disallow delete for authenticated" ON public.ledger_entries;

CREATE POLICY "Disallow insert for authenticated" ON public.ledger_entries FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "Disallow update for authenticated" ON public.ledger_entries FOR UPDATE TO authenticated WITH CHECK (false);
CREATE POLICY "Disallow delete for authenticated" ON public.ledger_entries FOR DELETE TO authenticated USING (false);

-- 4. Comment for documentation
COMMENT ON TABLE public.ledger_entries IS 'Secure ledger for financial accounting. RLS enabled, select restricted to owners and admins.';
