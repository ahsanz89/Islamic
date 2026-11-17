import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { LETTERS, LETTER, LEVELS, VOWELS, TANWEEN, SUKOON_WORDS, SHORT_WORDS, COMBOS, LONG_VOWELS, SYLLABLE_LETTERS, forms, question, syllable, sukoonForm } from '@/lib/learn-data';
import { soundKey } from '@/lib/learn-key';

// The authentic Arabic alphabet order (hamza sits between ha and ya, as in most Arabic-for-learners lists).
const ORDER = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن و ه ء ي'.split(' ');

describe('Arabic alphabet data', () => {
  it('has 28 letters plus hamza, in the authentic order', () => {
    expect(LETTERS).toHaveLength(29);
    expect(LETTERS.map((l) => l.ar)).toEqual(ORDER);
  });
  it('has unique ids and a full set of fields for every letter', () => {
    expect(new Set(LETTERS.map((l) => l.id)).size).toBe(29);
    for (const l of LETTERS) {
      for (const k of ['ar', 'arName', 'name', 'sound', 'how', 'ur', 'ru', 'mouth', 'dots']) expect(l[k], `${l.id}.${k}`).toBeTruthy();
      expect(l.ex).toHaveLength(3);
    }
  });
  it('knows the six non-joining letters', () => {
    expect(LETTERS.filter((l) => !l.connects && l.id !== 'hamza').map((l) => l.ar).sort()).toEqual(['ا', 'د', 'ذ', 'ر', 'ز', 'و'].sort());
  });
  it('builds four positional forms, joining only joiners', () => {
    const b = forms(LETTER.ba);
    expect(b.joins).toBe(true);
    expect(b.ini.endsWith('‍')).toBe(true);
    expect(b.fin.startsWith('‍')).toBe(true);
    expect(forms(LETTER.alif)).toMatchObject({ joins: false, ini: 'ا', fin: 'ا' });
  });
  it('has six levels', () => expect(LEVELS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6]));
  it('builds syllables with the right vowel mark', () => {
    expect(syllable(LETTER.ba, VOWELS[0]).ar).toBe('بَ');
    expect(syllable(LETTER.ba, VOWELS[1]).roman).toBe('bi');
    expect(sukoonForm(LETTER.ba, LETTER.ta, VOWELS[0]).ar).toBe('بَتْ');
  });
});

describe('quiz generator', () => {
  for (let level = 1; level <= 6; level++) {
    it(`level ${level}: 300 questions are valid (answer present, no duplicate choices)`, () => {
      for (let i = 0; i < 300; i++) {
        const q = question(level);
        expect(q.prompt).toBeTruthy();
        const keys = q.options.map((o) => o.key);
        expect(new Set(keys).size, q.prompt).toBe(keys.length);
        expect(keys).toContain(q.answer);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        if (q.audio) expect(q.audio.text).toBeTruthy();
      }
    });
  }
});

describe('lesson recordings', () => {
  const manifest = new Set(JSON.parse(fs.readFileSync('public/learn-audio/manifest.json', 'utf8')));
  it('soundKey is stable and unique across all lesson texts', () => {
    expect(soundKey('بَاء')).toBe(soundKey('بَاء'));
    const all = [...LETTERS.map((l) => l.arName), ...LETTERS.map((l) => l.ex[0]), ...SHORT_WORDS.map((w) => w[0]), ...SUKOON_WORDS.map((w) => w[0])];
    const uniq = [...new Set(all)];
    expect(new Set(uniq.map(soundKey)).size).toBe(uniq.length);
  });
  it('every letter name has a recording file', () => {
    for (const l of LETTERS) {
      const k = soundKey(l.arName);
      expect(manifest.has(k), `${l.id} ${k}`).toBe(true);
      expect(fs.statSync(`public/learn-audio/${k}.mp3`).size).toBeGreaterThan(1500);
    }
  });
  it('every word, syllable and tanween used by the lessons has a recording', () => {
    const need = [
      ...LETTERS.map((l) => l.ex[0]),
      ...SYLLABLE_LETTERS.flatMap((l) => VOWELS.map((v) => syllable(l, v).ar)),
      ...SYLLABLE_LETTERS.flatMap((l) => TANWEEN.map((t) => l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''))),
      ...[...SUKOON_WORDS, ...SHORT_WORDS, ...COMBOS].map((w) => w[0]),
      ...LONG_VOWELS.map((v) => v.ar)
    ];
    const missing = need.filter((t) => !manifest.has(soundKey(t)));
    expect(missing).toEqual([]);
  });
});
