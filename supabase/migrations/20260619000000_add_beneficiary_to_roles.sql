-- Add 'beneficiary' to the allowed roles constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_roles_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_roles_check CHECK (roles <@ ARRAY['member', 'admin', 'transversal_council', 'beneficiary']::TEXT[]);
