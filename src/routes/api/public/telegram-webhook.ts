import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import {
  sendTelegramMessage,
  sendTelegramContactRequest,
  getTelegramFileUrl,
  downloadTelegramFile,
} from '@/lib/whatsapp/telegram.server';
import { findOrCreateCustomer, type ChannelAdapter } from '@/lib/whatsapp/pipeline.server';

interface TelegramContact {
  phone_number: string;
  user_id?: number;
}

interface TelegramMediaFile {
  file_id: string;
  mime_type?: string;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  from?: { id: number };
  text?: string;
  contact?: TelegramContact;
  voice?: TelegramMediaFile;
  audio?: TelegramMediaFile;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

function jsonOk(): Response {
  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export const Route = createFileRoute('/api/public/telegram-webhook')({
  server: {
    handlers: {
      GET: async () => new Response('DukaanDost Telegram webhook is live.', { status: 200 }),
      POST: async ({ request }) => {
        let update: TelegramUpdate;
        try {
          const raw = await request.text();
          console.log(`[telegram][diag] RAW_BODY_BEGIN>>>${raw}<<<RAW_BODY_END`);
          update = JSON.parse(raw) as TelegramUpdate;
        } catch (err) {
          console.error('[telegram-webhook] could not parse body:', err);
          return jsonOk();
        }

        const message = update.message;
        if (!message) {
          // Ignore edited_message, callback_query, etc. for now.
          return jsonOk();
        }

        const chatId = String(message.chat.id);

        try {
          // Step 1: contact share — this is how we learn the user's real phone number,
          // since Telegram's chat_id has no relationship to it.
          if (message.contact) {
            if (message.from && message.contact.user_id && message.contact.user_id !== message.from.id) {
              await sendTelegramMessage(
                chatId,
                'Yeh kisi aur ka contact lag raha hai. Kripya *apna* phone number hi "Share phone number" button se bhejein.',
              );
              return jsonOk();
            }

            const customerId = await findOrCreateCustomer(message.contact.phone_number, 'Telegram Grahak');
            if (!customerId) {
              await sendTelegramMessage(chatId, 'Phone number samajh nahi aaya. Dobara try karein.');
              return jsonOk();
            }

            const { error: linkError } = await supabaseAdmin
              .from('telegram_links')
              .upsert(
                { chat_id: chatId, customer_id: customerId, phone: message.contact.phone_number } as never,
                { onConflict: 'chat_id' },
              );
            if (linkError) console.error('[telegram-webhook] link upsert failed:', linkError.message);

            await sendTelegramMessage(chatId, 'Shukriya! Ab aap apna order likh kar ya voice note bhej kar bata sakte hain.');
            return jsonOk();
          }

          // Step 2: is this chat already linked to a known phone/customer?
          const { data: linkRows } = await supabaseAdmin
            .from('telegram_links')
            .select('phone')
            .eq('chat_id' as never, chatId)
            .limit(1);
          const phone = (linkRows ?? [])[0]?.phone as string | undefined;

          if (!phone) {
            await sendTelegramContactRequest(
              chatId,
              'Namaste! DukaanDost mein order karne ke liye pehle apna phone number share karein:',
            );
            return jsonOk();
          }

          // Step 3: normalize into the shared field shape and hand off to the
          // channel-agnostic pipeline — same entry point WhatsApp uses.
          const form: Record<string, string> = {
            From: phone,
            Body: message.text ?? '',
            MessageSid: `telegram:${chatId}:${message.message_id}`,
            NumMedia: '0',
          };

          const voice = message.voice ?? message.audio;
          if (voice) {
            const fileUrl = await getTelegramFileUrl(voice.file_id);
            form.NumMedia = '1';
            form.MediaContentType0 = voice.mime_type ?? 'audio/ogg';
            form.MediaUrl0 = fileUrl;
          }

          const channel: ChannelAdapter = {
            send: (_to, body) => sendTelegramMessage(chatId, body),
            downloadMedia: downloadTelegramFile,
          };

          const { handleInboundMessage } = await import('@/lib/whatsapp/pipeline.server');
          await handleInboundMessage(form, channel);
        } catch (err) {
          console.error('[telegram-webhook] processing failed:', err);
        }

        return jsonOk();
      },
    },
  },
});
