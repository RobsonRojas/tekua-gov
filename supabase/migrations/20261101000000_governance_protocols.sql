-- Protocolos e POPs da Governança (change add-governance-protocols).
-- Leitura para membros autenticados; escrita somente pela edge function api-governance,
-- que exige papel de administrador ou do Conselho Transversal.

CREATE TABLE IF NOT EXISTS public.governance_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  content TEXT NOT NULL DEFAULT '' CHECK (char_length(content) <= 20000),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS governance_protocols_status_title
  ON public.governance_protocols (status, title);

ALTER TABLE public.governance_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can read governance protocols"
  ON public.governance_protocols FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sem policy de INSERT/UPDATE/DELETE para clientes: a escrita passa pela api-governance.

-- Um protocolo opcional por atividade. Sem exclusão de protocolos: arquivam-se.
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES public.governance_protocols (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS activities_protocol_id ON public.activities (protocol_id) WHERE protocol_id IS NOT NULL;
