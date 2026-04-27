-- Migration: Rate Limit Atomic Increment RPC
-- Date: 2026-04-27

CREATE OR REPLACE FUNCTION public.increment_rate_limit(
    p_key TEXT,
    p_window_start TIMESTAMPTZ,
    p_limit INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Upsert the rate limit record
    INSERT INTO public.security_rate_limits (key, window_start, request_count)
    VALUES (p_key, p_window_start, 1)
    ON CONFLICT (key, window_start) -- Requires a unique constraint
    DO UPDATE SET request_count = public.security_rate_limits.request_count + 1
    RETURNING request_count INTO v_count;

    RETURN jsonb_build_object(
        'allowed', v_count <= p_limit,
        'remaining', GREATEST(0, p_limit - v_count),
        'count', v_count
    );
END;
$$;

-- Add unique constraint required for ON CONFLICT
ALTER TABLE public.security_rate_limits ADD CONSTRAINT unique_key_window UNIQUE (key, window_start);
