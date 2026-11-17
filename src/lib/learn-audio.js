'use client';
// Plays a lesson sound. Preference order:
//  1. a recording in /learn-audio/<soundKey(text)>.mp3 (listed in manifest.json; the build ships one for every lesson text)
//  2. the voice the learner picked in "Sound help", if any
//  3. an Arabic voice installed on the device
//  4. an online voice (needs internet; unofficial services, may be blocked)
import { soundKey } from './learn-key';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const VOICE_KEY = 'dalil.learn.voice';
const SPEED_KEY = 'dalil.learn.speed';
/** 'slow' (default, for beginners: the recordings are already slow and clear) or 'normal' (same recording, a little faster, pitch kept). */
export const SPEEDS = { slow: { rate: 1, speech: 0.5 }, normal: { rate: 1.3, speech: 0.8 } };
let speed = null;
const speedListeners = new Set();
export function getSpeed() {
  if (speed) return speed;
  try { speed = localStorage.getItem(SPEED_KEY) === 'normal' ? 'normal' : 'slow'; } catch { speed = 'slow'; }
  return speed;
}
export function setSpeed(v) {
  speed = v === 'normal' ? 'normal' : 'slow';
  try { localStorage.setItem(SPEED_KEY, speed); } catch { /* ignore */ }
  speedListeners.forEach((f) => f(speed));
}
export function onSpeedChange(f) { speedListeners.add(f); return () => speedListeners.delete(f); }
let manifest = null;
let current = null;
const listeners = new Set();
const emit = (state) => listeners.forEach((f) => f(state));
/** Subscribe to 'playing' / 'idle' changes (used to show Stop / Play on the button). */
export function onLessonState(f) { listeners.add(f); return () => listeners.delete(f); }

const loadManifest = () => {
  if (!manifest) manifest = fetch(`${BASE}/learn-audio/manifest.json`).then((r) => (r.ok ? r.json() : [])).then((l) => { if (typeof window !== 'undefined') window.__lqRecordings = l.length > 0; return new Set(l); }).catch(() => { if (typeof window !== 'undefined') window.__lqRecordings = false; return new Set(); });
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
  current = null;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  emit('idle');
}

function playUrl(url) {
  return new Promise((resolve) => {
    try {
      const a = new Audio(url);
      a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true;
      a.playbackRate = SPEEDS[getSpeed()].rate;
      current = a;
      a.addEventListener('error', () => resolve(false), { once: true });
      a.addEventListener('ended', () => { if (current === a) { current = null; emit('idle'); } }, { once: true });
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
export async function playLesson({ text, id, rate }) {
  stopLesson();
  rate = rate ?? SPEEDS[getSpeed()].speech;
  if (typeof window === 'undefined' || !text) return 'none';
  const list = await loadManifest();
  const key = [soundKey(text), id].find((k) => k && list.has(k));
  if (key) {
    emit('playing');
    if (await playUrl(`${BASE}/learn-audio/${key}.mp3`)) return 'recording';
    emit('idle');
  }
  if (window.speechSynthesis) {
    const vs = await loadVoices();
    const saved = savedVoiceName();
    const v = vs.find((x) => x.name === saved) || arabicVoices(vs)[0];
    if (v) {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.rate = rate;
      u.onend = u.onerror = () => emit('idle');
      emit('playing');
      window.speechSynthesis.speak(u);
      return 'voice';
    }
  }
  return playOnline(text);
}
