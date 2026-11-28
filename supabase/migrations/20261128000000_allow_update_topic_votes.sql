-- Permite que usuários autenticados atualizem seu próprio voto na tabela topic_votes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'topic_votes' 
    AND policyname = 'Users can update their own vote'
  ) THEN
    CREATE POLICY "Users can update their own vote" ON topic_votes
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
