-- Migration: Fix official-docs-admin storage policy for multi-role support
-- Date: 2026-06-05

DROP POLICY IF EXISTS "official-docs-admin" ON storage.objects;

CREATE POLICY "official-docs-admin" ON storage.objects
FOR ALL USING (
    bucket_id = 'official-docs' 
    AND (
        SELECT role = 'admin' OR 'admin' = ANY(roles) 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);
