-- Registra se o autor confirmou os pré-círculos individuais ao convocar (change convocacao-detail-view-modal).
ALTER TABLE public.restorative_circles
  ADD COLUMN IF NOT EXISTS confirmed_pre_circles BOOLEAN NOT NULL DEFAULT false;

-- Toda convocação existente passou pela validação que exigia essa confirmação.
UPDATE public.restorative_circles SET confirmed_pre_circles = true WHERE confirmed_pre_circles = false;
