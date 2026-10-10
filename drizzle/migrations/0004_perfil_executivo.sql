ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'executivo';

CREATE OR REPLACE FUNCTION public.e_leitor_total(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id
    AND (r.role::text IN ('admin','executivo') OR '*' = ANY(r.unidades)));
$$;

CREATE OR REPLACE FUNCTION public.pode_ler_unidade(_user_id uuid, _slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.e_leitor_total(_user_id) OR public.pode_unidade(_user_id, _slug);
$$;

GRANT EXECUTE ON FUNCTION public.e_leitor_total(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pode_ler_unidade(uuid, text) TO authenticated;

DROP POLICY IF EXISTS "logados leem analises da sua unidade" ON public.unit_monthly_review;
CREATE POLICY "logados leem analises da sua unidade" ON public.unit_monthly_review
  FOR SELECT TO authenticated USING (public.pode_ler_unidade(auth.uid(), unit_slug));

DROP POLICY IF EXISTS "logados leem dados da sua unidade" ON public.ciclo_unidade_dados;
CREATE POLICY "logados leem dados da sua unidade" ON public.ciclo_unidade_dados
  FOR SELECT TO authenticated USING (
    CASE WHEN unit_slug = '_consolidado' THEN public.e_leitor_total(auth.uid())
         ELSE public.pode_ler_unidade(auth.uid(), unit_slug) END);