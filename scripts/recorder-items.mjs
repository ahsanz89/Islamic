// Builds public/recorder/items.json: the list of lesson sounds a human tutor can record, in priority order.
import fs from 'node:fs';
import { LETTERS, VOWELS, TANWEEN, SUKOON_WORDS, SHORT_WORDS, COMBOS, LONG_VOWELS, SYLLABLE_LETTERS, syllable } from '../src/lib/learn-data.js';
import { soundKey } from '../src/lib/learn-key.js';
const out = [], seen = new Set();
const add = (group, text, hint) => { const k = soundKey(text); if (seen.has(k)) return; seen.add(k); out.push({ k, t: text, g: group, h: hint }); };
for (const l of LETTERS) add('1. Letter names (29)', l.arName, `${l.name} (${l.ar})`);
for (const l of LETTERS) add('2. Example words for letters (29)', l.ex[0], `${l.ex[1]} = ${l.ex[2]}`);
for (const v of VOWELS) for (const l of SYLLABLE_LETTERS.concat(LETTERS.filter((x) => x.id === 'hamza'))) { const s = syllable(l, v); add(`3. Letter + ${v.name}`, s.ar, s.roman); }
for (const t of TANWEEN) for (const l of SYLLABLE_LETTERS) add(`4. Tanween: ${t.name}`, l.ar + t.mark + (t.id === 'fathatan' ? 'ا' : ''), l.sound + t.ending);
for (const w of SUKOON_WORDS) add('5. Words with sukoon', w[0], `${w[1]} = ${w[2]}`);
for (const v of LONG_VOWELS) add('6. Long vowels', v.ar, v.roman);
for (const c of COMBOS) add('7. Joined sounds', c[0], c[1]);
for (const w of SHORT_WORDS) add('8. Real words', w[0], `${w[1]} = ${w[2]}`);
fs.mkdirSync('public/recorder', { recursive: true });
fs.writeFileSync('public/recorder/items.json', JSON.stringify(out));
console.log(out.length, 'items');
