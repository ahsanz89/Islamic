// The 15-line Mushaf as data, plus the lookups the reader and the reading-history code need.
// Pure functions only (no React), so they are easy to test and the same code can serve iOS later.
// mushaf15.json is built by scripts/build-mushaf.py from the Madinah Mushaf page/line layout and is checked
// verse by verse against the app's own Quran data before it is written.
export const PAGES = 604;
let data = null;
/** The page layout file (public/data/mushaf15.json, ~1.6 MB) is fetched on first use; call setMushaf(json) once before the other functions. */
export const setMushaf = (d) => { data = d; };
export const mushaf = () => data;

const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
export const clampPage = (p) => Math.min(PAGES, Math.max(1, Math.round(Number(p)) || 1));

/** Lines of a page: [0, surah, title] header, [1] basmala, [2, [word tokens]] text. */
export const pageLines = (p) => mushaf().pages[clampPage(p) - 1];

/** The page a verse STARTS on (the same page number the Quran data uses). */
export function pageOfVerse(surah, ayah) {
  const pf = mushaf().pf;
  const key = [Number(surah), Number(ayah), 1];
  let lo = 1, hi = PAGES, ans = 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cmp(pf[mid - 1], key) <= 0) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
}
/** First page of a surah (where its header is). */
export const pageOfSurah = (s) => mushaf().sp[Math.min(114, Math.max(1, Number(s) || 1)) - 1];
/** Surah and ayah of the first word on a page: the position saved when a page is read. */
export function firstVerseOfPage(p) {
  const [s, v] = mushaf().pf[clampPage(p) - 1];
  return { surah: s, ayah: v };
}
/** Surah numbers whose header or text appears on the page, in order. */
export function surahsOnPage(p) {
  const out = [];
  const lines = pageLines(p);
  const pf = mushaf().pf[clampPage(p) - 1];
  if (lines[0] && lines[0][0] !== 0) out.push(pf[0]);
  for (const l of lines) if (l[0] === 0 && !out.includes(l[1])) out.push(l[1]);
  return out;
}

const DIGITS = /^(.*?)\s*([٠-٩]+)$/;
const toNum = (d) => Number(d.replace(/[٠-٩]/g, (c) => c.charCodeAt(0) - 0x660));
/** "ٱلرَّحِيمِ ١" -> { text: 'ٱلرَّحِيمِ', n: 1 } ; a word with no verse number -> { text, n: 0 } */
export function parseToken(tok) {
  const m = DIGITS.exec(tok);
  return m ? { text: m[1], n: toNum(m[2]) } : { text: tok, n: 0 };
}
export const toArabicDigits = (n) => String(n).replace(/\d/g, (d) => String.fromCharCode(0x660 + Number(d)));

/** Plain text of a line for screen readers (the words, with verse numbers spoken as numbers). */
export function lineSpeech(line) {
  if (line[0] === 0) return line[2];
  if (line[0] === 1) return 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
  return line[1].map((t) => { const p = parseToken(t); return p.n ? `${p.text} ${p.n}` : p.text; }).join(' ');
}
