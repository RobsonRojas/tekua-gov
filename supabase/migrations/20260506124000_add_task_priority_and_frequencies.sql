-- Migration: Add Task Priority (Eisenhower Matrix) and Notification Frequencies
-- Task 1.1: Add urgency, importance and last_reminder_at to activities
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS urgency BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS importance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ;

-- Task 1.2: Add task_reminder_frequencies to governance_settings
ALTER TABLE public.governance_settings
ADD COLUMN IF NOT EXISTS task_reminder_frequencies JSONB DEFAULT '{
  "urgent_important": "1 hour",
  "urgent_not_important": "1 day",
  "not_urgent_important": "1 day",
  "not_urgent_not_important": "1 week"
}'::jsonb;

-- Task 1.3: Update submit_activity RPC to accept priority fields
CREATE OR REPLACE FUNCTION public.submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL,
  p_validation_method validation_method DEFAULT 'community_consensus',
  p_urgency BOOLEAN DEFAULT FALSE,
  p_importance BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO activities (
    title, 
    description, 
    reward_amount, 
    type,
    requester_id, 
    worker_id, 
    status,
    validation_method,
    urgency,
    importance
  )
  VALUES (
    p_title, 
    p_description, 
    p_reward_amount, 
    'contribution'::activity_type,
    p_requester_id, 
    auth.uid(), 
    'pending_approval'::activity_status,
    p_validation_method,
    p_urgency,
    p_importance
  )
  RETURNING id INTO v_new_id;

  INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
  VALUES (v_new_id, auth.uid(), p_evidence_url);
  
  RETURN v_new_id;
END;
$$;

-- Task 1.4: Develop the reminder engine logic
CREATE OR REPLACE FUNCTION public.process_task_reminders()
RETURNS VOID AS $$
DECLARE
  v_frequencies JSONB;
  v_task RECORD;
  v_freq_interval INTERVAL;
  v_quadrant TEXT;
BEGIN
  -- 1. Get frequencies from governance_settings
  SELECT task_reminder_frequencies INTO v_frequencies
  FROM public.governance_settings
  WHERE id = 'current';

  -- 2. Loop through active tasks
  FOR v_task IN 
    SELECT a.*
    FROM public.activities a
    WHERE a.type = 'task' 
    AND a.status IN ('open', 'in_progress')
  LOOP
    -- Identify Eisenhower quadrant
    IF v_task.urgency AND v_task.importance THEN 
      v_quadrant := 'urgent_important';
    ELSIF v_task.urgency AND NOT v_task.importance THEN 
      v_quadrant := 'urgent_not_important';
    ELSIF NOT v_task.urgency AND v_task.importance THEN 
      v_quadrant := 'not_urgent_important';
    ELSE 
      v_quadrant := 'not_urgent_not_important';
    END IF;

    -- Convert frequency string to INTERVAL
    v_freq_interval := (v_frequencies->>v_quadrant)::INTERVAL;

    -- Check if reminder should be sent
    IF COALESCE(v_task.last_reminder_at, v_task.created_at) + v_freq_interval < NOW() THEN
      -- If task is assigned, notify the worker
      IF v_task.worker_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_task.worker_id,
          jsonb_build_object(
            'pt', '⏰ Lembrete de Tarefa: ' || (v_task.title->>'pt'), 
            'en', '⏰ Task Reminder: ' || (v_task.title->>'en')
          ),
          jsonb_build_object(
            'pt', 'Esta tarefa ainda está pendente de conclusão: ' || (v_task.description->>'pt'), 
            'en', 'This task is still pending completion: ' || (v_task.description->>'en')
          ),
          'task',
          '/tasks/' || v_task.id
        );
      ELSE
        -- If task is still open, notify the requester (or potentially a broader group in the future)
        PERFORM public.create_notification(
          v_task.requester_id,
          jsonb_build_object(
            'pt', '📢 Sua tarefa ainda está aberta: ' || (v_task.title->>'pt'), 
            'en', '📢 Your task is still open: ' || (v_task.title->>'en')
          ),
          jsonb_build_object(
            'pt', 'Ninguém assumiu esta tarefa ainda no mural.', 
            'en', 'No one has claimed this task on the board yet.'
          ),
          'task',
          '/tasks/' || v_task.id
        );
      END IF;

      -- Update last_reminder_at to prevent repeated notifications until next cycle
      UPDATE public.activities SET last_reminder_at = NOW() WHERE id = v_task.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Task 1.5: Configure scheduling (Cron)
-- Note: Enable pg_cron extension in Supabase dashboard.
-- SELECT cron.schedule('task-reminders-job', '0 * * * *', 'SELECT public.process_task_reminders()'); -- Every hour
