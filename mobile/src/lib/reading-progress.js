// Reading history. Quran and Hadith are saved separately (one never overwrites the other);
// `lastActivity` says which one was read most recently, and Continue Reading follows it.
// Pure functions: they take the settings object and return a patch / a route, so they are easy to test.
import { clampPage, firstVerseOfPage, pageOfVerse } from './mushaf-core';

const int = (n) => (Number.isInteger(n) ? n : Number.isFinite(Number(n)) ? Math.round(Number(n)) : NaN);
export const validQuran = (p) => !!p && int(p.surah) >= 1 && int(p.surah) <= 114 && int(p.ayah) >= 1;
export const validHadith = (p) => !!p && typeof p.col === 'string' && p.col.length > 0 && typeof p.sec === 'string' && p.sec.length > 0;

/** Patch to save a Quran position. `page` is the Mushaf page when read in the 15-line view. */
export function saveQuran(pos, now = Date.now()) {
  if (!validQuran(pos)) return null;
  const readQuran = { surah: int(pos.surah), ayah: int(pos.ayah), name: pos.name || '', at: now };
  if (pos.page) readQuran.page = clampPage(pos.page);
  return { readQuran, lastActivity: 'quran' };
}
/** Patch to save a Hadith position (book, chapter, hadith number). */
export function saveHadith(pos, now = Date.now()) {
  if (!validHadith(pos)) return null;
  const n = int(pos.n);
  return { readHadith: { col: pos.col, sec: pos.sec, n: n > 0 ? n : 0, title: pos.title || '', at: now }, lastActivity: 'hadith' };
}

/** Saved histories, including the old single `lastRead` of earlier versions (read once, never written back). */
export function histories(settings) {
  let q = validQuran(settings.readQuran) ? settings.readQuran : null;
  let h = validHadith(settings.readHadith) ? settings.readHadith : null;
  const old = settings.lastRead && typeof settings.lastRead.href === 'string' ? settings.lastRead.href : '';
  const mq = /^\/surah\/(\d+)/.exec(old), mh = /^\/section\/([^/]+)\/([^/?]+)/.exec(old);
  if (!q && mq) q = { surah: Number(mq[1]), ayah: 1, name: settings.lastRead.title || '', at: 0 };
  if (!h && mh) h = { col: mh[1], sec: mh[2], n: 0, title: settings.lastRead.title || '', at: 0 };
  if (q && !validQuran(q)) q = null;
  return { quran: q, hadith: h };
}

/** Where Continue Reading should go. Returns null when there is no history yet (first-time user). */
export function continueTarget(settings, mode = settings.quranMode) {
  const { quran, hadith } = histories(settings);
  let type = settings.lastActivity === 'hadith' ? 'hadith' : settings.lastActivity === 'quran' ? 'quran' : null;
  if (type === 'quran' && !quran) type = hadith ? 'hadith' : null;
  if (type === 'hadith' && !hadith) type = quran ? 'quran' : null;
  if (!type) type = quran && hadith ? (quran.at >= hadith.at ? 'quran' : 'hadith') : quran ? 'quran' : hadith ? 'hadith' : null;
  if (type === 'quran') return { type, ...quranRoute(quran, mode) };
  if (type === 'hadith') {
    const q = hadith.n ? `?focus=${hadith.n}` : '';
    return { type, href: `/section/${hadith.col}/${hadith.sec}${q}`, title: hadith.title || `${hadith.col} · ${hadith.sec}`, detail: hadith.n ? `#${hadith.n}` : '' };
  }
  return null;
}
/** Route for a saved Quran position in the chosen layout. Both layouts understand the same saved position. */
export function quranRoute(pos, mode) {
  if (mode === 'mushaf') {
    const page = pos.page || pageOfVerse(pos.surah, pos.ayah);
    return { href: `/mushaf/${page}`, title: pos.name ? `${pos.surah}. ${pos.name}` : `Surah ${pos.surah}`, detail: `Page ${page}` };
  }
  return { href: `/surah/${pos.surah}?ayah=${pos.ayah}`, title: pos.name ? `${pos.surah}. ${pos.name}` : `Surah ${pos.surah}`, detail: `Ayah ${pos.ayah}` };
}
/** Position of the first verse on a Mushaf page, as a saveable Quran position. */
export function positionOfPage(page, name = '') {
  const { surah, ayah } = firstVerseOfPage(page);
  return { surah, ayah, page: clampPage(page), name };
}
