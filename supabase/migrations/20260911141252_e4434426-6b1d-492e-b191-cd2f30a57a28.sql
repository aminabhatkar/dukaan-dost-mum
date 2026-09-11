CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.pending_orders ADD COLUMN IF NOT EXISTS twilio_message_sid text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS twilio_message_sid text;

CREATE UNIQUE INDEX IF NOT EXISTS pending_orders_twilio_message_sid_key
  ON public.pending_orders (twilio_message_sid) WHERE twilio_message_sid IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_twilio_message_sid_key
  ON public.orders (twilio_message_sid) WHERE twilio_message_sid IS NOT NULL;

CREATE INDEX IF NOT EXISTS catalog_items_name_trgm_idx
  ON public.catalog_items USING gin (name gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.match_catalog_item(_phrase text)
RETURNS TABLE (id integer, category text, name text, unit text, price numeric, times_ordered integer, score real)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.category, c.name, c.unit, c.price, c.times_ordered,
         similarity(lower(c.name), lower(_phrase)) AS score
  FROM public.catalog_items c
  WHERE c.is_active
  ORDER BY (lower(c.name) = lower(_phrase)) DESC,
           similarity(lower(c.name), lower(_phrase)) DESC,
           c.times_ordered DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.match_catalog_item(text) TO service_role;
