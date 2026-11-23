// The download engine behind the Download Manager.
// Work is split into "groups" (for example "Quran text", "Surah 2 audio", "Sahih al-Bukhari"); each group is a list of
// small files. Files are saved one at a time under a temporary name and renamed when complete, so an interrupted
// download never leaves a half-written file behind. Pause, resume, cancel, retry and delete all work per group.
import * as defaultStore from './offline-store';
import {
  essentialJobs, hadithIndexJob, hadithSectionJob, quranAudioJobs, quranTextJob, surahCount, trimHadith, trimSurah, wordRel, wordUrl,
} from './offline-catalog';
import ARABIC from './arabic-data.json';
import { reciterById } from './reciters';

const RESERVE = 60 * 1024 * 1024; // always leave this much free space on the phone

export const specId = (s) => {
  if (s.type === 'text') return `text:${s.surahs === 'all' ? 'all' : s.surahs.join(',')}`;
  if (s.type === 'audio') return `audio:${s.reciter}:${s.surahs === 'all' ? 'all' : s.surahs.join(',')}`;
  if (s.type === 'hadith') return `hadith:${s.cid}`;
  return s.type; // essentials | words
};

export function collectWordRefs(data = ARABIC) {
  const seen = new Map();
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    for (const [k, v] of Object.entries(o)) {
      if (k === 'ref' && Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)) seen.set(v.join(':'), v);
      else walk(v);
    }
  };
  walk(data);
  return [...seen.values()];
}

const allSurahs = () => Array.from({ length: surahCount() }, (_, i) => i + 1);
const surahList = (s) => (s === 'all' ? allSurahs() : s);

/** The files a spec needs. Hadith books list their sections only after the book's index has been downloaded. */
export function jobsForSpec(spec) {
  if (spec.type === 'text') return surahList(spec.surahs).map((n) => quranTextJob(n, spec.trans || []));
  if (spec.type === 'audio') return surahList(spec.surahs).flatMap((n) => quranAudioJobs(spec.reciter, n));
  if (spec.type === 'essentials') return essentialJobs();
  if (spec.type === 'words') return collectWordRefs().map((r) => ({ id: `w:${r.join(':')}`, kind: 'word', url: wordUrl(r), rel: wordRel(r), bytes: 14000, exact: false }));
  if (spec.type === 'hadith') return [hadithIndexJob(spec.cid)];
  return [];
}

/** Which stored files belong to a spec (used to delete it and to show what is installed). */
export function relMatcher(spec) {
  if (spec.type === 'text') { const set = new Set(surahList(spec.surahs).map((n) => `q/${n}.json`)); return (r) => set.has(r); }
  if (spec.type === 'audio') {
    const set = new Set(surahList(spec.surahs).map((n) => String(n).padStart(3, '0')));
    return (r) => { const m = /^a\/([^/]+)\/(\d{3})(\d{3})?\.mp3$/.exec(r); return !!m && set.has(m[2]) && matchesReciter(m[1], spec.reciter); };
  }
  if (spec.type === 'hadith') return (r) => r === `c/${spec.cid}.json` || r.startsWith(`c/${spec.cid}/`);
  if (spec.type === 'essentials') return (r) => ['q/surahs.json', 'collections.json', 'duas.json', 'glossary.json'].includes(r);
  if (spec.type === 'words') return (r) => r.startsWith('w/');
  return () => false;
}
const matchesReciter = (dir, id) => { const r = reciterById(id); return dir === (r.type === 'surah' ? r.slug : r.folder); };

export function createDownloader({ fs, store = defaultStore, concurrency = 3, retries = 3, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  const groups = new Map();
  const subs = new Set();
  let running = 0;
  let dirty = false;
  const emit = () => subs.forEach((f) => f());
  const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

  const persist = () => {
    store.setQueue([...groups.values()].filter((g) => g.status !== 'done' && g.status !== 'canceled').map((g) => ({ spec: g.spec, title: g.title })));
  };
  const progress = (g) => {
    const done = g.jobs.filter((j) => j.state === 'done');
    g.doneCount = done.length;
    g.doneBytes = done.reduce((a, j) => a + (j.actual || j.bytes || 0), 0);
    g.totalBytes = g.jobs.reduce((a, j) => a + (j.state === 'done' ? (j.actual || j.bytes || 0) : (j.bytes || 0)), 0);
  };

  async function runJob(g, job) {
    const existing = store.entry(job.rel);
    const wants = job.trim ? job.trim.keys : null;
    if (existing && (!wants || wants.every((k) => (existing.k || []).includes(k)))) { job.state = 'done'; job.actual = existing.b; return; }
    const dest = store.uri(job.rel);
    const tmp = `${dest}.part`;
    let lastErr;
    for (let attempt = 0; attempt < retries; attempt++) {
      if (g.status !== 'downloading') { job.state = 'pending'; return; }
      try {
        await fs.ensureDir(tmp.slice(0, tmp.lastIndexOf('/') + 1));
        const res = await fs.download(job.url, tmp);
        if (!res || res.status !== 200) throw new Error(`HTTP ${res && res.status}`);
        if (job.trim) {
          const data = JSON.parse(await fs.read(tmp));
          const out = job.trim.type === 'quran' ? trimSurah(data, job.trim.keys) : trimHadith(data, job.trim.keys);
          job.actual = await store.write(job.rel, JSON.stringify(out), [...job.trim.keys]);
          await fs.remove(tmp);
        } else {
          const size = await fs.size(tmp);
          if (!(size > 0)) throw new Error('empty file');
          await fs.remove(dest);
          await fs.move(tmp, dest);
          job.actual = size;
          store.record(job.rel, size);
        }
        job.state = 'done';
        return;
      } catch (e) {
        lastErr = e;
        try { await fs.remove(tmp); } catch { /* none */ }
        if (attempt < retries - 1) await sleep(500 * 2 ** attempt);
      }
    }
    job.state = 'failed';
    job.error = String((lastErr && lastErr.message) || lastErr || 'failed');
  }

  async function planHadith(g) {
    // the book's section list is inside its index file
    const col = await store.readJSON(`c/${g.spec.cid}.json`);
    if (!col || !Array.isArray(col.sections)) return;
    const have = new Set(g.jobs.map((j) => j.id));
    for (const s of col.sections) {
      const j = hadithSectionJob(g.spec.cid, s.id, g.spec.langs || []);
      if (!have.has(j.id)) g.jobs.push({ ...j, state: 'pending' });
    }
    g.planned = true;
  }

  async function worker() {
    for (;;) {
      let picked = null;
      for (const g of groups.values()) {
        if (g.status !== 'downloading') continue;
        const job = g.jobs.find((j) => j.state === 'pending');
        if (job) { job.state = 'active'; picked = [g, job]; break; }
      }
      if (!picked) return;
      const [g, job] = picked;
      await runJob(g, job);
      progress(g);
      if (g.status === 'downloading') await settle(g);
      emit();
    }
  }
  async function settle(g) {
    if (g.spec.type === 'hadith' && !g.planned && g.jobs.every((j) => j.state !== 'pending' && j.state !== 'active')) {
      if (g.jobs[0] && g.jobs[0].state === 'done') { await planHadith(g); progress(g); pump(); }
    }
    const open = g.jobs.some((j) => j.state === 'pending' || j.state === 'active');
    if (open) return;
    const failed = g.jobs.filter((j) => j.state === 'failed').length;
    if (g.spec.type === 'hadith' && !g.planned && failed === 0) return; // still waiting for the index
    if (failed) { g.status = 'error'; g.error = `${failed} file${failed > 1 ? 's' : ''} could not be downloaded. Check your connection and tap Resume.`; }
    else { g.status = 'done'; g.error = ''; }
    persist(); store.flush();
  }
  function pump() {
    while (running < concurrency && [...groups.values()].some((g) => g.status === 'downloading' && g.jobs.some((j) => j.state === 'pending'))) {
      running += 1;
      worker().catch(() => {}).finally(() => { running -= 1; emit(); pump(); });
    }
  }

  async function checkSpace(jobs) {
    const need = jobs.filter((j) => j.state !== 'done').reduce((a, j) => a + (j.bytes || 0), 0);
    const { free } = await store.disk();
    if (free && need + RESERVE > free) { const e = new Error('not-enough-space'); e.need = need; e.free = free; throw e; }
  }

  async function start(spec, title = '') {
    await store.init();
    const id = specId(spec);
    const old = groups.get(id);
    if (old && (old.status === 'downloading' || old.status === 'done')) return old;
    if (old && (old.status === 'paused' || old.status === 'error')) { resume(id); return old; }
    const jobs = jobsForSpec(spec).map((j) => ({ ...j, state: 'pending' }));
    for (const j of jobs) { const e = store.entry(j.rel); if (e && (!j.trim || j.trim.keys.every((k) => (e.k || []).includes(k)))) { j.state = 'done'; j.actual = e.b; } }
    await checkSpace(jobs);
    const g = { id, spec, title, jobs, status: 'downloading', error: '', doneCount: 0, doneBytes: 0, totalBytes: 0, planned: spec.type !== 'hadith', at: Date.now() };
    groups.set(id, g);
    progress(g); persist(); emit();
    if (jobs.every((j) => j.state === 'done')) { if (spec.type === 'hadith') { g.planned = false; await planHadith(g); progress(g); if (g.jobs.some((j) => j.state === 'pending')) { pump(); return g; } } g.status = 'done'; persist(); emit(); return g; }
    pump();
    return g;
  }
  function pause(id) { const g = groups.get(id); if (g && g.status === 'downloading') { g.status = 'paused'; persist(); emit(); } }
  function resume(id) {
    const g = groups.get(id); if (!g || (g.status !== 'paused' && g.status !== 'error')) return;
    for (const j of g.jobs) if (j.state === 'failed' || j.state === 'active') j.state = 'pending';
    g.status = 'downloading'; g.error = ''; persist(); emit(); pump();
  }
  async function cancel(id) {
    const g = groups.get(id); if (!g) return;
    g.status = 'canceled';
    groups.delete(id);
    persist(); emit();
  }
  function resumeErrored() { for (const g of groups.values()) if (g.status === 'error') resume(g.id); }
  async function remove(spec) {
    const id = specId(spec);
    const g = groups.get(id);
    if (g) groups.delete(id);
    const n = await store.removeWhere(relMatcher(spec));
    persist(); emit();
    return n;
  }
  function restore() {
    for (const q of store.getQueue()) {
      const id = specId(q.spec);
      if (groups.has(id)) continue;
      const jobs = jobsForSpec(q.spec).map((j) => ({ ...j, state: store.entry(j.rel) ? 'done' : 'pending', actual: (store.entry(j.rel) || {}).b }));
      const g = { id, spec: q.spec, title: q.title || id, jobs, status: 'paused', error: 'Paused when the app was closed.', doneCount: 0, doneBytes: 0, totalBytes: 0, planned: q.spec.type !== 'hadith', at: Date.now() };
      groups.set(id, g); progress(g);
    }
    emit();
  }

  const list = () => [...groups.values()];
  const get = (id) => groups.get(id) || null;
  return { start, pause, resume, cancel, remove, restore, resumeErrored, list, get, subscribe, _groups: groups };
}

/* ------------------------------------------------------------------ the real engine, on the phone's file system */
let engine = null;
export function downloader() {
  if (engine) return engine;
  let FS = null;
  try { FS = require('expo-file-system/legacy'); } catch { FS = null; }
  const fs = {
    ensureDir: (d) => FS.makeDirectoryAsync(d, { intermediates: true }).catch(() => {}),
    download: (url, dest) => FS.downloadAsync(url, dest),
    read: (p) => FS.readAsStringAsync(p),
    remove: (p) => FS.deleteAsync(p, { idempotent: true }),
    move: (from, to) => FS.moveAsync({ from, to }),
    size: async (p) => { const i = await FS.getInfoAsync(p); return i.exists ? i.size || 0 : 0; },
  };
  engine = createDownloader({ fs });
  return engine;
}
