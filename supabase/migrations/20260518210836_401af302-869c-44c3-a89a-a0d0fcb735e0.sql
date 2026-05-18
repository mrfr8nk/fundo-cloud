
ALTER FUNCTION public.gen_short_slug() SET search_path = public;
ALTER FUNCTION public.files_set_short_slug() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.gen_short_slug() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.files_set_short_slug() FROM public, anon, authenticated;
