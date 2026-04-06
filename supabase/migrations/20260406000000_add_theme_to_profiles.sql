-- Add preferred_theme column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark'));

-- Comment on column for documentation
COMMENT ON COLUMN public.profiles.preferred_theme IS 'Preferred UI theme of the user (light or dark).';
