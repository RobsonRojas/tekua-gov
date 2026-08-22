-- Migration: Create Reward Ranking RPC
-- Date: 2026-08-20

CREATE OR REPLACE FUNCTION public.get_reward_ranking(p_reward_id UUID)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    balance NUMERIC,
    achieved BOOLEAN,
    achieved_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.full_name,
        p.avatar_url,
        w.balance,
        (ur.id IS NOT NULL) as achieved,
        ur.achieved_at
    FROM public.profiles p
    JOIN public.wallets w ON w.profile_id = p.id
    LEFT JOIN public.user_rewards ur ON ur.user_id = p.id AND ur.reward_id = p_reward_id
    ORDER BY 
        (ur.id IS NOT NULL) DESC, -- Achieved first
        w.balance DESC; -- Then by balance
END;
$$;
