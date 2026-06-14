-- Migration: Create projects table and associate with activities

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add project_id to activities
ALTER TABLE public.activities 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Projects are viewable by everyone." 
ON public.projects FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create projects." 
ON public.projects FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their own projects." 
ON public.projects FOR UPDATE 
USING (auth.uid() = created_by);
