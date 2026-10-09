GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pode_unidade(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_my_role() TO authenticated;