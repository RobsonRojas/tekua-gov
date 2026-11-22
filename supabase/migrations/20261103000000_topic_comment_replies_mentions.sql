-- Respostas e menções em comentários de pauta
ALTER TABLE topic_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES topic_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS mentioned_user_ids UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_topic_comments_parent_id ON topic_comments(parent_id);
