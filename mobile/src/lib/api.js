// Downloads content JSON from the DALIL website, with a memory cache and an on-device file cache so
// anything opened once also works offline.
import { Platform } from 'react-native';
import { DATA } from './config';

let FS = null;
if (Platform.OS !== 'web') { try { FS = require('expo-file-system/legacy'); } catch { FS = null; } }
const DIR = FS ? `${FS.documentDirectory}dalil-cache/` : null;
const mem = new Map();
let dirReady = null;
const ensureDir = () => (dirReady ||= FS.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {}));
const fileFor = (path) => `${DIR}${path.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

async function readCache(path) {
  if (!FS) return null;
  try {
    const f = fileFor(path);
    const info = await FS.getInfoAsync(f);
    if (!info.exists) return null;
    return JSON.parse(await FS.readAsStringAsync(f));
  } catch { return null; }
}
async function writeCache(path, text) {
  if (!FS) return;
  try { await ensureDir(); await FS.writeAsStringAsync(fileFor(path), text); } catch { /* cache is best-effort */ }
}

/** Fetch `path` (relative to /data). Order: memory, disk cache, network (then cached). */
export function getJSON(path) {
  if (mem.has(path)) return mem.get(path);
  const p = (async () => {
    const cached = await readCache(path);
    if (cached) return cached;
    const res = await fetch(`${DATA}/${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    writeCache(path, text);
    return JSON.parse(text);
  })().catch((e) => { mem.delete(path); throw e; });
  mem.set(path, p);
  return p;
}

export async function clearCache() {
  mem.clear();
  if (FS) { try { await FS.deleteAsync(DIR, { idempotent: true }); dirReady = null; } catch { /* ignore */ } }
}
export async function cacheSize() {
  if (!FS) return 0;
  try {
    const names = await FS.readDirectoryAsync(DIR);
    let total = 0;
    for (const n of names) { const i = await FS.getInfoAsync(DIR + n); total += i.size || 0; }
    return total;
  } catch { return 0; }
}

export const getSurahs = () => getJSON('q/surahs.json');
export const getSurah = (n) => getJSON(`q/${n}.json`);
export const getCollections = () => getJSON('collections.json');
export const getCollection = (id) => getJSON(`c/${id}.json`);
export const getSection = (cid, sid) => getJSON(`c/${cid}/${sid}.json`);
export const getDuas = () => getJSON('duas.json');

export async function getHadith(cid, n, secId) {
  if (secId) {
    const items = await getSection(cid, secId);
    const h = items.find((x) => String(x.n) === String(n));
    if (h) return { col: await getCollection(cid), h };
  }
  const col = await getCollection(cid);
  for (const sec of col.sections.filter((s) => n >= s.from && n <= s.to)) {
    const items = await getSection(cid, sec.id);
    const h = items.find((x) => String(x.n) === String(n));
    if (h) return { col, h, sec };
  }
  return { col, h: null };
}
