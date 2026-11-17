'use client';
// Plays a lesson sound. Preference order:
//  1. a recording in /learn-audio/<id>.mp3 (listed in manifest.json)
//  2. the voice the learner picked in "Sound help", if any
//  3. an Arabic voice installed on the device
//  4. an online voice (needs internet; unofficial services, may be blocked)
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const VOICE_KEY = 'dalil.learn.voice';
let manifest = null;
let current = null;

const loadManifest = () => {
  if (!manifest) manifest = fetch(`${BASE}/learn-audio/manifest.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  return manifest;
};

/** Voices load asynchronously in most browsers: wait for them (up to 1.5 s). */
export function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve([]);
  const have = window.speechSynthesis.getVoices();
  if (have.length) return Promise.resolve(have);
  return new Promise((resolve) => {
    const done = () => { window.speechSynthesis.removeEventListener('voiceschanged', done); resolve(window.speechSynthesis.getVoices()); };
    window.speechSynthesis.addEventListener('voiceschanged', done);
    setTimeout(done, 1500);
  });
}

const isArabic = (v) => /^ar([-_]|$)/i.test(v.lang || '') || /arab|عرب/i.test(v.name || '');
export const arabicVoices = (vs) => vs.filter(isArabic);

export function savedVoiceName() { try { return localStorage.getItem(VOICE_KEY) || ''; } catch { return ''; } }
export function saveVoiceName(n) { try { if (n) localStorage.setItem(VOICE_KEY, n); else localStorage.removeItem(VOICE_KEY); } catch { /* ignore */ } }

export function stopLesson() {
  try { current?.pause(); } catch { /* ignore */ }
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

function playUrl(url) {
  return new Promise((resolve) => {
    try {
      const a = new Audio(url);
      current = a;
      a.addEventListener('error', () => resolve(false), { once: true });
      a.play().then(() => resolve(true)).catch(() => resolve(false));
    } catch { resolve(false); }
  });
}

async function playOnline(text) {
  const q = encodeURIComponent(text);
  const urls = [
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${q}`,
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=ar&q=${q}`
  ];
  for (const u of urls) if (await playUrl(u)) return 'online';
  return 'none';
}

/** @returns {Promise<'recording'|'voice'|'online'|'none'>} */
export async function playLesson({ text, id, rate = 0.7 }) {
  stopLesson();
  if (id) {
    const list = await loadManifest();
    if (list.includes(id) && await playUrl(`${BASE}/learn-audio/${id}.mp3`)) return 'recording';
  }
  if (typeof window === 'undefined' || !text) return 'none';
  if (window.speechSynthesis) {
    const vs = await loadVoices();
    const saved = savedVoiceName();
    const v = vs.find((x) => x.name === saved) || arabicVoices(vs)[0];
    if (v) {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.rate = rate;
      window.speechSynthesis.speak(u);
      return 'voice';
    }
  }
  return playOnline(text);
}
