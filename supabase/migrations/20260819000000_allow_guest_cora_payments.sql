-- Allow user_id to be null for guest payments
ALTER TABLE public.cora_payments
ALTER COLUMN user_id DROP NOT NULL;

-- Add a policy to allow anyone to read anonymous payments 
-- (Guest users can subscribe via Supabase Realtime using the unguessable UUID)
CREATE POLICY "Guests can view anonymous payments"
    ON public.cora_payments
    FOR SELECT
    USING (user_id IS NULL);
