// Builds everything under public/data from the raw downloads in raw/.
// Run: npm run data   (after npm run fetch)
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, GROUPS, HADITH_API_LANGS, LANG3 } from './collections.config.mjs';
import { parseOpenITI } from './lib/openiti-parse.mjs';
import { findMatnStart, normalizeArabic, normalizeText } from '../src/lib/arabic.mjs';
import { findSimilar } from './lib/takhrij.mjs';
import { gradeClass } from '../src/lib/grades.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RAW = path.join(ROOT, 'raw');
const OUT = path.join(ROOT, 'public', 'data');
const OPENITI_BLOCK = 100; // hadith per page for Arabic-only books

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (rel, obj) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj));
};
const log = (...a) => console.log('[data]', ...a);

fs.rmSync(OUT, { recursive: true, force: true });

// ---------------------------------------------------------------- hadith
const books = []; // {meta, sections:[{id,title,items:[record]}]}

for (const c of COLLECTIONS) {
  if (c.source === 'hadith-api') {
    const ara = readJSON(path.join(RAW, 'hadith', `ara-${c.id}.json`));
    const tr = {};
    const langs = ['ar'];
    for (const l of HADITH_API_LANGS) {
      const f = path.join(RAW, 'hadith', `${LANG3[l]}-${c.id}.json`);
      if (!fs.existsSync(f)) continue;
      const d = readJSON(f);
      tr[l] = new Map(d.hadiths.map((h) => [h.hadithnumber, h]));
      langs.push(l);
    }
    const gradesSrc = tr.en || new Map();
    const secNames = ara.metadata.sections;
    const secDet = ara.metadata.section_details;
    const ranges = Object.entries(secDet)
      .filter(([, d]) => d.hadithnumber_last > 0)
      .map(([id, d]) => ({ id, first: d.hadithnumber_first, last: d.hadithnumber_last }));
    const sections = new Map();
    for (const h of ara.hadiths) {
      const n = h.hadithnumber;
      // Numbers outside every range (e.g. 402.2) go to the book that starts just before them.
      const r = ranges.find((x) => n >= x.first && n <= x.last) ||
        ranges.filter((x) => x.first <= n).sort((a, b) => b.first - a.first)[0] || ranges[0];
      const sid = r ? r.id : 'other';
      if (!sections.has(sid)) {
        sections.set(sid, { id: sid, title: secNames[sid] || (sid === 'other' ? 'Other' : `Book ${sid}`), items: [] });
      }
      const t = {};
      for (const l of langs) {
        if (l === 'ar') continue;
        const x = tr[l].get(n);
        if (x && x.text && x.text.trim()) t[l] = x.text.trim();
      }
      const g = (gradesSrc.get(n)?.grades || []).map((x) => [x.name, x.grade]);
      sections.get(sid).items.push({
        n,
        an: h.arabicnumber,
        ref: [h.reference?.book ?? null, h.reference?.hadith ?? null],
        ar: (h.text || '').trim(),
        g,
        t
      });
    }
    const secs = [...sections.values()].filter((s) => s.items.length)
      .sort((a, b) => Math.min(...a.items.map((h) => h.n)) - Math.min(...b.items.map((h) => h.n)));
    books.push({ meta: { ...c, langs }, sections: secs });
    log(c.id, ara.hadiths.length, 'hadith,', secs.length, 'books,', langs.join('/'));
  } else {
    const f = path.join(RAW, 'openiti', c.file);
    if (!fs.existsSync(f)) { log('missing', c.file); continue; }
    const parsed = parseOpenITI(fs.readFileSync(f, 'utf8'));
    const ratio = c.expected ? parsed.length / c.expected : 1;
    if (ratio < 0.6) { log('skip (segmentation too weak)', c.id, parsed.length, '/', c.expected); continue; }
    const secs = [];
    for (let i = 0; i < parsed.length; i += OPENITI_BLOCK) {
      const items = parsed.slice(i, i + OPENITI_BLOCK).map((h) => ({ n: h.n, p: h.printed, ch: h.chapter, ar: h.text, g: [], t: {} }));
      const first = items[0], last = items[items.length - 1];
      secs.push({ id: String(secs.length + 1), title: `${first.n}–${last.n}`, sub: first.ch || '', items });
    }
    books.push({ meta: { ...c, langs: ['ar'], partial: c.expected ? parsed.length < c.expected * 0.95 : false }, sections: secs });
    log(c.id, parsed.length, 'hadith (OpenITI)', c.expected ? `expected ~${c.expected}` : '');
  }
}

// matn split for every hadith
for (const b of books) for (const s of b.sections) for (const h of s.items) h.mi = findMatnStart(h.ar);

// ---------------------------------------------------------------- takhrij
log('finding similar narrations (takhrij)…');
const all = [];
for (const b of books) for (const s of b.sections) for (const h of s.items) all.push({ c: b.meta.id, h });
const sims = findSimilar(all.map(({ h }) => normalizeArabic(h.ar.slice(h.mi))));
let linked = 0;
sims.forEach((list, i) => {
  if (!list.length) return;
  all[i].h.sim = list.map(([j, score]) => [all[j].c, all[j].h.n, score]);
  linked++;
});
log('takhrij links for', linked, 'of', all.length, 'hadith');

// ---------------------------------------------------------------- write hadith data
const summary = [];
for (const b of books) {
  const m = b.meta;
  let count = 0;
  const secIndex = b.sections.map((s) => {
    count += s.items.length;
    write(`c/${m.id}/${s.id}.json`, s.items);
    const ns = s.items.map((x) => x.n);
    return { id: s.id, title: s.title, sub: s.sub || '', from: Math.min(...ns), to: Math.max(...ns), count: s.items.length };
  });
  const entry = {
    id: m.id, group: m.group, source: m.source, en: m.en, ar: m.ar, ur: m.ur,
    author: m.author, authorAr: m.authorAr, death: m.death, langs: m.langs, count, partial: !!m.partial
  };
  write(`c/${m.id}.json`, { ...entry, sections: secIndex });
  summary.push(entry);

  // search files, one per language
  for (const l of m.langs) {
    const rows = [];
    for (const s of b.sections) for (const h of s.items) {
      const txt = l === 'ar' ? h.ar : h.t[l];
      // [number, normalised text, grade class, section id]
      if (txt) rows.push([h.n, normalizeText(txt, l), gradeClass(h.g, m.id), s.id]);
    }
    write(`s/${l}/${m.id}.json`, rows);
  }
}
write('collections.json', { groups: GROUPS, collections: summary, built: new Date().toISOString() });
log('collections written:', summary.length);

// empty-but-ready datasets
write('narrators/index.json', { narrators: [], note: 'Narrator profiles are not loaded yet. See docs/DATA.md for the schema.' });
write('commentary/index.json', { sources: [], note: 'No commentary is loaded yet. See docs/DATA.md for the schema.' });

// ---------------------------------------------------------------- Quran
const Q = path.join(RAW, 'quran');
const info = readJSON(path.join(Q, 'info.json'));
const QEDS = {
  ar: 'ara-quranuthmanienc', simple: 'ara-quransimple', translit: 'ara-quran-la',
  ur: 'urd-fatehmuhammadja', ur2: 'urd-muhammadjunagar', en: 'eng-mohammedmarmadu', en2: 'eng-abdullahyusufal',
  bn: 'ben-muhiuddinkhan', id: 'ind-indonesianislam', tr: 'tur-diyanetisleri', fr: 'fra-muhammadhamidul',
  ru: 'rus-elmirkuliev', ta: 'tam-janturstfoundat', hi: 'hin-suhelfarooqkhan'
};
const QNAMES = {
  ur: 'Fateh Muhammad Jalandhry', ur2: 'Muhammad Junagarhi', en: 'Marmaduke Pickthall', en2: 'Abdullah Yusuf Ali',
  bn: 'Muhiuddin Khan', id: 'Indonesian Ministry of Religious Affairs', tr: 'Diyanet İşleri', fr: 'Muhammad Hamidullah',
  ru: 'Elmir Kuliev', ta: 'Jan Trust Foundation', hi: 'Suhel Farooq Khan & Saifur Rahman Nadwi'
};
const qtext = {};
for (const [k, ed] of Object.entries(QEDS)) {
  qtext[k] = new Map(readJSON(path.join(Q, `${ed}.json`)).quran.map((v) => [`${v.chapter}:${v.verse}`, v.text]));
}
// word by word (English meaning + transliteration), keyed by verse
const wbw = new Map();
for (const page of readJSON(path.join(Q, 'wbw.json'))) {
  for (const a of page.ayahs || []) for (const w of a.words || []) {
    if (!w || w.char_type_name !== 'word') continue;
    const k = w.parentAyahVerseKey;
    if (!wbw.has(k)) wbw.set(k, []);
    wbw.get(k).push({ pos: w.position, en: w.translation?.text || '', tl: w.transliteration?.text || '' });
  }
}
for (const list of wbw.values()) list.sort((a, b) => a.pos - b.pos);
// roots per verse (Quranic Arabic Corpus via quran-search-engine)
const morph = new Map(readJSON(path.join(Q, 'morphology.json')).map((m) => [m.gid, m]));

const roots = new Map(); // root -> [[key, word]]
let gid = 0;
const surahs = [];
for (const ch of info.chapters) {
  const verses = [];
  for (const v of ch.verses) {
    gid++;
    const k = `${ch.chapter}:${v.verse}`;
    const arWords = [];
    for (const tok of (qtext.ar.get(k) || '').split(/\s+/)) {
      if (!tok) continue;
      // Some Uthmani encodings put a space before a dagger alif: join it back.
      if (/^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/.test(tok) && arWords.length) arWords[arWords.length - 1] += tok;
      else if (/[\u0621-\u064A]/.test(tok)) arWords.push(tok);
    }
    const meanings = wbw.get(k) || [];
    const m = morph.get(gid) || { lemmas: [], roots: [] };
    // Roots are listed only for lemmas that have one: give each root to the next lemma that contains its strong letters.
    const lemmaRoot = [];
    let ri = 0;
    for (const lem of m.lemmas) {
      const r = m.roots[ri];
      if (r) {
        const strong = r.split('-').map((x) => normalizeArabic(x)).filter((x) => !'اويء'.includes(x));
        const L = normalizeArabic(lem);
        let p = 0;
        for (const c2 of L) if (c2 === strong[p]) p++;
        if (p === strong.length && strong.length) { lemmaRoot.push(r); ri++; continue; }
      }
      lemmaRoot.push(null);
    }
    const sameCount = m.lemmas.length === arWords.length;
    let j = 0;
    const core = (x) => {
      let n = normalizeArabic(x).replace(/ /g, '');
      if (n.length > 3 && n !== 'الله' && n.startsWith('ال')) n = n.slice(2);
      return n;
    };
    const matches = (lemma, word) => {
      if (lemma.length < 2) return word === lemma;
      let p = 0;
      for (const c2 of word) if (c2 === lemma[p]) p++;
      return p === lemma.length || (lemma.length >= 4 && p >= lemma.length - 1);
    };
    const words = arWords.map((a, i) => {
      const w = { a, en: meanings[i]?.en || '', tl: meanings[i]?.tl || '' };
      let li = -1;
      if (sameCount) li = i;
      else {
        const word = normalizeArabic(a).replace(/ /g, '');
        for (let kk = 0; kk < 3 && j + kk < m.lemmas.length; kk++) {
          if (matches(core(m.lemmas[j + kk]), word)) { li = j + kk; j = li + 1; break; }
        }
      }
      if (li >= 0) {
        w.l = m.lemmas[li];
        if (lemmaRoot[li]) w.r = lemmaRoot[li];
      }
      if (w.r) {
        if (!roots.has(w.r)) roots.set(w.r, []);
        roots.get(w.r).push([k, a, w.en]);
      }
      return w;
    });
    const t = {};
    for (const key of Object.keys(QNAMES)) t[key] = qtext[key].get(k) || '';
    verses.push({ v: v.verse, ar: qtext.ar.get(k), tl: qtext.translit.get(k), t, w: words, juz: v.juz, page: v.page, sajda: !!v.sajda });
  }
  write(`q/${ch.chapter}.json`, verses);
  surahs.push({ n: ch.chapter, name: ch.name, en: ch.englishname, ar: ch.arabicname, place: ch.revelation, verses: ch.verses.length });
  // Quran search rows
}
write('q/surahs.json', { surahs, translators: QNAMES });
write('q/roots.json', Object.fromEntries([...roots.entries()].sort((a, b) => b[1].length - a[1].length).map(([r, occ]) => [r, occ])));
// Quran search: Arabic (simple) + every translation
for (const key of ['simple', ...Object.keys(QNAMES)]) {
  const lang = key === 'simple' ? 'ar' : key.replace(/2$/, '');
  const juzOf = new Map();
  for (const ch of info.chapters) for (const v of ch.verses) juzOf.set(`${ch.chapter}:${v.verse}`, v.juz);
  // [verse key, normalised text, juz]
  const rows = [...qtext[key].entries()].map(([k, txt]) => [k, normalizeText(txt, lang), juzOf.get(k)]);
  write(`s/quran/${key}.json`, rows);
}
log('quran: 114 surahs,', roots.size, 'roots');

// ---------------------------------------------------------------- content (glossary, duas)
const CONTENT = path.join(ROOT, 'content');
fs.copyFileSync(path.join(CONTENT, 'glossary.json'), path.join(OUT, 'glossary.json'));
const duas = readJSON(path.join(CONTENT, 'duas.json'));
for (const d of duas.duas) {
  const book = books.find((b) => b.meta.id === d.c);
  const needle = normalizeArabic(d.find);
  let hit = null;
  for (const s of book?.sections || []) {
    hit = s.items.find((h) => normalizeArabic(h.ar).includes(needle));
    if (hit) { d.n = hit.n; d.sec = s.id; break; }
  }
  if (!hit) log('dua not found:', d.id);
}
write('duas.json', { categories: duas.categories, duas: duas.duas.filter((d) => d.n != null).map(({ find, ...d }) => d) });
log('done');
