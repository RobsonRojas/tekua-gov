CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Create a table for public profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  avatar_url TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Creating policies
-- 1. Profiles are viewable by authenticated users
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (TRUE);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Only admins can update other roles (This will be handled by Edge Function)
-- But for safety, we restrict role updates via direct SQL if not owner
-- Actually, we'll use an Edge Function with service_role to manage roles.

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Add created_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Function to handle new user signup with created_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'member', new.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles with data from auth.users
UPDATE profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id AND p.created_at IS NULL;
-- Add preferred_language column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'pt';

-- Update handle_new_user to include preferred_language (optional, usually handled by client default)
-- But for consistency:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, created_at, preferred_language)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'member', 
    new.created_at,
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'pt')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
-- Add preferred_theme column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark'));

-- Comment on column for documentation
COMMENT ON COLUMN public.profiles.preferred_theme IS 'Preferred UI theme of the user (light or dark).';
-- Migration: Create Wallet System (Surreal)
-- Date: 2026-04-07

-- 1. Wallets Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(15, 2) DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL from_id = Minting from Treasury
  to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3.1 Wallet Policies (Owner can see their own balance, no manual updates)
CREATE POLICY "Users can view their own wallet." ON wallets
  FOR SELECT USING (auth.uid() = profile_id);

-- 3.2 Transaction Policies (Users can see their sent/received transactions)
CREATE POLICY "Users can view their transactions." ON transactions
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

-- 4. Atomic Transfer RPC Function
CREATE OR REPLACE FUNCTION perform_transfer(
  p_to_id UUID,
  p_amount NUMERIC(15, 2),
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions
AS $$
DECLARE
  v_from_id UUID;
  v_from_balance NUMERIC;
BEGIN
  v_from_id := auth.uid();
  
  -- 1. Basic validation
  IF v_from_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF p_to_id = v_from_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  -- 2. Check and lock from wallet
  SELECT balance INTO v_from_balance
  FROM wallets
  WHERE profile_id = v_from_id
  FOR UPDATE;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Perform atomic operations
  -- 3a. Debit
  UPDATE wallets SET balance = balance - p_amount, updated_at = NOW()
  WHERE profile_id = v_from_id;

  -- 3b. Credit
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_to_id;

  -- 3c. Log transaction
  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (v_from_id, p_to_id, p_amount, p_description);

  RETURN jsonb_build_object('success', TRUE, 'new_balance', v_from_balance - p_amount);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- 5. Treasury Function (Admin Only)
CREATE OR REPLACE FUNCTION admin_mint_currency(
  p_recipient_id UUID,
  p_amount NUMERIC(15, 2),
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role TEXT;
BEGIN
  -- 1. Verify admin role
  SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can mint currency';
  END IF;

  -- 2. Update recipient balance
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_recipient_id;

  -- 3. Log transaction (from_id NULL = Treasury)
  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (NULL, p_recipient_id, p_amount, p_description);

  RETURN jsonb_build_object('success', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- 6. Trigger to auto-create wallets for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (profile_id, balance)
  VALUES (new.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

-- 7. Initialize wallets for existing users
INSERT INTO wallets (profile_id, balance)
SELECT id, 0 FROM profiles
ON CONFLICT (profile_id) DO NOTHING;
-- Migration: Create Work Registration & Community Validation System
-- Date: 2026-04-07

-- 1. Governance Settings Table (e.g., threshold for confirmations)
CREATE TABLE governance_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default threshold
INSERT INTO governance_settings (key, value)
VALUES ('min_contribution_confirmations', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Contributions Table
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contribution_status') THEN CREATE TYPE contribution_status AS ENUM ('pending', 'completed', 'rejected'); END IF; END $$;

CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL = Tekuá Treasury
  amount_suggested NUMERIC(15, 2) NOT NULL CHECK (amount_suggested > 0),
  description TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  status contribution_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Contribution Confirmations (Social Validation)
CREATE TABLE contribution_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES public.contributions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contribution_id, user_id) -- One vote per member
);

-- 4. RLS Policies
ALTER TABLE governance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_confirmations ENABLE ROW LEVEL SECURITY;

-- 4.1 Governance Settings: Viewable by all, update by admin only
CREATE POLICY "Governance settings are viewable by everyone." ON governance_settings
  FOR SELECT USING (TRUE);

-- 4.2 Contributions: Viewable by all, insert by authenticated
CREATE POLICY "Contributions are viewable by everyone." ON contributions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can submit their own contributions." ON contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.3 Confirmations: Viewable by all, insert by authenticated (except owner)
CREATE POLICY "Confirmations are viewable by everyone." ON contribution_confirmations
  FOR SELECT USING (TRUE);

-- Validation that user is not the owner is handled in the RPC for better feedback
CREATE POLICY "Users can confirm contributions." ON contribution_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. RPC Functions

-- 5.1 Submit Contribution (Helper to ensure metadata)
CREATE OR REPLACE FUNCTION submit_contribution(
  p_description TEXT,
  p_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_beneficiary_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO contributions (user_id, description, amount_suggested, evidence_url, beneficiary_id)
  VALUES (auth.uid(), p_description, p_amount, p_evidence_url, p_beneficiary_id)
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- 5.2 Confirm Contribution & Auto-Payout
CREATE OR REPLACE FUNCTION confirm_contribution(
  p_contribution_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_contribution_user_id UUID;
  v_amount NUMERIC;
  v_status contribution_status;
  v_confirm_count INTEGER;
  v_threshold INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get contribution info
  SELECT user_id, amount_suggested, status INTO v_contribution_user_id, v_amount, v_status
  FROM contributions WHERE id = p_contribution_id;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'This contribution is no longer pending';
  END IF;

  IF v_user_id = v_contribution_user_id THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Record confirmation
  INSERT INTO contribution_confirmations (contribution_id, user_id)
  VALUES (p_contribution_id, v_user_id);

  -- 3. Check threshold
  SELECT COUNT(*)::INTEGER INTO v_confirm_count
  FROM contribution_confirmations
  WHERE contribution_id = p_contribution_id;

  -- Get setting
  SELECT (value->>0)::INTEGER INTO v_threshold
  FROM governance_settings
  WHERE key = 'min_contribution_confirmations';

  -- 4. Trigger payout if reached
  IF v_confirm_count >= v_threshold THEN
    -- Update status
    UPDATE contributions SET status = 'completed', updated_at = NOW()
    WHERE id = p_contribution_id;

    -- Execute internal minting (reusing logic from admin_mint_currency)
    UPDATE wallets SET balance = balance + v_amount, updated_at = NOW()
    WHERE profile_id = v_contribution_user_id;

    -- Log transaction (Treasury -> User)
    INSERT INTO transactions (from_id, to_id, amount, description)
    VALUES (NULL, v_contribution_user_id, v_amount, 'Automated payout for validated contribution: ' || p_contribution_id);
    
    RETURN jsonb_build_object('success', TRUE, 'payout_executed', TRUE, 'current_confirmations', v_confirm_count);
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'payout_executed', FALSE, 'current_confirmations', v_confirm_count);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You have already confirmed this work');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
-- Migration: Create activity_logs table
-- Purpose: Store user activity history for audit and timeline features

-- Create the ENUM for action types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_action_type') THEN
        CREATE TYPE activity_action_type AS ENUM ('auth', 'vote', 'task', 'document', 'profile_update');
    END IF;
END $$;

-- Create the activity_logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type activity_action_type NOT NULL,
    description JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own logs
CREATE POLICY "Users can view their own activity logs"
    ON public.activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all logs
CREATE POLICY "Admins can view all activity logs"
    ON public.activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
-- Create discussion_topics table
CREATE TABLE discussion_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL,
  content JSONB NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- Create comments table
CREATE TABLE topic_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES discussion_topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE topic_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES discussion_topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  option TEXT NOT NULL CHECK (option IN ('yes', 'no', 'abstain')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE discussion_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_votes ENABLE ROW LEVEL SECURITY;

-- Policies for discussion_topics
-- Everyone can view topics
CREATE POLICY "Topics are viewable by authenticated users" ON discussion_topics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert topics
CREATE POLICY "Only admins can insert topics" ON discussion_topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update topics
CREATE POLICY "Only admins can update topics" ON discussion_topics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for topic_comments
-- Everyone can view comments
CREATE POLICY "Comments are viewable by authenticated users" ON topic_comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments" ON topic_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for topic_votes
-- Everyone can view votes
CREATE POLICY "Votes are viewable by authenticated users" ON topic_votes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can insert their own vote
CREATE POLICY "Users can insert their own vote" ON topic_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own vote (if needed, but usually vote is final. Let's allow update for now or stick to insert only)
-- The unique constraint already prevents multiple inserts.

-- Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE discussion_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE topic_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE topic_votes;
-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Set up Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for push_subscriptions
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own push subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete their own push subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all push subscriptions" ON push_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Realtime replication (not strictly necessary for this table but good practice if we want to monitor)
ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;
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
-- Migration: Implement Unified Activities Framework
-- Follows openspec/changes/user-surreal-digital-currency-wallet/framework-design.md

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- 1. Enums
DO $$ BEGIN
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_status') THEN
            CREATE TYPE activity_status AS ENUM ('open', 'in_progress', 'pending_validation', 'completed', 'rejected');
        END IF;
    END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
            CREATE TYPE activity_type AS ENUM ('task', 'contribution');
        END IF;
    END $$;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'validation_method') THEN
            CREATE TYPE validation_method AS ENUM ('requester_approval', 'community_consensus');
        END IF;
    END $$;
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
-- Migration: Activity RPC Functions for Gift Economy
-- Follows openspec/changes/user-surreal-digital-currency-wallet/framework-design.md

-- 1. Execute Currency Transfer (Internal helper)
CREATE OR REPLACE FUNCTION execute_currency_transfer(
  p_from_wallet UUID, -- profile_id or NULL for Treasury
  p_to_wallet UUID,   -- profile_id
  p_amount NUMERIC,
  p_activity_id UUID,
  p_type TEXT DEFAULT 'reward'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Update recipient balance
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_to_wallet;

  -- 2. Update sender balance (if not treasury)
  IF p_from_wallet IS NOT NULL THEN
    UPDATE wallets SET balance = balance - p_amount, updated_at = NOW()
    WHERE profile_id = p_from_wallet;
    
    -- Check for negative balance
    IF EXISTS (SELECT 1 FROM wallets WHERE profile_id = p_from_wallet AND balance < 0) THEN
      RAISE EXCEPTION 'Insufficient balance in source wallet';
    END IF;
  END IF;

  -- 3. Log to ledger (transactions table)
  INSERT INTO transactions (from_id, to_id, amount, description)
  VALUES (p_from_wallet, p_to_wallet, p_amount, 'Activity reward: ' || p_activity_id);
END;
$$;

-- 2. Process Activity Validation (Social or Requester)
CREATE OR REPLACE FUNCTION confirm_activity(
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_activity RECORD;
  v_confirm_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get activity info
  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id FOR UPDATE;

  IF v_activity.status != 'pending_validation' THEN
    RAISE EXCEPTION 'Activity is not pending validation';
  END IF;

  IF v_user_id = v_activity.worker_id THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Logic based on validation method
  IF v_activity.validation_method = 'requester_approval' THEN
    IF v_user_id != v_activity.requester_id THEN
      RAISE EXCEPTION 'Only the requester can approve this activity';
    END IF;
    
    -- Approve and payout
    UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
    PERFORM execute_currency_transfer(v_activity.requester_id, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
    
    RETURN jsonb_build_object('success', TRUE, 'completed', TRUE);
  
  ELSIF v_activity.validation_method = 'community_consensus' THEN
    -- Record confirmation
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id);
    
    -- Check threshold
    SELECT COUNT(*)::INTEGER INTO v_confirm_count FROM activity_confirmations WHERE activity_id = p_activity_id;
    
    IF v_confirm_count >= v_activity.min_confirmations THEN
       UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;
       -- Payout from Treasury (NULL)
       PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
       RETURN jsonb_build_object('success', TRUE, 'completed', TRUE, 'confirmations', v_confirm_count);
    END IF;
    
    RETURN jsonb_build_object('success', TRUE, 'completed', FALSE, 'confirmations', v_confirm_count);
  END IF;

  RETURN jsonb_build_object('success', FALSE, 'error', 'Unknown validation method');
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You have already confirmed this activity');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
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
-- Migration: Add activity_id to transactions and convert topic_comments to JSONB
-- Date: 2026-04-10

-- 1. Update transactions table
ALTER TABLE transactions 
ADD COLUMN activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_activity_id ON transactions(activity_id);

-- 2. Update topic_comments table
-- 2.1 Rename old column
ALTER TABLE topic_comments RENAME COLUMN content TO content_old;

-- 2.2 Add new JSONB column
ALTER TABLE topic_comments ADD COLUMN content JSONB;

-- 2.3 Migrate data (wrapping old text in i18n object)
UPDATE topic_comments 
SET content = jsonb_build_object('pt', content_old, 'en', content_old)
WHERE content_old IS NOT NULL;

-- 2.4 Set constraints
ALTER TABLE topic_comments ALTER COLUMN content SET NOT NULL;

-- 2.5 (Optional) Drop old column or keep for safety?
-- We'll keep it for now but it's considered deprecated.
-- Migration: Update execute_currency_transfer to use activity_id
-- Date: 2026-04-10

CREATE OR REPLACE FUNCTION execute_currency_transfer(
  p_from_wallet UUID, -- profile_id or NULL for Treasury
  p_to_wallet UUID,   -- profile_id
  p_amount NUMERIC,
  p_activity_id UUID,
  p_type TEXT DEFAULT 'reward'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Update recipient balance
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE profile_id = p_to_wallet;

  -- 2. Update sender balance (if not treasury)
  IF p_from_wallet IS NOT NULL THEN
    UPDATE wallets SET balance = balance - p_amount, updated_at = NOW()
    WHERE profile_id = p_from_wallet;
    
    -- Check for negative balance
    IF EXISTS (SELECT 1 FROM wallets WHERE profile_id = p_from_wallet AND balance < 0) THEN
      RAISE EXCEPTION 'Insufficient balance in source wallet';
    END IF;
  END IF;

  -- 3. Log to ledger (transactions table)
  -- Now using the dedicated activity_id column
  INSERT INTO transactions (from_id, to_id, amount, description, activity_id)
  VALUES (p_from_wallet, p_to_wallet, p_amount, 'Activity reward: ' || p_activity_id, p_activity_id);
END;
$$;
-- Migration: Create submit_activity RPC to support i18n and unified activities
-- Date: 2026-04-10

CREATE OR REPLACE FUNCTION submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL, -- beneficiary_id in contributions context
  p_validation_method validation_method DEFAULT 'community_consensus'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO activities (
    title, 
    description, 
    reward_amount, 
    type,
    requester_id, 
    worker_id, 
    status,
    validation_method
  )
  VALUES (
    p_title, 
    p_description, 
    p_reward_amount, 
    'contribution'::activity_type,
    p_requester_id, 
    auth.uid(), 
    'pending_validation'::activity_status,
    p_validation_method
  )
  RETURNING id INTO v_new_id;

  -- Log evidence immediately
  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, auth.uid(), p_evidence_url);
  
  RETURN v_new_id;
END;
$$;
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
-- Migration: Create notifications table and hub infrastructure
-- Date: 2026-04-10

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title JSONB NOT NULL,
  message JSONB NOT NULL,
  type TEXT NOT NULL DEFAULT 'system', -- system, vote, task, social, finance
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- 3. RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- 4. Helper Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title JSONB,
  p_message JSONB,
  p_type TEXT DEFAULT 'system',
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notif_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (p_user_id, p_title, p_message, p_type, p_link)
  RETURNING id INTO v_notif_id;
  
  RETURN v_notif_id;
END;
$$;

-- 5. Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- Migration: Notification Security Hardening
-- Date: 2026-04-10

-- 1. Restrict RPC access
REVOKE EXECUTE ON FUNCTION public.create_notification(UUID, JSONB, JSONB, TEXT, TEXT) FROM public, anon, authenticated;

-- 2. Trigger for comments
CREATE OR REPLACE FUNCTION public.fn_notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_topic_title JSONB;
  v_topic_owner UUID;
BEGIN
  -- Get topic info
  SELECT title, created_by INTO v_topic_title, v_topic_owner
  FROM public.discussion_topics
  WHERE id = NEW.topic_id;

  -- Notify topic owner if not the same person
  IF v_topic_owner IS NOT NULL AND v_topic_owner != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      v_topic_owner,
      jsonb_build_object('pt', 'Novo comentário', 'en', 'New comment'),
      jsonb_build_object(
        'pt', 'Alguém comentou na pauta: ' || (v_topic_title->>'pt'),
        'en', 'Someone commented on topic: ' || (v_topic_title->>'en')
      ),
      'social',
      '/voting/' || NEW.topic_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_comment ON public.topic_comments;
CREATE TRIGGER tr_notify_on_comment
AFTER INSERT ON public.topic_comments
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_comment();

-- 3. Trigger for activity updates (claim and validation)
CREATE OR REPLACE FUNCTION public.fn_notify_on_activity_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_worker_name TEXT;
  v_confirmer_name TEXT;
BEGIN
  -- 3.1 Task Claimed (worker_id changed from null to something)
  IF OLD.worker_id IS NULL AND NEW.worker_id IS NOT NULL AND NEW.requester_id IS NOT NULL THEN
    SELECT full_name INTO v_worker_name FROM public.profiles WHERE id = NEW.worker_id;
    
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.requester_id,
      jsonb_build_object('pt', 'Tarefa Assumida', 'en', 'Task Claimed'),
      jsonb_build_object(
        'pt', (COALESCE(v_worker_name, 'Alguém')) || ' assumiu sua tarefa: ' || NEW.title,
        'en', (COALESCE(v_worker_name, 'Someone')) || ' claimed your task: ' || NEW.title
      ),
      'task',
      '/work-wall'
    );
  END IF;

  -- 3.2 Work Confirmed (status changed to validated/completed)
  -- Note: This assumes a 'validated' or 'completed' status indicates confirmation
  -- Adjust status check if necessary
  IF OLD.status = 'pending_validation' AND NEW.status != 'pending_validation' AND NEW.worker_id IS NOT NULL THEN
    -- In this case, the current user (the one who updated the record) is the confirmer
    -- But since we are in a trigger, we don't easily know who that is unless we use auth.uid()
    SELECT full_name INTO v_confirmer_name FROM public.profiles WHERE id = auth.uid();

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.worker_id,
      jsonb_build_object('pt', 'Trabalho Confirmado', 'en', 'Work Confirmed'),
      jsonb_build_object(
        'pt', (COALESCE(v_confirmer_name, 'Alguém')) || ' confirmou seu trabalho: ' || NEW.title,
        'en', (COALESCE(v_confirmer_name, 'Someone')) || ' confirmed your work: ' || NEW.title
      ),
      'task',
      '/wallet'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_activity_update ON public.activities;
CREATE TRIGGER tr_notify_on_activity_update
AFTER UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_activity_update();
-- Migration: Add audit logging for contribution payouts
-- Date: 2026-04-24

-- Helper function to log activity from PL/pgSQL
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action_type activity_action_type,
  p_description JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action_type, description)
  VALUES (p_user_id, p_action_type, p_description);
END;
$$;

-- Update confirm_contribution to log when a payout happens
CREATE OR REPLACE FUNCTION confirm_contribution(
  p_contribution_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_contribution_user_id UUID;
  v_amount NUMERIC;
  v_status contribution_status;
  v_confirm_count INTEGER;
  v_threshold INTEGER;
  v_desc_text TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get contribution info
  SELECT user_id, amount_suggested, status, description 
  INTO v_contribution_user_id, v_amount, v_status, v_desc_text
  FROM contributions WHERE id = p_contribution_id;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'This contribution is no longer pending';
  END IF;

  IF v_user_id = v_contribution_user_id THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Record confirmation
  INSERT INTO contribution_confirmations (contribution_id, user_id)
  VALUES (p_contribution_id, v_user_id);

  -- 3. Check threshold
  SELECT COUNT(*)::INTEGER INTO v_confirm_count
  FROM contribution_confirmations
  WHERE contribution_id = p_contribution_id;

  -- Get setting
  SELECT (value->>0)::INTEGER INTO v_threshold
  FROM governance_settings
  WHERE key = 'min_contribution_confirmations';

  -- 4. Trigger payout if reached
  IF v_confirm_count >= v_threshold THEN
    -- Update status
    UPDATE contributions SET status = 'completed', updated_at = NOW()
    WHERE id = p_contribution_id;

    -- Execute internal minting
    UPDATE wallets SET balance = balance + v_amount, updated_at = NOW()
    WHERE profile_id = v_contribution_user_id;

    -- Log transaction
    INSERT INTO transactions (from_id, to_id, amount, description)
    VALUES (NULL, v_contribution_user_id, v_amount, 'Automated payout for validated contribution: ' || p_contribution_id);
    
    -- LOG ACTIVITY for the recipient (Task completed/rewarded)
    PERFORM log_user_activity(
      v_contribution_user_id,
      'task',
      jsonb_build_object(
        'pt', 'Pagamento automático recebido por: ' || v_desc_text,
        'en', 'Automated payout received for: ' || v_desc_text
      )
    );

    -- LOG ACTIVITY for the validator (Audit trail)
    PERFORM log_user_activity(
      v_user_id,
      'vote',
      jsonb_build_object(
        'pt', 'Você forneceu a validação final para: ' || v_desc_text,
        'en', 'You provided the final validation for: ' || v_desc_text
      )
    );
    
    RETURN jsonb_build_object('success', TRUE, 'payout_executed', TRUE, 'current_confirmations', v_confirm_count);
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'payout_executed', FALSE, 'current_confirmations', v_confirm_count);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You have already confirmed this work');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
-- Migration: Platform Evolution Core
-- Date: 2026-04-25

-- 1. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can read audit logs
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 2. Payout Lock Logic
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ;

-- Update existing activities to be available now
UPDATE public.activities SET available_at = created_at WHERE available_at IS NULL;

-- 3. Balance Calculation View or Function
-- We'll create a function to get "Available Balance"
CREATE OR REPLACE FUNCTION public.get_available_balance(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_credits NUMERIC;
  v_pending_credits NUMERIC;
BEGIN
  -- This is a placeholder logic. You should adapt it to your actual transaction/wallet schema.
  -- For now, let's assume we sum payouts from activities where available_at <= now()
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_credits
  FROM public.activities
  WHERE worker_id = p_user_id AND status = 'completed'; -- Adjust status as needed

  SELECT COALESCE(SUM(reward_amount), 0) INTO v_pending_credits
  FROM public.activities
  WHERE worker_id = p_user_id AND status = 'completed' AND available_at > now();

  RETURN v_total_credits - v_pending_credits;
END;
$$;

-- 4. Audit Triggers
CREATE OR REPLACE FUNCTION public.fn_audit_critical_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, old_data, new_data)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
    RETURN NEW;
END;
$$;

-- Apply audit to sensitive tables
DROP TRIGGER IF EXISTS tr_audit_wallets ON public.wallets;
CREATE TRIGGER tr_audit_wallets
AFTER UPDATE ON public.wallets
FOR EACH ROW WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
EXECUTE FUNCTION public.fn_audit_critical_changes();

DROP TRIGGER IF EXISTS tr_audit_activities ON public.activities;
CREATE TRIGGER tr_audit_activities
AFTER UPDATE ON public.activities
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_audit_critical_changes();

DROP TRIGGER IF EXISTS tr_audit_profiles ON public.profiles;
CREATE TRIGGER tr_audit_profiles
AFTER UPDATE ON public.profiles
FOR EACH ROW WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.fn_audit_critical_changes();

-- 5. Trigger to set available_at on task confirmation
CREATE OR REPLACE FUNCTION public.fn_set_payout_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When task moves to a 'confirmed' state, set available_at to 24h from now
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        NEW.available_at := now() + interval '24 hours';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_payout_lock ON public.activities;
CREATE TRIGGER tr_set_payout_lock
BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.fn_set_payout_lock();
-- Migration: Unified Wallet Ledger
-- Date: 2026-04-26

-- 1. Ledger Entries Table
-- 1a. Relax wallets balance constraint to allow system wallets to be negative (double-entry source)
DO $$ 
BEGIN 
    -- Drop any existing balance check constraints to allow ledger-managed balances
    EXECUTE (
        SELECT 'ALTER TABLE public.wallets DROP CONSTRAINT ' || quote_ident(conname)
        FROM pg_constraint 
        WHERE conrelid = 'public.wallets'::regclass 
        AND contype = 'c' 
        AND (conname LIKE '%balance%' OR pg_get_constraintdef(oid) LIKE '%balance%')
    );
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'No balance constraint found to drop or error occurred';
END $$;

ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_check CHECK (profile_id IS NULL OR balance >= 0);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL, -- Positive for Credit, Negative for Debit
    reference_type TEXT NOT NULL, -- 'activity', 'transfer', 'fee', 'mint'
    reference_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indices for performance
CREATE INDEX IF NOT EXISTS idx_ledger_wallet_id ON public.ledger_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference_id ON public.ledger_entries(reference_id);

-- 3. System Wallets Initialization
-- Allowing NULL profile_id for system accounts (like Treasury)
ALTER TABLE public.wallets ALTER COLUMN profile_id DROP NOT NULL;

DO $$
DECLARE
    v_treasury_wallet_id UUID;
BEGIN
    -- Create Treasury Wallet with NULL profile_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE profile_id IS NULL) THEN
        INSERT INTO public.wallets (profile_id, balance)
        VALUES (NULL, 1000000) -- Initial Treasury Balance
        RETURNING id INTO v_treasury_wallet_id;
    END IF;
END $$;

-- 4. Double-Entry Recording Function
CREATE OR REPLACE FUNCTION public.fn_record_ledger_entry(
    p_from_wallet_id UUID,
    p_to_wallet_id UUID,
    p_amount NUMERIC(15, 2),
    p_type TEXT,
    p_ref_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Debit from source
    IF p_from_wallet_id IS NOT NULL THEN
        INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id)
        VALUES (p_from_wallet_id, -p_amount, p_type, p_ref_id);
    END IF;

    -- Credit to destination
    IF p_to_wallet_id IS NOT NULL THEN
        INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id)
        VALUES (p_to_wallet_id, p_amount, p_type, p_ref_id);
    END IF;
END;
$$;

-- 5. Trigger to Sync Materialized Balance
CREATE OR REPLACE FUNCTION public.fn_sync_wallet_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.wallets
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_wallet_balance ON public.ledger_entries;
CREATE TRIGGER tr_sync_wallet_balance
AFTER INSERT ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_wallet_balance();

-- 6. Refactored perform_transfer RPC
CREATE OR REPLACE FUNCTION public.perform_transfer(
  p_to_id UUID,
  p_amount NUMERIC(15, 2),
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_id UUID;
  v_from_wallet_id UUID;
  v_to_wallet_id UUID;
  v_from_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  v_from_id := auth.uid();
  
  -- 1. Basic validation
  IF v_from_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF p_to_id = v_from_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  -- 2. Get and lock wallets
  SELECT id, balance INTO v_from_wallet_id, v_from_balance
  FROM public.wallets
  WHERE profile_id = v_from_id
  FOR UPDATE;

  SELECT id INTO v_to_wallet_id
  FROM public.wallets
  WHERE profile_id = p_to_id
  FOR UPDATE;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Log legacy transaction for UI compatibility
  INSERT INTO public.transactions (from_id, to_id, amount, description)
  VALUES (v_from_id, p_to_id, p_amount, p_description)
  RETURNING id INTO v_transaction_id;

  -- 4. Record in Ledger (Trigger will update balances)
  PERFORM public.fn_record_ledger_entry(
      v_from_wallet_id,
      v_to_wallet_id,
      p_amount,
      'transfer',
      v_transaction_id
  );

  RETURN jsonb_build_object('success', TRUE, 'new_balance', v_from_balance - p_amount);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- 7. Historical Data Migration (Task 3.1)
DO $$
DECLARE
    v_treasury_wallet_id UUID;
BEGIN
    -- Find Treasury Wallet
    SELECT id INTO v_treasury_wallet_id FROM public.wallets WHERE profile_id IS NULL LIMIT 1;

    -- 7a. Disable balance sync trigger during migration
    ALTER TABLE public.ledger_entries DISABLE TRIGGER tr_sync_wallet_balance;
    ALTER TABLE public.wallets DISABLE TRIGGER tr_prevent_direct_balance_update;

    -- 7b. Migrate Transactions (Double Entry)
    -- From non-system wallets
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        w_from.id as wallet_id,
        -t.amount as amount,
        'transfer' as reference_type,
        t.id as reference_id,
        t.created_at
    FROM public.transactions t
    JOIN public.wallets w_from ON w_from.profile_id = t.from_id
    WHERE t.from_id IS NOT NULL;

    -- From Treasury (where from_id IS NULL)
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        v_treasury_wallet_id,
        -t.amount as amount,
        'transfer' as reference_type,
        t.id as reference_id,
        t.created_at
    FROM public.transactions t
    WHERE t.from_id IS NULL;

    -- Credit destinations
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        w_to.id as wallet_id,
        t.amount as amount,
        'transfer' as reference_type,
        t.id as reference_id,
        t.created_at
    FROM public.transactions t
    JOIN public.wallets w_to ON w_to.profile_id = t.to_id;

    -- 7c. Migrate Activities (Rewards from Treasury to Worker)
    -- Debit Treasury
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        v_treasury_wallet_id,
        -reward_amount,
        'activity',
        id,
        created_at
    FROM public.activities
    WHERE status = 'completed';

    -- Credit Worker
    INSERT INTO public.ledger_entries (wallet_id, amount, reference_type, reference_id, created_at)
    SELECT 
        w.id,
        a.reward_amount,
        'activity',
        a.id,
        a.created_at
    FROM public.activities a
    JOIN public.wallets w ON w.profile_id = a.worker_id
    WHERE a.status = 'completed';

    -- 7d. Reset Balances and Re-calculate from Ledger
    UPDATE public.wallets w
    SET balance = COALESCE((
        SELECT SUM(amount)
        FROM public.ledger_entries
        WHERE wallet_id = w.id
    ), 0);

    -- 7e. Re-enable triggers
    ALTER TABLE public.ledger_entries ENABLE TRIGGER tr_sync_wallet_balance;
    ALTER TABLE public.wallets ENABLE TRIGGER tr_prevent_direct_balance_update;
END $$;

-- 8. Reconciliation Service (Task 3.2)
CREATE OR REPLACE FUNCTION public.verify_ledger_integrity()
RETURNS TABLE (
    wallet_id UUID,
    profile_id UUID,
    materialized_balance NUMERIC,
    ledger_sum NUMERIC,
    discrepancy NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.profile_id,
        w.balance,
        COALESCE(SUM(l.amount), 0) as ledger_sum,
        w.balance - COALESCE(SUM(l.amount), 0) as discrepancy
    FROM public.wallets w
    LEFT JOIN public.ledger_entries l ON l.wallet_id = w.id
    GROUP BY w.id, w.profile_id, w.balance
    HAVING w.balance != COALESCE(SUM(l.amount), 0);
END;
$$;

-- 9. Balance Protection Trigger (Task 4.2)
CREATE OR REPLACE FUNCTION public.fn_prevent_direct_balance_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the update is coming from our sync function
    -- We use a session variable to flag authorized updates
    IF current_setting('app.authorized_ledger_sync', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF OLD.balance IS DISTINCT FROM NEW.balance THEN
        RAISE EXCEPTION 'Direct balance updates are forbidden. Use the ledger system.';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_direct_balance_update ON public.wallets;
CREATE TRIGGER tr_prevent_direct_balance_update
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_direct_balance_update();

-- Update sync function to set the flag
CREATE OR REPLACE FUNCTION public.fn_sync_wallet_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.authorized_ledger_sync', 'on', true);
    
    UPDATE public.wallets
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
    
    PERFORM set_config('app.authorized_ledger_sync', 'off', true);
    
    RETURN NEW;
END;
$$;
-- Validation Script: Unified Wallet Ledger
-- Test Group 4

DO $$
DECLARE
    v_test_worker_id UUID;
    v_test_wallet_id UUID;
    v_test_activity_id UUID;
    v_initial_balance NUMERIC;
    v_final_balance NUMERIC;
    v_treasury_wallet_id UUID;
BEGIN
    -- 1. Setup Test Data
    -- Find a worker
    SELECT id INTO v_test_worker_id FROM public.profiles WHERE role = 'member' LIMIT 1;
    SELECT id, balance INTO v_test_wallet_id, v_initial_balance FROM public.wallets WHERE profile_id = v_test_worker_id;
    SELECT id INTO v_treasury_wallet_id FROM public.wallets WHERE profile_id IS NULL;

    RAISE NOTICE 'Initial Balance: %', v_initial_balance;

    -- 2. Simulate Payout (Task 4.1)
    -- Create dummy activity
    INSERT INTO public.activities (worker_id, title, description, type, status, reward_amount)
    VALUES (
        v_test_worker_id, 
        '{"pt": "Teste de Ledger", "en": "Ledger Test"}'::jsonb, 
        '{"pt": "Descrição de teste", "en": "Test description"}'::jsonb,
        'task'::activity_type,
        'completed', 
        50.00
    )
    RETURNING id INTO v_test_activity_id;

    -- Record in Ledger (Debit Treasury, Credit Worker)
    PERFORM public.fn_record_ledger_entry(
        v_treasury_wallet_id,
        v_test_wallet_id,
        50.00,
        'activity',
        v_test_activity_id
    );

    -- Check final balance
    SELECT balance INTO v_final_balance FROM public.wallets WHERE id = v_test_wallet_id;
    RAISE NOTICE 'Final Balance: %', v_final_balance;

    IF v_final_balance != v_initial_balance + 50.00 THEN
        RAISE EXCEPTION 'Balance mismatch! Expected %, got %', v_initial_balance + 50.00, v_final_balance;
    END IF;

    RAISE NOTICE 'Payout cycle test passed!';

    -- 3. Check Ledger Integrity (Task 4.3)
    IF EXISTS (SELECT 1 FROM public.verify_ledger_integrity()) THEN
        RAISE EXCEPTION 'Ledger integrity failed after test payout!';
    END IF;

    RAISE NOTICE 'Integrity check passed!';

END $$;
-- Migration: Implement Audit Log Partitioning
-- Date: 2026-04-26
-- Purpose: Move activity_logs to a partitioned audit_logs structure with automated maintenance.

-- 1. Create the new partitioned table
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type activity_action_type NOT NULL,
    description JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. Create archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- 3. Helper function to create a partition
CREATE OR REPLACE FUNCTION public.create_audit_partition(p_date DATE)
RETURNS VOID AS $$
DECLARE
    v_partition_name TEXT;
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := date_trunc('month', p_date);
    v_end_date := v_start_date + interval '1 month';
    v_partition_name := 'audit_logs_' || to_char(v_start_date, 'YYYY_MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.audit_logs FOR VALUES FROM (%L) TO (%L)',
        v_partition_name, v_start_date, v_end_date
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Pre-create partitions (Last 12 months + next 2 months)
DO $$
DECLARE
    v_date DATE;
BEGIN
    FOR i IN -12..2 LOOP
        v_date := date_trunc('month', now()) + (i || ' month')::interval;
        PERFORM public.create_audit_partition(v_date);
    END LOOP;
END $$;

-- 5. Migrate data from activity_logs to audit_logs
INSERT INTO public.audit_logs (id, user_id, action_type, description, ip_address, created_at)
SELECT id, user_id, action_type, description, ip_address, created_at
FROM public.activity_logs;

-- 6. Maintenance Functions
-- 6.1 manage_audit_partitions(): Creates partitions for next month
CREATE OR REPLACE FUNCTION public.manage_audit_partitions()
RETURNS VOID AS $$
BEGIN
    PERFORM public.create_audit_partition(date_trunc('month', now()) + interval '1 month');
    PERFORM public.create_audit_partition(date_trunc('month', now()) + interval '2 months');
END;
$$ LANGUAGE plpgsql;

-- 6.2 archive_old_audit_logs(): Moves partitions older than 12 months to archive schema
CREATE OR REPLACE FUNCTION public.archive_old_audit_logs()
RETURNS VOID AS $$
DECLARE
    v_partition_to_archive TEXT;
    v_oldest_date DATE;
BEGIN
    v_oldest_date := date_trunc('month', now()) - interval '13 months';
    v_partition_to_archive := 'audit_logs_' || to_char(v_oldest_date, 'YYYY_MM');
    
    -- Check if table exists in public schema
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = v_partition_to_archive) THEN
        -- Move to archive schema
        EXECUTE format('ALTER TABLE public.%I SET SCHEMA archive', v_partition_to_archive);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Unified View (Task 3.1)
-- This view will need to be updated when new partitions are archived.
-- For now, we create it dynamically or as a union of all tables in both schemas that follow the pattern.
CREATE OR REPLACE VIEW public.vw_audit_logs_all AS
SELECT * FROM public.audit_logs;
-- Note: A more complex view using dynamic SQL or pg_cron to update its definition 
-- could be used to include archived partitions automatically.

-- 8. Update log_user_activity function
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action_type activity_action_type,
  p_description JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action_type, description)
  VALUES (p_user_id, p_action_type, p_description);
END;
$$;

-- 9. Cleanup and RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Rename old table instead of dropping
ALTER TABLE IF EXISTS public.activity_logs RENAME TO activity_logs_old;

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at_desc ON public.audit_logs(created_at DESC);

-- 10. Scheduling with pg_cron (Task 2.3)
-- Ensure pg_cron is enabled in your Supabase dashboard (Database -> Extensions)
-- SELECT cron.schedule('manage-audit-partitions', '0 0 1 * *', 'SELECT public.manage_audit_partitions()');
-- SELECT cron.schedule('archive-old-audit-logs', '0 5 1 * *', 'SELECT public.archive_old_audit_logs()');
-- Migration: Governance Flex Policy
-- Date: 2026-04-26
-- Purpose: Implement variable payout locks and manual audit requirements.

-- 1. Create governance_policies table
CREATE TABLE IF NOT EXISTS public.governance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'task', 'contribution'
    min_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    lock_hours INTEGER NOT NULL DEFAULT 24,
    requires_manual_audit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add columns to activities for audit tracking
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS requires_audit BOOLEAN DEFAULT FALSE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT 'approved' CHECK (audit_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS auditor_id UUID REFERENCES public.profiles(id);

-- 3. Initial Policies
-- We use a TRUNCATE to ensure we start fresh if re-run
TRUNCATE public.governance_policies;
INSERT INTO public.governance_policies (category, min_amount, lock_hours, requires_manual_audit)
VALUES 
    ('task', 0, 24, FALSE),            -- Standard tasks: 24h lock, no audit
    ('task', 500, 48, TRUE),           -- High value tasks: 48h lock, needs audit
    ('contribution', 0, 24, FALSE),    -- Standard contributions: 24h lock
    ('contribution', 1000, 72, TRUE);  -- High value contributions: 72h lock, needs audit

-- 4. Update fn_set_payout_lock to use dynamic policies
CREATE OR REPLACE FUNCTION public.fn_set_payout_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_policy RECORD;
BEGIN
    -- When task moves to a 'completed' state
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Find the best matching policy (highest min_amount that is <= reward_amount)
        SELECT * INTO v_policy
        FROM public.governance_policies
        WHERE category = NEW.type::TEXT
          AND min_amount <= NEW.reward_amount
        ORDER BY min_amount DESC
        LIMIT 1;

        IF v_policy IS NOT NULL THEN
            NEW.available_at := now() + (v_policy.lock_hours || ' hours')::interval;
            NEW.requires_audit := v_policy.requires_manual_audit;
        ELSE
            -- Fallback to default
            NEW.available_at := now() + interval '24 hours';
            NEW.requires_audit := FALSE;
        END IF;
        
        -- Set audit status
        IF NEW.requires_audit THEN
            NEW.audit_status := 'pending';
        ELSE
            NEW.audit_status := 'approved';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Update get_available_balance to respect audit status
CREATE OR REPLACE FUNCTION public.get_available_balance(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_credits NUMERIC;
  v_pending_credits NUMERIC;
BEGIN
  -- Sum all completed rewards
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_credits
  FROM public.activities
  WHERE worker_id = p_user_id AND status = 'completed';

  -- Subtract rewards that are still locked by time OR pending audit
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_pending_credits
  FROM public.activities
  WHERE worker_id = p_user_id 
    AND status = 'completed' 
    AND (
      available_at > now() 
      OR (requires_audit = TRUE AND audit_status = 'pending')
    );

  RETURN v_total_credits - v_pending_credits;
END;
$$;

-- 6. RPC approve_payout(activity_id, status)
CREATE OR REPLACE FUNCTION public.approve_payout(p_activity_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve payouts';
    END IF;

    IF p_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Invalid status. Use approved or rejected.';
    END IF;

    UPDATE public.activities
    SET 
        audit_status = p_status,
        auditor_id = auth.uid(),
        updated_at = now()
    WHERE id = p_activity_id;
    
    -- Log to audit_logs
    PERFORM public.log_user_activity(
        auth.uid(),
        'profile_update', -- Using an existing action type
        jsonb_build_object(
            'action', 'payout_audit',
            'activity_id', p_activity_id,
            'status', p_status,
            'pt', 'Auditoria de payout: ' || p_status || ' para atividade ' || p_activity_id,
            'en', 'Payout audit: ' || p_status || ' for activity ' || p_activity_id
        )
    );
END;
$$;

-- Enable RLS on governance_policies
ALTER TABLE public.governance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Policies viewable by authenticated users" ON public.governance_policies
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only admins can modify policies" ON public.governance_policies
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
-- Migration: Unify Audit and Activity Logs
-- Date: 2026-04-26
-- Purpose: Unify activity_logs and audit_logs into a single partitioned table and restore triggers.

-- 1. Update audit_logs table schema (partitioned)
-- Drop dependent view first to allow schema changes
DROP VIEW IF EXISTS public.vw_audit_logs_all;

-- Rename columns to match platform evolution audit style but keep activity functionality
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN user_id TO actor_id;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action_type') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN action_type TO action;
        -- Change to TEXT for flexibility
        ALTER TABLE public.audit_logs ALTER COLUMN action TYPE TEXT;
    END IF;
END $$;

-- Add missing columns from platform evolution
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS old_data JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS new_data JSONB;

-- 2. Update log_user_activity function to use unified columns
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_action_type TEXT,
    p_description JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, description, metadata)
    VALUES (p_user_id, p_action_type, p_description, p_metadata);
END;
$$;

-- 3. Restore Platform Evolution Audit Triggers
CREATE OR REPLACE FUNCTION public.fn_audit_critical_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, old_data, new_data, description)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END,
        jsonb_build_object(
            'pt', 'Alteração em ' || TG_TABLE_NAME,
            'en', 'Change in ' || TG_TABLE_NAME
        )
    );
    RETURN NEW;
END;
$$;

-- Re-apply triggers to critical tables
DROP TRIGGER IF EXISTS tr_audit_wallets ON public.wallets;
CREATE TRIGGER tr_audit_wallets
AFTER UPDATE ON public.wallets
FOR EACH ROW WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
EXECUTE FUNCTION public.fn_audit_critical_changes();

DROP TRIGGER IF EXISTS tr_audit_activities ON public.activities;
CREATE TRIGGER tr_audit_activities
AFTER UPDATE ON public.activities
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_audit_critical_changes();

DROP TRIGGER IF EXISTS tr_audit_profiles ON public.profiles;
CREATE TRIGGER tr_audit_profiles
AFTER UPDATE ON public.profiles
FOR EACH ROW WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.fn_audit_critical_changes();

-- 4. Unified RLS policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Update View
CREATE OR REPLACE VIEW public.vw_audit_logs_all AS
SELECT * FROM public.audit_logs;
-- Migration: Add partitions for 2026 and index for performance
-- Date: 2026-04-26
-- Purpose: Ensure the partitioned table has partitions for the current year (2026) and improve query performance.

-- 1. Create partitions for 2026
DO $$ 
DECLARE
    v_date DATE;
BEGIN
    -- Start from January 2026 up to December 2026
    v_date := '2026-01-01'::date;
    LOOP
        PERFORM public.create_audit_partition(v_date);
        v_date := v_date + interval '1 month';
        EXIT WHEN v_date > '2026-12-01'::date;
    END LOOP;
END $$;

-- 2. Add index on actor_id (essential for partitioning performance and filtering)
-- Note: Indexes on partitioned tables are automatically created on all existing and future partitions in PostgreSQL 11+
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs (actor_id);

-- 3. Also add index on action for filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

-- 4. Re-verify log_user_activity to handle potential failures gracefully
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_action_type TEXT,
    p_description JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Use a sub-transaction or just a direct insert
    -- If a partition is missing, this will fail, but we've added partitions for 2026 now
    INSERT INTO public.audit_logs (actor_id, action, description, metadata)
    VALUES (p_user_id, p_action_type, p_description, p_metadata);
EXCEPTION WHEN OTHERS THEN
    -- Log error to Postgres log but don't crash the calling transaction if possible
    -- However, for activity logs we usually want to know if it fails.
    RAISE NOTICE 'Failed to log activity for user %: %', p_user_id, SQLERRM;
END;
$$;
-- Migration: Add metadata column to audit_logs
-- Date: 2026-04-25
-- Purpose: Fix missing metadata column in unified audit logs table to prevent 400 errors.

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Ensure the view is also updated
CREATE OR REPLACE VIEW public.vw_audit_logs_all AS
SELECT * FROM public.audit_logs;
