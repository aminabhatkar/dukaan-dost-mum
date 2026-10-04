-- The trigger helper is a SECURITY DEFINER function that reads vault secrets.
-- Only the database itself (trigger execution, service role, signed-in users) may run it.
-- authenticated keeps EXECUTE because browser-initiated order updates fire the trigger.
REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM anon;
GRANT EXECUTE ON FUNCTION public.notify_order_status_change() TO authenticated, service_role;