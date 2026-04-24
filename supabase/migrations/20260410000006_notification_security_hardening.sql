-- Migration: Notification Security Hardening
-- Date: 2026-04-10

-- 1. Restrict RPC access
REVOKE EXECUTE ON FUNCTION public.create_notification(UUID, JSONB, JSONB, TEXT, TEXT) FROM public, anon, authenticated;

-- 2. Trigger for comments
CREATE OR REPLACE FUNCTION public.fn_notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_topic_title JSONB;
  v_topic_owner UUID;
BEGIN
  -- Get topic info
  SELECT title, created_by INTO v_topic_title, v_topic_owner
  FROM public.discussion_topics
  WHERE id = NEW.topic_id;

  -- Notify topic owner if not the same person
  IF v_topic_owner IS NOT NULL AND v_topic_owner != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      v_topic_owner,
      jsonb_build_object('pt', 'Novo comentário', 'en', 'New comment'),
      jsonb_build_object(
        'pt', 'Alguém comentou na pauta: ' || (v_topic_title->>'pt'),
        'en', 'Someone commented on topic: ' || (v_topic_title->>'en')
      ),
      'social',
      '/voting/' || NEW.topic_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_comment ON public.topic_comments;
CREATE TRIGGER tr_notify_on_comment
AFTER INSERT ON public.topic_comments
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_comment();

-- 3. Trigger for activity updates (claim and validation)
CREATE OR REPLACE FUNCTION public.fn_notify_on_activity_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_worker_name TEXT;
  v_confirmer_name TEXT;
BEGIN
  -- 3.1 Task Claimed (worker_id changed from null to something)
  IF OLD.worker_id IS NULL AND NEW.worker_id IS NOT NULL AND NEW.requester_id IS NOT NULL THEN
    SELECT full_name INTO v_worker_name FROM public.profiles WHERE id = NEW.worker_id;
    
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.requester_id,
      jsonb_build_object('pt', 'Tarefa Assumida', 'en', 'Task Claimed'),
      jsonb_build_object(
        'pt', (COALESCE(v_worker_name, 'Alguém')) || ' assumiu sua tarefa: ' || NEW.title,
        'en', (COALESCE(v_worker_name, 'Someone')) || ' claimed your task: ' || NEW.title
      ),
      'task',
      '/work-wall'
    );
  END IF;

  -- 3.2 Work Confirmed (status changed to validated/completed)
  -- Note: This assumes a 'validated' or 'completed' status indicates confirmation
  -- Adjust status check if necessary
  IF OLD.status = 'pending_validation' AND NEW.status != 'pending_validation' AND NEW.worker_id IS NOT NULL THEN
    -- In this case, the current user (the one who updated the record) is the confirmer
    -- But since we are in a trigger, we don't easily know who that is unless we use auth.uid()
    SELECT full_name INTO v_confirmer_name FROM public.profiles WHERE id = auth.uid();

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.worker_id,
      jsonb_build_object('pt', 'Trabalho Confirmado', 'en', 'Work Confirmed'),
      jsonb_build_object(
        'pt', (COALESCE(v_confirmer_name, 'Alguém')) || ' confirmou seu trabalho: ' || NEW.title,
        'en', (COALESCE(v_confirmer_name, 'Someone')) || ' confirmed your work: ' || NEW.title
      ),
      'task',
      '/wallet'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_activity_update ON public.activities;
CREATE TRIGGER tr_notify_on_activity_update
AFTER UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_activity_update();
