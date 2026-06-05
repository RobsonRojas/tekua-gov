-- Fix Admins can manage documents policy to support multi-role configuration (roles array)
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;

CREATE POLICY "Admins can manage documents" ON public.documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR 'admin' = ANY(profiles.roles))
  )
);
