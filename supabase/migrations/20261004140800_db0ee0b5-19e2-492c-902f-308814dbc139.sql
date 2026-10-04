CREATE OR REPLACE FUNCTION public.zzz_vault_probe()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT count(*) FROM vault.decrypted_secrets WHERE name = 'ORDER_NOTIFY_SECRET')::int
$$;