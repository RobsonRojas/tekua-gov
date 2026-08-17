-- Migration: Add data column to notifications table for structured notification payloads
-- Date: 2026-08-16

-- Add data column to support structured payloads (e.g., surreal_receipt with transaction details)
ALTER TABLE IF EXISTS public.notifications
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.notifications.data IS 'Structured payload data for notification types (e.g., surreal_receipt contains transactionId, amount, senderName, etc.)';

-- Create an index on (type, user_id) for efficient querying by type
CREATE INDEX IF NOT EXISTS idx_notifications_type_user ON public.notifications(type, user_id);
