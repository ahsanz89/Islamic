// What can be downloaded, how big it is, and where each file is saved. Pure functions (no network, no disk),
// so they are easy to test. The Download Manager and the download engine both read from here.
import MANIFEST from './offline-manifest.json';
import { AUDIO, reciterById } from './reciters';

export const DATA_BASE = 'https://ahsanz89.github.io/Islamic/data';

/** Average length of one ayah recording, used only to ESTIMATE audio size before it is downloaded. */
const AVG_AYAH_SECONDS = 5;
export const HADITH_LANGS = ['en', 'ur', 'bn', 'id', 'tr', 'fr', 'ru', 'ta'];

const surahInfo = (n) => MANIFEST.quran.surahs[n - 1];

/** Keep only what the chosen languages need. Word-by-word data is not used by the app, so it is never stored. */
export function trimSurah(ayahs, keys = []) {
  return ayahs.map((a) => {
    const o = { v: a.v, ar: a.ar };
    if (a.tl) o.tl = a.tl;
    if (a.juz != null) o.juz = a.juz;
    if (a.page != null) o.page = a.page;
    if (a.sajda != null) o.sajda = a.sajda;
    const t = {};
    for (const k of keys) if (a.t && a.t[k] != null) t[k] = a.t[k];
    o.t = t;
    return o;
  });
}
/** Keep the Arabic and only the chosen languages of each hadith. */
export function trimHadith(items, langs = []) {
  return items.map((h) => {
    if (!h || typeof h.t !== 'object' || !h.t) return h;
    const t = {};
    for (const l of langs) if (h.t[l] != null) t[l] = h.t[l];
    return { ...h, t };
  });
}

/* ------------------------------------------------------------------ jobs (one file each) */
// A job: { id, kind, url, rel, bytes (estimate or exact), trim? }. `rel` is the path inside the offline folder.

export function quranTextJob(n, trans = []) {
  const s = surahInfo(n);
  const bytes = s.base + trans.reduce((a, k) => a + (s.t[k] || 0), 0);
  return { id: `qt:${n}`, kind: 'quran-text', url: `${DATA_BASE}/q/${n}.json`, rel: `q/${n}.json`, bytes, exact: true, trim: { type: 'quran', keys: [...trans] } };
}

export function ayahFileName(s, v) { return `${String(s).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`; }
/** Approximate bytes of one ayah clip from the bitrate written in the reciter's folder name (e.g. Alafasy_128kbps). */
export function ayahBytes(reciter) {
  const m = /(\d+)kbps/i.exec(reciter.folder || '');
  const kbps = m ? Number(m[1]) : 128;
  return Math.round(AVG_AYAH_SECONDS * kbps * 125);
}
export function quranAudioJobs(reciterId, n) {
  const r = reciterById(reciterId);
  const s = surahInfo(n);
  if (r.type === 'surah') {
    const file = `${String(n).padStart(3, '0')}.mp3`;
    // a whole-surah recording: roughly 0.8 s per ayah of audio per 10 kbps at 64 kbps is far too small, so use a typical 5 s per ayah at 64 kbps
    return [{ id: `qa:${r.id}:${n}`, kind: 'quran-audio', url: AUDIO.surahFile(r.slug, n), rel: `a/${r.slug}/${file}`, bytes: s.verses * AVG_AYAH_SECONDS * 64 * 125, exact: false, whole: true }];
  }
  const per = ayahBytes(r);
  const jobs = [];
  for (let v = 1; v <= s.verses; v++) {
    const f = ayahFileName(n, v);
    jobs.push({ id: `qa:${r.id}:${n}:${v}`, kind: 'quran-audio', url: AUDIO.ayah(r.folder, n, v), rel: `a/${r.folder}/${f}`, bytes: per, exact: false });
  }
  return jobs;
}
/** Estimated size of one surah's audio for a reciter, without building the file list. */
export function quranAudioEstimate(reciterId, n) {
  const r = reciterById(reciterId);
  const s = surahInfo(n);
  return r.type === 'surah' ? s.verses * AVG_AYAH_SECONDS * 64 * 125 : s.verses * ayahBytes(r);
}

export function hadithEstimate(cid, langs = []) {
  const b = MANIFEST.hadith[cid];
  if (!b) return 0;
  return b.base + langs.reduce((a, l) => a + ((b.t && b.t[l]) || 0), 0);
}
/** A hadith book: its index file, then every section file (the section list comes from the index once it is downloaded). */
export function hadithIndexJob(cid) {
  return { id: `hi:${cid}`, kind: 'hadith', url: `${DATA_BASE}/c/${cid}.json`, rel: `c/${cid}.json`, bytes: 0, exact: true };
}
export function hadithSectionJob(cid, sec, langs = []) {
  return { id: `hs:${cid}:${sec}`, kind: 'hadith', url: `${DATA_BASE}/c/${cid}/${sec}.json`, rel: `c/${cid}/${sec}.json`, bytes: 0, exact: true, trim: { type: 'hadith', keys: [...langs] } };
}

/** Essentials are tiny and make the lists and names work without a connection. */
export const ESSENTIAL_FILES = [
  ['q/surahs.json', 'surahs.json'], ['collections.json', 'collections.json'], ['duas.json', 'duas.json'], ['glossary.json', 'glossary.json'],
];
export const essentialJobs = () => ESSENTIAL_FILES.map(([rel]) => ({ id: `es:${rel}`, kind: 'essential', url: `${DATA_BASE}/${rel}`, rel, bytes: 14000, exact: false }));

/** Word-by-word clips used by the "Understand What You Pray" words on Home. */
export const wordUrl = (ref) => `https://audio.qurancdn.com/wbw/${String(ref[0]).padStart(3, '0')}_${String(ref[1]).padStart(3, '0')}_${String(ref[2]).padStart(3, '0')}.mp3`;
export const wordRel = (ref) => `w/${String(ref[0]).padStart(3, '0')}_${String(ref[1]).padStart(3, '0')}_${String(ref[2]).padStart(3, '0')}.mp3`;

/** Where a remote URL is stored on the phone (so players can swap in the local copy), or null if we never store it. */
export function relForUrl(url) {
  let m = /^https:\/\/everyayah\.com\/data\/([^/]+)\/(\d{6}\.mp3)$/.exec(url);
  if (m && m[1] !== 'translations') return `a/${m[1]}/${m[2]}`;
  m = /^https:\/\/cdn\.mp3quran\.net\/download\/audio\/([^/]+)\/r1\/(\d{3}\.mp3)$/.exec(url);
  if (m) return `a/${m[1]}/${m[2]}`;
  m = /^https:\/\/audio\.qurancdn\.com\/wbw\/(\d{3}_\d{3}_\d{3}\.mp3)$/.exec(url);
  if (m) return `w/${m[1]}`;
  return null;
}

export const surahCount = () => MANIFEST.quran.surahs.length;
export const quranTextEstimate = (n, trans) => quranTextJob(n, trans).bytes;
export const verseCount = (n) => surahInfo(n).verses;

/** Human-readable size: 1.2 MB, 340 KB. */
export function fmtBytes(b) {
  if (!Number.isFinite(b) || b <= 0) return '0 KB';
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1048576).toFixed(b < 10485760 ? 1 : 0)} MB`;
  return `${(b / 1073741824).toFixed(2)} GB`;
}
