import fs from 'fs';
import path from 'path';
import { LETTERS, VOWELS, TANWEEN, SUKOON_WORDS, SHORT_WORDS, COMBOS, LONG_VOWELS, SYLLABLE_LETTERS, forms, question, syllable } from '../src/lib/learn-data';
import { soundKey } from '../src/lib/learn-key';
import files from '../src/lib/learn-audio-map';

const ORDER = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن و ه ء ي'.split(' ');

const hasWeb = fs.existsSync(path.join(__dirname, '../../src/lib/learn-data.js'));
(hasWeb ? test : test.skip)('the app uses the same lesson data as the website', () => {
  const web = fs.readFileSync(path.join(__dirname, '../../src/lib/learn-data.js'), 'utf8');
  expect(fs.readFileSync(path.join(__dirname, '../src/lib/learn-data.js'), 'utf8')).toBe(web);
  expect(fs.readFileSync(path.join(__dirname, '../src/lib/learn-key.js'), 'utf8')).toBe(fs.readFileSync(path.join(__dirname, '../../src/lib/learn-key.js'), 'utf8'));
});
test('alphabet is in the authentic order (29 letters)', () => { expect(LETTERS.map((l) => l.ar)).toEqual(ORDER); });
test('forms: joiners get joining forms', () => { expect(forms(LETTERS[1]).joins).toBe(true); expect(forms(LETTERS[0]).joins).toBe(false); });
test('every letter name, word, syllable and tanween has a bundled recording', () => {
  const need = [
    ...LETTERS.map((l) => l.arName), ...LETTERS.map((l) => l.ex[0]),
    ...SYLLABLE_LETTERS.flatMap((l) => VOWELS.map((v) => syllable(l, v).ar)),
    ...SYLLABLE_LETTERS.flatMap((l) => TANWEEN.map((t) => l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''))),
    ...[...SUKOON_WORDS, ...SHORT_WORDS, ...COMBOS].map((w) => w[0]), ...LONG_VOWELS.map((v) => v.ar)
  ];
  expect(need.filter((t) => !files[soundKey(t)])).toEqual([]);
});
test('every bundled recording file exists on disk', () => {
  const missing = Object.keys(files).filter((k) => !fs.existsSync(path.join(__dirname, `../assets/learn-audio/${k}.mp3`)));
  expect(missing).toEqual([]);
});
test.each([1, 2, 3, 4, 5, 6])('quiz level %i generates valid questions', (level) => {
  for (let i = 0; i < 200; i++) {
    const q = question(level);
    const keys = q.options.map((o) => o.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain(q.answer);
    if (q.audio) expect(files[soundKey(q.audio.text)]).toBeTruthy();
  }
});
