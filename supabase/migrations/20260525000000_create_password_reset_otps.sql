-- Create password_reset_otps table for storing single-use verification OTPs
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Disable Row Level Security so only the service_role key (Edge Functions) can access it
ALTER TABLE public.password_reset_otps DISABLE ROW LEVEL SECURITY;

-- Add index on email and otp for rapid lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_lookup ON public.password_reset_otps (email, otp, used);
