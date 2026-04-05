-- Add preferred_language column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'pt';

-- Update handle_new_user to include preferred_language (optional, usually handled by client default)
-- But for consistency:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, created_at, preferred_language)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'member', 
    new.created_at,
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'pt')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
