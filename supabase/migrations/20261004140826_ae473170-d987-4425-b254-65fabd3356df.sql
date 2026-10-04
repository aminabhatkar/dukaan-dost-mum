CREATE OR REPLACE FUNCTION public.zzz_vault_names()
RETURNS text[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(array_agg(name ORDER BY name), '{}') FROM vault.decrypted_secrets
$$;