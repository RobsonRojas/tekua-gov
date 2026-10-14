-- Migration: Add work_categories (áreas de atuação) and activities.category_id
-- Categorizes Work Wall items (demands, tasks, contributions) by area of practice.

-- 1. Reference table for work areas (áreas de atuação)
CREATE TABLE IF NOT EXISTS public.work_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS: public read access ("Areas are viewable by everyone")
ALTER TABLE public.work_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Areas are viewable by everyone" ON public.work_categories;
CREATE POLICY "Areas are viewable by everyone"
  ON public.work_categories
  FOR SELECT
  USING (true);

-- 3. Seed the initial areas
INSERT INTO public.work_categories (slug, name, sort_order) VALUES
  ('permacultura', '{"pt": "Permacultura", "en": "Permaculture"}'::jsonb, 10),
  ('tecnologia', '{"pt": "Tecnologia", "en": "Technology"}'::jsonb, 20),
  ('saude', '{"pt": "Saúde", "en": "Health"}'::jsonb, 30),
  ('educacao', '{"pt": "Educação", "en": "Education"}'::jsonb, 40),
  ('agricultura', '{"pt": "Agricultura", "en": "Agriculture"}'::jsonb, 50),
  ('cultura', '{"pt": "Cultura", "en": "Culture"}'::jsonb, 60),
  ('infraestrutura', '{"pt": "Infraestrutura", "en": "Infrastructure"}'::jsonb, 70),
  ('outros', '{"pt": "Outros", "en": "Other"}'::jsonb, 80)
ON CONFLICT (slug) DO NOTHING;

-- 4. Optional area on activities (one per item; NULL = "sem categoria")
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.work_categories(id) ON DELETE SET NULL;
