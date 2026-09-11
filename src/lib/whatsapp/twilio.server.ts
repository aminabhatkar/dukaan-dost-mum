// Twilio helpers for the WhatsApp ordering webhook.
// Sending goes through the Lovable connector gateway when a Twilio connection is
// linked (TWILIO_API_KEY present); otherwise it falls back to direct Basic Auth
// with TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN.

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function twilioBasicAuthHeader(): string | undefined {
  const sid = env('TWILIO_ACCOUNT_SID');
  const token = env('TWILIO_AUTH_TOKEN');
  if (!sid || !token) return undefined;
  return `Basic ${btoa(`${sid}:${token}`)}`;
}

/** Download inbound media (Twilio media URLs require Basic Auth). */
export async function downloadTwilioMedia(url: string): Promise<ArrayBuffer> {
  const auth = twilioBasicAuthHeader();
  if (!auth) {
    throw new Error(
      'Cannot download WhatsApp media: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not configured.',
    );
  }
  const res = await fetch(url, { headers: { Authorization: auth }, redirect: 'follow' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twilio media download failed [${res.status}]: ${body}`);
  }
  return await res.arrayBuffer();
}

/** Send a WhatsApp text message back to the customer. */
export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const from = env('TWILIO_WHATSAPP_FROM') ?? 'whatsapp:+14155238886'; // Twilio Sandbox default
  const params = new URLSearchParams({
    To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
    Body: body,
  });

  const connectionKey = env('TWILIO_API_KEY');
  const lovableKey = env('LOVABLE_API_KEY');

  let res: Response;
  if (connectionKey && lovableKey) {
    res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'X-Connection-Api-Key': connectionKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
  } else {
    const sid = env('TWILIO_ACCOUNT_SID');
    const auth = twilioBasicAuthHeader();
    if (!sid || !auth) {
      throw new Error(
        'Twilio is not configured: link the Twilio connection, or set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.',
      );
    }
    res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
  }

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[twilio] send failed [${res.status}]: ${errorBody}`);
    throw new Error(`Twilio send failed [${res.status}]: ${errorBody}`);
  }
}
