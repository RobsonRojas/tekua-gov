-- Enable RLS on public.spatial_ref_sys table within a block to catch permission errors
DO $$
BEGIN
    ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow public read access to spatial_ref_sys" ON public.spatial_ref_sys;
    CREATE POLICY "Allow public read access to spatial_ref_sys" ON public.spatial_ref_sys
        FOR SELECT USING (true);
        
    RAISE NOTICE 'Successfully enabled RLS on public.spatial_ref_sys';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not enable RLS on spatial_ref_sys (owned by supabase_admin): %', SQLERRM;
END $$;
