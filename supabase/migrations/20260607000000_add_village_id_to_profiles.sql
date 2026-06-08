-- Add village_id column to profiles for beneficiary users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS village_id UUID;

-- Note: Foreign key constraint for villages table will be added when villages table is created
-- This allows the migration to run independently of the villages table existence

-- Add FK constraint only if villages table exists and constraint not already present
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'villages'
	) THEN
		IF NOT EXISTS (
			SELECT 1 FROM information_schema.table_constraints
			WHERE constraint_name = 'fk_profiles_village_id' AND table_schema = 'public'
		) THEN
			EXECUTE 'ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_village_id FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE SET NULL';
		END IF;
	END IF;
END
$$;
