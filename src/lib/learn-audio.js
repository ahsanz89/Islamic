'use client';
// Plays a lesson sound. Preference order: a recording in /learn-audio/<id>.mp3 (listed in manifest.json),
// otherwise the device's Arabic voice. Drop real teacher recordings into public/learn-audio/ and list their ids in manifest.json.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
let manifest = null;
let current = null;

const loadManifest = () => {
  if (!manifest) manifest = fetch(`${BASE}/learn-audio/manifest.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  return manifest;
};

export function arabicVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const vs = window.speechSynthesis.getVoices();
  return vs.find((v) => /^ar(-|_|$)/i.test(v.lang)) || null;
}

export function voiceStatus() {
  if (typeof window === 'undefined') return 'unknown';
  if (!window.speechSynthesis) return 'none';
  return arabicVoice() ? 'ok' : 'missing';
}

export function stopLesson() {
  try { current?.pause(); } catch {}
  try { window.speechSynthesis?.cancel(); } catch {}
}

/** @returns {Promise<'recording'|'voice'|'none'>} */
export async function playLesson({ text, id, rate = 0.7 }) {
  stopLesson();
  if (id) {
    const list = await loadManifest();
    if (list.includes(id)) {
      try {
        current = new Audio(`${BASE}/learn-audio/${id}.mp3`);
        await current.play();
        return 'recording';
      } catch { /* fall through to the device voice */ }
    }
  }
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return 'none';
  const v = arabicVoice();
  if (!v) return 'none';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = v.lang; u.voice = v; u.rate = rate;
  window.speechSynthesis.speak(u);
  return 'voice';
}
