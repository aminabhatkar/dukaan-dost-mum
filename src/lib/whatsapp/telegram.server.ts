// Telegram Bot API helpers for the DukaanDost demo channel.
// Unlike Twilio, sending and file downloads use the bot token directly in the
// URL/body — no separate auth-header dance, and no Trial-tier gating.

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set.');
  }
  return token;
}

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${botToken()}/${method}`;
}

/** Send a Markdown-formatted text message to a Telegram chat. */
export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const res = await fetch(apiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[telegram] sendMessage failed [${res.status}]: ${body}`);
    throw new Error(`Telegram sendMessage failed [${res.status}]: ${body}`);
  }
}

/** Prompt the user to share their phone number via Telegram's native contact button. */
export async function sendTelegramContactRequest(chatId: string, promptText: string): Promise<void> {
  const res = await fetch(apiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: promptText,
      reply_markup: {
        keyboard: [[{ text: '📱 Phone number share karein', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[telegram] contact request failed [${res.status}]: ${body}`);
    throw new Error(`Telegram contact request failed [${res.status}]: ${body}`);
  }
}

/** Resolve a Telegram file_id to a downloadable URL (token is embedded — no auth header needed). */
export async function getTelegramFileUrl(fileId: string): Promise<string> {
  const res = await fetch(apiUrl(`getFile?file_id=${encodeURIComponent(fileId)}`));
  if (!res.ok) {
    const body = await res.text();
    console.error(`[telegram] getFile failed [${res.status}]: ${body}`);
    throw new Error(`Telegram getFile failed [${res.status}]: ${body}`);
  }
  const data = (await res.json()) as { ok: boolean; result?: { file_path?: string } };
  const filePath = data.result?.file_path;
  if (!filePath) throw new Error('Telegram getFile returned no file_path.');
  return `https://api.telegram.org/file/bot${botToken()}/${filePath}`;
}

/** Download a Telegram file from an already-resolved URL. */
export async function downloadTelegramFile(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.error(`[telegram] file download failed [${res.status}]: ${body}`);
    throw new Error(`Telegram file download failed [${res.status}]: ${body}`);
  }
  return await res.arrayBuffer();
}
