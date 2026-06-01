-- Migration: Add owner policy for member-photos bucket
-- Date: 2026-06-01

-- Policy to allow authenticated owners to manage their own profile images
DROP POLICY IF EXISTS "member-photos-owner" ON storage.objects;

CREATE POLICY "member-photos-owner" ON storage.objects
FOR ALL USING (
    bucket_id = 'member-photos' 
    AND owner = auth.uid()
);
