import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}
interface GeminiContent { parts: GeminiPart[] }
interface GeminiCandidate { content: GeminiContent }
interface GeminiResponse { candidates?: GeminiCandidate[] }

interface ParsedItem {
  name: string;
  unit: string;
  price: number;
  category: string;
}

function jsonReply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const Route = createFileRoute('/api/public/parse-rate-list')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const GEMINI_API_KEY = process.env['GEMINI_API_KEY'];
        if (!GEMINI_API_KEY) {
          console.error('[parse-rate-list] GEMINI_API_KEY not set');
          return jsonReply({ error: 'API key missing' }, 500);
        }

        // --- 1. Read the uploaded file ---
        let imageBase64: string;
        let mimeType: string;
        try {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          if (!file) return jsonReply({ error: 'No file provided' }, 400);
          mimeType = file.type || 'image/jpeg';
          const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
          if (!supported.includes(mimeType.toLowerCase())) {
            return jsonReply({
              error: `Yeh format (${mimeType || 'unknown'}) support nahi hai. JPEG, PNG, ya WebP mein photo bhejein.`,
            }, 415);
          }
          const arrayBuffer = await file.arrayBuffer();
          imageBase64 = Buffer.from(arrayBuffer).toString('base64');
        } catch (err) {
          console.error('[parse-rate-list] formData read failed:', err);
          return jsonReply({ error: 'Could not read file' }, 400);
        }

        // --- 2. Call Gemini Vision ---
        const prompt = `You are reading a kirana / grocery shop rate list. Extract every item you can see.

Return ONLY a JSON array, no markdown, no explanation. Each element must have exactly these fields:
- "name": item name in English or Hinglish (e.g. "Doodh", "Aata", "Maggi", "Surf Excel")
- "unit": unit of sale (e.g. "1 litre", "500g", "1 packet", "per nag", "1 kg")
- "price": price as a plain integer in rupees (no ₹ symbol)
- "category": one of these — Dairy, Atta & Grains, Oil & Ghee, Sugar & Salt, Spices, Snacks & Biscuits, Soap & Detergent, Beverages, Pulses, Rice, Noodles & Pasta, Other

If a price is unclear or missing, use 0. If a unit is unclear, use "per nag".
Do not include headers, totals, or store names — only sellable items.

Example output:
[{"name":"Amul Doodh","unit":"1 litre","price":62,"category":"Dairy"},{"name":"Aashirvaad Aata","unit":"5 kg","price":220,"category":"Atta & Grains"}]`;

        let parsedItems: ParsedItem[] = [];
        try {
          // Older Gemini models are being retired for new keys; try newer
          // models first and fall back on 404 (retired) / 503 (overloaded).
          const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite-preview'];
          let geminiData: GeminiResponse | null = null;
          for (const model of models) {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [
                      { text: prompt },
                      { inlineData: { mimeType, data: imageBase64 } },
                    ],
                  }],
                  generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
                }),
              }
            );

            if (geminiRes.ok) {
              geminiData = await geminiRes.json() as GeminiResponse;
              break;
            }
            const errText = await geminiRes.text();
            console.error(`[parse-rate-list] Gemini ${model} error:`, geminiRes.status, errText.slice(0, 300));
            if (geminiRes.status === 503 || geminiRes.status === 404) continue;
            return jsonReply({ error: 'Gemini API error: ' + geminiRes.status }, 502);
          }

          if (!geminiData) {
            return jsonReply({ error: 'Gemini API overloaded, dobara try karein' }, 502);
          }
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          console.log('[parse-rate-list] Gemini raw output:', rawText.slice(0, 300));

          // Strip markdown code fences if present
          const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
          parsedItems = JSON.parse(cleaned) as ParsedItem[];

          if (!Array.isArray(parsedItems)) {
            console.error('[parse-rate-list] Gemini did not return an array:', cleaned);
            return jsonReply({ error: 'Could not parse items from image' }, 422);
          }
        } catch (err) {
          console.error('[parse-rate-list] Gemini call or parse failed:', err);
          return jsonReply({ error: 'Failed to read image' }, 502);
        }

        // --- 3. Filter and insert into catalog_items ---
        const validItems = parsedItems.filter(
          (it) => it && typeof it.name === 'string' && it.name.trim().length > 0
        ).map((it) => ({
          name: String(it.name).trim(),
          unit: String(it.unit ?? 'per nag').trim() || 'per nag',
          price: Number.isFinite(Number(it.price)) ? Math.round(Number(it.price)) : 0,
          category: String(it.category ?? 'Other').trim() || 'Other',
          is_active: true,
        }));

        if (validItems.length === 0) {
          return jsonReply({ inserted: 0, skipped: 0, message: 'No items found in image' });
        }

        // Upsert — skip duplicates on (category, name) instead of failing
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('catalog_items')
          .upsert(validItems, { onConflict: 'category,name', ignoreDuplicates: true })
          .select('id');

        if (insertError) {
          console.error('[parse-rate-list] insert failed:', insertError.message);
          return jsonReply({ error: 'DB insert failed: ' + insertError.message }, 500);
        }

        const insertedCount = (inserted ?? []).length;
        const skipped = validItems.length - insertedCount;
        console.log(`[parse-rate-list] inserted ${insertedCount}, skipped ${skipped} duplicates`);

        return jsonReply({ inserted: insertedCount, skipped, total: validItems.length });
      },
    },
  },
});
