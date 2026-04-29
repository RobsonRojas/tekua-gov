-- Migration: Create activity_interactions table
-- Date: 2026-04-29

CREATE TABLE IF NOT EXISTS activity_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_interactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read interactions"
ON activity_interactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to post interactions"
ON activity_interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_activity_interactions_activity_id ON activity_interactions(activity_id);
CREATE INDEX idx_activity_interactions_created_at ON activity_interactions(created_at);
