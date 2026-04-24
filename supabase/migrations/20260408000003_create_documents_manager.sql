-- Create official-docs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('official-docs', 'official-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for official-docs bucket
-- Admins can do everything
CREATE POLICY "Admins can manage official docs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'official-docs' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can view official docs
CREATE POLICY "Authenticated users can view official docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'official-docs' AND
    auth.role() = 'authenticated'
  );

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL,
  description JSONB,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- Set up Row Level Security (RLS) for documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies for documents
-- Admins can do everything
CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can view documents
CREATE POLICY "Authenticated users can view documents" ON public.documents
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
