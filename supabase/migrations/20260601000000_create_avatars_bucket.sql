-- Migration: Create member-photos bucket and configure policies
-- Date: 2026-06-01

-- 1. Create the bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configure bucket limits (5MB and image types only)
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 5242880 -- 5MB
WHERE id = 'member-photos';

-- 3. Define RLS Policies for member-photos bucket
-- Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS "member-photos-select" ON storage.objects;
DROP POLICY IF EXISTS "member-photos-admin" ON storage.objects;

-- Policy to allow anyone (public/authenticated) to read member photos
CREATE POLICY "member-photos-select" ON storage.objects
FOR SELECT USING (bucket_id = 'member-photos');

-- Policy to allow administrators to perform all operations
CREATE POLICY "member-photos-admin" ON storage.objects
FOR ALL USING (
    bucket_id = 'member-photos' 
    AND (
        SELECT role = 'admin' OR 'admin' = ANY(roles) 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);
