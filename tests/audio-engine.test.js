import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A controllable stand-in for <audio>: tests decide when a clip starts, ends or fails.
let els;
class FakeAudio {
  constructor() { this.l = {}; this.src = ''; this.paused = true; this.ended = false; this.currentTime = 0; this.duration = NaN; this.volume = 1; this.preload = ''; els.push(this); }
  addEventListener(e, f) { (this.l[e] = this.l[e] || []).push(f); }
  removeAttribute(a) { if (a === 'src') this.src = ''; }
  load() {}
  fire(e) { (this.l[e] || []).forEach((f) => f({})); }
  play() { this.paused = false; this.ended = false; this.playedSrc = this.src; return Promise.resolve(); }
  pause() { if (!this.paused) { this.paused = true; this.fire('pause'); } }
}
let rejectNext = null;
FakeAudio.prototype.play = function () { this.paused = false; this.ended = false; this.playedSrc = this.src; return rejectNext ? Promise.reject(rejectNext) : Promise.resolve(); };

const main = () => els.find((e) => e.src && !/^$/.test(e.src) && e.l.ended); // the engine's own ayah element (has listeners)
const finish = (a = main()) => { a.ended = true; a.paused = true; a.fire('ended'); };
const fail = (a = main()) => a.fire('error');

let eng, R;
async function fresh() {
  vi.resetModules();
  els = []; rejectNext = null;
  globalThis.Audio = FakeAudio;
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  eng = await import('@/lib/audio-engine');
  R = await import('@/lib/reciters');
}
const S112 = { n: 112, name: 'Al-Ikhlas', ar: 'الإخلاص', verses: 4 };
const pad = (n) => String(n).padStart(3, '0');
const urdu = (s, v) => R.AUDIO_SOURCES.urdu(s, v);
const srcOf = () => main().src;
const cfgBase = { repeat: false, continuous: true, bismillah: true, volume: 0.9, urdu: true };

beforeEach(async () => { vi.useFakeTimers(); await fresh(); });
afterEach(() => { vi.useRealTimers(); });

describe('recitation is followed by its translation with EVERY reciter', () => {
  it('lists every configured reciter', async () => { expect(R.RECITERS.length).toBeGreaterThanOrEqual(11); });
  for (const id of ['alafasy', 'badr', 'sudais', 'shuraim', 'muaiqly', 'abdulbasit', 'husary', 'minshawi', 'ghamdi', 'rifai', 'dosari']) {
    it(`${id}: ayah, translation, next ayah, translation … in order`, async () => {
      eng.configure({ ...cfgBase, reciter: id });
      eng.playSurah(S112, 1);
      const seen = [srcOf()];
      // Bismillah first (no translation for it), then 4 ayahs each followed by its translation
      for (let i = 0; i < 9 && eng.state.status !== 'ended'; i++) { finish(); seen.push(srcOf()); }
      const reciterForAyahs = R.reciterById(id).type === 'surah' ? 'alafasy' : id; // whole-surah files cannot be interleaved
      const folder = R.reciterById(reciterForAyahs).folder;
      const ayah = (v) => R.AUDIO_SOURCES.ayah(folder, 112, v);
      expect(seen.slice(0, 10)).toEqual([
        R.AUDIO_SOURCES.ayah(folder, 1, 1), // Bismillah
        ayah(1), urdu(112, 1), ayah(2), urdu(112, 2), ayah(3), urdu(112, 3), ayah(4), urdu(112, 4), urdu(112, 4)
      ].slice(0, seen.length));
      expect(seen).toContain(urdu(112, 4));
      expect(eng.state.status).toBe('ended');
    });
  }
  it('no translation clips are played when translation audio is off', () => {
    eng.configure({ ...cfgBase, urdu: false, reciter: 'alafasy' });
    eng.playSurah(S112, 1);
    const seen = [srcOf()];
    for (let i = 0; i < 6 && eng.state.status !== 'ended'; i++) { finish(); seen.push(srcOf()); }
    expect(seen.some((u) => u.includes('translations'))).toBe(false);
  });
  it('a tapped single ayah plays that ayah then its translation, then stops', () => {
    eng.configure({ ...cfgBase, reciter: 'husary' });
    eng.playAyah(S112, 3);
    expect(srcOf()).toContain(`${pad(112)}${pad(3)}`);
    finish();
    expect(srcOf()).toBe(urdu(112, 3));
    expect(eng.state.phase).toBe('urdu');
    finish();
    expect(eng.state.status).toBe('ended');
  });
  it('the player says the translation is playing (phase) and returns to recitation for the next ayah', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playSurah({ ...S112, n: 1, verses: 7 }, 1);
    expect(eng.state.phase).toBe('');
    finish(); expect(eng.state.phase).toBe('urdu');
    finish(); expect(eng.state.phase).toBe(''); expect(eng.state.q.v).toBe(2);
  });
});

describe('Badr Al-Turki (single file per surah)', () => {
  it('without translation it plays the one whole-surah file', () => {
    eng.configure({ ...cfgBase, urdu: false, reciter: 'badr' });
    eng.playSurah(S112, 1);
    expect(srcOf()).toContain('badr-turki');
    expect(eng.state.q.whole).toBe(true);
  });
  it('with translation on, it plays ayah by ayah (Alafasy) so every ayah gets its translation', () => {
    eng.configure({ ...cfgBase, reciter: 'badr' });
    eng.playSurah(S112, 1);
    expect(eng.state.q.whole).toBe(false);
    finish(); finish();
    expect(srcOf()).toBe(urdu(112, 1));
  });
});

describe('translation problems never break the recitation', () => {
  it('a missing translation clip is skipped and the next ayah plays', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playSurah(S112, 1);
    finish(); finish();            // Bismillah, ayah 1 → translation 1 starts
    expect(srcOf()).toBe(urdu(112, 1));
    fail();                         // translation 404
    expect(srcOf()).toContain(`${pad(112)}${pad(2)}`);
    expect(eng.state.toast).toBe('urdu-unavailable');
    expect(eng.state.status).not.toBe('error');
  });
  it('a translation clip that never starts is skipped after 12 seconds', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playAyah(S112, 1);
    finish();
    expect(eng.state.status).toBe('loading');
    vi.advanceTimersByTime(12100);
    expect(eng.state.status).toBe('ended'); // single-ayah mode: nothing more to play, but it did not hang
    expect(eng.state.toast).toBe('urdu-unavailable');
  });
  it('the watchdog does not fire once the translation is playing', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playAyah(S112, 1); finish();
    main().fire('playing');
    vi.advanceTimersByTime(20000);
    expect(eng.state.phase).toBe('urdu');
    expect(eng.state.status).toBe('playing');
  });
  it('autoplay blocked on the translation clip leaves the player paused (not stuck loading)', async () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playAyah(S112, 1);
    rejectNext = Object.assign(new Error('x'), { name: 'NotAllowedError' });
    finish();
    await Promise.resolve(); await Promise.resolve();
    expect(eng.state.status).toBe('paused');
  });
});

describe('controls with recitation and translation', () => {
  beforeEach(() => eng.configure({ ...cfgBase, reciter: 'alafasy' }));
  it('pause and resume during the translation clip continue the same clip', () => {
    eng.playAyah(S112, 2); finish();
    main().fire('playing');
    eng.pause(); expect(eng.state.status).toBe('paused');
    eng.resume(); expect(main().paused).toBe(false);
    expect(srcOf()).toBe(urdu(112, 2));
  });
  it('next ayah during a translation jumps to the next recitation', () => {
    eng.playSurah(S112, 1); finish(); finish();
    expect(srcOf()).toBe(urdu(112, 1));
    eng.next();
    expect(srcOf()).toContain(`${pad(112)}${pad(2)}`); expect(eng.state.phase).toBe('');
  });
  it('replay during a translation restarts the ayah recitation', () => {
    eng.playAyah(S112, 2); finish();
    eng.replay();
    expect(srcOf()).toContain(`${pad(112)}${pad(2)}`); expect(eng.state.phase).toBe('');
  });
  it('repeat plays recitation then translation again', () => {
    eng.configure({ repeat: true });
    eng.playAyah(S112, 2);
    finish(); expect(srcOf()).toBe(urdu(112, 2));
    finish(); expect(srcOf()).toContain(`${pad(112)}${pad(2)}`); expect(eng.state.phase).toBe('');
    finish(); expect(srcOf()).toBe(urdu(112, 2));
  });
  it('previous returns to the previous ayah', () => {
    eng.playSurah(S112, 3); eng.state.q.v; 
    finish(); // translation of 3 (bismillah skipped path)
    eng.state.status = 'playing';
    main().currentTime = 0;
    eng.prev();
    expect(eng.state.q.v).toBeLessThanOrEqual(3);
  });
});

describe('switching reciter during playback', () => {
  it('while the recitation plays: the same ayah restarts in the new reciter and the translation still follows', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playSurah(S112, 1); finish();        // ayah 1 of Alafasy
    expect(srcOf()).toContain('Alafasy');
    eng.configure({ reciter: 'sudais' });
    expect(srcOf()).toContain('Sudais');
    expect(srcOf()).toContain(`${pad(112)}${pad(1)}`);
    finish();
    expect(srcOf()).toBe(urdu(112, 1));
    finish();
    expect(srcOf()).toContain('Sudais'); expect(srcOf()).toContain(`${pad(112)}${pad(2)}`);
  });
  it('while the translation plays: it is NOT interrupted, and the next ayah uses the new reciter', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playSurah(S112, 1); finish(); finish();
    expect(srcOf()).toBe(urdu(112, 1));
    eng.configure({ reciter: 'husary' });
    expect(srcOf()).toBe(urdu(112, 1)); expect(eng.state.phase).toBe('urdu');
    finish();
    expect(srcOf()).toContain('Husary'); expect(srcOf()).toContain(`${pad(112)}${pad(2)}`);
  });
  it('switching to Badr (whole file) while translation is on keeps the ayah-by-ayah sequence', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playAyah(S112, 2);
    eng.configure({ reciter: 'badr' });
    expect(srcOf()).toContain(`${pad(112)}${pad(2)}`);
    finish(); expect(srcOf()).toBe(urdu(112, 2));
  });
  it('switching while paused keeps it paused', () => {
    eng.configure({ ...cfgBase, reciter: 'alafasy' });
    eng.playAyah(S112, 2); eng.pause();
    eng.configure({ reciter: 'rifai' });
    expect(eng.state.status).toBe('paused');
  });
});

describe('short and long ayahs behave the same (events, not durations, drive the sequence)', () => {
  it('Al-Baqarah 282 (longest) then 283 with translations', () => {
    eng.configure({ ...cfgBase, reciter: 'minshawi' });
    eng.playSurah({ n: 2, name: 'Al-Baqarah', verses: 286 }, 282);
    finish(); expect(srcOf()).toBe(urdu(2, 282));
    finish(); expect(srcOf()).toContain(`${pad(2)}${pad(283)}`);
  });
  it('Ar-Rahman 1 (shortest) then 2', () => {
    eng.configure({ ...cfgBase, reciter: 'muaiqly' });
    eng.playSurah({ n: 55, name: 'Ar-Rahman', verses: 78 }, 1);
    finish(); finish(); // bismillah, then v1
    expect(srcOf()).toBe(urdu(55, 1));
  });
});
