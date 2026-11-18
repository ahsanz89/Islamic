import { createLessonAudio } from '../src/lib/learn-audio-core';
import { soundKey } from '../src/lib/learn-key';

const TEXT = 'بَاء';
function make(files = { [soundKey(TEXT)]: 123 }, { throwPlayer = false, throwSpeak = false, speed = 'slow' } = {}) {
  const players = [], spoken = [];
  const eng = createLessonAudio({
    files,
    makePlayer: (src) => { if (throwPlayer) throw new Error('boom'); const p = { src, l: null, played: false, paused: false, removed: false, addListener: (e, f) => { p.l = f; }, setPlaybackRate: (r, q) => { p.rate = r; p.q = q; }, play: () => { p.played = true; }, pause: () => { p.paused = true; }, remove: () => { p.removed = true; } }; players.push(p); return p; },
    speak: (t, done) => { if (throwSpeak) throw new Error('no voice'); spoken.push([t, done]); },
    stopSpeak: () => {},
    getSpeed: () => speed
  });
  return { eng, players, spoken };
}

test('plays the bundled recording', () => {
  const { eng, players } = make();
  expect(eng.play({ text: TEXT })).toBe('recording');
  expect(players[0]).toMatchObject({ src: 123, played: true });
  expect(eng.getState()).toEqual({ status: 'playing', text: TEXT });
});
test('goes idle when the recording finishes', () => {
  const { eng, players } = make();
  eng.play({ text: TEXT });
  players[0].l({ didJustFinish: true });
  expect(eng.getState().status).toBe('idle');
  expect(players[0].removed).toBe(true);
});
test('stop pauses and releases the player (stop / replay controls)', () => {
  const { eng, players } = make();
  eng.play({ text: TEXT });
  eng.stop();
  expect(players[0]).toMatchObject({ paused: true, removed: true });
  expect(eng.getState().status).toBe('idle');
  eng.play({ text: TEXT });
  expect(players).toHaveLength(2);
  expect(players[1].played).toBe(true);
});
test('tapping another sound stops the first', () => {
  const { eng, players } = make({ [soundKey(TEXT)]: 1, [soundKey('تَاء')]: 2 });
  eng.play({ text: TEXT }); eng.play({ text: 'تَاء' });
  expect(players[0].paused).toBe(true);
  expect(eng.getState().text).toBe('تَاء');
});
test('falls back to the phone voice when there is no recording', () => {
  const { eng, spoken } = make({});
  expect(eng.play({ text: TEXT })).toBe('voice');
  expect(spoken[0][0]).toBe(TEXT);
  spoken[0][1]();
  expect(eng.getState().status).toBe('idle');
});
test('falls back to the voice when the player throws', () => {
  const { eng, spoken } = make(undefined, { throwPlayer: true });
  expect(eng.play({ text: TEXT })).toBe('voice');
  expect(spoken).toHaveLength(1);
});
test('returns none (so the screen can say so) when nothing can play, or text is empty', () => {
  expect(make({}, { throwSpeak: true }).eng.play({ text: TEXT })).toBe('none');
  expect(make().eng.play({ text: '' })).toBe('none');
});
test('notifies subscribers', () => {
  const { eng } = make(); const seen = [];
  const off = eng.subscribe((s) => seen.push(s.status));
  eng.play({ text: TEXT }); eng.stop(); off(); eng.play({ text: TEXT });
  expect(seen).toEqual(['playing', 'idle']);
});

test('slow learning (default) plays the recording at its natural slow pace', () => {
  const { eng, players } = make();
  eng.play({ text: TEXT });
  expect(players[0].rate).toBeUndefined();
});
test('normal speed plays a little faster with pitch correction', () => {
  const { eng, players } = make(undefined, { speed: 'normal' });
  eng.play({ text: TEXT });
  expect(players[0].rate).toBe(1.3);
  expect(players[0].q).toBe('high');
});
test('the phone voice fallback is slower in slow mode', () => {
  const slow = []; const fast = [];
  const mk = (speed, sink) => createLessonAudio({ files: {}, makePlayer: () => {}, speak: (t, d, r) => sink.push(r), stopSpeak: () => {}, getSpeed: () => speed });
  mk('slow', slow).play({ text: TEXT }); mk('normal', fast).play({ text: TEXT });
  expect(slow[0]).toBeLessThan(fast[0]);
});

test('online word clip: plays the url, and falls back to the phone voice when it errors', () => {
  const { eng, players, spoken } = make();
  expect(eng.play({ text: 'ٱللَّهِ', url: 'https://x/y.mp3' })).toBe('recording');
  expect(players[0].src).toEqual({ uri: 'https://x/y.mp3' });
  players[0].l({ error: 'network' });
  expect(spoken[0][0]).toBe('ٱللَّهِ');
});
test('online word clip: voice when the player cannot be created', () => {
  const { eng, spoken } = make({}, { throwPlayer: true });
  expect(eng.play({ text: 'ٱللَّهِ', url: 'https://x/y.mp3' })).toBe('voice');
  expect(spoken).toHaveLength(1);
});
