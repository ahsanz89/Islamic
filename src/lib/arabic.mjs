// Arabic text helpers shared by the build scripts and the website.

const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export const stripDiacritics = (s) => (s || '').replace(DIACRITICS, '');

/** Normalise Arabic for searching and matching: no harakat, unified letter forms. */
export function normalizeArabic(s) {
  return stripDiacritics(s)
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[ىیۍې]/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ہ/g, 'ه')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/[^ء-ي\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalise any language for simple substring search. */
export function normalizeText(s, lang) {
  if (lang === 'ar') return normalizeArabic(s);
  if (lang === 'ur') {
    return stripDiacritics(s)
      .replace(/[إأآ]/g, 'ا')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/ه(?=\s|$)/g, 'ہ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }
  return (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ');
}

// Phrases that usually open the Prophet's words (the matn) after the chain (isnad).
const MATN_MARKERS = [
  'قال رسول الله', 'سمعت رسول الله', 'ان رسول الله', 'عن رسول الله', 'قال النبي', 'سمعت النبي',
  'ان النبي', 'عن النبي', 'كان رسول الله', 'كان النبي', 'رايت رسول الله', 'رايت النبي'
];

/**
 * Best guess at where the chain of narrators ends and the text begins.
 * Returns a character index into the ORIGINAL string (0 = no split found).
 */
export function findMatnStart(text) {
  if (!text) return 0;
  // Map positions in the stripped string back to the original.
  const map = [];
  let stripped = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/[ؐ-ًؚ-ٰٟۖ-ۭـ]/.test(ch)) continue;
    stripped += ch.replace(/[إأآٱ]/, 'ا');
    map.push(i);
  }
  const limit = stripped.length * 0.75;
  const quote = stripped.search(/[«"“]/);
  let best = -1;
  for (const m of MATN_MARKERS) {
    const idx = stripped.indexOf(m);
    if (idx > 0 && idx < limit && (best < 0 || idx < best)) best = idx;
  }
  if (quote > 0 && quote < limit && (best < 0 || quote < best)) best = quote;
  if (best <= 20) return 0;
  return map[best] ?? 0;
}
