-- pg_net lets DB triggers make async HTTP calls.
CREATE EXTENSION IF NOT EXISTS pg_net;

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
    BEGIN
      SELECT decrypted_secret INTO v_secret
      FROM vault.decrypted_secrets
      WHERE name = 'ORDER_NOTIFY_SECRET';
    EXCEPTION WHEN OTHERS THEN
      v_secret := NULL;
    END;

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
      RAISE WARNING 'notify_order_status_change: ORDER_NOTIFY_SECRET missing from vault';
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