-- Migration: Refine storage policies and enforce limits
-- Date: 2026-04-10

-- 1. Update buckets configuration (if possible via SQL, otherwise we rely on RLS)
-- Supabase allows setting allowed_mime_types and max_file_size on the bucket record.
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 5242880 -- 5MB
WHERE id = 'task-evidence';

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'],
    file_size_limit = 20971520 -- 20MB
WHERE id = 'official-docs';

-- 2. Refine RLS Policies
-- Drop old policies to replace them with more specific ones
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage official docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view official docs" ON storage.objects;

-- task-evidence: Select allowed for all authenticated (Mural visibility)
CREATE POLICY "task-evidence-select" ON storage.objects
FOR SELECT USING (bucket_id = 'task-evidence' AND auth.role() = 'authenticated');

-- task-evidence: Insert allowed for authenticated users
CREATE POLICY "task-evidence-insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'task-evidence' 
    AND auth.role() = 'authenticated'
    -- We could add additional checks here if needed, but bucket config handles most
);

-- official-docs: Admins can do everything
CREATE POLICY "official-docs-admin" ON storage.objects
FOR ALL USING (
    bucket_id = 'official-docs' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- official-docs: Members can view
CREATE POLICY "official-docs-select" ON storage.objects
FOR SELECT USING (
    bucket_id = 'official-docs' 
    AND auth.role() = 'authenticated'
);
