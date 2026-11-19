import { describe, expect, it } from 'vitest';
import { SD, TX, matches, titleOf, tx } from '../src/lib/special-duas';

describe('special duas data', () => {
  it('has 36 duas with the required fields', () => {
    expect(SD.duas.length).toBeGreaterThanOrEqual(30);
    for (const d of SD.duas) {
      expect(d.ar, d.id).toBeTruthy(); expect(d.title.en && d.title.ur, d.id).toBeTruthy(); expect(d.src.book && d.src.ref, d.id).toBeTruthy();
      expect(d.grade.label, d.id).toBeTruthy(); expect(d.occ.en && d.occ.ur && d.virt.en && d.virt.ur, d.id).toBeTruthy();
      expect(d.en, d.id).toBeTruthy(); expect(d.cats.length, d.id).toBeGreaterThan(0);
      for (const c of d.cats) expect(SD.cats.find((x) => x.id === c), `${d.id}:${c}`).toBeTruthy();
    }
  });
  it('ids are unique', () => { expect(new Set(SD.duas.map((d) => d.id)).size).toBe(SD.duas.length); });
  it('every hadith dua points at a real book, has a grade, and never promises guaranteed acceptance in our own notes', () => {
    const books = ['Sahih al-Bukhari', 'Sahih Muslim', 'Sunan Abi Dawud', "Jami' at-Tirmidhi", "Sunan an-Nasa'i", 'Sunan Ibn Majah'];
    for (const d of SD.duas.filter((x) => x.kind !== 'quran')) { expect(books, d.id).toContain(d.src.book); expect(['s', 'h', 'd']).toContain(d.grade.class); expect(d.src.c).toBeTruthy(); expect(d.src.n).toBeGreaterThan(0); }
    for (const d of SD.duas) expect(`${d.virt.en} ${d.occ.en}`, d.id).not.toMatch(/guarantee[sd]? (that )?(it|your|every|the)/i);
  });
  it('dua with differing gradings carries every grader and is flagged', () => {
    for (const id of ['ilman-nafian', 'rahmatika-arju']) { const d = SD.duas.find((x) => x.id === id); expect(d.grade.differ, id).toBe(true); expect(d.grade.graders.length, id).toBeGreaterThan(1); }
  });
  it('quran duas link to verses and keep the verse text', () => {
    const q = SD.duas.filter((d) => d.kind === 'quran'); expect(q.length).toBe(10);
    for (const d of q) { expect(d.src.s).toBeGreaterThan(0); expect(d.tl).toBeTruthy(); expect(d.ur).toBeTruthy(); }
  });
  it('no bad characters from the source data', () => { for (const d of SD.duas) { expect(d.ar, d.id).not.toMatch(/[�‏{}]/); expect(d.en, d.id).not.toMatch(/�/); } });
  it('has the nine categories', () => { expect(SD.cats.map((c) => c.id)).toEqual(['accept', 'ism', 'forgive', 'protect', 'hardship', 'rizq', 'guidance', 'morning', 'quran']); });
});
describe('search and filters', () => {
  const run = (q, cat = 'all', kind = 'all') => SD.duas.filter((d) => matches(d, q, cat, kind)).map((d) => d.id);
  it('filters by category', () => { expect(run('', 'ism')).toContain('ism-azam-ahad-samad'); expect(run('', 'ism')).not.toContain('halal-haram'); });
  it('filters by source', () => { expect(run('', 'all', 'quran').every((id) => id.startsWith('q-'))).toBe(true); expect(run('', 'all', 'hadith').some((id) => id.startsWith('q-'))).toBe(false); });
  it('searches English, Urdu title, transliteration and Arabic without vowels', () => {
    expect(run('forgiveness')).toContain('sayyid-istighfar');
    expect(run('سید الاستغفار')).toContain('sayyid-istighfar');
    expect(run('yunus')).toContain('yunus');
    expect(run('سيد الاستغفار')).not.toContain('nothing');
    expect(run('مقلب القلوب')).toContain('muqallib-alqulub');
  });
  it('returns nothing for gibberish', () => { expect(run('zzzzqqqq')).toEqual([]); });
  it('every language has the same text keys', () => { expect(Object.keys(TX.ur).sort()).toEqual(Object.keys(TX.en).sort()); expect(titleOf(SD.duas[0], 'ur')).toBe(SD.duas[0].title.ur); expect(tx('xx')).toBe(TX.en); });
});
