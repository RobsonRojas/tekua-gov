-- Migration: Make the evidence of a contribution optional
-- Date: 2026-10-22
-- Change: remove-evidence-requirement
--
-- The Portal Tekuá works on a mutual-trust principle: the honest declaration of the
-- executor, combined with the later validation by the peers (or by the requester), is
-- enough. The material evidence is an optional complement, never a gate.
--
-- `public.submit_activity` used to write a row in `activity_evidence` for EVERY
-- contribution, even when no evidence had been provided (the caller sent an empty
-- string, and the column refuses NULL). Those empty rows pollute the reading of the
-- work wall and make the UI show an "evidence" that does not exist.
--
-- This migration keeps the exact same signature (11 parameters) so that no caller
-- breaks, and only changes one thing: the evidence row is written when there is
-- actually something to record.

-- ---------------------------------------------------------------------------
-- 1. Recreate submit_activity with the optional evidence insert.
--    The signature, the body and the semantics are the ones from
--    20261016000000_remove_moderation_flow.sql; only the evidence insert is
--    conditioned. `CREATE OR REPLACE` keeps the migration idempotent.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_activity(
  p_title JSONB,
  p_description JSONB,
  p_reward_amount NUMERIC(15, 2),
  p_evidence_url TEXT,
  p_requester_id UUID DEFAULT NULL,
  p_validation_method validation_method DEFAULT 'community_consensus',
  p_urgency BOOLEAN DEFAULT FALSE,
  p_importance BOOLEAN DEFAULT FALSE,
  p_worker_id UUID DEFAULT NULL,
  p_executor_ids UUID[] DEFAULT '{}',
  p_category_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
  v_effective_executors UUID[];
BEGIN
  -- Determine effective executors
  IF array_length(p_executor_ids, 1) > 0 THEN
    v_effective_executors := p_executor_ids;
  ELSIF p_worker_id IS NOT NULL THEN
    v_effective_executors := ARRAY[p_worker_id];
  ELSE
    v_effective_executors := ARRAY[auth.uid()];
  END IF;

  INSERT INTO activities (
    title,
    description,
    reward_amount,
    type,
    requester_id,
    worker_id,
    executor_ids,
    status,
    validation_method,
    urgency,
    importance,
    category_id
  )
  VALUES (
    p_title,
    p_description,
    p_reward_amount,
    'contribution'::activity_type,
    p_requester_id,
    v_effective_executors[1], -- Set first executor as worker_id for backward compatibility
    v_effective_executors,
    'pending_validation'::activity_status,
    p_validation_method,
    p_urgency,
    p_importance,
    p_category_id
  )
  RETURNING id INTO v_new_id;

  -- Evidence is optional: no row is written when there is nothing to record.
  -- An empty string is treated as "no evidence" too, since that is what the
  -- clients used to send when the member attached nothing.
  IF p_evidence_url IS NOT NULL AND btrim(p_evidence_url) <> '' THEN
    INSERT INTO activity_evidence (activity_id, worker_id, evidence_url)
    VALUES (v_new_id, v_effective_executors[1], p_evidence_url);
  END IF;

  RETURN v_new_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. The column `activity_evidence.evidence_url` is left exactly as it is.
--    The migration never writes NULL into it and never relaxes or tightens its
--    constraint, so the legacy rows (whatever they hold) stay valid and readable.
--    The function above simply stops creating rows without content.
-- ---------------------------------------------------------------------------
