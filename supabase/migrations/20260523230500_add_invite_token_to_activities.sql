-- Add invite_token to activities table
ALTER TABLE activities ADD COLUMN invite_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create an index to quickly look up tasks by their invite token
CREATE INDEX IF NOT EXISTS activities_invite_token_idx ON activities(invite_token);
