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
