'use client';
// Client-side Quran audio engine (singleton, survives page navigation).
// - one <audio> for ayah recitation, one cached <audio> per word, never playing at the same time
// - tiny external store so only the verse / word that changes re-renders
import { useSyncExternalStore } from 'react';
import { AUDIO_SOURCES, reciterById } from './reciters';

const isBrowser = typeof window !== 'undefined';

export const state = {
  q: null,            // { surah:{n,name,ar,verses}, v, mode:'ayah'|'surah' }   v = 0 means the Bismillah
  status: 'idle',     // idle | loading | playing | paused | ended | error
  err: '',
  time: 0,
  dur: 0,
  phase: '',          // '' = recitation, 'urdu' = spoken Urdu translation of the current ayah
  word: { key: '', status: '' }, // status: loading | playing | fallback | error
  toast: ''
};
const cfg = { reciter: 'alafasy', repeat: false, continuous: true, bismillah: true, volume: 0.9, wordAudio: true, wordHoverPlay: false, urdu: false };

const subs = new Set();
const tsubs = new Set();
const emit = () => subs.forEach((f) => f());
const emitTime = () => tsubs.forEach((f) => f());
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
const subscribeTime = (f) => { tsubs.add(f); return () => tsubs.delete(f); };
const initial = { ...state };

/** Subscribe to a primitive (or stable) slice of the state. */
export function useAudioState(selector) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(initial));
}
export function useAudioTime(selector) {
  return useSyncExternalStore(subscribeTime, () => selector(state), () => selector(initial));
}

let ayahEl = null;
let prefetchEl = null;
let toastTimer = 0;
const wordCache = new Map(); // url → HTMLAudioElement (most recent 12)
let curWordEl = null;
let wordToken = 0;

const set = (patch) => { Object.assign(state, patch); emit(); };
const toast = (msg) => {
  set({ toast: msg });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: '' }), 3500);
};

function ensureEl() {
  if (!isBrowser || ayahEl) return;
  ayahEl = new Audio();
  ayahEl.preload = 'auto';
  ayahEl.volume = cfg.volume;
  ayahEl.addEventListener('timeupdate', () => { state.time = ayahEl.currentTime; emitTime(); });
  ayahEl.addEventListener('durationchange', () => { state.dur = Number.isFinite(ayahEl.duration) ? ayahEl.duration : 0; emitTime(); });
  ayahEl.addEventListener('loadstart', () => { if (state.q && state.status !== 'paused') set({ status: 'loading', err: '' }); });
  ayahEl.addEventListener('waiting', () => { if (state.status === 'playing') set({ status: 'loading' }); });
  ayahEl.addEventListener('canplay', () => { if (state.status === 'loading' && !ayahEl.paused) set({ status: 'playing' }); });
  ayahEl.addEventListener('playing', () => set({ status: 'playing', err: '' }));
  ayahEl.addEventListener('pause', () => { if (!ayahEl.ended && state.status !== 'idle' && state.status !== 'error' && state.status !== 'loading') set({ status: 'paused' }); });
  ayahEl.addEventListener('ended', onEnded);
  ayahEl.addEventListener('error', () => {
    if (!state.q) return;
    const off = typeof navigator !== 'undefined' && navigator.onLine === false;
    // a missing Urdu clip never blocks the recitation: skip it and carry on
    if (state.phase === 'urdu' && !off) { toast('urdu-unavailable'); state.phase = ''; advance(); return; }
    set({ status: 'error', err: off ? 'offline' : 'unavailable' });
  });
  window.addEventListener('online', () => { if (state.status === 'error' && state.q) retry(); });
}

export const isWhole = (reciterId) => reciterById(reciterId).type === 'surah';
export const verseUrl = (reciterId, s, v) => {
  const r = reciterById(reciterId);
  if (r.type === 'surah') return AUDIO_SOURCES.surahFile(r.slug, s);
  return AUDIO_SOURCES.ayah(r.folder, v === 0 ? 1 : s, v === 0 ? 1 : v);
};

function load(surah, v, mode, autoplay = true) {
  if (v < 0) v = 1;
  ensureEl();
  stopWord();
  const whole = isWhole(cfg.reciter);
  state.q = { surah, v: whole ? -1 : v, mode: whole ? 'surah' : mode, whole };
  state.time = 0; state.dur = 0; emitTime();
  set({ status: 'loading', err: '', phase: '' });
  ayahEl.src = verseUrl(cfg.reciter, surah.n, v);
  ayahEl.volume = cfg.volume;
  if (autoplay) {
    const p = ayahEl.play();
    if (p && p.catch) p.catch((e) => { if (e && e.name === 'NotAllowedError') set({ status: 'paused' }); });
  }
  prefetchNext();
  mediaSession();
}

function prefetch(url) {
  if (!isBrowser) return;
  prefetchEl = prefetchEl || new Audio();
  prefetchEl.preload = 'auto';
  prefetchEl.src = url;
}
function prefetchNext() {
  const q = state.q;
  if (!q || q.whole || !isBrowser) return;
  if (cfg.urdu && q.v >= 1) { prefetch(AUDIO_SOURCES.urdu(q.surah.n, q.v)); return; }
  if (q.mode !== 'surah') return;
  if (q.v < q.surah.verses) prefetch(verseUrl(cfg.reciter, q.surah.n, q.v + 1));
}

/** After the recitation (and the Urdu clip, if any): repeat, move to the next ayah, or finish. */
function advance() {
  const q = state.q;
  if (!q) return;
  if (cfg.repeat && !q.whole) { load(q.surah, q.v, q.mode); return; }
  if (cfg.repeat && q.whole) { ayahEl.currentTime = 0; ayahEl.play().catch(() => {}); return; }
  if (!q.whole && q.mode === 'surah' && cfg.continuous) {
    if (q.v < q.surah.verses) { load(q.surah, q.v + 1, 'surah'); return; }
  }
  set({ status: 'ended', phase: '' });
}

function onEnded() {
  const q = state.q;
  if (!q) return;
  if (cfg.urdu && !q.whole && q.v >= 1 && state.phase !== 'urdu') {
    // the spoken Urdu translation follows each ayah
    state.phase = 'urdu';
    state.time = 0; state.dur = 0; emitTime();
    set({ status: 'loading', phase: 'urdu' });
    ayahEl.src = AUDIO_SOURCES.urdu(q.surah.n, q.v);
    ayahEl.play().catch(() => {});
    if (q.mode === 'surah' && q.v < q.surah.verses) prefetch(verseUrl(cfg.reciter, q.surah.n, q.v + 1));
    return;
  }
  state.phase = '';
  advance();
}

/** Play one ayah. `surah` = { n, name, ar, verses }. */
export function playAyah(surah, v, mode = 'ayah') { load(surah, v, mode); }
/** Play a whole surah from `from` (default 1). Starts with the Bismillah when the setting is on. */
export function playSurah(surah, from = 1) {
  const bism = cfg.bismillah && from === 1 && surah.n !== 1 && surah.n !== 9;
  load(surah, bism ? 0 : from, 'surah');
}
export function pause() { if (ayahEl && state.q) { ayahEl.pause(); set({ status: 'paused' }); } }
export function resume() {
  if (!ayahEl || !state.q) return;
  if (state.status === 'ended') { load(state.q.surah, state.q.v, state.q.mode); return; }
  stopWord();
  ayahEl.play().catch(() => {});
}
export function toggle() { if (state.status === 'playing' || state.status === 'loading') pause(); else resume(); }
export function stop() {
  if (ayahEl) { ayahEl.pause(); ayahEl.removeAttribute('src'); ayahEl.load(); }
  state.q = null; state.time = 0; state.dur = 0; emitTime();
  set({ status: 'idle', err: '', phase: '' });
}
export function replay() {
  if (!ayahEl || !state.q) return;
  if (state.phase === 'urdu') { load(state.q.surah, state.q.v, state.q.mode); return; }
  ayahEl.currentTime = 0; ayahEl.play().catch(() => {});
}
export function next() {
  const q = state.q; if (!q || q.whole) return;
  if (q.v < q.surah.verses) load(q.surah, q.v + 1, q.mode);
}
export function prev() {
  const q = state.q; if (!q) return;
  if (q.whole || (ayahEl && ayahEl.currentTime > 3)) { replay(); return; }
  const pv = q.v - 1;
  if (pv >= 1 || (pv === 0 && q.mode === 'surah' && cfg.bismillah && q.surah.n !== 1 && q.surah.n !== 9)) load(q.surah, pv, q.mode);
  else replay();
}
export function seek(t) { if (ayahEl && state.q && Number.isFinite(t)) { ayahEl.currentTime = Math.max(0, Math.min(t, state.dur || t)); state.time = ayahEl.currentTime; emitTime(); } }
export function retry() { if (state.q) load(state.q.surah, Math.max(state.q.v, 1), state.q.mode); }

/** Keep the engine in sync with the saved settings (called from React). */
export function configure(next) {
  const prevReciter = cfg.reciter;
  Object.assign(cfg, next);
  if (ayahEl) ayahEl.volume = cfg.volume;
  if (curWordEl) curWordEl.volume = cfg.volume;
  if (next.reciter && next.reciter !== prevReciter && state.q && ayahEl) {
    const wasPlaying = state.status === 'playing' || state.status === 'loading';
    load(state.q.surah, state.q.v, state.q.mode, wasPlaying);
    if (!wasPlaying) set({ status: 'paused' });
  }
}

/* ---------------------------------------------------------------- word pronunciation */
export const wordKey = (s, v, w) => `${s}:${v}:${w}`;

export function stopWord() {
  wordToken++;
  if (curWordEl) { try { curWordEl.pause(); curWordEl.currentTime = 0; } catch {} curWordEl = null; }
  if (isBrowser && window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch {} }
  if (state.word.key) { state.word = { key: '', status: '' }; emit(); }
}

function wordAudio(url) {
  let a = wordCache.get(url);
  if (a) { wordCache.delete(url); wordCache.set(url, a); return a; }
  a = new Audio(); a.preload = 'auto'; a.src = url;
  wordCache.set(url, a);
  if (wordCache.size > 12) { const [oldUrl, old] = wordCache.entries().next().value; if (old !== curWordEl) { old.removeAttribute('src'); wordCache.delete(oldUrl); } }
  return a;
}

function speakFallback(text, token) {
  const synth = isBrowser && window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return false;
  const voices = synth.getVoices ? synth.getVoices() : [];
  const ar = voices.find((x) => /^ar/i.test(x.lang));
  if (!ar) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = ar; u.lang = ar.lang; u.rate = 0.8; u.volume = cfg.volume;
  u.onend = () => { if (token === wordToken) stopWord(); };
  u.onerror = () => { if (token === wordToken) stopWord(); };
  state.word = { ...state.word, status: 'fallback' }; emit();
  synth.speak(u);
  return true;
}

/** Play the recorded pronunciation of word number `w` (1-based) of verse s:v. */
export function playWord(s, v, w, text) {
  if (!isBrowser) return;
  const key = wordKey(s, v, w);
  if (ayahEl && state.q && (state.status === 'playing' || state.status === 'loading')) { ayahEl.pause(); set({ status: 'paused' }); }
  stopWord();
  const token = wordToken;
  const url = AUDIO_SOURCES.word(s, v, w);
  const a = wordAudio(url);
  curWordEl = a;
  a.volume = cfg.volume;
  a.currentTime = 0;
  state.word = { key, status: 'loading' }; emit();
  const fail = () => {
    if (token !== wordToken) return;
    const used = text && speakFallback(text, token);
    if (!used) { state.word = { key: '', status: '' }; emit(); toast(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'word-unavailable'); }
  };
  a.onplaying = () => { if (token === wordToken) { state.word = { key, status: 'playing' }; emit(); } };
  a.onended = () => { if (token === wordToken) { curWordEl = null; state.word = { key: '', status: '' }; emit(); } };
  a.onerror = fail;
  const p = a.play();
  if (p && p.catch) p.catch((e) => { if (e && e.name !== 'AbortError') fail(); });
}

/* ---------------------------------------------------------------- lock-screen / media keys */
function mediaSession() {
  if (!isBrowser || !('mediaSession' in navigator) || !state.q) return;
  try {
    const { surah, v } = state.q;
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${surah.name}${v > 0 ? ` · ${v}` : v === 0 ? ' · Bismillah' : ''}`, artist: reciterById(cfg.reciter).name.en, album: 'Quran' });
    navigator.mediaSession.setActionHandler('play', resume);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
  } catch {}
}
