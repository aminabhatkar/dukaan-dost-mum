DROP FUNCTION IF EXISTS public.zzz_vault_probe();
DROP FUNCTION IF EXISTS public.zzz_vault_names();

CREATE TABLE public.app_secrets (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp without time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_secrets TO service_role;
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role and the trigger helper (owner) can read.

INSERT INTO public.app_secrets (name, value)
VALUES ('ORDER_NOTIFY_SECRET', encode(gen_random_bytes(32), 'hex'));

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
BEGIN
  IF NEW.state IN ('accepted', 'delivered') AND (OLD.state IS DISTINCT FROM NEW.state) THEN
    SELECT value INTO v_secret FROM public.app_secrets WHERE name = 'ORDER_NOTIFY_SECRET';

    IF v_secret IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://dukaan-dost-mum.lovable.app/api/public/notify-order-status',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-notify-secret', v_secret
        ),
        body := jsonb_build_object('order_id', NEW.id, 'new_state', NEW.state)
      );
    ELSE
      RAISE WARNING 'notify_order_status_change: ORDER_NOTIFY_SECRET missing';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_status_notify ON public.orders;
CREATE TRIGGER order_status_notify
  AFTER UPDATE OF state ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM anon;
GRANT EXECUTE ON FUNCTION public.notify_order_status_change() TO authenticated, service_role;