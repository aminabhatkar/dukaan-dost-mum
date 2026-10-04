// Sends a Telegram status message to a customer when their order state changes
// to 'accepted' or 'delivered'. Called by the notify_order_status_change DB
// trigger (pg_net), which authenticates with the ORDER_NOTIFY_SECRET header.

import { createFileRoute } from '@tanstack/react-router';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

interface NotifyBody {
  order_id: number;
  new_state: string;
}

function jsonReply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const Route = createFileRoute('/api/public/notify-order-status')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const expected = process.env['ORDER_NOTIFY_SECRET'];
          if (!expected) {
            console.error('[notify-order-status] ORDER_NOTIFY_SECRET is not configured');
            return jsonReply({ error: 'not configured' }, 500);
          }
          const provided = request.headers.get('x-notify-secret') ?? '';
          const a = Buffer.from(provided);
          const b = Buffer.from(expected);
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return jsonReply({ error: 'unauthorized' }, 401);
          }

          const body = (await request.json()) as NotifyBody;
          const { order_id, new_state } = body;
          if (typeof order_id !== 'number' || !Number.isFinite(order_id)) {
            return jsonReply({ error: 'bad order_id' }, 400);
          }
          if (!['accepted', 'delivered'].includes(new_state)) {
            return jsonReply({ ok: true, ignored: true });
          }

          const { data: order, error: orderErr } = await supabaseAdmin
            .from('orders')
            .select('customer_id, total')
            .eq('id', order_id)
            .single();
          if (orderErr || !order) {
            console.error('[notify-order-status] order fetch failed:', orderErr?.message);
            return jsonReply({ ok: true, reason: 'order not found' });
          }

          const { data: link, error: linkErr } = await supabaseAdmin
            .from('telegram_links')
            .select('chat_id')
            .eq('customer_id', order.customer_id)
            .single();
          if (linkErr || !link) {
            // Customer didn't order via Telegram — nothing to do
            return jsonReply({ ok: true, reason: 'no telegram link' });
          }

          const total = Math.round(Number(order.total));
          const text = new_state === 'accepted'
            ? `Order confirm ho gaya! Dukaandar taiyaar kar rahe hain. Order #${order_id}`
            : `Order deliver ho gaya. Aapke khate mein Rs ${total} add ho gaya. Shukriya! Order #${order_id}`;

          const botToken = process.env['TELEGRAM_BOT_TOKEN'];
          if (!botToken) {
            console.error('[notify-order-status] TELEGRAM_BOT_TOKEN is not configured');
            return jsonReply({ error: 'telegram not configured' }, 500);
          }

          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: link.chat_id, text }),
          });
          if (!res.ok) {
            console.error('[notify-order-status] telegram send failed:', res.status, await res.text());
            return jsonReply({ ok: false, reason: 'telegram send failed' });
          }

          return jsonReply({ ok: true });
        } catch (err) {
          console.error('[notify-order-status] error:', err);
          return jsonReply({ ok: true, reason: 'error' }); // never fail the trigger caller
        }
      },
    },
  },
});
