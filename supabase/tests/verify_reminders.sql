-- Test script to verify Task Reminders (Eisenhower Matrix)
-- Run this in your Supabase SQL Editor after applying the migration.

BEGIN;

-- 1. Setup: Create test activities with various quadrants and ages
INSERT INTO activities (title, description, type, reward_amount, requester_id, urgency, importance, created_at)
VALUES 
  ('{"pt": "Urgente e Importante (Trigger)", "en": "Urgent & Important"}', '{"pt": "Devia disparar", "en": "Should trigger"}', 'task', 10, (SELECT id FROM profiles LIMIT 1), TRUE, TRUE, NOW() - INTERVAL '2 hours'),
  ('{"pt": "Urgente e Importante (Recent)", "en": "Urgent & Important"}', '{"pt": "Nao devia disparar", "en": "Should not"}', 'task', 10, (SELECT id FROM profiles LIMIT 1), TRUE, TRUE, NOW() - INTERVAL '30 minutes'),
  ('{"pt": "Normal (Long age)", "en": "Normal"}', '{"pt": "Nao devia disparar ainda (1 semana)", "en": "Should not"}', 'task', 10, (SELECT id FROM profiles LIMIT 1), FALSE, FALSE, NOW() - INTERVAL '2 days');

-- 2. Run the reminder engine
SELECT public.process_task_reminders();

-- 3. Verify results
SELECT 
  title->>'pt' as task_title, 
  last_reminder_at, 
  CASE WHEN last_reminder_at IS NOT NULL THEN 'Sent ✅' ELSE 'Skipped ⏭️' END as status
FROM activities 
WHERE title->>'pt' LIKE '%Trigger%' OR title->>'pt' LIKE '%Recent%' OR title->>'pt' LIKE '%Normal%';

-- Check notifications table
SELECT n.title->>'pt' as notif_title, n.created_at 
FROM notifications n
ORDER BY n.created_at DESC LIMIT 5;

ROLLBACK; -- Undo changes after test
