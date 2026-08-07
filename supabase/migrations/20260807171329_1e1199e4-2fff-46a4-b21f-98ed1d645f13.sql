-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('bp', 'lider', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  nome text,
  role public.app_role NOT NULL DEFAULT 'bp',
  unidades text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_roles_email_key ON public.user_roles (lower(email));
CREATE UNIQUE INDEX user_roles_user_id_key ON public.user_roles (user_id) WHERE user_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.pode_unidade(_user_id uuid, _slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = _user_id
      AND (r.role = 'admin' OR '*' = ANY(r.unidades) OR _slug = ANY(r.unidades))
  );
$$;

CREATE POLICY "Usuario le o proprio papel" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin cria papeis" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin edita papeis" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin remove papeis" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Vincula o papel pre-cadastrado por e-mail ao usuario autenticado
CREATE OR REPLACE FUNCTION public.claim_my_role()
RETURNS public.user_roles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  _row public.user_roles;
BEGIN
  IF _email = '' THEN RETURN NULL; END IF;
  UPDATE public.user_roles
     SET user_id = auth.uid(), updated_at = now()
   WHERE lower(email) = _email AND user_id IS DISTINCT FROM auth.uid()
   RETURNING * INTO _row;
  IF _row.id IS NULL THEN
    SELECT * INTO _row FROM public.user_roles WHERE user_id = auth.uid();
  END IF;
  RETURN _row;
END;
$$;

-- Primeiro usuario do dominio vira admin quando nao existe nenhum admin
CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS public.user_roles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  _row public.user_roles;
BEGIN
  IF _email !~ '@chlorumsolutions\.com$' THEN
    RAISE EXCEPTION 'Dominio nao autorizado';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    SELECT * INTO _row FROM public.user_roles WHERE user_id = auth.uid();
    RETURN _row;
  END IF;
  INSERT INTO public.user_roles (user_id, email, role, unidades)
  VALUES (auth.uid(), _email, 'admin', ARRAY['*'])
  ON CONFLICT (user_id) WHERE user_id IS NOT NULL
  DO UPDATE SET role = 'admin', unidades = ARRAY['*'], updated_at = now()
  RETURNING * INTO _row;
  RETURN _row;
END;
$$;

-- FLUXO DA ANALISE ------------------------------------------------------
ALTER TABLE public.unit_monthly_review
  ADD COLUMN IF NOT EXISTS fluxo_status text NOT NULL DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS justificativas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enviado_em timestamptz,
  ADD COLUMN IF NOT EXISTS enviado_por text,
  ADD COLUMN IF NOT EXISTS consolidado_em timestamptz,
  ADD COLUMN IF NOT EXISTS consolidado_por text,
  ADD COLUMN IF NOT EXISTS motivo_reabertura text,
  ADD COLUMN IF NOT EXISTS autor_email text;

CREATE UNIQUE INDEX IF NOT EXISTS unit_monthly_review_unit_ciclo_key
  ON public.unit_monthly_review (unit_slug, ciclo);

DROP POLICY IF EXISTS "Analises visiveis para usuarios autenticados" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "Usuarios autenticados criam analises" ON public.unit_monthly_review;
DROP POLICY IF EXISTS "Usuarios autenticados editam analises" ON public.unit_monthly_review;

CREATE POLICY "Le analises das unidades permitidas" ON public.unit_monthly_review
  FOR SELECT TO authenticated USING (public.pode_unidade(auth.uid(), unit_slug));

CREATE POLICY "Cria analises das unidades permitidas" ON public.unit_monthly_review
  FOR INSERT TO authenticated
  WITH CHECK (public.pode_unidade(auth.uid(), unit_slug) AND autor_id = auth.uid());

CREATE POLICY "Edita analises das unidades permitidas" ON public.unit_monthly_review
  FOR UPDATE TO authenticated
  USING (public.pode_unidade(auth.uid(), unit_slug))
  WITH CHECK (public.pode_unidade(auth.uid(), unit_slug) AND autor_id = auth.uid());

-- AUDITORIA -------------------------------------------------------------
CREATE TABLE public.review_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_slug text NOT NULL,
  ciclo text NOT NULL,
  acao text NOT NULL,
  detalhe text,
  user_id uuid NOT NULL,
  email text,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.review_audit_log TO authenticated;
GRANT ALL ON public.review_audit_log TO service_role;
ALTER TABLE public.review_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Le auditoria das unidades permitidas" ON public.review_audit_log
  FOR SELECT TO authenticated USING (public.pode_unidade(auth.uid(), unit_slug));

CREATE POLICY "Registra auditoria" ON public.review_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.pode_unidade(auth.uid(), unit_slug));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();