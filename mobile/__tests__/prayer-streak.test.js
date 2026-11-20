import { prayerTimes, formatTime, nextPrayer, qiblaBearing, kaabaDistanceKm, METHODS } from '../src/lib/prayer-times';
import { recordReading, streakStats, lastWeek, streakPatch, dayKey, emptyStreak } from '../src/lib/streak';

const hm = (h) => { const m = Math.round(h * 60); return [Math.floor(m / 60), m % 60]; };
const near = (h, hh, mm, tol = 8) => Math.abs(h * 60 - (hh * 60 + mm)) <= tol;

describe('prayer times', () => {
  const karachi = prayerTimes({ y: 2026, m: 11, d: 20 }, { lat: 24.86, lng: 67.01 }, 5, { method: 'karachi', asr: 'standard' });
  test('Karachi in November is in a plausible order and range', () => {
    const { fajr, sunrise, dhuhr, asr, maghrib, isha } = karachi;
    expect(fajr).toBeLessThan(sunrise); expect(sunrise).toBeLessThan(dhuhr); expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib); expect(maghrib).toBeLessThan(isha);
    expect(near(dhuhr, 12, 18)).toBe(true);
    expect(near(maghrib, 17, 43)).toBe(true);
  });
  test('Hanafi Asr is later than standard Asr', () => {
    const h = prayerTimes({ y: 2026, m: 11, d: 20 }, { lat: 24.86, lng: 67.01 }, 5, { method: 'karachi', asr: 'hanafi' });
    expect(h.asr).toBeGreaterThan(karachi.asr);
  });
  test('Makkah uses Umm al-Qura: Isha is 90 minutes after Maghrib', () => {
    const m = prayerTimes({ y: 2026, m: 11, d: 20 }, { lat: 21.42, lng: 39.83 }, 3, { method: 'makkah' });
    expect(Math.round((m.isha - m.maghrib) * 60)).toBe(90);
  });
  test('high latitude midsummer still gives Fajr and Isha', () => {
    const l = prayerTimes({ y: 2026, m: 6, d: 21 }, { lat: 59.9, lng: 10.75 }, 2, { method: 'mwl' });
    for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) expect(Number.isFinite(l[k])).toBe(true);
    expect(l.isha).not.toBeCloseTo(l.fajr, 1);
  });
  test('every method gives finite times for a normal place', () => {
    for (const key of Object.keys(METHODS)) {
      const t = prayerTimes({ y: 2026, m: 3, d: 1 }, { lat: 40.7, lng: -74 }, -5, { method: key });
      Object.values(t).forEach((v) => expect(Number.isFinite(v)).toBe(true));
    }
  });
  test('formatTime and nextPrayer', () => {
    expect(formatTime(13.5)).toBe('1:30 PM'); expect(formatTime(13.5, true)).toBe('13:30'); expect(formatTime(null)).toBe('--:--');
    expect(nextPrayer(karachi, 3).key).toBe('fajr');
    expect(nextPrayer(karachi, 13).key).toBe('asr');
    expect(nextPrayer(karachi, 23).tomorrow).toBe(true);
    expect(hm(6.5)).toEqual([6, 30]);
  });
});

describe('qibla', () => {
  test('known bearings', () => {
    expect(Math.abs(qiblaBearing(51.5, -0.12) - 119)).toBeLessThan(1.5);
    expect(Math.abs(qiblaBearing(40.71, -74.0) - 58.5)).toBeLessThan(1.5);
    expect(Math.abs(qiblaBearing(24.86, 67.01) - 267.7)).toBeLessThan(1.5);
  });
  test('distance from London is about 4,800 km', () => {
    expect(Math.abs(kaabaDistanceKm(51.5, -0.12) - 4800)).toBeLessThan(150);
  });
});

describe('reading streak', () => {
  const d = (s) => new Date(`${s}T12:00:00`);
  test('counts consecutive days and keeps yesterday alive', () => {
    let r = emptyStreak();
    r = recordReading(r, 3, d('2026-11-18')); r = recordReading(r, 1, d('2026-11-19')); r = recordReading(r, 2, d('2026-11-20'));
    expect(streakStats(r, d('2026-11-20')).current).toBe(3);
    expect(streakStats(r, d('2026-11-21')).current).toBe(3); // today empty, yesterday counts
    expect(streakStats(r, d('2026-11-22')).current).toBe(0); // missed a whole day
    expect(streakStats(r, d('2026-11-22')).best).toBe(3);
  });
  test('goal progress and week strip', () => {
    let r = { ...emptyStreak(), goal: 4 };
    r = recordReading(r, 2, d('2026-11-20'));
    const s = streakStats(r, d('2026-11-20'));
    expect(s.progress).toBe(0.5); expect(s.goalMet).toBe(false);
    r = recordReading(r, 2, d('2026-11-20'));
    expect(streakStats(r, d('2026-11-20')).goalMet).toBe(true);
    const w = lastWeek(r, d('2026-11-20'));
    expect(w).toHaveLength(7); expect(w[6].today).toBe(true); expect(w[6].met).toBe(true);
  });
  test('only a moved position adds to the streak', () => {
    const prev = { readQuran: { surah: 2, ayah: 5 }, streak: null };
    expect(streakPatch(prev, { readQuran: { surah: 2, ayah: 5 } })).toBeNull();
    const p = streakPatch(prev, { readQuran: { surah: 2, ayah: 6 } }, d('2026-11-20'));
    expect(p.streak.days[dayKey(d('2026-11-20'))]).toBe(1);
    expect(streakPatch(prev, { theme: 'dark' })).toBeNull();
  });
});
