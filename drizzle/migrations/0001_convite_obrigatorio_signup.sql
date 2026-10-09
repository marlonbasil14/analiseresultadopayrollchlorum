CREATE OR REPLACE FUNCTION public.exigir_convite_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(coalesce(NEW.email,'')) !~ '@chlorumsolutions\.com$' THEN
    RAISE EXCEPTION 'Dominio nao autorizado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE lower(email) = lower(NEW.email)) THEN
    RAISE EXCEPTION 'Acesso somente por convite';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.exigir_convite_signup() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS exigir_convite_signup ON auth.users;
CREATE TRIGGER exigir_convite_signup BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.exigir_convite_signup();

-- pode_unidade passa a exigir vinculo ao usuario (ja exigia via user_id); bootstrap_admin desativado: criacao so via painel
CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS public.user_roles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.user_roles;
BEGIN
  SELECT * INTO _row FROM public.user_roles WHERE user_id = auth.uid();
  RETURN _row;
END;
$$;