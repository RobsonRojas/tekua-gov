-- Add role assignment audit logging
-- Add new action type for role management (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'activity_action_type' AND e.enumlabel = 'role_assignment'
  ) THEN
    EXECUTE 'ALTER TYPE activity_action_type ADD VALUE ''role_assignment''';
  END IF;
END
$$;

-- Create a trigger to log role changes on profiles table
CREATE OR REPLACE FUNCTION log_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if roles have actually changed
  IF NEW.roles IS DISTINCT FROM OLD.roles OR NEW.village_id IS DISTINCT FROM OLD.village_id THEN
    INSERT INTO public.activity_logs (user_id, action_type, description)
    VALUES (
      auth.uid(),
      'role_assignment'::activity_action_type,
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_roles', OLD.roles,
        'new_roles', NEW.roles,
        'old_village_id', OLD.village_id,
        'new_village_id', NEW.village_id,
        'action', 'role_updated'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table for role changes
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_assignment();
