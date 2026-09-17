ALTER TABLE public.governance_settings
ADD COLUMN IF NOT EXISTS default_ai_model TEXT DEFAULT 'gemini-1.5-flash' NOT NULL;
