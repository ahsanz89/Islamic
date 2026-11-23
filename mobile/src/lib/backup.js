// Backup and restore of everything the user created on this phone (settings, reading history, streak, favourites,
// learning progress). DALIL has no account and no server, so "sync" means: your data lives on the phone, and a backup
// can be merged back in on this or another phone without duplicating anything. The merge is pure and tested.
// If a server is ever added, it only has to exchange the same snapshot with `mergeSnapshots`.
import { load, save } from './storage';
import { STORE_KEY } from './arabic-learn';

export const SNAPSHOT_VERSION = 1;
const KEYS = { favs: 'dalil.special-dua-favs', learn: 'dalil.learn.v1', arabic: STORE_KEY, speed: 'dalil.learn.speed' };
const SETTINGS_KEY = 'dalil.settings.v1';
const MAX_BYTES = 1_000_000;

const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
const sum = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

/** Merge two values of user progress: objects key by key, lists as a union, flags OR, numbers keep the larger. */
export function mergeValue(a, b) {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (isObj(a) && isObj(b)) { const out = { ...a }; for (const k of Object.keys(b)) out[k] = mergeValue(a[k], b[k]); return out; }
  if (Array.isArray(a) && Array.isArray(b)) { const seen = new Set(); return [...a, ...b].filter((x) => { const k = JSON.stringify(x); if (seen.has(k)) return false; seen.add(k); return true; }); }
  if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  return b;
}

/** Settings: the newer snapshot's choices win, but history, streak and progress from both are kept. */
export function mergeSettings(local, remote, remoteIsNewer) {
  const base = remoteIsNewer ? { ...local, ...remote } : { ...remote, ...local };
  const out = { ...base };
  const pickNewer = (k) => { const x = local[k], y = remote[k]; if (!x) return y || null; if (!y) return x; return (y.at || 0) > (x.at || 0) ? y : x; };
  for (const k of ['readQuran', 'readHadith']) out[k] = pickNewer(k);
  out.lastActivity = ((out.readQuran && out.readQuran.at) || 0) >= ((out.readHadith && out.readHadith.at) || 0) ? (out.readQuran ? 'quran' : out.lastActivity) : 'hadith';
  const days = {};
  for (const d of [local.streak && local.streak.days, remote.streak && remote.streak.days]) for (const [k, v] of Object.entries(d || {})) days[k] = Math.max(days[k] || 0, v);
  if (Object.keys(days).length) out.streak = { ...(remoteIsNewer ? remote.streak : local.streak), days, goal: ((remoteIsNewer ? remote.streak : local.streak) || {}).goal || 5 };
  out.recitationDone = mergeValue(local.recitationDone || {}, remote.recitationDone || {});
  out.onboarded = !!(local.onboarded || remote.onboarded);
  return out;
}

export function mergeSnapshots(local, remote) {
  const remoteIsNewer = (remote.at || 0) > (local.at || 0);
  return {
    v: SNAPSHOT_VERSION, at: Math.max(local.at || 0, remote.at || 0),
    settings: mergeSettings(local.settings || {}, remote.settings || {}, remoteIsNewer),
    favs: mergeValue(local.favs || [], remote.favs || []),
    learn: mergeValue(local.learn || {}, remote.learn || {}),
    arabic: mergeValue(local.arabic || {}, remote.arabic || {}),
    speed: remoteIsNewer ? (remote.speed || local.speed) : (local.speed || remote.speed),
  };
}

export async function readLocalSnapshot(now = Date.now()) {
  const [settings, favs, learn, arabic, speed] = await Promise.all([load(SETTINGS_KEY, {}), load(KEYS.favs, []), load(KEYS.learn, {}), load(KEYS.arabic, {}), load(KEYS.speed, 'slow')]);
  return { v: SNAPSHOT_VERSION, at: now, settings, favs, learn, arabic, speed };
}

/** Text the user can keep. Includes a check code so a cut-off or edited backup is rejected on restore. */
export function exportText(snapshot) {
  const body = JSON.stringify(snapshot);
  return `DALIL-BACKUP-1\n${sum(body)}\n${body}`;
}
export function parseBackup(text) {
  const raw = String(text || '').trim();
  if (raw.length > MAX_BYTES) throw new Error('This backup is too large to be a DALIL backup.');
  const [head, code, ...rest] = raw.split('\n');
  const body = rest.join('\n');
  if (head !== 'DALIL-BACKUP-1' || !code || !body) throw new Error('This is not a DALIL backup. Copy the whole backup text and try again.');
  if (sum(body) !== code) throw new Error('The backup text looks cut off or changed. Please copy it again.');
  let snap; try { snap = JSON.parse(body); } catch { throw new Error('The backup text could not be read.'); }
  if (!isObj(snap) || snap.v !== SNAPSHOT_VERSION || !isObj(snap.settings)) throw new Error('This backup is from a different version of DALIL.');
  return snap;
}

/** Merge a backup into this phone. Returns the merged snapshot; the app should be reopened afterwards. */
export async function restoreFrom(text) {
  const remote = parseBackup(text);
  const local = await readLocalSnapshot();
  const merged = mergeSnapshots(local, remote);
  await save(SETTINGS_KEY, merged.settings);
  await save(KEYS.favs, merged.favs); await save(KEYS.learn, merged.learn); await save(KEYS.arabic, merged.arabic); await save(KEYS.speed, merged.speed);
  return merged;
}
