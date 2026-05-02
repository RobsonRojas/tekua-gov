-- Migration: Add pending_approval to activity_status enum
-- Date: 2026-05-01
-- Purpose: Add the new enum value. This must be run separately from any logic that uses it.

-- 1. Add pending_approval to activity_status enum
-- Note: 'IF NOT EXISTS' is supported in Postgres 13+
ALTER TYPE activity_status ADD VALUE IF NOT EXISTS 'pending_approval' BEFORE 'open';
