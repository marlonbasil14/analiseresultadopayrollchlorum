REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.pode_unidade(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_my_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.bootstrap_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;