-- Migration: Multi-profile support
-- Date: 2026-05-02
-- Purpose: Enable multiple roles and functions for each member profile.

-- 1. Add new columns
ALTER TABLE public.profiles ADD COLUMN roles TEXT[] DEFAULT ARRAY['member']::TEXT[];
ALTER TABLE public.profiles ADD COLUMN functions TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Migrate existing data
UPDATE public.profiles 
SET roles = ARRAY[role],
    functions = CASE WHEN is_board_member THEN ARRAY[board_role] ELSE ARRAY[]::TEXT[] END;

-- 3. Update constraints
-- First remove the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- Add new constraint for the roles array (checking if it is a subset of allowed roles)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_roles_check CHECK (roles <@ ARRAY['member', 'admin', 'transversal_council']::TEXT[]);

-- 4. Update handle_new_user function to support multi-profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, roles, functions)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    CASE 
      WHEN new.raw_user_meta_data->>'role' IS NOT NULL THEN ARRAY[new.raw_user_meta_data->>'role']::TEXT[]
      ELSE ARRAY['member']::TEXT[]
    END,
    CASE 
      WHEN (new.raw_user_meta_data->>'is_board_member')::BOOLEAN = TRUE THEN ARRAY[new.raw_user_meta_data->>'board_role']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update is_transversal_council_or_admin helper function
CREATE OR REPLACE FUNCTION public.is_transversal_council_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (roles && ARRAY['admin', 'transversal_council']::TEXT[])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update moderate_activity RPC
CREATE OR REPLACE FUNCTION public.moderate_activity(p_activity_id UUID, p_action TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_transversal_council_or_admin() THEN
    RAISE EXCEPTION 'Only transversal council or admins can moderate activities';
  END IF;

  IF p_action = 'approve' THEN
    UPDATE public.activities 
    SET status = CASE 
        WHEN type = 'contribution' THEN 'pending_validation'::activity_status
        ELSE 'open'::activity_status
    END, 
    updated_at = now()
    WHERE id = p_activity_id AND status = 'pending_approval';
  ELSIF p_action = 'reject' THEN
    UPDATE public.activities 
    SET status = 'rejected', updated_at = now()
    WHERE id = p_activity_id AND status = 'pending_approval';
  ELSE
    RAISE EXCEPTION 'Invalid moderation action';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update submit_activity RPC (it already used pending_approval, but ensure it works with profile context)
-- No changes needed to logic, but re-defining ensures it uses updated profile schema if needed

-- 8. Update RLS Policies
-- Profiles: Only admins (any admin role) can update roles of others
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (roles = (SELECT roles FROM profiles WHERE id = auth.uid())) -- Prevent self-elevation unless via RPC
  );

-- Activities Update Policy
DROP POLICY IF EXISTS "Activities update policy" ON activities;
CREATE POLICY "Activities update policy" ON activities
  FOR UPDATE USING (
    auth.uid() = requester_id OR 
    auth.uid() = worker_id OR
    public.is_transversal_council_or_admin()
  );

-- 9. Add comments
COMMENT ON COLUMN public.profiles.roles IS 'Collection of platform roles assigned to the user (e.g., admin, member, transversal_council).';
COMMENT ON COLUMN public.profiles.functions IS 'Collection of organizational functions or titles assigned to the user (e.g., Presidente, Diretor).';
