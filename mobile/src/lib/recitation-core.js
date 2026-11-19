// Recitation checking: compares what the speech recogniser HEARD with the verified Quranic words of an ayah.
// Pure functions (no React / native code), so they are fully unit-tested and can serve iOS later.
//
// IMPORTANT HONESTY RULES (see docs/RECITATION.md):
//  - The matching form of a word is used ONLY to compare; the Quranic text shown to the user is never altered.
//  - This is WORD recognition. It cannot judge tajweed or exact letter pronunciation, and says so in its results.
//  - A word that was "not heard" is reported as "not heard clearly", never as a proven pronunciation mistake.
//  - Low engine confidence or a very short capture asks for another attempt instead of reporting errors.

/** Letters-only matching form: no vowel marks, tatweel, dagger alef, Quranic marks; alef/ya/ta-marbuta variants unified. */
export function skeleton(word) {
  return String(word || '')
    .normalize('NFKD')
    .replace(/\u0670/g, '\u0627') // dagger alef is a real long aa in speech
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u06d6-\u06ed\u08d3-\u08ff\u0640\u200c-\u200f]/g, '')
    .replace(/[آأإٱٲٳ]/g, 'ا') // آ أ إ ٱ -> ا
    .replace(/ى|ی|ي/g, 'ي') // ى ی ي -> ي
    .replace(/ة/g, 'ه') // ة -> ه
    .replace(/ک/g, 'ك') // ک -> ك
    .replace(/ؤ/g, 'و') // ؤ -> و
    .replace(/ئ/g, 'ي') // ئ -> ي
    .replace(/ء/g, '') // lone hamza is frequently dropped by recognisers
    .replace(/[^ء-ي]/g, '');
}

/** Words of a text (split on whitespace; Quranic verse markers and stop signs dropped). */
export function words(text) {
  return String(text || '').split(/\s+/).filter((w) => /[ء-يٱ]/.test(w));
}

export function distance(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/** 'exact' | 'close' | 'no'. Close = same word allowing one letter of recogniser noise (two on long words). */
export function wordMatch(expected, heard) {
  const a = skeleton(expected), b = skeleton(heard);
  if (!a || !b) return 'no';
  if (a === b) return 'exact';
  const d = distance(a, b);
  const allowed = a.length <= 3 ? 0 : a.length <= 7 ? 1 : 2;
  return d <= allowed ? 'close' : 'no';
}

const COST = { exact: 0, close: 0.3, no: 1.6 };
const GAP = 1;

/**
 * Align expected words with heard words (dynamic programming). Recognisers often join or split words
 * ("بسم الله" <-> "بسمالله"), so one expected word may match two consecutive heard words and vice versa.
 * Returns one status per expected word: 'ok' | 'close' | 'wrong' | 'missing', plus the heard words with no partner.
 */
export function align(expected, heard) {
  const E = expected.length, H = heard.length;
  const INF = 1e9;
  const D = Array.from({ length: E + 1 }, () => Array(H + 1).fill(INF));
  const from = Array.from({ length: E + 1 }, () => Array(H + 1).fill(null));
  D[0][0] = 0;
  const set = (i, j, c, f) => { if (c < D[i][j]) { D[i][j] = c; from[i][j] = f; } };
  for (let i = 0; i <= E; i++) {
    for (let j = 0; j <= H; j++) {
      const d = D[i][j];
      if (d >= INF) continue;
      if (i < E && j < H) {
        const m = wordMatch(expected[i], heard[j]);
        set(i + 1, j + 1, d + COST[m], { i, j, kind: m === 'no' ? 'wrong' : m === 'exact' ? 'ok' : 'close', n: 1, m: 1 });
      }
      if (i < E) set(i + 1, j, d + GAP, { i, j, kind: 'missing', n: 1, m: 0 });
      if (j < H) set(i, j + 1, d + GAP * 0.8, { i, j, kind: 'extra', n: 0, m: 1 });
      // one expected word spoken as two heard words (recogniser split it)
      if (i < E && j + 1 < H && skeleton(expected[i]) === skeleton(heard[j] + heard[j + 1])) {
        set(i + 1, j + 2, d + 0.2, { i, j, kind: 'close', n: 1, m: 2 });
      }
      // two expected words heard as one (recogniser joined them)
      if (i + 1 < E && j < H && skeleton(expected[i] + expected[i + 1]) === skeleton(heard[j])) {
        set(i + 2, j + 1, d + 0.2, { i, j, kind: 'close', n: 2, m: 1 });
      }
    }
  }
  const status = Array(E).fill('missing');
  const extra = [];
  let i = E, j = H;
  while (i > 0 || j > 0) {
    const f = from[i][j];
    if (!f) break;
    if (f.kind === 'extra') extra.push(f.j);
    else for (let k = 0; k < f.n; k++) status[f.i + k] = f.kind;
    i = f.i; j = f.j;
  }
  return { status, extra: extra.reverse() };
}

export const MIN_CONFIDENCE = 0.5;
export const SELF_CONFIRM_AFTER = 3;

/**
 * Judge one attempt.
 * @param {string} ayahText verified Arabic text of the ayah (displayed text, with marks)
 * @param {{text:string, confidence?:number}[]} alternatives what the recogniser heard (best first; n-best allowed)
 * @returns {{result:'complete'|'incomplete'|'errors'|'retry'|'silence', status:string[], words:string[], problems:number[], confidence:number, note:string}}
 *   `status` has one entry per ayah word. `problems` are indexes of words that were not heard clearly.
 */
export function evaluate(ayahText, alternatives) {
  const expected = words(ayahText);
  const alts = (alternatives || []).filter((a) => a && words(a.text).length);
  const base = { words: expected, status: expected.map(() => 'pending'), problems: [], confidence: 0 };
  if (!alts.length) return { ...base, result: 'silence', note: 'Nothing was heard. Check the microphone and try again.' };

  // Use the best-aligning alternative: more candidates can only help the reciter, never hurt.
  let best = null;
  for (const a of alts) {
    const h = words(a.text);
    const al = align(expected, h);
    const good = al.status.filter((s) => s === 'ok' || s === 'close').length;
    const score = good - al.extra.length * 0.25;
    if (!best || score > best.score) best = { score, al, heard: h, confidence: typeof a.confidence === 'number' ? a.confidence : 1 };
  }
  const { al, heard, confidence } = best;
  const status = al.status;
  const matched = status.filter((s) => s === 'ok' || s === 'close').length;
  const out = { ...base, status, confidence };

  // Not enough evidence either way: ask again, do not accuse.
  if (confidence < MIN_CONFIDENCE) {
    return { ...out, result: 'retry', note: 'I could not hear that clearly enough to check it. Please try again in a quieter place, closer to the microphone.' };
  }
  const problems = status.map((s, i) => (s === 'wrong' || s === 'missing' ? i : -1)).filter((i) => i >= 0);
  if (!problems.length && al.extra.length <= Math.max(1, Math.floor(expected.length * 0.15))) {
    return { ...out, result: 'complete', note: 'Every word of the ayah was heard. This checks the words only, not tajweed.' };
  }
  // Stopped part-way: the heard words match the beginning, the rest is missing.
  const firstMissing = status.indexOf('missing');
  const tailMissing = firstMissing >= 0 && status.slice(firstMissing).every((s) => s === 'missing');
  if (tailMissing && !status.slice(0, firstMissing).some((s) => s === 'wrong')) {
    return { ...out, problems, result: 'incomplete', note: 'The ayah was not finished. Keep going from the highlighted word.' };
  }
  if (matched < expected.length * 0.35 && heard.length < expected.length * 0.5) {
    return { ...out, result: 'retry', problems: [], note: 'Too little was heard to check the ayah. Please recite the whole ayah again.' };
  }
  return { ...out, problems, result: 'errors', note: 'Some words were not heard clearly. This may be a recognition limit, not a mistake: listen and try again.' };
}

/** Where a saved position stands: completed ayat per surah are stored as a sorted list of ayah numbers. */
export function markDone(done, surah, ayah) {
  const key = String(surah);
  const list = new Set(done[key] || []);
  list.add(Number(ayah));
  return { ...done, [key]: [...list].sort((a, b) => a - b) };
}
export const isDone = (done, surah, ayah) => (done[String(surah)] || []).includes(Number(ayah));
/** First ayah of the surah not completed yet (1 when none done; count+1 never returned: capped to the last ayah). */
export function nextToPractice(done, surah, ayahCount) {
  const have = new Set(done[String(surah)] || []);
  for (let a = 1; a <= ayahCount; a++) if (!have.has(a)) return a;
  return ayahCount;
}
