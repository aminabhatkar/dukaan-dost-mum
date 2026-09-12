import { createFileRoute } from '@tanstack/react-router';
import { downloadTwilioMedia, sendWhatsAppMessage } from '@/lib/whatsapp/twilio.server';
import type { ChannelAdapter } from '@/lib/whatsapp/pipeline.server';

const twilioChannel: ChannelAdapter = {
  send: sendWhatsAppMessage,
  downloadMedia: downloadTwilioMedia,
};

export const Route = createFileRoute('/api/public/whatsapp-webhook')({
  server: {
    handlers: {
      GET: async () => new Response('DukaanDost WhatsApp webhook is live.', { status: 200 }),
      POST: async ({ request }) => {
        let form: Record<string, string> = {};
        try {
          const raw = await request.text();
          // TEMP DIAGNOSTIC: log the complete raw Twilio form body verbatim.
          console.log(`[whatsapp][diag] RAW_BODY_BEGIN>>>${raw}<<<RAW_BODY_END`);
          form = Object.fromEntries(new URLSearchParams(raw));
          for (const [k, v] of Object.entries(form)) {
            console.log(`[whatsapp][diag] field ${k} = >>>${v}<<<`);
          }
        } catch (err) {
          console.error('[whatsapp-webhook] could not read body:', err);
        }

        try {
          const { handleInboundMessage } = await import('@/lib/whatsapp/pipeline.server');
          await handleInboundMessage(form, twilioChannel);
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
