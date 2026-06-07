-- Since spatial_ref_sys is owned by supabase_admin (PostGIS), 
-- we cannot enable RLS on it directly using the postgres role.
-- To secure the table from being exposed via PostgREST to clients,
-- we revoke access from the public, anon, and authenticated roles.

REVOKE ALL ON TABLE public.spatial_ref_sys FROM public;
REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon;
REVOKE ALL ON TABLE public.spatial_ref_sys FROM authenticated;
