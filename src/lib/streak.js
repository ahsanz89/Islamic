// Reading streak and daily goal. Stored on the phone only (inside the settings object); never uploaded.
// A "day" is the phone's local calendar day, written YYYY-MM-DD. Pure functions so they are easy to test.

export const dayKey = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const toDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (key, n) => { const d = toDate(key); d.setDate(d.getDate() + n); return dayKey(d); };

export const DEFAULT_GOAL = 5; // ayat (or hadith) per day

/** Empty record. `days` maps a day key to the number of items read that day (kept for 400 days). */
export const emptyStreak = () => ({ days: {}, goal: DEFAULT_GOAL });

/** Add `count` items read today. Returns a new record. */
export function recordReading(rec, count = 1, now = new Date()) {
  const base = rec && rec.days ? rec : emptyStreak();
  const key = dayKey(now);
  const days = { ...base.days, [key]: (base.days[key] || 0) + Math.max(0, Math.floor(count)) };
  const keep = Object.keys(days).sort().slice(-400);
  const trimmed = {};
  for (const k of keep) trimmed[k] = days[k];
  return { ...base, days: trimmed };
}

/** Current streak (consecutive days with any reading, counting today or, if today is empty, yesterday) and best streak. */
export function streakStats(rec, now = new Date()) {
  const days = (rec && rec.days) || {};
  const today = dayKey(now);
  let cursor = days[today] > 0 ? today : addDays(today, -1);
  let current = 0;
  while (days[cursor] > 0) { current += 1; cursor = addDays(cursor, -1); }
  const keys = Object.keys(days).filter((k) => days[k] > 0).sort();
  let best = 0, run = 0, prev = null;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  const goal = (rec && rec.goal) || DEFAULT_GOAL;
  const todayCount = days[today] || 0;
  return { current, best, todayCount, goal, goalMet: todayCount >= goal, progress: Math.min(1, todayCount / goal) };
}

/** Last 7 days, oldest first, for the small week strip: { key, count, met }. */
export function lastWeek(rec, now = new Date()) {
  const days = (rec && rec.days) || {};
  const goal = (rec && rec.goal) || DEFAULT_GOAL;
  const today = dayKey(now);
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(today, i - 6);
    const count = days[key] || 0;
    return { key, count, met: count >= goal, today: key === today };
  });
}

/**
 * Called whenever the saved reading position changes. If the position moved (a new ayah, page or hadith),
 * one more item counts toward today. Opening the same place again does not add anything.
 * Returns a settings patch ({ streak }) or null.
 */
export function streakPatch(prev, patch, now = new Date()) {
  if (!patch) return null;
  let moved = false;
  if (patch.readQuran) {
    const a = prev.readQuran || {};
    moved = moved || a.surah !== patch.readQuran.surah || a.ayah !== patch.readQuran.ayah || a.page !== patch.readQuran.page;
  }
  if (patch.readHadith) {
    const a = prev.readHadith || {};
    moved = moved || a.col !== patch.readHadith.col || a.sec !== patch.readHadith.sec || a.n !== patch.readHadith.n;
  }
  return moved ? { streak: recordReading(prev.streak, 1, now) } : null;
}
