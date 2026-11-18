import { useEffect, useState } from 'react';
import { load, save } from './storage';
import { STORE_KEY } from './arabic-learn';

const empty = { lang: null, best: {}, passed: {}, unlocked: false };
let state = empty, loaded = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f(state));
const commit = (n) => { state = n; save(STORE_KEY, n); emit(); };
const ensure = async () => { if (loaded) return; loaded = true; state = { ...empty, ...(await load(STORE_KEY, {})) }; state.ready = true; emit(); };

export function useArabic() {
  const [s, setS] = useState(state);
  useEffect(() => { subs.add(setS); ensure(); setS(state); return () => { subs.delete(setS); }; }, []);
  return {
    s, ready: !!s.ready, lang: s.lang || 'en',
    isOpen: (level) => level === 1 || s.unlocked || !!s.passed[level - 1],
    record: (level, ratio, mark) => commit({ ...state, best: { ...state.best, [level]: Math.max(state.best[level] || 0, ratio) }, passed: ratio >= mark ? { ...state.passed, [level]: true } : state.passed }),
    setLang: (lang) => commit({ ...state, lang }),
    unlockAll: () => commit({ ...state, unlocked: true }),
    reset: () => commit({ ...empty, lang: state.lang })
  };
}
