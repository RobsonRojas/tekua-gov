-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cost INTEGER NOT NULL CHECK (cost > 0),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, reward_id)
);

-- Configure RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Policies for rewards
DROP POLICY IF EXISTS "Rewards are viewable by everyone" ON public.rewards;
CREATE POLICY "Rewards are viewable by everyone" ON public.rewards
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Rewards can be inserted by admins" ON public.rewards;
CREATE POLICY "Rewards can be inserted by admins" ON public.rewards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Rewards can be updated by admins" ON public.rewards;
CREATE POLICY "Rewards can be updated by admins" ON public.rewards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Rewards can be deleted by admins" ON public.rewards;
CREATE POLICY "Rewards can be deleted by admins" ON public.rewards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policies for user_rewards
DROP POLICY IF EXISTS "User rewards are viewable by everyone" ON public.user_rewards;
CREATE POLICY "User rewards are viewable by everyone" ON public.user_rewards
    FOR SELECT USING (true);

-- No manual insert/update/delete for user_rewards by users (handled by trigger)

-- Create trigger function to grant rewards automatically
CREATE OR REPLACE FUNCTION public.check_and_grant_rewards()
RETURNS TRIGGER AS $$
DECLARE
    reward_record RECORD;
BEGIN
    -- Only run if the balance has increased
    IF NEW.balance > OLD.balance AND NEW.profile_id IS NOT NULL THEN
        
        -- Find active rewards the user can afford, hasn't achieved yet, and aren't expired
        FOR reward_record IN 
            SELECT r.* FROM public.rewards r
            LEFT JOIN public.user_rewards ur ON ur.reward_id = r.id AND ur.user_id = NEW.profile_id
            WHERE r.status = 'active'
              AND (r.deadline IS NULL OR r.deadline > NOW())
              AND r.cost <= NEW.balance
              AND ur.id IS NULL
        LOOP
            -- Grant the reward
            INSERT INTO public.user_rewards (user_id, reward_id)
            VALUES (NEW.profile_id, reward_record.id);
            
            -- Insert a notification for the user
            INSERT INTO public.notifications (user_id, type, title, message, data)
            VALUES (
                NEW.profile_id,
                'reward_achieved',
                'Novo prêmio conquistado!',
                'Você conquistou o prêmio: ' || reward_record.title,
                jsonb_build_object('reward_id', reward_record.id)
            );
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on wallets
DROP TRIGGER IF EXISTS trigger_check_and_grant_rewards ON public.wallets;
CREATE TRIGGER trigger_check_and_grant_rewards
    AFTER UPDATE OF balance ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.check_and_grant_rewards();
