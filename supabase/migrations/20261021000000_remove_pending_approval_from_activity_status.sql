-- Migration: Remove the legacy 'pending_approval' value from the activity_status enum
-- Date: 2026-10-21
-- Change: remove-pending-approval-from-activities-status
--
-- The moderation stage was removed in `20261016000000_remove_moderation_flow.sql`, which kept
-- 'pending_approval' in the `activity_status` enum because Postgres cannot drop an enum value
-- in place. That migration documented the value as legacy and no longer produced by the
-- application. This migration performs the deferred cleanup: the type is rebuilt without it.
--
-- Postgres has no "ALTER TYPE ... DROP VALUE", so the type is swapped:
--   1. the current type is renamed aside
--   2. the replacement type is created with the supported values
--   3. the column is moved over (text round-trip)
--   4. the old type is dropped
--
-- Two things have to be handled around the swap:
--   * `public.confirm_activity` still compared the status against 'pending_approval'. The literal
--     would raise "invalid input value for enum activity_status" at runtime once the value is
--     gone, so the RPC is recreated first, accepting only 'pending_validation'.
--   * RLS policies whose expression references the status column hold an AUTO dependency on the
--     enum type, so `DROP TYPE` would silently drop them. They are captured beforehand and
--     restored afterwards, which also re-analyses their expressions against the new type.

-- ---------------------------------------------------------------------------
-- 1. Defensive data migration.
--    No-op on a database already migrated by 20261016000000_remove_moderation_flow.sql,
--    but it guarantees the column can be converted below.
--    Guarded so that re-running this migration is a no-op instead of an error.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'activity_status'
      AND e.enumlabel = 'pending_approval'
  ) THEN
    UPDATE public.activities
    SET status = 'open'::activity_status,
        updated_at = now()
    WHERE status = 'pending_approval'::activity_status
      AND type <> 'contribution'::activity_type;

    UPDATE public.activities
    SET status = 'pending_validation'::activity_status,
        updated_at = now()
    WHERE status = 'pending_approval'::activity_status
      AND type = 'contribution'::activity_type;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.activities WHERE status::text = 'pending_approval') THEN
    RAISE EXCEPTION
      'Cannot remove ''pending_approval'' from activity_status: activities still use that status';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. confirm_activity: only 'pending_validation' can be confirmed.
--    Body kept identical to 20260902000000_update_payment_model_and_admin_wallet.sql, except
--    for the status guard and its error message.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_activity(
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_activity RECORD;
  v_confirm_count INTEGER;
  v_user_role TEXT;
  v_user_roles TEXT[];
  v_is_admin BOOLEAN;
  v_executor_id UUID;
  v_num_executors INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role, roles INTO v_user_role, v_user_roles FROM profiles WHERE id = v_user_id;
  v_is_admin := (v_user_role = 'admin') OR ('admin' = ANY(v_user_roles));

  -- 1. Get activity info
  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id FOR UPDATE;

  -- Only activities awaiting validation can be confirmed
  IF v_activity.status != 'pending_validation' THEN
    RAISE EXCEPTION 'Activity is not pending validation';
  END IF;

  IF v_user_id = v_activity.worker_id OR v_user_id = ANY(v_activity.executor_ids) THEN
    RAISE EXCEPTION 'You cannot confirm your own work';
  END IF;

  -- 2. Logic based on validation method
  IF v_activity.validation_method = 'requester_approval' THEN
    IF v_user_id != v_activity.requester_id AND NOT v_is_admin THEN
      RAISE EXCEPTION 'Only the requester or an administrator can approve this activity';
    END IF;

    -- Record confirmation for the UI progress bar (0 -> 1)
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id)
    ON CONFLICT DO NOTHING;

    -- Approve and payout from Treasury (NULL)
    UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;

    v_num_executors := array_length(v_activity.executor_ids, 1);
    IF v_num_executors > 0 THEN
      -- Do not split amount, give full amount to each executor
      FOREACH v_executor_id IN ARRAY v_activity.executor_ids
      LOOP
        PERFORM execute_currency_transfer(NULL, v_executor_id, v_activity.reward_amount, p_activity_id);
      END LOOP;
    ELSIF v_activity.worker_id IS NOT NULL THEN
      PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'completed', TRUE, 'confirmations', 1);

  ELSIF v_activity.validation_method = 'community_consensus' THEN
    -- Record confirmation
    INSERT INTO activity_confirmations (activity_id, user_id)
    VALUES (p_activity_id, v_user_id)
    ON CONFLICT DO NOTHING;

    -- Check threshold
    SELECT COUNT(*)::INTEGER INTO v_confirm_count FROM activity_confirmations WHERE activity_id = p_activity_id;

    IF v_confirm_count >= v_activity.min_confirmations THEN
       UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = p_activity_id;

       -- Payout from Treasury (NULL)
       v_num_executors := array_length(v_activity.executor_ids, 1);
       IF v_num_executors > 0 THEN
         -- Do not split amount, give full amount to each executor
         FOREACH v_executor_id IN ARRAY v_activity.executor_ids
         LOOP
           PERFORM execute_currency_transfer(NULL, v_executor_id, v_activity.reward_amount, p_activity_id);
         END LOOP;
       ELSIF v_activity.worker_id IS NOT NULL THEN
         PERFORM execute_currency_transfer(NULL, v_activity.worker_id, v_activity.reward_amount, p_activity_id);
       END IF;

       RETURN jsonb_build_object('success', TRUE, 'completed', TRUE, 'confirmations', v_confirm_count);
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'completed', FALSE, 'confirmations', v_confirm_count);
  END IF;

  RETURN jsonb_build_object('success', FALSE, 'error', 'Unknown validation method');
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You have already confirmed this activity');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Capture the RLS policies and the triggers of public.activities, then drop them.
--    * A policy whose expression references the status column depends on the enum type with
--      DEPENDENCY_AUTO, so dropping the old type would drop the policy silently.
--    * Postgres refuses to change the type of a column that is used by a policy or by a
--      trigger definition:
--          ERROR: cannot alter type of a column used in a policy definition
--          ERROR: cannot alter type of a column used in a trigger definition
--      Two triggers of public.activities carry a WHEN clause over OLD.status/NEW.status:
--          tr_audit_activities       WHEN (OLD.status IS DISTINCT FROM NEW.status)
--          tr_notify_activity_update  WHEN (OLD.status IS DISTINCT FROM NEW.status OR ...)
--      They are captured with pg_get_triggerdef() and recreated right after the swap, so the
--      WHEN clauses are re-analysed against the new type.
-- ---------------------------------------------------------------------------
-- Qualified with pg_temp so a table with the same name in a permanent schema is never touched.
DROP TABLE IF EXISTS pg_temp._tmp_activities_policies;
DROP TABLE IF EXISTS pg_temp._tmp_activities_triggers;

CREATE TEMP TABLE _tmp_activities_policies AS
SELECT policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'activities';

CREATE TEMP TABLE _tmp_activities_triggers AS
SELECT t.tgname,
       pg_get_triggerdef(t.oid) AS triggerdef
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'activities'
  AND NOT t.tgisinternal;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM _tmp_activities_policies LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.activities', r.policyname);
  END LOOP;

  FOR r IN SELECT tgname FROM _tmp_activities_triggers LOOP
    EXECUTE format('DROP TRIGGER %I ON public.activities', r.tgname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Swap the enum type.
-- ---------------------------------------------------------------------------
ALTER TYPE public.activity_status RENAME TO activity_status_legacy;

CREATE TYPE public.activity_status AS ENUM (
  'open',
  'in_progress',
  'pending_validation',
  'completed',
  'rejected'
);

-- The default of the column points at the old type; drop it before the conversion and
-- restore it against the new type afterwards.
ALTER TABLE public.activities ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.activities
  ALTER COLUMN status TYPE public.activity_status
  USING status::text::public.activity_status;

ALTER TABLE public.activities
  ALTER COLUMN status SET DEFAULT 'open'::public.activity_status;

DROP TYPE public.activity_status_legacy;

-- ---------------------------------------------------------------------------
-- 5. Restore the RLS policies and the triggers of public.activities.
--    The policy expressions and the trigger WHEN clauses are re-analysed here, against the
--    new type.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  v_roles TEXT;
  v_sql TEXT;
BEGIN
  FOR r IN SELECT * FROM _tmp_activities_policies LOOP
    -- 'roles' is a name[]: '{public}' means PUBLIC, otherwise an explicit role list.
    IF r.roles IS NULL OR r.roles = ARRAY['public']::name[] THEN
      v_roles := 'PUBLIC';
    ELSE
      SELECT string_agg(quote_ident(p.role), ', ')
      INTO v_roles
      FROM unnest(r.roles) AS p(role);

      IF v_roles IS NULL THEN
        v_roles := 'PUBLIC';
      END IF;
    END IF;

    v_sql := format('CREATE POLICY %I ON public.activities AS %s FOR %s TO %s',
                    r.policyname, r.permissive, r.cmd, v_roles);

    IF r.qual IS NOT NULL THEN
      v_sql := v_sql || format(' USING (%s)', r.qual);
    END IF;

    IF r.with_check IS NOT NULL THEN
      v_sql := v_sql || format(' WITH CHECK (%s)', r.with_check);
    END IF;

    EXECUTE v_sql;
  END LOOP;
END $$;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT triggerdef FROM _tmp_activities_triggers LOOP
    EXECUTE r.triggerdef;
  END LOOP;
END $$;

DROP TABLE IF EXISTS pg_temp._tmp_activities_policies;
DROP TABLE IF EXISTS pg_temp._tmp_activities_triggers;
