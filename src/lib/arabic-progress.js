'use client';
import { useCallback, useEffect, useState } from 'react';
import { STORE_KEY } from './arabic-learn';
const empty = { lang: null, best: {}, passed: {}, unlocked: false };
const read = () => { try { return { ...empty, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { return empty; } };

export function useArabic() {
  const [s, setS] = useState(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => { setS(read()); setReady(true); }, []);
  const save = useCallback((fn) => setS((cur) => { const n = fn(cur); try { localStorage.setItem(STORE_KEY, JSON.stringify(n)); } catch {} return n; }), []);
  const isOpen = (level) => level === 1 || s.unlocked || !!s.passed[level - 1];
  const record = (level, ratio, mark) => save((c) => ({ ...c, best: { ...c.best, [level]: Math.max(c.best[level] || 0, ratio) }, passed: ratio >= mark ? { ...c.passed, [level]: true } : c.passed }));
  return { s, ready, lang: s.lang || 'en', isOpen, record, setLang: (lang) => save((c) => ({ ...c, lang })), unlockAll: () => save((c) => ({ ...c, unlocked: true })), reset: () => save((c) => ({ ...empty, lang: c.lang })) };
}
