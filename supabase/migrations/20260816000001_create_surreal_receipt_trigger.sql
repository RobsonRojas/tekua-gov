-- Migration: Create trigger to dispatch surreal receipt notifications
-- Date: 2026-08-16

-- Trigger function that calls notify_surreal_receipt RPC and dispatches to notify-engine
CREATE OR REPLACE FUNCTION public.trigger_notify_surreal_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Only notify for peer-to-peer transfers (from_id IS NOT NULL)
  IF NEW.from_id IS NOT NULL THEN
    -- Call the RPC to create in-app notifications
    SELECT public.notify_surreal_receipt(NEW.id) INTO v_result;
    RAISE NOTICE 'Triggered surreal receipt notifications: %', v_result;

    -- Dispatch to notify-engine Edge Function for push + email delivery (async via pg_net)
    BEGIN
      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-engine',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'event', 'notification.surreal_receipt',
          'payload', jsonb_build_object(
            'from_id', NEW.from_id,
            'to_id', NEW.to_id,
            'data', v_result
          )
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Don't fail the transaction if notify-engine call fails
      RAISE WARNING 'notify-engine dispatch failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on transactions table AFTER INSERT
-- This runs after a transaction is successfully created
DROP TRIGGER IF EXISTS trg_surreal_receipt_notifications ON public.transactions;

CREATE TRIGGER trg_surreal_receipt_notifications
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_surreal_receipt();

COMMENT ON TRIGGER trg_surreal_receipt_notifications ON public.transactions 
IS 'Automatically dispatch surreal receipt notifications to all members when a peer-to-peer surreal transaction is created';
