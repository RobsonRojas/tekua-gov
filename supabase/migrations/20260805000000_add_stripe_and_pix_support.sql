-- Add fiat payment support for activities and Pix receiving details for profiles.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pix_key TEXT,
  ADD COLUMN IF NOT EXISTS pix_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS pix_holder_document TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_type TEXT;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS fiat_amount NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
