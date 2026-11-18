// Quran audio engine (one shared player). Same behaviour as the website:
// ayah recitation, optional spoken Urdu translation after each ayah, surah playback, full-surah reciters.
import { useSyncExternalStore } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AUDIO, reciterById } from './reciters';

export const state = { q: null, status: 'idle', phase: '', err: '' };   // status: idle | loading | playing | paused | ended | error
const cfg = { reciter: 'alafasy', urdu: false, continuous: true, bismillah: true };
const subs = new Set();
const emit = () => subs.forEach((f) => f());
const set = (p) => { Object.assign(state, p); emit(); };
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
const initial = { ...state };
export function useAudio(selector) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(initial));
}

let player = null;
let guard = 0;        // ignores stale "finished" events after a source change
let loadingTimer = null;
let playId = 0;        // one id per clip started
let finishedId = 0;    // the clip whose "finished" event was already handled (expo-audio can report it twice)

function ensure() {
  if (player) return player;
  setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
  player = createAudioPlayer(null, { updateInterval: 250 });
  player.addListener('playbackStatusUpdate', (s) => {
    if (!state.q) return;
    if (s.didJustFinish && Date.now() > guard) { if (finishedId !== playId) { finishedId = playId; onEnded(); } return; }
    if (s.isLoaded && s.playing && state.status !== 'playing') { clearTimeout(loadingTimer); set({ status: 'playing', err: '' }); }
    else if (s.isLoaded && !s.playing && state.status === 'playing' && !s.didJustFinish) set({ status: 'paused' });
  });
  return player;
}

// Whole-surah reciters have no per-ayah files, so a single tapped ayah plays in this ayah-by-ayah reciter instead.
let ayahFallback = false;
// A whole-surah file has no ayah boundaries, so translation audio cannot follow each ayah. When spoken translation is on,
// such a reciter's surah plays ayah by ayah in the fallback reciter instead.
const rid = () => ((ayahFallback || cfg.urdu) && reciterById(cfg.reciter).type === 'surah' ? 'alafasy' : cfg.reciter);
export const isWhole = (id) => reciterById(id).type === 'surah';
function srcFor(surah, v) {
  const r = reciterById(rid());
  if (r.type === 'surah') return AUDIO.surahFile(r.slug, surah.n);
  return AUDIO.ayah(r.folder, v === 0 ? 1 : surah.n, v === 0 ? 1 : v);
}
const URDU_START_TIMEOUT = 12000;
function start(url) {
  const p = ensure();
  guard = Date.now() + 600;
  playId += 1;
  const id = playId;
  p.replace({ uri: url });
  p.play();
  clearTimeout(loadingTimer);
  const isUrdu = state.phase === 'urdu';
  loadingTimer = setTimeout(() => {
    if (id !== playId || state.status !== 'loading') return;
    // a translation clip that never starts must not freeze the recitation: skip it
    if (isUrdu) { state.phase = ''; advance(); return; }
    set({ status: 'error', err: 'unavailable' });
  }, isUrdu ? URDU_START_TIMEOUT : 20000);
}
function load(surah, v, mode, autoplay = true) {
  if (v < 0) v = 1;
  const whole = isWhole(rid());
  state.q = { surah, v: whole ? -1 : v, mode: whole ? 'surah' : mode, whole };
  set({ status: 'loading', err: '', phase: '' });
  if (autoplay) start(srcFor(surah, v)); else { ensure().replace({ uri: srcFor(surah, v) }); set({ status: 'paused' }); }
}
function advance() {
  const q = state.q; if (!q) return;
  if (!q.whole && q.mode === 'surah' && cfg.continuous && q.v < q.surah.verses) { load(q.surah, q.v + 1, 'surah'); return; }
  set({ status: 'ended', phase: '' });
}
function onEnded() {
  const q = state.q; if (!q) return;
  if (cfg.urdu && !q.whole && q.v >= 1 && state.phase !== 'urdu') {
    set({ phase: 'urdu', status: 'loading' });
    start(AUDIO.urdu(q.surah.n, q.v));
    return;
  }
  state.phase = '';
  advance();
}

export function playAyah(surah, v) { ayahFallback = true; load(surah, v, 'ayah'); }
export function playSurah(surah, from = 1) {
  ayahFallback = false;
  const bism = cfg.bismillah && from === 1 && surah.n !== 1 && surah.n !== 9;
  load(surah, bism ? 0 : from, 'surah');
}
export function pause() { if (player && state.q) { player.pause(); set({ status: 'paused' }); } }
export function resume() {
  if (!player || !state.q) return;
  if (state.status === 'ended') { load(state.q.surah, Math.max(state.q.v, 1), state.q.mode); return; }
  player.play(); set({ status: 'loading' });
}
export function toggle() { if (state.status === 'playing' || state.status === 'loading') pause(); else resume(); }
export function stop() {
  if (player) { try { player.pause(); } catch { /* ignore */ } }
  state.q = null; set({ status: 'idle', err: '', phase: '' });
}
export function next() { const q = state.q; if (q && !q.whole && q.v < q.surah.verses) load(q.surah, q.v + 1, q.mode); }
export function prev() { const q = state.q; if (q && !q.whole && q.v > 1) load(q.surah, q.v - 1, q.mode); }
export function retry() { if (state.q) load(state.q.surah, Math.max(state.q.v, 1), state.q.mode); }

/** Keep the engine in step with the saved settings. */
export function configure(next) {
  const prevReciter = cfg.reciter;
  Object.assign(cfg, next);
  if (!state.q) return;
  // While the translation clip plays, the reciter is irrelevant: let it finish; the next ayah uses the new reciter.
  if (state.phase === 'urdu') return;
  if (next.reciter && next.reciter !== prevReciter) {
    const was = state.status === 'playing' || state.status === 'loading';
    load(state.q.surah, Math.max(state.q.v, 1), state.q.mode, was);
  }
}
