'use client';
import { useCallback, useEffect, useState } from 'react';
const KEY = 'dalil.learn.v1';
const empty = { best: {}, passed: {}, roman: true, unlocked: false };
const read = () => { try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return empty; } };

export function useLearn() {
  const [s, setS] = useState(empty);
  useEffect(() => { setS(read()); }, []);
  const save = useCallback((fn) => setS((cur) => { const n = fn(cur); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; }), []);
  const isOpen = (level) => level === 1 || s.unlocked || !!s.passed[level - 1];
  const record = (level, ratio, passMark) => save((c) => ({ ...c, best: { ...c.best, [level]: Math.max(c.best[level] || 0, ratio) }, passed: ratio >= passMark ? { ...c.passed, [level]: true } : c.passed }));
  return { s, isOpen, record, setRoman: (roman) => save((c) => ({ ...c, roman })), unlockAll: () => save((c) => ({ ...c, unlocked: true })), reset: () => save(() => empty) };
}
