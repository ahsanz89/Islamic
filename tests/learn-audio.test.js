import { beforeEach, describe, expect, it, vi } from 'vitest';
import { soundKey } from '@/lib/learn-key';

const TEXT = 'بَاء';
let audios;
function setup({ manifest = [soundKey(TEXT)], audioFails = false, voices = [] } = {}) {
  audios = [];
  globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => manifest }));
  globalThis.Audio = class {
    constructor(url) { this.url = url; this.l = {}; audios.push(this); }
    addEventListener(e, f) { this.l[e] = f; }
    play() { return audioFails ? Promise.reject(new Error('blocked')) : Promise.resolve(); }
    pause() { this.paused = true; }
  };
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => voices, speak: (u) => spoken.push(u), cancel: vi.fn(), addEventListener() {}, removeEventListener() {} } });
  return spoken;
}
async function fresh() { vi.resetModules(); return import('@/lib/learn-audio'); }

describe('playLesson', () => {
  beforeEach(() => localStorage.clear());
  it('plays the recording for the text', async () => {
    setup();
    const m = await fresh();
    expect(await m.playLesson({ text: TEXT })).toBe('recording');
    expect(audios[0].url).toContain(`learn-audio/${soundKey(TEXT)}.mp3`);
  });
  it('falls back to an Arabic device voice when there is no recording', async () => {
    const spoken = setup({ manifest: [], voices: [{ name: 'Hoda', lang: 'ar-EG' }] });
    const m = await fresh();
    expect(await m.playLesson({ text: TEXT })).toBe('voice');
    expect(spoken[0].text).toBe(TEXT);
  });
  it('reports "none" (so the page can show a message) when nothing can play', async () => {
    setup({ manifest: [], audioFails: true });
    const m = await fresh();
    expect(await m.playLesson({ text: TEXT })).toBe('none');
  });
  it('falls back when the recording fails to play', async () => {
    const spoken = setup({ audioFails: true, voices: [{ name: 'Hoda', lang: 'ar-EG' }] });
    const m = await fresh();
    expect(await m.playLesson({ text: TEXT })).toBe('voice');
    expect(spoken).toHaveLength(1);
  });
  it('returns none for empty text and does not throw if the manifest cannot load', async () => {
    setup({ audioFails: true });
    globalThis.fetch = vi.fn(async () => { throw new Error('offline'); });
    const m = await fresh();
    expect(await m.playLesson({ text: '' })).toBe('none');
    expect(await m.playLesson({ text: TEXT })).toBe('none');
  });
  it('emits playing then idle, and stop pauses the audio', async () => {
    setup();
    const m = await fresh();
    const seen = [];
    m.onLessonState((s) => seen.push(s));
    await m.playLesson({ text: TEXT });
    expect(seen).toContain('playing');
    audios[0].l.ended();
    expect(seen.at(-1)).toBe('idle');
    await m.playLesson({ text: TEXT });
    m.stopLesson();
    expect(audios[1].paused).toBe(true);
    expect(seen.at(-1)).toBe('idle');
  });
  it('replaying starts a fresh audio each time', async () => {
    setup();
    const m = await fresh();
    await m.playLesson({ text: TEXT });
    await m.playLesson({ text: TEXT });
    expect(audios).toHaveLength(2);
    expect(audios[0].paused).toBe(true);
  });
});
