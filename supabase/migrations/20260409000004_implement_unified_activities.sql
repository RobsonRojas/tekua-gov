-- Migration: Implement Unified Activities Framework
-- Follows openspec/changes/user-surreal-digital-currency-wallet/framework-design.md

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE activity_status AS ENUM ('open', 'in_progress', 'pending_validation', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('task', 'contribution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE validation_method AS ENUM ('requester_approval', 'community_consensus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL, -- { "pt": "...", "en": "..." }
  description JSONB NOT NULL, -- { "pt": "...", "en": "..." }
  type activity_type NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reward_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status activity_status NOT NULL DEFAULT 'open',
  validation_method validation_method NOT NULL DEFAULT 'community_consensus',
  min_confirmations INTEGER DEFAULT 3,
  geo_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activity Evidence Table
CREATE TABLE IF NOT EXISTS activity_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  evidence_url TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Activity Confirmations Table
CREATE TABLE IF NOT EXISTS activity_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- 5. RLS Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by everyone." ON activities
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create activities." ON activities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own activities or activities they are working on." ON activities
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = worker_id);

CREATE POLICY "Evidence is viewable by everyone." ON activity_evidence
  FOR SELECT USING (TRUE);

CREATE POLICY "Workers can submit evidence." ON activity_evidence
  FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Confirmations are viewable by everyone." ON activity_confirmations
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can confirm activities." ON activity_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Migrate existing contributions to activities
-- First, map contribution_status to activity_status
-- contribution_status: 'pending', 'completed', 'rejected'
-- activity_status: 'open', 'in_progress', 'pending_validation', 'completed', 'rejected'

INSERT INTO activities (
  id, 
  title, 
  description, 
  type, 
  requester_id, 
  worker_id, 
  reward_amount, 
  status, 
  validation_method, 
  min_confirmations, 
  created_at, 
  updated_at
)
SELECT 
  id,
  jsonb_build_object('pt', 'Contribuição', 'en', 'Contribution'), -- Default title
  jsonb_build_object('pt', description, 'en', description), -- Migrate description to i18n JSONB
  'contribution'::activity_type,
  beneficiary_id, -- requester_id in activities is who validates (beneficiary of the work)
  user_id, -- worker_id is who did the work
  amount_suggested,
  CASE 
    WHEN status = 'pending' THEN 'pending_validation'::activity_status
    WHEN status = 'completed' THEN 'completed'::activity_status
    WHEN status = 'rejected' THEN 'rejected'::activity_status
    ELSE 'pending_validation'::activity_status
  END,
  'community_consensus'::validation_method,
  3,
  created_at,
  updated_at
FROM contributions;

-- Migrate evidence
INSERT INTO activity_evidence (activity_id, worker_id, evidence_url, submitted_at)
SELECT id, user_id, evidence_url, created_at
FROM contributions;

-- Migrate confirmations
INSERT INTO activity_confirmations (activity_id, user_id, created_at)
SELECT contribution_id, user_id, created_at
FROM contribution_confirmations;

-- 7. (Optional) Cleanup or link old tables
-- We'll keep them for now but they should be considered deprecated.
