CREATE TABLE public.ciclo_unidade_dados (
  ciclo text NOT NULL,
  unit_slug text NOT NULL,
  payload jsonb NOT NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ciclo, unit_slug)
);
GRANT SELECT ON public.ciclo_unidade_dados TO authenticated;
GRANT ALL ON public.ciclo_unidade_dados TO service_role;
REVOKE ALL ON public.ciclo_unidade_dados FROM anon;
ALTER TABLE public.ciclo_unidade_dados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logados leem dados da sua unidade" ON public.ciclo_unidade_dados
  FOR SELECT TO authenticated
  USING (
    CASE WHEN unit_slug = '_consolidado'
      THEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND (r.role = 'admin' OR '*' = ANY(r.unidades)))
      ELSE public.pode_unidade(auth.uid(), unit_slug)
    END
  );