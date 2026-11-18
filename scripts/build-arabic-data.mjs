// Builds src/lib/arabic-data.json for "Learn Arabic" from the app's Quran data (public/data/q/*.json) + scripts/arabic-source.mjs.
// Run after `npm run data`:  node scripts/build-arabic-data.mjs
import fs from 'node:fs';
import { PHRASES, SURAHS, VOCAB_GROUPS } from './arabic-source.mjs';

const MARKS = /[ً-ٟ]/;
/** Compare Arabic words ignoring script variants: Uthmani/Indo-Pak letters, tatweel, dagger alif, stop signs, order of marks. */
export function norm(s) {
  s = s.replace(/ٱ/g, 'ا').replace(/ۡ/g, 'ْ').replace(/ـ/g, '').replace(/ۥ/g, 'و').replace(/ۦ/g, 'ي')
    .replace(/[ۖ-ۭؕ-ؚٓ-ٕ࣓-ٰࣿ]/g, '');
  const out = []; let buf = [];
  for (const ch of s) { if (MARKS.test(ch)) buf.push(ch); else { out.push(buf.sort().join('')); buf = []; out.push(ch); } }
  out.push(buf.sort().join(''));
  return out.join('').replace(/[اأإآء]/g, '').replace(/ى|ی/g, 'ي').replace(/ک/g, 'ك').replace(/ہ/g, 'ه').replace(/ۃ/g, 'ة').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[ًٌٍ]/g, '');
}

const q = {};
for (let n = 1; n <= 114; n++) q[n] = JSON.parse(fs.readFileSync(`public/data/q/${n}.json`, 'utf8'));
const index = new Map(); // norm(word) -> [{s,v,w,en,a}]
for (const n of Object.keys(q)) for (const v of q[n]) {
  if (v.na) continue;       // verses whose word count disagrees with the word recordings have no per-word audio
  v.w.forEach((w, i) => { const k = norm(w.a); if (!index.has(k)) index.set(k, []); index.get(k).push({ s: +n, v: v.v, w: i + 1, en: w.en, a: w.a }); });
}
const find = (form) => index.get(norm(form)) || [];
const report = [];

const phrases = PHRASES.map((p) => ({
  ...p,
  words: p.words.map(([a, tl, en, ur]) => {
    const hit = find(a)[0];
    if (!hit) report.push(`phrase ${p.id}: no recorded word audio for ${a}`);
    return { a, tl, en, ur, ref: hit ? [hit.s, hit.v, hit.w] : null };
  })
}));

const vocab = VOCAB_GROUPS.map((g) => ({
  id: g.id, en: g.en, ur: g.ur,
  words: g.words.map(([a, en, ur]) => {
    const hits = find(a);
    if (!hits.length) { report.push(`vocab ${g.id}: ${a} not found in Quran data`); return null; }
    const key = en.split(/[\/ ]/)[0].toLowerCase().replace(/[^a-z]/g, '');
    const agrees = hits.filter((h) => h.en.toLowerCase().includes(key)).length;
    if (!agrees) report.push(`vocab ${g.id}: gloss "${en}" for ${a} not found in the data's own glosses (e.g. "${hits[0].en}")`);
    const best = hits.find((h) => h.en.toLowerCase().includes(key)) || hits[0];
    return { a: best.a, tl: null, en, ur, ref: [best.s, best.v, best.w], count: hits.length, dataGloss: best.en };
  }).filter(Boolean)
}));

const surahs = SURAHS.map((s) => ({
  ...s,
  verses: q[s.n].map((v) => ({ v: v.v, ar: v.ar, tl: v.tl, en: v.t.en, ur: v.t.ur, na: !!v.na, words: v.w.map((w) => ({ a: w.a, tl: w.tl, en: w.en })) }))
}));

// pause/stop signs (ۖ–ۜ) are not part of a word: drop them from single-word tiles
const noStop = (a) => a.replace(/[\u06D6-\u06DC]/g, '');
for (const g of vocab) for (const w of g.words) w.a = noStop(w.a);
fs.writeFileSync('src/lib/arabic-data.json', JSON.stringify({ phrases, vocab, surahs }));
console.log('phrases', phrases.length, 'vocab words', vocab.reduce((n, g) => n + g.words.length, 0), 'surahs', surahs.length);
console.log(report.length ? report.join('\n') : 'all words matched');
