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
  first_name?: string;
  last_name?: string;
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

            const contactName = [message.contact.first_name, message.contact.last_name]
              .filter(Boolean).join(' ').trim() || 'Telegram Grahak';
            const customerId = await findOrCreateCustomer(message.contact.phone_number, contactName);
            // If the customer already existed with a placeholder name, update it to the real name
            if (customerId && contactName !== 'Telegram Grahak' && contactName !== 'WhatsApp Grahak') {
              const { data: existing } = await supabaseAdmin
                .from('customers')
                .select('id, name')
                .eq('id', customerId)
                .single();
              if (existing && (existing.name === 'Telegram Grahak' || existing.name === 'WhatsApp Grahak')) {
                await supabaseAdmin.from('customers').update({ name: contactName }).eq('id', customerId);
              }
            }
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

          // /rates command — reply with an inline button that opens the catalog as a Telegram Web App
          if (message.text && /^\/(rates|rate|ratelist)|rate list|rates dikhao|rate dikhao/i.test(message.text.trim())) {
            const catalogUrl = 'https://dukaan-dost-mum.lovable.app/catalog';
            const res = await fetch(`https://api.telegram.org/bot${process.env['TELEGRAM_BOT_TOKEN']}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '🛒 *Rehana Store — Aaj ke Rate*\nNeeche button dabaaiye aur poori rate list dekhein:',
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [[
                    {
                      text: '📋 Rate List Dekhein',
                      web_app: { url: catalogUrl },
                    },
                  ]],
                },
              }),
            });
            if (!res.ok) console.error('[telegram] /rates reply failed:', res.status, await res.text());
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
          console.log(`[telegram][diag] voice_field=${JSON.stringify(voice ?? null)} text=${JSON.stringify(message.text ?? null)}`);
          if (voice) {
            try {
              const fileUrl = await getTelegramFileUrl(voice.file_id);
              console.log(`[telegram][diag] file_url_resolved=${fileUrl} mime=${voice.mime_type ?? 'undefined'}`);
              form['NumMedia'] = '1';
              form['MediaContentType0'] = voice.mime_type ?? 'audio/ogg';
              form['MediaUrl0'] = fileUrl;
            } catch (err) {
              console.error('[telegram][diag] getTelegramFileUrl failed:', err);
              await sendTelegramMessage(chatId, 'Voice note download nahi ho saka. Thodi der mein dobara try karein.');
              return jsonOk();
            }
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
