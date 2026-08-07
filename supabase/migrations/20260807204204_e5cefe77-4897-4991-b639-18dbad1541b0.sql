ALTER TABLE public.unit_monthly_review ALTER COLUMN autor_id DROP NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.unit_monthly_review TO anon;

DROP POLICY IF EXISTS "anon pode ler analises" ON public.unit_monthly_review;
CREATE POLICY "anon pode ler analises" ON public.unit_monthly_review FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon pode criar analises" ON public.unit_monthly_review;
CREATE POLICY "anon pode criar analises" ON public.unit_monthly_review FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon pode editar analises" ON public.unit_monthly_review;
CREATE POLICY "anon pode editar analises" ON public.unit_monthly_review FOR UPDATE TO anon USING (true) WITH CHECK (true);