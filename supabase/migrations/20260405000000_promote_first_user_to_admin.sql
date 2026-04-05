-- Promote the first user to 'admin' role automatically
-- This script replaces the handle_new_user function to include logic for the first user.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
BEGIN
  -- Check if this is the first profile being created
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    CASE WHEN is_first_user THEN 'admin' ELSE 'member' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
