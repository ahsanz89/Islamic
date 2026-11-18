import DATA from '../src/lib/arabic-data.json';
import { LEVELS, itemsOf, makeGen, question, tr, wordItems3 } from '../src/lib/arabic-learn';

describe('arabic data', () => {
  it('has every Quran word with a meaning in English and Urdu and a word-audio reference', () => {
    for (const g of DATA.vocab) for (const w of g.words) { expect(w.a).toBeTruthy(); expect(w.en).toBeTruthy(); expect(w.ur).toBeTruthy(); expect(w.ref).toHaveLength(3); }
  });
  it('has the six short surahs with the verses from the app data', () => {
    expect(DATA.surahs.map((s) => s.n)).toEqual([1, 112, 108, 103, 113, 114]);
    expect(DATA.surahs.find((s) => s.n === 1).verses).toHaveLength(7);
  });
  it('phrases have English and Urdu meanings', () => { for (const p of DATA.phrases) { expect(p.en && p.ur && p.ar).toBeTruthy(); } });
});
describe('levels and questions', () => {
  it('each level has items', () => { for (const l of LEVELS) expect(itemsOf(l.n).length).toBeGreaterThan(3); expect(wordItems3().length).toBeGreaterThan(10); });
  for (const lang of ['en', 'ur']) for (const lv of [1, 2, 3]) it(`questions are valid (${lang}, level ${lv})`, () => {
    for (let i = 0; i < 200; i++) {
      const q = makeGen(lang)(lv);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
      expect(q.options.filter((o) => o.key === q.answer)).toHaveLength(1);
      expect(q.prompt).toBeTruthy();
    }
  });
  it('urdu question labels are Urdu for level 1', () => {
    const q = question(1, 'ur', () => 0.01);
    expect(q.options.some((o) => /[؀-ۿ]/.test(o.label))).toBe(true);
  });
  it('has Urdu and English text for the same keys', () => { expect(Object.keys(tr('ur')).sort()).toEqual(Object.keys(tr('en')).sort()); });
});
