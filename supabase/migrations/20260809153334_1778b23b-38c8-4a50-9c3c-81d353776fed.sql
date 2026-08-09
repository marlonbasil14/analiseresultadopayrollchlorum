ALTER TABLE public.review_audit_log ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.review_audit_log ADD COLUMN IF NOT EXISTS autor_nome text;

GRANT SELECT, INSERT ON public.review_audit_log TO anon;

DROP POLICY IF EXISTS "anon pode ler auditoria" ON public.review_audit_log;
CREATE POLICY "anon pode ler auditoria" ON public.review_audit_log FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon pode registrar auditoria" ON public.review_audit_log;
CREATE POLICY "anon pode registrar auditoria" ON public.review_audit_log FOR INSERT TO anon WITH CHECK (true);