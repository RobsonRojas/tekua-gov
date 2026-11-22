-- Adiciona updated_at na tabela topic_votes para suporte a updates/upserts
ALTER TABLE topic_votes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
