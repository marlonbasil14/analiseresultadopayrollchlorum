ALTER TABLE public.unit_monthly_review
  ADD COLUMN IF NOT EXISTS desvio_contabil boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS desvio_contabil_valor numeric NULL,
  ADD COLUMN IF NOT EXISTS desvio_contabil_nota text NULL,
  ADD COLUMN IF NOT EXISTS desvio_contabil_marcado_por text NULL,
  ADD COLUMN IF NOT EXISTS desvio_contabil_marcado_em timestamptz NULL;

CREATE TABLE public.orcamento_anual (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_slug text NOT NULL,
  diretoria_slug text NULL,
  mes date NOT NULL,
  orcado numeric NOT NULL,
  fonte text NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_slug, mes)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orcamento_anual TO authenticated;
GRANT ALL ON public.orcamento_anual TO service_role;
ALTER TABLE public.orcamento_anual ENABLE ROW LEVEL SECURITY;
CREATE POLICY "executivo e admin leem orcamento" ON public.orcamento_anual FOR SELECT TO authenticated USING (public.e_leitor_total(auth.uid()));
CREATE POLICY "admin insere orcamento" ON public.orcamento_anual FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin edita orcamento" ON public.orcamento_anual FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin remove orcamento" ON public.orcamento_anual FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.indicadores_operacionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_slug text NOT NULL,
  mes date NOT NULL,
  venda numeric NULL,
  producao numeric NULL,
  producao_unidade text NULL,
  fonte text NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_slug, mes)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.indicadores_operacionais TO authenticated;
GRANT ALL ON public.indicadores_operacionais TO service_role;
ALTER TABLE public.indicadores_operacionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "executivo e admin leem indicadores" ON public.indicadores_operacionais FOR SELECT TO authenticated USING (public.e_leitor_total(auth.uid()));
CREATE POLICY "admin insere indicadores" ON public.indicadores_operacionais FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin edita indicadores" ON public.indicadores_operacionais FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin remove indicadores" ON public.indicadores_operacionais FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));