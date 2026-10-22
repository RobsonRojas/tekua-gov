-- Verification script: removal of the legacy 'pending_approval' value from activity_status
-- Change: remove-pending-approval-from-activities-status
-- Migration: supabase/migrations/20261021000000_remove_pending_approval_from_activity_status.sql
--
-- Run this in your Supabase SQL Editor after applying the migration.
-- Every check reports ✅ / ❌; the script aborts on the first failure.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. The enum contains exactly the supported values, in the expected order.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_labels text[];
  v_expected text[] := ARRAY['open', 'in_progress', 'pending_validation', 'completed', 'rejected'];
BEGIN
  SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder)
  INTO v_labels
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE t.typname = 'activity_status';

  IF v_labels IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION '❌ activity_status = %, expected %', v_labels, v_expected;
  END IF;

  RAISE NOTICE '✅ 1. activity_status = %', v_labels;
END $$;

-- ---------------------------------------------------------------------------
-- 2. The legacy type used during the swap is gone.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_status_legacy') THEN
    RAISE EXCEPTION '❌ the temporary type activity_status_legacy still exists';
  END IF;

  RAISE NOTICE '✅ 2. no leftover activity_status_legacy type';
END $$;

-- ---------------------------------------------------------------------------
-- 3. The column kept its type and its default.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_type text;
  v_default text;
BEGIN
  SELECT udt_name, column_default INTO v_type, v_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'status';

  IF v_type <> 'activity_status' THEN
    RAISE EXCEPTION '❌ activities.status has type %, expected activity_status', v_type;
  END IF;

  IF v_default IS DISTINCT FROM '''open''::activity_status' THEN
    RAISE EXCEPTION '❌ activities.status default is %, expected ''open''::activity_status', v_default;
  END IF;

  RAISE NOTICE '✅ 3. activities.status is activity_status NOT NULL DEFAULT open';
END $$;

-- ---------------------------------------------------------------------------
-- 4. No activity is left with the removed status.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.activities WHERE status::text = 'pending_approval';

  IF v_count > 0 THEN
    RAISE EXCEPTION '❌ % activities still use the removed status', v_count;
  END IF;

  RAISE NOTICE '✅ 4. no activity uses the removed status';
END $$;

-- ---------------------------------------------------------------------------
-- 5. The access rules of the activities table survived the type replacement.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'activities';

  IF v_count = 0 THEN
    RAISE EXCEPTION '❌ the activities table has no access rule left (RLS would block every row)';
  END IF;

  RAISE NOTICE '✅ 5. % access rules present on public.activities', v_count;
END $$;

-- ---------------------------------------------------------------------------
-- 6. The triggers of the activities table survived the type replacement.
--    They are dropped before the type swap and recreated after it, so their WHEN clauses
--    are re-analysed against the new type.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
  v_missing text;
BEGIN
  SELECT count(*) INTO v_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'activities' AND NOT t.tgisinternal;

  IF v_count = 0 THEN
    RAISE EXCEPTION '❌ the activities table has no trigger left';
  END IF;

  -- These triggers carry a WHEN clause over OLD.status/NEW.status.
  SELECT string_agg(name, ', ') INTO v_missing
  FROM unnest(ARRAY['tr_audit_activities', 'tr_notify_activity_update']) AS name
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'activities' AND t.tgname = name
  );

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION '❌ these triggers are missing: %', v_missing;
  END IF;

  RAISE NOTICE '✅ 6. % triggers present on public.activities (incl. the ones on status)', v_count;
END $$;

-- ---------------------------------------------------------------------------
-- 7. Writing the removed value is rejected by the database.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    INSERT INTO public.activities (type, status, title, description)
    VALUES ('task', 'pending_approval', '{"pt":"teste"}'::jsonb, '{"pt":"teste"}'::jsonb);

    RAISE EXCEPTION '❌ the removed status was accepted';
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE NOTICE '✅ 7. writing the removed status is rejected';
  END;
END $$;

-- ---------------------------------------------------------------------------
-- 8. confirm_activity only accepts activities awaiting validation.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT public.confirm_activity(gen_random_uuid()) INTO v_result;

  IF v_result->>'error' IS DISTINCT FROM 'Not authenticated' THEN
    RAISE EXCEPTION '❌ confirm_activity did not run: %', v_result;
  END IF;

  RAISE NOTICE '✅ 8. confirm_activity responds (guard: %)', v_result->>'error';
END $$;

-- ---------------------------------------------------------------------------
-- 9. The supported statuses are still writable.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.activities (type, status, title, description)
  VALUES ('task', 'open', '{"pt":"teste"}'::jsonb, '{"pt":"teste"}'::jsonb)
  RETURNING id INTO v_id;

  IF NOT EXISTS (SELECT 1 FROM public.activities WHERE id = v_id AND status = 'open') THEN
    RAISE EXCEPTION '❌ an activity with status open could not be read back';
  END IF;

  RAISE NOTICE '✅ 9. an activity with status open was inserted';

  DELETE FROM public.activities WHERE id = v_id;
END $$;

-- ---------------------------------------------------------------------------
-- 10. Diagnostic: anything else still depending on the status column.
--     Informative only - it never fails the script.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_blockers text;
BEGIN
  SELECT string_agg(DISTINCT blocker, ', ') INTO v_blockers
  FROM (
    SELECT 'check constraint ' || con.conname AS blocker
    FROM pg_constraint con
    JOIN pg_attribute a
      ON a.attrelid = con.conrelid AND a.attnum = ANY (con.conkey)
    WHERE con.conrelid = 'public.activities'::regclass
      AND con.contype = 'c'
      AND a.attname = 'status'
      AND con.conkey = ARRAY[a.attnum]::smallint[]

    UNION ALL

    SELECT 'index ' || ic.relname
    FROM pg_index i
    JOIN pg_class ic ON ic.oid = i.indexrelid
    WHERE i.indrelid = 'public.activities'::regclass
      AND i.indpred IS NOT NULL
      AND pg_get_expr(i.indpred, i.indrelid) ~* '\mstatus\M'

    UNION ALL

    SELECT 'view/rule ' || v.relname
    FROM pg_depend d
    JOIN pg_rewrite rw ON rw.oid = d.objid
    JOIN pg_class v ON v.oid = rw.ev_class
    JOIN pg_namespace vn ON vn.oid = v.relnamespace
    WHERE d.classid = 'pg_rewrite'::regclass
      AND d.refclassid = 'pg_class'::regclass
      AND d.refobjid = 'public.activities'::regclass
      AND d.refobjsubid = (
            SELECT attnum FROM pg_attribute
            WHERE attrelid = 'public.activities'::regclass AND attname = 'status'
          )
      AND vn.nspname = 'public'
  ) b;

  IF v_blockers IS NULL THEN
    RAISE NOTICE '✅ 10. no other object depends on activities.status';
  ELSE
    RAISE NOTICE '⚠️  10. these objects still reference activities.status: %', v_blockers;
  END IF;
END $$;

ROLLBACK; -- Undo the test inserts
