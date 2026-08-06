-- Track who wrote the review
ALTER TABLE public.unit_monthly_review
  ADD COLUMN IF NOT EXISTS autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop the open policies
DROP POLICY IF EXISTS "Leitura aberta das analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "Criacao aberta das analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "Atualizacao aberta das analises" ON public.unit_monthly_review;

-- Remove anonymous Data API access
REVOKE ALL ON public.unit_monthly_review FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.unit_monthly_review TO authenticated;
GRANT ALL ON public.unit_monthly_review TO service_role;

ALTER TABLE public.unit_monthly_review ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analises visiveis para usuarios autenticados"
  ON public.unit_monthly_review FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados criam analises"
  ON public.unit_monthly_review FOR INSERT
  TO authenticated
  WITH CHECK (autor_id = auth.uid());

CREATE POLICY "Usuarios autenticados editam analises"
  ON public.unit_monthly_review FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (autor_id = auth.uid());
