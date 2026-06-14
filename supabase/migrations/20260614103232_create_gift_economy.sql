-- 1.2 Alterar a tabela wallets para adicionar a coluna gift_points
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS gift_points INTEGER DEFAULT 0;

-- 1.3 Criar tabela gifts
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for gifts
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gifts are viewable by everyone." ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create gifts." ON public.gifts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Providers can update their own gifts." ON public.gifts FOR UPDATE USING (auth.uid() = provider_id);

-- 1.4 Criar tabela gift_usages
CREATE TABLE IF NOT EXISTS public.gift_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for gift_usages
ALTER TABLE public.gift_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gift usages are viewable by everyone." ON public.gift_usages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can record gift usage." ON public.gift_usages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 1.5 Criar função RPC award_gift_points
CREATE OR REPLACE FUNCTION public.award_gift_points(p_gift_id UUID, p_consumer_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider_id UUID;
BEGIN
  -- 1. Insert the usage record
  INSERT INTO public.gift_usages (gift_id, consumer_id)
  VALUES (p_gift_id, p_consumer_id);

  -- 2. Find the provider
  SELECT provider_id INTO v_provider_id
  FROM public.gifts
  WHERE id = p_gift_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  -- 3. Increment gift points for the provider
  UPDATE public.wallets
  SET gift_points = COALESCE(gift_points, 0) + 1,
      updated_at = now()
  WHERE profile_id = v_provider_id;

  RETURN json_build_object('success', true);
END;
$$;
