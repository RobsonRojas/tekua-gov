-- Convocação de círculo restaurativo (change restorative-circle-convocation).
-- Convocações são visíveis a membros autenticados; mudanças de status passam
-- pela edge function api-governance, que aplica as regras de autor e administrador.

CREATE TABLE IF NOT EXISTS public.restorative_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 2000),
  scheduled_at TIMESTAMPTZ NOT NULL,
  location_or_link TEXT CHECK (location_or_link IS NULL OR char_length(location_or_link) <= 500),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  cancelled_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  -- 32 caracteres hexadecimais aleatórios (122 bits), não adivinháveis.
  share_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A data agendada precisa ser futura no momento da criação (checado no banco).
CREATE OR REPLACE FUNCTION public.check_restorative_circle_future_date()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.scheduled_at <= now() THEN
    RAISE EXCEPTION 'Scheduled date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restorative_circles_future_date ON public.restorative_circles;
CREATE TRIGGER restorative_circles_future_date
  BEFORE INSERT ON public.restorative_circles
  FOR EACH ROW EXECUTE FUNCTION public.check_restorative_circle_future_date();

-- Uma convocação aberta por autor (mitigação de spam de email para a vila).
CREATE UNIQUE INDEX IF NOT EXISTS restorative_circles_one_open_per_author
  ON public.restorative_circles (created_by)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS restorative_circles_open_scheduled
  ON public.restorative_circles (status, scheduled_at);

ALTER TABLE public.restorative_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can read restorative circles"
  ON public.restorative_circles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Members can create their own restorative circle"
  ON public.restorative_circles FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Sem policy de UPDATE/DELETE para clientes: mudanças de status ficam na api-governance.
