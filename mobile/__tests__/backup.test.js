jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
import { mergeSnapshots, mergeValue, exportText, parseBackup } from '../src/lib/backup';

const snap = (over = {}) => ({ v: 1, at: 1, settings: {}, favs: [], learn: {}, arabic: {}, speed: 'slow', ...over });

test('favourites are a union without duplicates', () => {
  expect(mergeSnapshots(snap({ favs: ['a', 'b'] }), snap({ favs: ['b', 'c'] })).favs.sort()).toEqual(['a', 'b', 'c']);
});
test('progress keeps the best score and every passed level', () => {
  const m = mergeSnapshots(snap({ learn: { best: { 1: 0.6 }, passed: { 1: true } } }), snap({ learn: { best: { 1: 0.9, 2: 0.5 }, passed: { 2: false } } }));
  expect(m.learn.best).toEqual({ 1: 0.9, 2: 0.5 }); expect(m.learn.passed).toEqual({ 1: true, 2: false });
});
test('the newer reading position wins and streak days are never lost', () => {
  const a = snap({ at: 10, settings: { theme: 'dark', readQuran: { surah: 2, ayah: 5, at: 100 }, streak: { goal: 5, days: { '2026-11-19': 3 } } } });
  const b = snap({ at: 20, settings: { theme: 'light', readQuran: { surah: 3, ayah: 1, at: 200 }, streak: { goal: 5, days: { '2026-11-19': 7, '2026-11-20': 1 } } } });
  const m = mergeSnapshots(a, b);
  expect(m.settings.readQuran.surah).toBe(3); expect(m.settings.theme).toBe('light');
  expect(m.settings.streak.days).toEqual({ '2026-11-19': 7, '2026-11-20': 1 });
  expect(mergeSnapshots(b, a).settings.streak.days).toEqual({ '2026-11-19': 7, '2026-11-20': 1 });
});
test('merging the same data twice changes nothing (no duplicates, no conflicts)', () => {
  const a = snap({ favs: ['x'], learn: { best: { 1: 1 } }, settings: { recitationDone: { '1:1': true } } });
  const once = mergeSnapshots(a, a);
  expect(mergeSnapshots(once, a)).toEqual(once);
  expect(mergeValue([1, 2], [2, 3])).toEqual([1, 2, 3]);
});
test('a backup round-trips and damaged text is refused with a clear message', () => {
  const s = snap({ favs: ['z'] });
  expect(parseBackup(exportText(s)).favs).toEqual(['z']);
  expect(() => parseBackup('hello')).toThrow(/not a DALIL backup/);
  expect(() => parseBackup(exportText(s).slice(0, -5))).toThrow(/cut off/);
  expect(() => parseBackup('')).toThrow();
});
