-- unit_monthly_review: apenas usuários autenticados, com escopo por unidade
DROP POLICY IF EXISTS "anon pode criar analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "anon pode editar analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "anon pode ler analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "authenticated pode criar analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "authenticated pode editar analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "authenticated pode ler analises" ON public.unit_monthly_review;

REVOKE ALL ON public.unit_monthly_review FROM anon;

CREATE POLICY "logados leem analises da sua unidade"
ON public.unit_monthly_review FOR SELECT TO authenticated
USING (public.pode_unidade(auth.uid(), unit_slug));

CREATE POLICY "logados criam analises da sua unidade"
ON public.unit_monthly_review FOR INSERT TO authenticated
WITH CHECK (public.pode_unidade(auth.uid(), unit_slug));

CREATE POLICY "logados editam analises da sua unidade"
ON public.unit_monthly_review FOR UPDATE TO authenticated
USING (public.pode_unidade(auth.uid(), unit_slug))
WITH CHECK (public.pode_unidade(auth.uid(), unit_slug));

-- review_audit_log: leitura apenas para logados; registro segue aberto (fluxo de auditoria)
DROP POLICY IF EXISTS "anon pode ler auditoria" ON public.review_audit_log;

REVOKE SELECT ON public.review_audit_log FROM anon;