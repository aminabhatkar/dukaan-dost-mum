import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/whatsapp-webhook')({
  server: {
    handlers: {
      GET: async () => new Response('DukaanDost WhatsApp webhook is live.', { status: 200 }),
      POST: async ({ request }) => {
        let form: Record<string, string> = {};
        try {
          const raw = await request.text();
          form = Object.fromEntries(new URLSearchParams(raw));
        } catch (err) {
          console.error('[whatsapp-webhook] could not read body:', err);
        }

        try {
          const { handleInboundMessage } = await import('@/lib/whatsapp/pipeline.server');
          await handleInboundMessage(form);
        } catch (err) {
          // Always 200 back to Twilio so it doesn't retry-storm; log for debugging.
          console.error('[whatsapp-webhook] processing failed:', err);
        }

        return new Response('<Response></Response>', {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      },
    },
  },
});
