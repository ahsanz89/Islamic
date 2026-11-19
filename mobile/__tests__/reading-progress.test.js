import { continueTarget, histories, positionOfPage, quranRoute, saveHadith, saveQuran, validHadith, validQuran } from '../src/lib/reading-progress';
import { pageOfVerse } from '../src/lib/mushaf-core';

const apply = (s, patch) => (patch ? { ...s, ...patch } : s);

test('first-time user: no history, no destination, no crash', () => {
  expect(continueTarget({})).toBeNull();
  expect(continueTarget({ readQuran: null, readHadith: null, lastActivity: null })).toBeNull();
});
test('Quran only: resumes the exact surah and ayah', () => {
  const s = apply({}, saveQuran({ surah: 2, ayah: 255, name: 'Al-Baqara' }, 10));
  const t = continueTarget(s);
  expect(t.type).toBe('quran'); expect(t.href).toBe('/surah/2?ayah=255'); expect(t.detail).toBe('Ayah 255');
});
test('Quran in the 15-line view: resumes the exact page; both layouts understand the same position', () => {
  const s = apply({ quranMode: 'mushaf' }, saveQuran({ surah: 2, ayah: 255, name: 'Al-Baqara' }, 10));
  expect(continueTarget(s).href).toBe(`/mushaf/${pageOfVerse(2, 255)}`);
  expect(continueTarget(s).href).toBe('/mushaf/42');
  const fromPage = apply({ quranMode: 'standard' }, saveQuran(positionOfPage(42, 'Al-Baqara'), 11));
  expect(continueTarget(fromPage).href).toMatch(/^\/surah\/2\?ayah=\d+$/);
  expect(histories(fromPage).quran.page).toBe(42);
});
test('Hadith only: resumes book, chapter and hadith number', () => {
  const s = apply({}, saveHadith({ col: 'bukhari', sec: '12', n: 345, title: 'Sahih al-Bukhari · Prayer' }, 10));
  expect(continueTarget(s)).toMatchObject({ type: 'hadith', href: '/section/bukhari/12?focus=345' });
});
test('Continue Reading follows the latest activity, and each history is kept separately', () => {
  let s = {};
  s = apply(s, saveQuran({ surah: 18, ayah: 10, name: 'Al-Kahf' }, 1));
  s = apply(s, saveHadith({ col: 'muslim', sec: '3', n: 77, title: 'Sahih Muslim' }, 2));
  expect(continueTarget(s).type).toBe('hadith');
  s = apply(s, saveQuran({ surah: 18, ayah: 40, name: 'Al-Kahf' }, 3));
  expect(continueTarget(s).type).toBe('quran');
  s = apply(s, saveHadith({ col: 'muslim', sec: '3', n: 90, title: 'Sahih Muslim' }, 4));
  expect(continueTarget(s).type).toBe('hadith');
  for (let i = 0; i < 6; i++) { s = apply(s, saveQuran({ surah: 18, ayah: 41 + i, name: 'Al-Kahf' }, 10 + i)); s = apply(s, saveHadith({ col: 'muslim', sec: '3', n: 91 + i, title: 'Sahih Muslim' }, 20 + i)); }
  expect(s.readQuran.ayah).toBe(46); expect(s.readHadith.n).toBe(96);      // neither overwrote the other
  expect(continueTarget(s).type).toBe('hadith');
  expect(continueTarget({ ...s, lastActivity: 'quran' }).href).toBe('/surah/18?ayah=46');
});
test('invalid or damaged saved data is ignored without crashing', () => {
  expect(saveQuran({ surah: 0, ayah: 1 })).toBeNull(); expect(saveQuran({ surah: 115, ayah: 1 })).toBeNull(); expect(saveQuran({ surah: 'x', ayah: 1 })).toBeNull();
  expect(saveQuran(null)).toBeNull(); expect(saveHadith({ col: '', sec: '1' })).toBeNull(); expect(saveHadith(undefined)).toBeNull();
  expect(validQuran({ surah: 5, ayah: 0 })).toBe(false); expect(validHadith({ col: 'a' })).toBe(false);
  expect(continueTarget({ readQuran: { surah: 999, ayah: 1 }, lastActivity: 'quran' })).toBeNull();
  expect(continueTarget({ readQuran: { surah: 999, ayah: 1 }, readHadith: { col: 'bukhari', sec: '1', n: 5 }, lastActivity: 'quran' }).type).toBe('hadith');
  expect(continueTarget({ readHadith: { col: 'bukhari', sec: '1' }, lastActivity: 'quran' }).type).toBe('hadith');
  expect(continueTarget({ lastActivity: 'bogus', readQuran: { surah: 1, ayah: 1, at: 5 } }).type).toBe('quran');
  expect(saveHadith({ col: 'a', sec: 'b', n: -4 }).readHadith.n).toBe(0);
});
test('the single "lastRead" of earlier versions still resumes (read-only migration)', () => {
  expect(continueTarget({ lastRead: { href: '/surah/36', title: '36. Ya-Sin' } }).href).toBe('/surah/36?ayah=1');
  expect(continueTarget({ lastRead: { href: '/section/bukhari/5', title: 'Bukhari' } }).href).toBe('/section/bukhari/5');
});
test('quranRoute names the surah and page', () => {
  expect(quranRoute({ surah: 1, ayah: 1, name: 'Al-Faatiha' }, 'mushaf')).toMatchObject({ href: '/mushaf/1', detail: 'Page 1', title: '1. Al-Faatiha' });
});
