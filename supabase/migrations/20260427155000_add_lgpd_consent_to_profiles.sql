-- Add LGPD consent tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT;

-- Comment on columns for clarity
COMMENT ON COLUMN public.profiles.accepted_terms_at IS 'Timestamp of when the user accepted the privacy policy and terms of use.';
COMMENT ON COLUMN public.profiles.terms_version IS 'The version of the terms that was accepted by the user.';

-- Ensure RLS allows users to update their own consent
-- (Existing policy for 'Update own profile' should cover this, but let's be explicit if needed)
-- Assuming a policy like 'Users can update their own profile' exists.
