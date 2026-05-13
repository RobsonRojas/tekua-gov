-- Fix foreign key constraints for user removal
-- Adding ON DELETE SET NULL to columns that reference profiles without a cascade action.

DO $$ 
BEGIN
  -- 1. Fix announcements.author_id
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'announcements') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'announcements' AND column_name = 'author_id') THEN
      ALTER TABLE public.announcements
      DROP CONSTRAINT IF EXISTS announcements_author_id_fkey,
      ADD CONSTRAINT announcements_author_id_fkey 
        FOREIGN KEY (author_id) 
        REFERENCES public.profiles(id) 
        ON DELETE SET NULL;
    END IF;
  END IF;

  -- 2. Fix activities.auditor_id
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'auditor_id') THEN
      ALTER TABLE public.activities
      DROP CONSTRAINT IF EXISTS activities_auditor_id_fkey,
      ADD CONSTRAINT activities_auditor_id_fkey 
        FOREIGN KEY (auditor_id) 
        REFERENCES public.profiles(id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
