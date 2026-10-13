CREATE TABLE public.ciclo_config (
  ciclo text PRIMARY KEY,
  prazo_justificativas date NOT NULL,
  encerrado boolean NOT NULL DEFAULT false,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_por text
);
GRANT SELECT, INSERT, UPDATE ON public.ciclo_config TO authenticated;
GRANT ALL ON public.ciclo_config TO service_role;
ALTER TABLE public.ciclo_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logados leem prazos" ON public.ciclo_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin cria prazos" ON public.ciclo_config FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin edita prazos" ON public.ciclo_config FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.ciclo_config (ciclo, prazo_justificativas, encerrado, atualizado_por) VALUES
 ('2026-07','2026-08-11',true,'carga inicial (regra 7º dia útil)'),
 ('2026-08','2026-09-10',true,'carga inicial (regra 7º dia útil)'),
 ('2026-09','2026-10-15',false,'carga inicial (decisão Gente e Gestão)');