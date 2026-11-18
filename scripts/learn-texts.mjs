// Lists every Arabic text the Learn Quran lessons can speak, with its file key. Used by gen-learn-audio.py.
import { LETTERS, VOWELS, TANWEEN, SUKOON_WORDS, LONG_VOWELS, SHORT_WORDS, COMBOS, SYLLABLE_LETTERS, syllable, sukoonForm } from '../src/lib/learn-data.js';
import { soundKey } from '../src/lib/learn-key.js';
import { readFileSync } from 'node:fs';
const set = new Map();
const add = (t) => { if (t) set.set(soundKey(t), t); };
for (const l of LETTERS) { add(l.arName); add(l.ex[0]); }
for (const l of SYLLABLE_LETTERS) {
  for (const v of VOWELS) add(syllable(l, v).ar);
  for (const t of TANWEEN) add(l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''));
}
for (const l of LETTERS) for (const v of VOWELS) add(syllable(l, v).ar);
for (const w of [...SUKOON_WORDS, ...SHORT_WORDS, ...COMBOS]) add(w[0]);
for (const v of LONG_VOWELS) add(v.ar);
add('بَتْ');
for (const a of SYLLABLE_LETTERS) for (const b of SYLLABLE_LETTERS) if (b.id !== 'alif') add(sukoonForm(a, b, VOWELS[0]).ar);
const ar = JSON.parse(readFileSync(new URL('../src/lib/arabic-data.json', import.meta.url), 'utf8'));
for (const p of ar.phrases) add(p.ar);
console.log(JSON.stringify([...set].map(([k, t]) => ({ k, t }))));
