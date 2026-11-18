// The phone's Quran audio engine: recitation, then its translation, then the next ayah, for every reciter.
let mockPlayer;
jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  createAudioPlayer: jest.fn(() => {
    mockPlayer = { src: '', plays: 0, cb: null, addListener: (e, f) => { mockPlayer.cb = f; }, replace: (o) => { mockPlayer.src = o.uri; }, play: () => { mockPlayer.plays++; }, pause: jest.fn() };
    return mockPlayer;
  })
}));

let eng, R;
const pad = (n) => String(n).padStart(3, '0');
const S112 = { n: 112, name: 'Al-Ikhlas', verses: 4 };
const urdu = (s, v) => R.AUDIO.urdu(s, v);
const emit = (s) => mockPlayer.cb(s);
const playing = () => emit({ isLoaded: true, playing: true });
const finish = () => { jest.advanceTimersByTime(700); emit({ didJustFinish: true }); };
const base = { urdu: true, continuous: true, bismillah: true };

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetModules();
  eng = require('../src/lib/audio');
  R = require('../src/lib/reciters');
});
afterEach(() => jest.useRealTimers());

const IDS = ['alafasy', 'badr', 'sudais', 'shuraim', 'muaiqly', 'abdulbasit', 'husary', 'minshawi', 'ghamdi', 'rifai', 'dosari'];
test.each(IDS)('%s: ayah, then its translation, then the next ayah …', (id) => {
  eng.configure({ ...base, reciter: id });
  eng.playSurah(S112, 1);
  const seen = [mockPlayer.src];
  for (let i = 0; i < 10 && eng.state.status !== 'ended'; i++) { finish(); seen.push(mockPlayer.src); }
  const rec = R.reciterById(id).type === 'surah' ? 'alafasy' : id;
  const folder = R.reciterById(rec).folder;
  const a = (v) => R.AUDIO.ayah(folder, 112, v);
  expect(seen).toEqual([R.AUDIO.ayah(folder, 1, 1), a(1), urdu(112, 1), a(2), urdu(112, 2), a(3), urdu(112, 3), a(4), urdu(112, 4), urdu(112, 4)].slice(0, seen.length));
  expect(seen).toContain(urdu(112, 4));
  expect(eng.state.status).toBe('ended');
});

test('Badr without translation plays the one whole-surah file', () => {
  eng.configure({ ...base, urdu: false, reciter: 'badr' });
  eng.playSurah(S112, 1);
  expect(mockPlayer.src).toContain('badr-turki');
});
test('no translation clips when translation audio is off', () => {
  eng.configure({ ...base, urdu: false, reciter: 'alafasy' });
  eng.playSurah(S112, 1);
  const seen = [mockPlayer.src];
  for (let i = 0; i < 6 && eng.state.status !== 'ended'; i++) { finish(); seen.push(mockPlayer.src); }
  expect(seen.some((u) => u.includes('translations'))).toBe(false);
});
test('a duplicated "finished" report does not skip the translation', () => {
  eng.configure({ ...base, reciter: 'alafasy' });
  eng.playAyah(S112, 2);
  jest.advanceTimersByTime(700);
  emit({ didJustFinish: true });
  expect(mockPlayer.src).toBe(urdu(112, 2));
  emit({ didJustFinish: true });         // same clip reported twice
  expect(mockPlayer.src).toBe(urdu(112, 2)); // translation still playing, not skipped
  expect(eng.state.phase).toBe('urdu');
});
test('a translation clip that never starts is skipped after 12 seconds and the surah goes on', () => {
  eng.configure({ ...base, reciter: 'alafasy' });
  eng.playSurah(S112, 1); finish(); finish();     // → translation of ayah 1
  expect(mockPlayer.src).toBe(urdu(112, 1));
  jest.advanceTimersByTime(12100);
  expect(mockPlayer.src).toContain(`${pad(112)}${pad(2)}`);
  expect(eng.state.phase).toBe('');
});
test('the watchdog stays quiet once the translation is playing', () => {
  eng.configure({ ...base, reciter: 'alafasy' });
  eng.playAyah(S112, 1); finish(); playing();
  jest.advanceTimersByTime(30000);
  expect(eng.state.phase).toBe('urdu'); expect(eng.state.status).toBe('playing');
});
test('changing reciter while recitation plays restarts that ayah in the new reciter, translation still follows', () => {
  eng.configure({ ...base, reciter: 'alafasy' });
  eng.playSurah(S112, 1); finish();
  eng.configure({ reciter: 'sudais' });
  expect(mockPlayer.src).toContain('Sudais');
  finish(); expect(mockPlayer.src).toBe(urdu(112, 1));
  finish(); expect(mockPlayer.src).toContain('Sudais'); expect(mockPlayer.src).toContain(`${pad(112)}${pad(2)}`);
});
test('changing reciter while the translation plays does not interrupt it', () => {
  eng.configure({ ...base, reciter: 'alafasy' });
  eng.playSurah(S112, 1); finish(); finish();
  const before = mockPlayer.plays;
  eng.configure({ reciter: 'husary' });
  expect(mockPlayer.src).toBe(urdu(112, 1)); expect(mockPlayer.plays).toBe(before);
  finish(); expect(mockPlayer.src).toContain('Husary');
});
test('pause, resume and next ayah', () => {
  eng.configure({ ...base, reciter: 'alafasy' });
  eng.playSurah(S112, 1); finish(); finish();
  eng.pause(); expect(eng.state.status).toBe('paused');
  eng.resume(); expect(eng.state.status).toBe('loading');
  eng.next(); expect(mockPlayer.src).toContain(`${pad(112)}${pad(2)}`); expect(eng.state.phase).toBe('');
});
