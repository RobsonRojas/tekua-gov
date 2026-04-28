-- Add board membership and roles to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_board_member BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS board_role TEXT;

COMMENT ON COLUMN public.profiles.is_board_member IS 'Whether the user is a member of the organization board (Diretoria).';
COMMENT ON COLUMN public.profiles.board_role IS 'Specific functional role of the board member (e.g., Presidente, Tesoureiro).';

-- Update handle_new_user to use metadata for roles and board status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, is_board_member, board_role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    COALESCE(new.raw_user_meta_data->>'role', 'member'),
    COALESCE((new.raw_user_meta_data->>'is_board_member')::BOOLEAN, FALSE),
    new.raw_user_meta_data->>'board_role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

