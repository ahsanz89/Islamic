import { createDownloader, jobsForSpec, relMatcher, specId, collectWordRefs } from '../src/lib/downloads';
import { trimSurah, trimHadith, relForUrl, quranTextJob, quranAudioJobs, quranAudioEstimate, hadithEstimate, fmtBytes } from '../src/lib/offline-catalog';

// in-memory stand-ins for the phone's disk and the offline index
function fakeWorld({ failUrls = [], failTimes = 0, free = 5e9 } = {}) {
  const disk = new Map();
  const web = {
    'https://ahsanz89.github.io/Islamic/data/c/bk.json': JSON.stringify({ id: 'bk', sections: [{ id: '1' }, { id: '2' }] }),
    'https://ahsanz89.github.io/Islamic/data/c/bk/1.json': JSON.stringify([{ n: '1', ar: 'x', t: { en: 'one', ur: 'ایک', fr: 'un' } }]),
    'https://ahsanz89.github.io/Islamic/data/c/bk/2.json': JSON.stringify([{ n: '2', ar: 'y', t: { en: 'two', ur: 'دو', fr: 'deux' } }]),
  };
  for (let n = 1; n <= 114; n++) web[`https://ahsanz89.github.io/Islamic/data/q/${n}.json`] = JSON.stringify([{ v: 1, ar: 'a', tl: 'b', juz: 1, page: 1, sajda: false, w: [{ a: 'w' }], t: { en: 'E', ur: 'U', fr: 'F' } }]);
  const calls = [];
  let failed = 0;
  const world = { broken: failTimes === Infinity };
  const fs = {
    ensureDir: async () => {},
    download: async (url, dest) => {
      calls.push(url);
      if (failTimes !== Infinity && failUrls.some((f) => url.includes(f)) && failed < failTimes) { failed += 1; throw new Error('network down'); }
      if (world.broken && failUrls.some((f) => url.includes(f))) throw new Error('network down');
      const body = web[url] || 'AUDIO'.repeat(100);
      disk.set(dest, body);
      return { status: 200 };
    },
    read: async (p) => disk.get(p),
    remove: async (p) => { disk.delete(p); },
    move: async (a, b) => { disk.set(b, disk.get(a)); disk.delete(a); },
    size: async (p) => (disk.get(p) || '').length,
  };
  const index = {}; let queue = [];
  const store = {
    init: async () => {}, flush: async () => {}, setQueue: (q) => { queue = q; }, getQueue: () => queue,
    uri: (r) => `/off/${r}`, entry: (r) => index[r] || null,
    record: (r, b, k) => { index[r] = k ? { b, k } : { b }; },
    write: async (r, text, k) => { disk.set(`/off/${r}`, text); index[r] = { b: text.length, k }; return text.length; },
    readJSON: async (r) => (disk.has(`/off/${r}`) ? JSON.parse(disk.get(`/off/${r}`)) : null),
    removeWhere: async (pred) => { let n = 0; for (const r of Object.keys(index)) if (pred(r)) { delete index[r]; disk.delete(`/off/${r}`); n++; } return n; },
    disk: async () => ({ free, total: 64e9 }),
  };
  return { fs, store, index, disk, calls, world, getQueue: () => queue };
}
const settleAll = async (dl, id, ms = 3000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const g = dl.get(id); if (g && g.status !== 'downloading') return g; await new Promise((r) => setTimeout(r, 5)); } return dl.get(id); };
const fast = { sleep: async () => {} };

describe('catalog', () => {
  test('trimSurah keeps Arabic, transliteration and only the chosen languages, and drops word data', () => {
    const out = trimSurah([{ v: 1, ar: 'a', tl: 'b', juz: 1, page: 2, sajda: false, w: [1], t: { en: 'E', ur: 'U' } }], ['en']);
    expect(out).toEqual([{ v: 1, ar: 'a', tl: 'b', juz: 1, page: 2, sajda: false, t: { en: 'E' } }]);
  });
  test('trimHadith keeps the Arabic and the chosen languages', () => {
    expect(trimHadith([{ n: '1', ar: 'x', t: { en: 'E', ur: 'U' } }], ['ur'])).toEqual([{ n: '1', ar: 'x', t: { ur: 'U' } }]);
  });
  test('whole Quran with one translation is a few megabytes; audio estimates grow with the bitrate', () => {
    let total = 0; for (let n = 1; n <= 114; n++) total += quranTextJob(n, ['en']).bytes;
    expect(total).toBeGreaterThan(2.5e6); expect(total).toBeLessThan(5e6);
    expect(quranAudioEstimate('sudais', 2)).toBeGreaterThan(quranAudioEstimate('ghamdi', 2));
    expect(hadithEstimate('bukhari', ['en'])).toBeLessThan(20e6);
    expect(hadithEstimate('bukhari', [])).toBeLessThan(hadithEstimate('bukhari', ['en', 'ur']));
  });
  test('audio urls map to local paths and unknown hosts never do', () => {
    expect(relForUrl('https://everyayah.com/data/Alafasy_128kbps/002255.mp3')).toBe('a/Alafasy_128kbps/002255.mp3');
    expect(relForUrl('https://cdn.mp3quran.net/download/audio/badr-turki/r1/001.mp3')).toBe('a/badr-turki/001.mp3');
    expect(relForUrl('https://audio.qurancdn.com/wbw/001_001_001.mp3')).toBe('w/001_001_001.mp3');
    expect(relForUrl('https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/001001.mp3')).toBeNull();
    expect(relForUrl('https://evil.example/a.mp3')).toBeNull();
  });
  test('audio jobs: one file per ayah for ayah reciters, one file per surah for whole-surah reciters', () => {
    expect(quranAudioJobs('alafasy', 1)).toHaveLength(7);
    expect(quranAudioJobs('badr', 1)).toHaveLarge === undefined;
    expect(quranAudioJobs('badr', 1)).toHaveLength(1);
    expect(fmtBytes(3.2 * 1048576)).toBe('3.2 MB'); expect(fmtBytes(500)).toBe('1 KB');
  });
  test('spec ids and word refs', () => {
    expect(specId({ type: 'text', surahs: 'all' })).toBe('text:all');
    expect(specId({ type: 'audio', reciter: 'alafasy', surahs: [2] })).toBe('audio:alafasy:2');
    expect(collectWordRefs().length).toBeGreaterThan(10);
  });
});

describe('download engine', () => {
  test('downloads Quran text, trims to the chosen translation and records the languages kept', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'text', surahs: [1, 2], trans: ['en'] }, 'Quran text');
    const g = await settleAll(dl, 'text:1,2');
    expect(g.status).toBe('done'); expect(g.doneCount).toBe(2);
    expect(w.index['q/1.json'].k).toEqual(['en']);
    expect(JSON.parse(w.disk.get('/off/q/1.json'))[0].t).toEqual({ en: 'E' });
    expect(JSON.parse(w.disk.get('/off/q/1.json'))[0].w).toBeUndefined();
    expect([...w.disk.keys()].some((k) => k.endsWith('.part'))).toBe(false);
  });
  test('the whole Quran is 114 files', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast, concurrency: 4 });
    await dl.start({ type: 'text', surahs: 'all', trans: ['en', 'ur'] });
    const g = await settleAll(dl, 'text:all'); expect(g.status).toBe('done'); expect(g.doneCount).toBe(114);
  });
  test('audio saves complete files only and counts real bytes', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'audio', reciter: 'alafasy', surahs: [1] });
    const g = await settleAll(dl, 'audio:alafasy:1');
    expect(g.status).toBe('done'); expect(w.index['a/Alafasy_128kbps/001001.mp3'].b).toBe(500); expect(g.doneBytes).toBe(7 * 500);
  });
  test('a hadith book downloads its index first, then every section in the chosen languages only', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'hadith', cid: 'bk', langs: ['en'] }, 'Book');
    const g = await settleAll(dl, 'hadith:bk');
    expect(g.status).toBe('done'); expect(g.jobs).toHaveLength(3);
    expect(JSON.parse(w.disk.get('/off/c/bk/2.json'))[0].t).toEqual({ en: 'two' });
    expect(JSON.parse(w.disk.get('/off/c/bk.json')).sections).toHaveLength(2);
  });
  test('a flaky network is retried and the download still completes', async () => {
    const w = fakeWorld({ failUrls: ['/q/1.json'], failTimes: 2 }); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'text', surahs: [1], trans: [] });
    expect((await settleAll(dl, 'text:1')).status).toBe('done');
  });
  test('a dead connection ends in "error", keeps finished files, and resume finishes the rest', async () => {
    const w = fakeWorld({ failUrls: ['/q/2.json'], failTimes: Infinity }); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'text', surahs: [1, 2], trans: [] });
    const g = await settleAll(dl, 'text:1,2');
    expect(g.status).toBe('error'); expect(g.error).toMatch(/could not be downloaded/); expect(w.index['q/1.json']).toBeTruthy(); expect(w.index['q/2.json']).toBeUndefined();
    w.world.broken = false; // connection is back
    dl.resume('text:1,2');
    expect((await settleAll(dl, 'text:1,2')).status).toBe('done'); expect(w.index['q/2.json']).toBeTruthy();
  });
  test('pause stops new files, resume continues; cancel forgets the group but keeps finished files', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast, concurrency: 1 });
    await dl.start({ type: 'text', surahs: 'all', trans: [] });
    dl.pause('text:all');
    await new Promise((r) => setTimeout(r, 30));
    const doneWhenPaused = dl.get('text:all').jobs.filter((j) => j.state === 'done').length;
    await new Promise((r) => setTimeout(r, 30));
    expect(dl.get('text:all').status).toBe('paused'); expect(dl.get('text:all').jobs.filter((j) => j.state === 'done').length).toBe(doneWhenPaused);
    dl.resume('text:all'); expect((await settleAll(dl, 'text:all', 5000)).status).toBe('done');
    await dl.start({ type: 'audio', reciter: 'alafasy', surahs: [2] }); await dl.cancel('audio:alafasy:2');
    expect(dl.get('audio:alafasy:2')).toBeNull();
  });
  test('delete removes only that content', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'text', surahs: [1, 2], trans: [] }); await settleAll(dl, 'text:1,2');
    await dl.start({ type: 'audio', reciter: 'alafasy', surahs: [1] }); await settleAll(dl, 'audio:alafasy:1');
    expect(await dl.remove({ type: 'audio', reciter: 'alafasy', surahs: [1] })).toBe(7);
    expect(w.index['q/1.json']).toBeTruthy(); expect(w.index['a/Alafasy_128kbps/001001.mp3']).toBeUndefined();
    expect(relMatcher({ type: 'audio', reciter: 'alafasy', surahs: [1] })('a/Alafasy_128kbps/002001.mp3')).toBe(false);
  });
  test('refuses to start when there is not enough free space', async () => {
    const w = fakeWorld({ free: 10 * 1024 * 1024 }); const dl = createDownloader({ ...w, ...fast });
    await expect(dl.start({ type: 'audio', reciter: 'alafasy', surahs: 'all' })).rejects.toThrow('not-enough-space');
  });
  test('unfinished downloads are remembered and come back paused after a restart', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast, concurrency: 1 });
    await dl.start({ type: 'text', surahs: 'all', trans: ['en'] }, 'Quran text'); dl.pause('text:all');
    expect(w.getQueue()).toHaveLength(1);
    const dl2 = createDownloader({ ...w, ...fast }); dl2.restore();
    expect(dl2.get('text:all').status).toBe('paused'); expect(dl2.get('text:all').error).toMatch(/Paused/);
  });
  test('files already on the phone are not downloaded again', async () => {
    const w = fakeWorld(); const dl = createDownloader({ ...w, ...fast });
    await dl.start({ type: 'text', surahs: [1], trans: ['en'] }); await settleAll(dl, 'text:1');
    const before = w.calls.length; const dl2 = createDownloader({ ...w, ...fast });
    await dl2.start({ type: 'text', surahs: [1], trans: ['en'] }); expect(w.calls.length).toBe(before);
    expect(jobsForSpec({ type: 'essentials' })).toHaveLength(4);
  });
});
