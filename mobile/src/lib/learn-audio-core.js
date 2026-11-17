// Lesson-sound logic with no native imports, so it can be unit-tested. See learn-audio.js for the wiring.
import { soundKey } from './learn-key';

export function createLessonAudio({ files, makePlayer, speak, stopSpeak }) {
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
  function play({ text }) {
    stop();
    if (!text) return 'none';
    const src = files[soundKey(text)];
    if (src) {
      try {
        const p = makePlayer(src);
        player = p;
        p.addListener?.('playbackStatusUpdate', (s) => { if (s?.didJustFinish && player === p) { dropPlayer(); set({ status: 'idle', text: '' }); } });
        p.play();
        set({ status: 'playing', text });
        return 'recording';
      } catch { dropPlayer(); }
    }
    try {
      speak(text, () => set({ status: 'idle', text: '' }));
      set({ status: 'playing', text });
      return 'voice';
    } catch { return 'none'; }
  }

  return { play, stop, has: (text) => !!files[soundKey(text)], getState: () => state, subscribe: (f) => { subs.add(f); return () => subs.delete(f); } };
}
