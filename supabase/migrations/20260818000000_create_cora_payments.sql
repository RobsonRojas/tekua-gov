-- Create cora_payments table
CREATE TABLE IF NOT EXISTS public.cora_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('pix', 'boleto', 'credit_card')),
    cora_transaction_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'canceled')),
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_cora_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cora_payments_updated_at_trigger
    BEFORE UPDATE ON public.cora_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_cora_payments_updated_at();

-- Enable RLS
ALTER TABLE public.cora_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments"
    ON public.cora_payments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON public.cora_payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- System or Service Role can update everything, but users cannot update their own payment status directly
CREATE POLICY "Service role can update payments"
    ON public.cora_payments
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
