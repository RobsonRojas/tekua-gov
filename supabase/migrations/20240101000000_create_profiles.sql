-- Create a table for public profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  avatar_url TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Creating policies
-- 1. Profiles are viewable by authenticated users
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (TRUE);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Only admins can update other roles (This will be handled by Edge Function)
-- But for safety, we restrict role updates via direct SQL if not owner
-- Actually, we'll use an Edge Function with service_role to manage roles.

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
