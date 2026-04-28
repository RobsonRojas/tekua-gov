-- Enable pg_net extension for asynchronous HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create schema for notifications if not exists
CREATE SCHEMA IF NOT EXISTS notifications;

-- Function to handle task notification events
CREATE OR REPLACE FUNCTION notifications.handle_task_notification_event()
RETURNS TRIGGER AS $$
DECLARE
  event_type TEXT;
  payload JSONB;
BEGIN
  -- Determine event type
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

  -- Call notify-engine Edge Function asynchronously via pg_net
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-engine',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'event', event_type,
        'payload', payload
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers on activities table
DROP TRIGGER IF EXISTS tr_notify_activity_insert ON public.activities;
CREATE TRIGGER tr_notify_activity_insert
AFTER INSERT ON public.activities
FOR EACH ROW EXECUTE FUNCTION notifications.handle_task_notification_event();

DROP TRIGGER IF EXISTS tr_notify_activity_update ON public.activities;
CREATE TRIGGER tr_notify_activity_update
AFTER UPDATE ON public.activities
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.worker_id IS DISTINCT FROM NEW.worker_id)
EXECUTE FUNCTION notifications.handle_task_notification_event();
