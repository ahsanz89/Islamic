import { PAGES, clampPage, firstVerseOfPage, lineSpeech, mushaf, pageLines, pageOfSurah, pageOfVerse, parseToken, surahsOnPage } from '../src/lib/mushaf-core';

const M = mushaf();
test('604 pages; 15 lines each, except pages 1 and 2 which have 8', () => {
  expect(M.pages.length).toBe(PAGES);
  M.pages.forEach((p, i) => expect(p.length).toBe(i < 2 ? 8 : 15));
});
test('114 surah headers, one per surah, in order; 112 basmala lines (none for Al-Fatiha and At-Tawbah)', () => {
  const heads = M.pages.flatMap((p) => p.filter((l) => l[0] === 0).map((l) => l[1]));
  expect(heads).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
  expect(M.pages.flat().filter((l) => l[0] === 1).length).toBe(112);
});
test('every line is a header, a basmala or text with words', () => {
  for (const l of M.pages.flat()) {
    if (l[0] === 2) { expect(l[1].length).toBeGreaterThan(0); l[1].forEach((t) => expect(typeof t).toBe('string')); } else expect([0, 1]).toContain(l[0]);
  }
});
test('verse numbers run 1..n without gaps through every surah (nothing lost or rearranged)', () => {
  const seen = {};
  for (const l of M.pages.flat()) if (l[0] === 2) for (const t of l[1]) { const p = parseToken(t); if (p.n) { const s = (seen.cur ||= {}); void s; (seen.list ||= []).push(p.n); } }
  const list = seen.list; let ok = true, surah = 1, expect_ = 1; const counts = []; let c = 0;
  for (const n of list) { if (n === 1 && c > 0) { counts.push(c); c = 0; } c += 1; if (c !== n) ok = false; }
  counts.push(c);
  expect(ok).toBe(true);
  expect(counts.length).toBe(114);
  expect(counts.reduce((a, b) => a + b, 0)).toBe(6236);
  expect(counts[0]).toBe(7); expect(counts[1]).toBe(286); expect(counts[113]).toBe(6); expect(surah + expect_).toBe(2);
});
test('page lookups: surah starts, known verses and round trips', () => {
  expect(pageOfSurah(1)).toBe(1); expect(pageOfSurah(2)).toBe(2); expect(pageOfSurah(114)).toBe(604);
  expect(pageOfVerse(1, 1)).toBe(1); expect(pageOfVerse(2, 1)).toBe(2); expect(pageOfVerse(2, 255)).toBe(42);
  expect(pageOfVerse(18, 1)).toBe(293); expect(pageOfVerse(36, 1)).toBe(440); expect(pageOfVerse(114, 6)).toBe(604);
  for (let p = 1; p <= PAGES; p += 7) { const { surah, ayah } = firstVerseOfPage(p); expect(pageOfVerse(surah, ayah)).toBeLessThanOrEqual(p); }
});
test('a page that begins in the middle of a verse is found at the page where that verse starts', () => {
  for (let p = 2; p <= PAGES; p++) {
    const pf = M.pf[p - 1];
    if (pf[2] > 1) expect(pageOfVerse(pf[0], pf[1])).toBeLessThan(p);
    else expect(pageOfVerse(pf[0], pf[1])).toBe(p);
  }
});
test('clampPage and surahsOnPage', () => {
  expect(clampPage(0)).toBe(1); expect(clampPage(9999)).toBe(604); expect(clampPage('x')).toBe(1);
  expect(surahsOnPage(1)).toEqual([1]); expect(surahsOnPage(604)).toContain(114);
});
test('parseToken splits the verse number; lineSpeech reads words and numbers', () => {
  expect(parseToken('ٱلرَّحِيمِ ١')).toEqual({ text: 'ٱلرَّحِيمِ', n: 1 });
  expect(parseToken('رَيْبَۛ')).toEqual({ text: 'رَيْبَۛ', n: 0 });
  expect(lineSpeech(pageLines(1)[1])).toContain('1');
});
