// DukaanDost WhatsApp ordering pipeline (v1, heuristic parsing — no LLM).

import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { downloadTwilioMedia, sendWhatsAppMessage } from './twilio.server';
import { transcribeAudio } from './sarvam.server';

export interface ParsedItem {
  spoken_text: string;
  quantity_text: string;
  is_vague: boolean;
  guessed_catalog_item_id: number | null;
  guess_reason: string | null;
  resolved_catalog_item_id: number | null;
  unit_price: number;
  line_total: number;
}

const CONFIRM = /\b(haan|ha|haa|yes|y|ok|okay|okey|theek|thik|sahi|confirm|karo\s*confirm|done|bilkul|ji)\b/i;
const CANCEL = /\b(nahi|nahin|na|no|cancel|rehne\s*do|mat\s*bhejo)\b/i;

export function isConfirm(text: string): boolean {
  return CONFIRM.test(text) && !CANCEL.test(text);
}
export function isCancel(text: string): boolean {
  return CANCEL.test(text);
}

/** Last 10 digits of any phone-ish string. */
export function last10(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.slice(-10);
}

export function rs(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/** Split a transcript into candidate item phrases. */
export function splitPhrases(transcript: string): string[] {
  return transcript
    .split(/[,\n;।]|\baur\b|\bund\b|और/gi)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

const QTY_RE =
  /(\d+(?:[.,]\d+)?|\bek\b|\bdo\b|\bteen\b|\bchar\b|\bpaanch\b|\bpanch\b)\s*(kg|kilo|gram|gm|g|litre|liter|ltr|l|ml|packet|pack|nag|piece|pcs|dozen|bottle|adad)?/i;

const WORD_NUM: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
  panch: 5,
};

export function extractQuantity(phrase: string): { quantityText: string; multiplier: number; rest: string } {
  const m = phrase.match(QTY_RE);
  if (!m) return { quantityText: '1', multiplier: 1, rest: phrase.trim() };
  const raw = m[1]!.toLowerCase();
  const num = WORD_NUM[raw] ?? Number.parseFloat(raw.replace(',', '.'));
  const unit = m[2] ? ` ${m[2].toLowerCase()}` : '';
  const rest = phrase.replace(m[0], ' ').replace(/\s+/g, ' ').trim();
  return {
    quantityText: `${Number.isFinite(num) ? num : 1}${unit}`.trim(),
    multiplier: Number.isFinite(num) && num > 0 ? num : 1,
    rest: rest.length > 0 ? rest : phrase.trim(),
  };
}

interface CatalogMatch {
  id: number;
  category: string;
  name: string;
  unit: string;
  price: number;
  times_ordered: number;
  score: number;
}

const GOOD_MATCH = 0.42;

export async function parseTranscript(
  transcript: string,
  customerId: number | null,
): Promise<{ items: ParsedItem[]; total: number }> {
  const phrases = splitPhrases(transcript);
  const items: ParsedItem[] = [];
  let total = 0;

  for (const phrase of phrases) {
    const { quantityText, multiplier, rest } = extractQuantity(phrase);
    const cleaned = rest.replace(/["'“”‘’]/g, '').trim();

    const { data, error } = await supabaseAdmin.rpc('match_catalog_item' as never, {
      _phrase: cleaned,
    } as never);
    if (error) console.error('[whatsapp] match_catalog_item failed:', error.message);

    const matches = (data ?? []) as unknown as CatalogMatch[];
    const best = matches[0];

    let item: ParsedItem;

    if (best && (best.score >= GOOD_MATCH || best.name.toLowerCase() === cleaned.toLowerCase())) {
      const lineTotal = Number(best.price) * multiplier;
      item = {
        spoken_text: phrase.trim(),
        quantity_text: quantityText,
        is_vague: false,
        guessed_catalog_item_id: null,
        guess_reason: null,
        resolved_catalog_item_id: best.id,
        unit_price: Number(best.price),
        line_total: lineTotal,
      };
    } else {
      // Vague phrase — guess from this customer's saved preferences first.
      let guess: { id: number; name: string; price: number; times_ordered: number } | null = null;
      let reason: string | null = null;

      if (customerId) {
        const { data: prefs } = await supabaseAdmin
          .from('customer_preferences')
          .select('catalog_item_id, note, catalog_items(id, name, category, price, times_ordered)')
          .eq('customer_id', customerId);

        const prefRows = (prefs ?? []) as unknown as Array<{
          catalog_items: { id: number; name: string; category: string; price: number; times_ordered: number } | null;
        }>;

        const category = best?.category;
        const pick =
          prefRows.find((p) => p.catalog_items && category && p.catalog_items.category === category) ??
          prefRows.find((p) => p.catalog_items && cleaned.toLowerCase().includes(p.catalog_items.name.split(' ')[0]!.toLowerCase()));

        if (pick?.catalog_items) {
          guess = pick.catalog_items;
          reason = `${guess.name} — ${guess.times_ordered} baar yahi liya hai`;
        }
      }

      if (!guess && best) {
        const { data: popular } = await supabaseAdmin
          .from('catalog_items')
          .select('id, name, price, times_ordered')
          .eq('category', best.category)
          .eq('is_active', true)
          .order('times_ordered', { ascending: false })
          .limit(1);
        const top = (popular ?? [])[0];
        if (top) {
          guess = top as { id: number; name: string; price: number; times_ordered: number };
          reason = `${top.name} — ${top.times_ordered} baar yahi liya hai`;
        }
      }

      const price = guess ? Number(guess.price) : 0;
      item = {
        spoken_text: phrase.trim(),
        quantity_text: quantityText,
        is_vague: true,
        guessed_catalog_item_id: guess?.id ?? null,
        guess_reason: reason,
        resolved_catalog_item_id: null,
        unit_price: price,
        line_total: price * multiplier,
      };
    }

    total += item.line_total;
    items.push(item);
  }

  return { items, total };
}

export async function findOrCreateCustomer(whatsappFrom: string): Promise<number | null> {
  const digits = last10(whatsappFrom);
  if (!digits) return null;

  const { data: customers } = await supabaseAdmin.from('customers').select('id, phone');
  const match = ((customers ?? []) as Array<{ id: number; phone: string }>).find(
    (c) => last10(c.phone) === digits,
  );
  if (match) return match.id;

  const pretty = `${digits.slice(0, 5)} ${digits.slice(5)}`;
  const { data: created, error } = await supabaseAdmin
    .from('customers')
    .insert({ name: 'WhatsApp Grahak', phone: pretty })
    .select('id')
    .single();
  if (error) {
    console.error('[whatsapp] customer create failed:', error.message);
    return null;
  }
  return created.id;
}

export function buildConfirmationCard(items: ParsedItem[], total: number, names: Map<number, string>): string {
  const lines = items.map((it, i) => {
    const id = it.resolved_catalog_item_id ?? it.guessed_catalog_item_id;
    const name = id ? (names.get(id) ?? it.spoken_text) : it.spoken_text;
    const flag = it.resolved_catalog_item_id
      ? ''
      : it.guessed_catalog_item_id
        ? `\n   (andaaza: ${it.guess_reason})`
        : '\n   (yeh item samajh nahi aaya — dukaandar check karenge)';
    return `${i + 1}. ${name} — ${it.quantity_text} — ${rs(it.line_total)}${flag}`;
  });

  return [
    '*Aapka order:*',
    ...lines,
    '',
    `*Total: ${rs(total)}*`,
    '',
    'Sahi hai? Reply karein:',
    '• *HAAN* — order confirm',
    '• *NAHI* — cancel',
    '• Ya naya order likh/bol kar bhejein — badal denge.',
  ].join('\n');
}

export async function catalogNames(items: ParsedItem[]): Promise<Map<number, string>> {
  const ids = items
    .map((i) => i.resolved_catalog_item_id ?? i.guessed_catalog_item_id)
    .filter((v): v is number => typeof v === 'number');
  const map = new Map<number, string>();
  if (ids.length === 0) return map;
  const { data } = await supabaseAdmin.from('catalog_items').select('id, name').in('id', ids);
  for (const row of data ?? []) map.set(row.id, row.name);
  return map;
}

/** Main entry: process one inbound Twilio WhatsApp message. */
export async function handleInboundMessage(form: Record<string, string>): Promise<void> {
  const from = form['From'] ?? '';
  const messageSid = form['MessageSid'] ?? form['SmsMessageSid'] ?? '';
  const body = (form['Body'] ?? '').trim();
  const numMedia = Number.parseInt(form['NumMedia'] ?? '0', 10) || 0;

  if (!from) return;

  // Idempotency: this exact Twilio message already produced a pending order or an order.
  if (messageSid) {
    const [{ data: dupPending }, { data: dupOrder }] = await Promise.all([
      supabaseAdmin.from('pending_orders').select('id').eq('twilio_message_sid' as never, messageSid).limit(1),
      supabaseAdmin.from('orders').select('id').eq('twilio_message_sid' as never, messageSid).limit(1),
    ]);
    if ((dupPending ?? []).length > 0 || (dupOrder ?? []).length > 0) {
      console.log(`[whatsapp] duplicate MessageSid ${messageSid} ignored`);
      return;
    }
  }

  const customerId = await findOrCreateCustomer(from);

  // Is this a reply to an order awaiting confirmation?
  const { data: pendingRows } = await supabaseAdmin
    .from('pending_orders')
    .select('*')
    .eq('whatsapp_from', from)
    .eq('status', 'awaiting_confirmation')
    .order('created_at', { ascending: false })
    .limit(1);

  const pending = (pendingRows ?? [])[0];

  if (pending) {
    if (body && isConfirm(body)) {
      await confirmPendingOrder(pending, from, messageSid);
      return;
    }
    if (body && isCancel(body)) {
      await supabaseAdmin
        .from('pending_orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', pending.id);
      await sendWhatsAppMessage(from, 'Theek hai, order cancel kar diya. Kabhi bhi naya order bhej sakte hain.');
      return;
    }
    // Anything else = correction: re-parse and replace the pending order.
    const transcript = await getTranscript(form, body, numMedia);
    if (!transcript) {
      await sendWhatsAppMessage(from, 'Maaf kijiye, samajh nahi aaya. Order dobara bhejein ya *HAAN* / *NAHI* likhein.');
      return;
    }
    const { items, total } = await parseTranscript(transcript, pending.customer_id ?? customerId);
    await supabaseAdmin
      .from('pending_orders')
      .update({
        items: items as never,
        total,
        raw_transcript: transcript,
        status: 'awaiting_confirmation',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id);
    const names = await catalogNames(items);
    await sendWhatsAppMessage(from, `Order badal diya.\n\n${buildConfirmationCard(items, total, names)}`);
    return;
  }

  // New order
  const transcript = await getTranscript(form, body, numMedia);
  if (!transcript) {
    await sendWhatsAppMessage(from, 'Namaste! Apna order likh kar ya voice note bhej kar bhejein.');
    return;
  }

  const { items, total } = await parseTranscript(transcript, customerId);
  if (items.length === 0) {
    await sendWhatsAppMessage(from, 'Order samajh nahi aaya. Kripya item aur maatra bhejein, jaise: "2 litre doodh, 1 kg atta".');
    return;
  }

  const { error } = await supabaseAdmin.from('pending_orders').insert({
    customer_id: customerId,
    whatsapp_from: from,
    items: items as never,
    total,
    status: 'awaiting_confirmation',
    raw_transcript: transcript,
    twilio_message_sid: messageSid || null,
  } as never);
  if (error) {
    // Unique violation on message sid = Twilio retry; stay silent.
    if (error.code === '23505') return;
    throw new Error(`pending_orders insert failed: ${error.message}`);
  }

  const names = await catalogNames(items);
  await sendWhatsAppMessage(from, buildConfirmationCard(items, total, names));
}

async function getTranscript(
  form: Record<string, string>,
  body: string,
  numMedia: number,
): Promise<string> {
  if (numMedia > 0 && (form['MediaContentType0'] ?? '').startsWith('audio')) {
    const audio = await downloadTwilioMedia(form['MediaUrl0']!);
    return await transcribeAudio(audio, form['MediaContentType0']!);
  }
  return body;
}

async function confirmPendingOrder(
  pending: { id: number; customer_id: number | null; items: unknown; total: number; whatsapp_from: string },
  from: string,
  messageSid: string,
): Promise<void> {
  const customerId = pending.customer_id ?? (await findOrCreateCustomer(from));
  if (!customerId) throw new Error('No customer for pending order confirmation');

  const items = (pending.items ?? []) as ParsedItem[];

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerId,
      state: 'new',
      total: pending.total,
      twilio_message_sid: messageSid || null,
    } as never)
    .select('id')
    .single();

  if (orderError) {
    if (orderError.code === '23505') return; // Twilio retry
    throw new Error(`order insert failed: ${orderError.message}`);
  }

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
    items.map((it) => ({
      order_id: order.id,
      spoken_text: it.spoken_text,
      quantity_text: it.quantity_text,
      is_vague: it.is_vague,
      guessed_catalog_item_id: it.guessed_catalog_item_id,
      guess_reason: it.guess_reason,
      resolved_catalog_item_id: it.resolved_catalog_item_id,
      unit_price: it.unit_price,
      line_total: it.line_total,
    })),
  );
  if (itemsError) throw new Error(`order_items insert failed: ${itemsError.message}`);

  await supabaseAdmin
    .from('pending_orders')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', pending.id);

  // No ledger charge here — the charge is created on delivery, per product spec.

  await sendWhatsAppMessage(
    from,
    `Shukriya! Order confirm ho gaya.\nOrder #${order.id} — ${rs(Number(pending.total))}\nDukaandar taiyaar kar rahe hain.`,
  );
}
