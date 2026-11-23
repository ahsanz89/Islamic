'use client';
// Reading streak and daily goal for the web. Same record shape as the mobile app ({ days: { 'YYYY-MM-DD': count }, goal }),
// kept in this browser only (nothing is uploaded). `seen` remembers what was already counted today so reading the same
// ayah, page or hadith twice in a day does not add twice.
import { emptyStreak, recordReading, DEFAULT_GOAL, dayKey } from './streak';

export const STREAK_KEY = 'dalil.streak.v1';
const EVENT = 'dalil-streak';

export function loadStreak() {
  try {
    const r = JSON.parse(localStorage.getItem(STREAK_KEY) || 'null');
    if (r && r.days && typeof r.days === 'object') return { goal: DEFAULT_GOAL, ...r };
  } catch { /* none saved */ }
  return emptyStreak();
}
export function saveStreak(rec) {
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(rec)); } catch { /* storage full or blocked */ }
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* ignore */ }
}

/** Count one item read today. `id` identifies it (e.g. "q:18:10", "m:293", "h:/c/bukhari/1/"). Returns true if it was new. */
export function recordRead(id, now = new Date()) {
  const rec = loadStreak();
  const today = dayKey(now);
  const seen = rec.seen && rec.seen.day === today ? rec.seen.keys : [];
  if (seen.includes(id)) return false;
  const next = { ...recordReading(rec, 1, now), seen: { day: today, keys: [...seen.slice(-400), id] } };
  saveStreak(next);
  return true;
}
export function setGoal(n) {
  const goal = Math.max(1, Math.min(200, Math.floor(Number(n)) || DEFAULT_GOAL));
  saveStreak({ ...loadStreak(), goal });
}
export const onStreakChange = (f) => {
  window.addEventListener(EVENT, f);
  window.addEventListener('storage', f);
  return () => { window.removeEventListener(EVENT, f); window.removeEventListener('storage', f); };
};
