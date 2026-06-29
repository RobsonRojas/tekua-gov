-- Migration: Add multiple executors to activities

-- 1. Add executor_ids array to activities table
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS executor_ids UUID[] DEFAULT '{}';

-- 2. Migrate existing worker_id to executor_ids array
UPDATE public.activities SET executor_ids = ARRAY[worker_id] WHERE worker_id IS NOT NULL AND (executor_ids IS NULL OR array_length(executor_ids, 1) IS NULL);

-- 3. Update RLS policies to allow updates by any executor in the array
CREATE POLICY "Executors in array can update activities" ON public.activities
  FOR UPDATE USING (auth.uid() = ANY(executor_ids));
