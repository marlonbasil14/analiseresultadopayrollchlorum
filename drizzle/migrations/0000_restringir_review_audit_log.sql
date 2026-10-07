DROP POLICY IF EXISTS "anon pode registrar auditoria" ON public.review_audit_log;
DROP POLICY IF EXISTS "authenticated pode ler auditoria" ON public.review_audit_log;
DROP POLICY IF EXISTS "authenticated pode registrar auditoria" ON public.review_audit_log;

CREATE POLICY "admin le auditoria"
ON public.review_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "logados registram auditoria propria"
ON public.review_audit_log
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());