// Sarvam AI speech-to-text (Saaras) for inbound WhatsApp/Telegram voice notes.
// Model: saarika:v2.5 on /speech-to-text endpoint (not the translate endpoint).

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

export async function transcribeAudio(
  audio: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const apiKey = process.env['SARVAM_API_KEY'];
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured.');
  }

  const ext = contentType.includes('mpeg')
    ? 'mp3'
    : contentType.includes('mp4')
      ? 'mp4'
      : contentType.includes('wav')
        ? 'wav'
        : 'ogg';

  const form = new FormData();
  form.append('file', new Blob([audio], { type: contentType }), `voice.${ext}`);
  form.append('model', 'saarika:v2.5');
  form.append('language_code', 'hi-IN');
  form.append('target_language_code', 'en-IN');
  form.append('with_timestamps', 'false');

  const res = await fetch(SARVAM_STT_URL, {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[sarvam] transcription failed [${res.status}]: ${errorBody}`);
    throw new Error(`Sarvam transcription failed [${res.status}]: ${errorBody}`);
  }

  const json = (await res.json()) as { transcript?: string };
  return (json.transcript ?? '').trim();
}
