import { useEffect, useState } from 'react';
import { load, save } from './storage';

const KEY = 'dalil.learn.v1';
const empty = { best: {}, passed: {}, roman: true, unlocked: false };
let state = empty, loaded = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f(state));
const commit = (n) => { state = n; save(KEY, n); emit(); };
const ensure = async () => { if (loaded) return; loaded = true; state = { ...empty, ...(await load(KEY, {})) }; emit(); };

export function useLearn() {
  const [s, setS] = useState(state);
  useEffect(() => { subs.add(setS); ensure(); setS(state); return () => { subs.delete(setS); }; }, []);
  return {
    s,
    isOpen: (level) => level === 1 || s.unlocked || !!s.passed[level - 1],
    record: (level, ratio, pass) => commit({ ...state, best: { ...state.best, [level]: Math.max(state.best[level] || 0, ratio) }, passed: ratio >= pass ? { ...state.passed, [level]: true } : state.passed }),
    setRoman: (roman) => commit({ ...state, roman }),
    unlockAll: () => commit({ ...state, unlocked: true }),
    reset: () => commit(empty)
  };
}
