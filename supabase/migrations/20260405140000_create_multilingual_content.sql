-- Migration to support multilingual content via JSONB
-- This is an example of how to implement the "multilingual-content" strategy.

-- 1. Example: Table for Governance Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id),
  
  -- Multilingual fields using JSONB
  -- Structure: { "pt": "...", "en": "...", "es": "..." }
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  is_published BOOLEAN DEFAULT FALSE
);

-- 2. Example: Table for Voting Items
CREATE TABLE IF NOT EXISTS voting_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Multilingual fields
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_items ENABLE ROW LEVEL SECURITY;

-- Basic Policies (example)
CREATE POLICY "Everyone can view announcements." ON announcements
  FOR SELECT USING (TRUE);

CREATE POLICY "Everyone can view voting items." ON voting_items
  FOR SELECT USING (TRUE);

-- Helper to extract content based on language
-- Usage: SELECT get_content(title, 'pt') as title FROM announcements;
CREATE OR REPLACE FUNCTION get_content(field JSONB, lang TEXT DEFAULT 'pt')
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(field->>lang, field->>'pt', field->>(field->0)); -- fallback logic
END;
$$ LANGUAGE plpgsql IMMUTABLE;
