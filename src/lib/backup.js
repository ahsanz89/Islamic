'use client';
// Backup and restore for the web. Same text format as the mobile app ("DALIL-BACKUP-1"), so a backup made on the phone can be
// restored here and the other way round. DALIL has no account and no server: your data lives in this browser, and a backup
// can be merged back in anywhere without duplicating anything.
//
// What travels between phone and web: reading streak, Learn Quran progress, Learn Arabic progress, saved special duas, sound
// speed. Web-only things (bookmarks, settings, last place read) are stored under `web` and are ignored by the phone.
import { STREAK_KEY, loadStreak, saveStreak } from './reading-log';

export const SNAPSHOT_VERSION = 1;
const KEYS = { favs: 'dalil.special-dua-favs', learn: 'dalil.learn.v1', arabic: 'dalil.arabic.v1', speed: 'dalil.learn.speed' };
const WEB = { bookmarks: 'hl.bookmarks', settings: 'hl.settings', lastRead: 'hl.lastRead' };
const MAX_BYTES = 1_500_000;

const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
const sum = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full */ } };

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

/** Streak: every reading day from both sides is kept (the larger count wins per day). */
export function mergeStreak(local, remote) {
  const days = {};
  for (const d of [local && local.days, remote && remote.days]) for (const [k, v] of Object.entries(d || {})) days[k] = Math.max(days[k] || 0, v);
  return { ...(local || {}), days, goal: (local && local.goal) || (remote && remote.goal) || 5 };
}

export function mergeSnapshots(local, remote) {
  const remoteIsNewer = (remote.at || 0) > (local.at || 0);
  const ls = local.settings || {}, rs = remote.settings || {};
  const streak = mergeStreak(ls.streak, rs.streak);
  return {
    v: SNAPSHOT_VERSION, at: Math.max(local.at || 0, remote.at || 0),
    settings: { ...(remoteIsNewer ? { ...ls, ...rs } : { ...rs, ...ls }), ...(Object.keys(streak.days).length ? { streak } : {}) },
    favs: mergeValue(local.favs || [], remote.favs || []),
    learn: mergeValue(local.learn || {}, remote.learn || {}),
    arabic: mergeValue(local.arabic || {}, remote.arabic || {}),
    speed: remoteIsNewer ? (remote.speed || local.speed) : (local.speed || remote.speed),
    web: { ...(remote.web || {}), ...(local.web || {}), bookmarks: mergeValue(local.web?.bookmarks || [], remote.web?.bookmarks || []).filter((b, i, a) => a.findIndex((x) => x.key === b.key) === i) }
  };
}

export function readLocalSnapshot(now = Date.now()) {
  const streak = loadStreak();
  const { seen, ...streakClean } = streak; // `seen` is only the "already counted today" list
  return {
    v: SNAPSHOT_VERSION, at: now,
    settings: Object.keys(streakClean.days || {}).length ? { streak: streakClean } : {},
    favs: read(KEYS.favs, []), learn: read(KEYS.learn, {}), arabic: read(KEYS.arabic, {}), speed: read(KEYS.speed, 'slow'),
    web: { bookmarks: read(WEB.bookmarks, []), settings: read(WEB.settings, {}), lastRead: read(WEB.lastRead, null) }
  };
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

/** Merge a backup into this browser. Returns the merged snapshot. Existing data is never deleted, only added to. */
export function restoreFrom(text) {
  const remote = parseBackup(text);
  const local = readLocalSnapshot();
  const merged = mergeSnapshots(local, remote);
  if (merged.settings.streak) saveStreak({ ...loadStreak(), ...merged.settings.streak });
  write(KEYS.favs, merged.favs); write(KEYS.learn, merged.learn); write(KEYS.arabic, merged.arabic);
  if (merged.speed) write(KEYS.speed, merged.speed);
  const bm = merged.web && merged.web.bookmarks;
  if (Array.isArray(bm)) write(WEB.bookmarks, bm);
  return merged;
}
export { STREAK_KEY };
