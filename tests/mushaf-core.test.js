import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PAGES, clampPage, firstVerseOfPage, lineSpeech, pageLines, pageOfSurah, pageOfVerse, parseToken, setMushaf, surahsOnPage, toArabicDigits } from '../src/lib/mushaf-core';

beforeAll(() => setMushaf(JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/mushaf15.json'), 'utf8'))));

describe('mushaf-core (web)', () => {
  it('has 604 pages and 15 lines on the ordinary pages', () => {
    expect(PAGES).toBe(604);
    expect(pageLines(2)).toHaveLength(8); // page 2 starts Al-Baqarah: header, basmala and six lines
    expect(pageLines(300)).toHaveLength(15);
  });
  it('maps surahs and verses to the right pages', () => {
    expect(pageOfSurah(1)).toBe(1);
    expect(pageOfSurah(2)).toBe(2);
    expect(pageOfSurah(18)).toBe(293);
    expect(pageOfSurah(114)).toBe(604);
    expect(pageOfVerse(2, 255)).toBe(42);
    expect(firstVerseOfPage(293)).toEqual({ surah: 17, ayah: 105 });
    expect(surahsOnPage(293)).toEqual([17, 18]);
  });
  it('clamps pages and reads verse-end numbers', () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(9999)).toBe(604);
    expect(clampPage('abc')).toBe(1);
    expect(parseToken('ٱلرَّحِيمِ ١')).toEqual({ text: 'ٱلرَّحِيمِ', n: 1 });
    expect(parseToken('word')).toEqual({ text: 'word', n: 0 });
    expect(toArabicDigits(112)).toBe('١١٢');
    expect(lineSpeech([2, ['ٱلرَّحِيمِ ١']])).toBe('ٱلرَّحِيمِ 1');
  });
  it('every page has text and every surah starts on a page that shows its header', () => {
    for (let p = 1; p <= PAGES; p += 1) expect(pageLines(p).some((l) => l[0] === 2)).toBe(true);
    for (let s = 1; s <= 114; s += 1) expect(surahsOnPage(pageOfSurah(s))).toContain(s);
  });
});
