// Lesson-sound logic with no native imports, so it can be unit-tested. See learn-audio.js for the wiring.
import { soundKey } from './learn-key';

/** Slow is the default for beginners (the recordings are already slow); Normal plays the same recording a little faster with the pitch kept. */
export const SPEEDS = { slow: { rate: 1, speech: 0.5 }, normal: { rate: 1.3, speech: 0.8 } };

export function createLessonAudio({ files, makePlayer, speak, stopSpeak, getSpeed = () => 'slow' }) {
  let player = null;
  let state = { status: 'idle', text: '' };
  const subs = new Set();
  const set = (s) => { state = s; subs.forEach((f) => f(state)); };
  const dropPlayer = () => { const p = player; player = null; try { p?.pause?.(); } catch { /* ignore */ } try { p?.remove?.(); } catch { /* ignore */ } };

  function stop() {
    dropPlayer();
    try { stopSpeak?.(); } catch { /* ignore */ }
    if (state.status !== 'idle') set({ status: 'idle', text: '' });
  }

  /** @returns {'recording'|'voice'|'none'} */
  function speakIt(text) {
    try {
      speak(text, () => set({ status: 'idle', text: '' }), (SPEEDS[getSpeed()] || SPEEDS.slow).speech);
      set({ status: 'playing', text });
      return 'voice';
    } catch { return 'none'; }
  }

  /** @param {{text:string,url?:string}} a  `url` = an online clip of exactly this text (e.g. a single Quran word); the phone voice is used if it cannot play. */
  function play({ text, url }) {
    stop();
    if (!text) return 'none';
    if (url) {
      try {
        const p = makePlayer({ uri: url });
        player = p;
        p.addListener?.('playbackStatusUpdate', (s) => {
          if (player !== p) return;
          if (s?.didJustFinish) { dropPlayer(); set({ status: 'idle', text: '' }); }
          else if (s?.error) { dropPlayer(); speakIt(text); }
        });
        try { const r = SPEEDS[getSpeed()] || SPEEDS.slow; if (r.rate !== 1) p.setPlaybackRate?.(r.rate, 'high'); } catch { /* ignore */ }
        p.play();
        set({ status: 'playing', text });
        return 'recording';
      } catch { dropPlayer(); return speakIt(text); }
    }
    const src = files[soundKey(text)];
    if (src) {
      try {
        const p = makePlayer(src);
        player = p;
        p.addListener?.('playbackStatusUpdate', (s) => { if (s?.didJustFinish && player === p) { dropPlayer(); set({ status: 'idle', text: '' }); } });
        try { const r = SPEEDS[getSpeed()] || SPEEDS.slow; if (r.rate !== 1) p.setPlaybackRate?.(r.rate, 'high'); } catch { /* ignore */ }
        p.play();
        set({ status: 'playing', text });
        return 'recording';
      } catch { dropPlayer(); }
    }
    return speakIt(text);
  }

  return { play, stop, has: (text) => !!files[soundKey(text)], getState: () => state, subscribe: (f) => { subs.add(f); return () => subs.delete(f); } };
}
