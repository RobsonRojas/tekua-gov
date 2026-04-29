-- Migration: Fix Notification Trigger Robustness
-- Date: 2026-04-28
-- Purpose: Prevent transaction failure when notification settings are missing.

CREATE OR REPLACE FUNCTION notifications.handle_task_notification_event()
RETURNS TRIGGER AS $$
DECLARE
  event_type TEXT;
  payload JSONB;
  v_url TEXT;
  v_key TEXT;
BEGIN
  -- 1. Get settings safely (returns NULL if missing)
  v_url := current_setting('app.settings.supabase_url', true);
  v_key := current_setting('app.settings.service_role_key', true);

  -- 2. Guard Clause: Skip if not configured
  IF v_url IS NULL OR v_key IS NULL THEN
    RAISE WARNING 'Notification skipped: app.settings.supabase_url or app.settings.service_role_key is not set.';
    RETURN NEW;
  END IF;

  -- 3. Determine event type
  IF (TG_OP = 'INSERT') THEN
    event_type := 'activity.created';
    payload := row_to_json(NEW)::jsonb;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status = 'open' AND NEW.status = 'in_progress') THEN
      event_type := 'activity.claimed';
    ELSIF (OLD.status = 'in_progress' AND NEW.status = 'pending_validation') THEN
      event_type := 'activity.submitted';
    ELSIF (OLD.status = 'pending_validation' AND NEW.status = 'completed') THEN
      event_type := 'activity.completed';
    ELSE
      -- Generic edit or other status change
      event_type := 'activity.updated';
    END IF;
    payload := row_to_json(NEW)::jsonb;
  END IF;

  -- 4. Call notify-engine Edge Function asynchronously via pg_net
  -- We wrap this in a block to catch potential pg_net errors
  BEGIN
    PERFORM
      net.http_post(
        url := v_url || '/functions/v1/notify-engine',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_key
        ),
        body := jsonb_build_object(
          'event', event_type,
          'payload', payload
        )
      );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to dispatch notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
