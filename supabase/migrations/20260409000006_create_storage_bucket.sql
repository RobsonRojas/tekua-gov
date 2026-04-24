-- Migration: Create task-evidence bucket
-- Ensure the bucket for task evidence exists in Supabase Storage

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-evidence', 'task-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for buckets
-- Allow anyone to read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'task-evidence');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'task-evidence' AND auth.role() = 'authenticated');
