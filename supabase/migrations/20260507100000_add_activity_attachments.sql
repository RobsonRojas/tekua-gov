-- Migration: Add Activity Attachments
-- Description: Supports multiple file attachments for task specs and evidence.

-- 1. Create activity_attachments table
CREATE TABLE IF NOT EXISTS public.activity_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    is_evidence BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.activity_attachments ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Attachments are viewable by everyone." ON public.activity_attachments
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can upload their own attachments." ON public.activity_attachments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments." ON public.activity_attachments
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Update storage bucket configuration
-- Allow PDFs and common documents in task-evidence
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    file_size_limit = 10485760 -- 10MB
WHERE id = 'task-evidence';

-- 5. Grant access
GRANT ALL ON public.activity_attachments TO authenticated;
GRANT ALL ON public.activity_attachments TO service_role;
GRANT SELECT ON public.activity_attachments TO anon;
