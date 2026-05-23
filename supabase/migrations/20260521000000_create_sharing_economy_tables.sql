-- 1.1 Create equipment_items table
CREATE TABLE equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hourly_rate_surreias NUMERIC NOT NULL CHECK (hourly_rate_surreias >= 0),
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment items are viewable by everyone if public and active" ON equipment_items
  FOR SELECT USING (is_public = true AND status = 'active');

CREATE POLICY "Owners can view their own items" ON equipment_items
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all items" ON equipment_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users can create items" ON equipment_items
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own items" ON equipment_items
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update items" ON equipment_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 1.2 Create equipment_questions and equipment_moderation_logs tables
CREATE TABLE equipment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES equipment_items(id) ON DELETE CASCADE NOT NULL,
  asker_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE equipment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone" ON equipment_questions
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can ask questions" ON equipment_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = asker_id);

CREATE POLICY "Owners can answer questions" ON equipment_questions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM equipment_items WHERE equipment_items.id = item_id AND equipment_items.owner_id = auth.uid())
  );

CREATE TABLE equipment_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES equipment_items(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  justification TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE equipment_moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation logs" ON equipment_moderation_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Owners can view moderation logs for their items" ON equipment_moderation_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM equipment_items WHERE equipment_items.id = item_id AND equipment_items.owner_id = auth.uid())
  );

CREATE POLICY "Admins can insert moderation logs" ON equipment_moderation_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 1.3 Create sharing_transactions table
CREATE TABLE sharing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES equipment_items(id) ON DELETE CASCADE NOT NULL,
  borrower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'completed', 'cancelled')),
  delivery_evidence_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_surreias NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sharing_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON sharing_transactions
  FOR SELECT USING (
    auth.uid() = borrower_id OR 
    EXISTS (SELECT 1 FROM equipment_items WHERE equipment_items.id = item_id AND equipment_items.owner_id = auth.uid())
  );

CREATE POLICY "Borrowers can insert transactions" ON sharing_transactions
  FOR INSERT WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Users can update their transactions" ON sharing_transactions
  FOR UPDATE USING (
    auth.uid() = borrower_id OR 
    EXISTS (SELECT 1 FROM equipment_items WHERE equipment_items.id = item_id AND equipment_items.owner_id = auth.uid())
  );

-- 1.4 Setup Supabase Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('handover-evidence', 'handover-evidence', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Evidence is viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'handover-evidence');

CREATE POLICY "Authenticated users can upload evidence" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'handover-evidence' AND auth.role() = 'authenticated');
