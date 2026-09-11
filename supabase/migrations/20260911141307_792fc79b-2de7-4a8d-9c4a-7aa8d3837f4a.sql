REVOKE EXECUTE ON FUNCTION public.match_catalog_item(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_catalog_item(text) TO service_role;
