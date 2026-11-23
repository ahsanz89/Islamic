// The offline library on the phone: downloaded files live in one app-private folder (`dalil-offline/`) and a small
// index remembers every file, its size and, for trimmed files, which languages it holds.
// The index is written atomically (temp file, then rename) and rebuilt from the folder if it ever gets damaged.
import { Platform } from 'react-native';
import { relForUrl } from './offline-catalog';

let FS = null;
if (Platform.OS !== 'web') { try { FS = require('expo-file-system/legacy'); } catch { FS = null; } }

export const supported = () => !!FS;
export const ROOT = FS ? `${FS.documentDirectory}dalil-offline/` : null;
const INDEX = ROOT ? `${ROOT}index.json` : null;
const SUBDIRS = ['q', 'a', 'c', 'w'];

let files = {};            // rel -> { b: bytes, k?: [keys kept in a trimmed file] }
let queue = [];            // download groups that were not finished (so they can be resumed after the app restarts)
let ready = null;
const subs = new Set();
const emit = () => subs.forEach((f) => f());
let saveTimer = null;

export const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
export const version = { n: 0 };
const bump = () => { version.n += 1; emit(); };

async function ensureDirs(dirs = ['']) {
  if (!FS) return;
  for (const d of dirs) { try { await FS.makeDirectoryAsync(ROOT + d, { intermediates: true }); } catch { /* exists */ } }
}

async function scan(dir = '') {
  // rebuild: every file under the known sub-folders counts, with its real size
  const out = {};
  const walk = async (rel) => {
    let names = [];
    try { names = await FS.readDirectoryAsync(ROOT + rel); } catch { return; }
    for (const n of names) {
      const path = rel ? `${rel}/${n}` : n;
      let info; try { info = await FS.getInfoAsync(ROOT + path); } catch { continue; }
      if (info.isDirectory) await walk(path);
      else if (!/\.(part|tmp)$/.test(n) && n !== 'index.json' && info.size > 0) out[path] = { b: info.size };
    }
  };
  for (const d of SUBDIRS) await walk(d);
  for (const n of ['surahs.json', 'collections.json', 'duas.json', 'glossary.json']) {
    try { const i = await FS.getInfoAsync(ROOT + n); if (i.exists && i.size > 0) out[n] = { b: i.size }; } catch { /* none */ }
  }
  return out;
}

/** Load the index once. Safe to call many times. */
export function init() {
  if (!FS) return Promise.resolve();
  return (ready ||= (async () => {
    await ensureDirs(['', ...SUBDIRS]);
    try {
      const info = await FS.getInfoAsync(INDEX);
      if (info.exists) {
        const parsed = JSON.parse(await FS.readAsStringAsync(INDEX));
        if (parsed && typeof parsed.files === 'object') { files = parsed.files; queue = Array.isArray(parsed.queue) ? parsed.queue : []; }
        else throw new Error('bad index');
      } else {
        files = await scan(); await flush();
      }
    } catch {
      files = await scan(); queue = []; await flush();
    }
    bump();
  })());
}

export async function flush() {
  if (!FS) return;
  clearTimeout(saveTimer);
  try {
    await ensureDirs();
    const tmp = `${INDEX}.tmp`;
    await FS.writeAsStringAsync(tmp, JSON.stringify({ v: 1, files, queue }));
    try { await FS.deleteAsync(INDEX, { idempotent: true }); } catch { /* none */ }
    await FS.moveAsync({ from: tmp, to: INDEX });
  } catch { /* keep working in memory; the next flush tries again */ }
}
const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 800); };

export const has = (rel) => !!files[rel];
export const entry = (rel) => files[rel] || null;
export const uri = (rel) => (ROOT ? ROOT + rel : null);
export const sizeOf = (rel) => (files[rel] ? files[rel].b : 0);
export const allRels = () => Object.keys(files);
export const totalBytes = () => Object.values(files).reduce((a, f) => a + (f.b || 0), 0);
export const bytesWhere = (pred) => Object.entries(files).reduce((a, [r, f]) => a + (pred(r) ? f.b || 0 : 0), 0);
export const countWhere = (pred) => Object.keys(files).reduce((a, r) => a + (pred(r) ? 1 : 0), 0);

export function record(rel, bytes, keys) {
  files[rel] = keys ? { b: bytes, k: keys } : { b: bytes };
  saveSoon(); bump();
}
export async function write(rel, text, keys) {
  if (!FS) return 0;
  const dest = ROOT + rel;
  const dir = dest.slice(0, dest.lastIndexOf('/') + 1);
  try { await FS.makeDirectoryAsync(dir, { intermediates: true }); } catch { /* exists */ }
  const tmp = `${dest}.tmp`;
  await FS.writeAsStringAsync(tmp, text);
  try { await FS.deleteAsync(dest, { idempotent: true }); } catch { /* none */ }
  await FS.moveAsync({ from: tmp, to: dest });
  const info = await FS.getInfoAsync(dest);
  record(rel, info.size || text.length, keys);
  return info.size || text.length;
}
export async function readJSON(rel) {
  if (!FS || !files[rel]) return null;
  try { return JSON.parse(await FS.readAsStringAsync(ROOT + rel)); }
  catch { files = { ...files }; delete files[rel]; saveSoon(); bump(); return null; }  // damaged file: forget it so it can be downloaded again
}

export async function removeWhere(pred) {
  const gone = Object.keys(files).filter(pred);
  for (const rel of gone) {
    try { if (FS) await FS.deleteAsync(ROOT + rel, { idempotent: true }); } catch { /* ignore */ }
    delete files[rel];
  }
  await flush(); bump();
  return gone.length;
}
export async function removeAll() {
  if (FS) { try { await FS.deleteAsync(ROOT, { idempotent: true }); } catch { /* ignore */ } }
  files = {}; queue = []; ready = null;
  await init();
}

export const getQueue = () => queue;
export function setQueue(q) { queue = q; saveSoon(); }

/** Free and total space on the phone, in bytes (0 when unknown). */
export async function disk() {
  if (!FS) return { free: 0, total: 0 };
  try { return { free: await FS.getFreeDiskStorageAsync(), total: await FS.getTotalDiskCapacityAsync() }; } catch { return { free: 0, total: 0 }; }
}

/** If we hold a local copy of this remote URL (an audio clip), return its file:// uri; otherwise the URL itself. */
export function localUri(url) {
  const rel = relForUrl(url);
  return rel && files[rel] && ROOT ? ROOT + rel : url;
}

// testing hooks
export const _reset = () => { files = {}; queue = []; ready = null; };
export const _files = () => files;
