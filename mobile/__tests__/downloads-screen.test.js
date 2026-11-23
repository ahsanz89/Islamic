import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

const mockStart = jest.fn(() => Promise.resolve());
let mockOnline = true;
let mockFiles = {};
jest.mock('../src/lib/settings', () => ({ useApp: () => ({ colors: new Proxy({}, { get: () => '#123456' }), t: (k) => k, uiRtl: false, settings: { tr: 'en', tr2: '', ui: 'en', reciter: 'alafasy' }, update: jest.fn() }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }), SafeAreaView: require('react-native').View }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('../src/lib/audio', () => ({ useAudio: () => null }));
jest.mock('../src/lib/net', () => ({ useOnline: () => mockOnline, isOnline: () => mockOnline }));
jest.mock('../src/lib/downloads', () => ({ downloader: () => ({ list: () => [], subscribe: () => () => {}, start: mockStart, restore: jest.fn(), cancel: jest.fn(), remove: jest.fn(), pause: jest.fn(), resume: jest.fn() }) }));
jest.mock('../src/lib/offline-store', () => ({
  init: () => Promise.resolve(), subscribe: () => () => {}, version: { n: 0 }, disk: () => Promise.resolve({ free: 8e9, total: 64e9 }),
  allRels: () => Object.keys(mockFiles), totalBytes: () => Object.values(mockFiles).reduce((a, b) => a + b, 0), has: (r) => !!mockFiles[r], entry: (r) => (mockFiles[r] ? { b: mockFiles[r] } : null),
  bytesWhere: (p) => Object.entries(mockFiles).reduce((a, [r, b]) => a + (p(r) ? b : 0), 0), countWhere: (p) => Object.keys(mockFiles).filter(p).length, removeAll: jest.fn(),
}));
jest.mock('../src/lib/backup', () => ({ exportText: jest.fn(), readLocalSnapshot: jest.fn(), restoreFrom: jest.fn() }));

const Downloads = require('../app/downloads').default;
beforeEach(() => { mockStart.mockClear(); mockOnline = true; mockFiles = {}; });

test('shows storage and the Quran download choices', async () => {
  await render(<Downloads />);
  expect(screen.getByText(/Offline library: 0 KB/)).toBeTruthy();
  expect(screen.getByText(/0 of 114 surahs downloaded$/)).toBeTruthy();
  expect(screen.getByText(/free of/)).toBeTruthy();
});

test('Download whole Quran starts a text download with the chosen translation', async () => {
  await render(<Downloads />);
  await fireEvent.press(screen.getByText(/^Download all text \(/));
  expect(mockStart).toHaveBeenCalledTimes(1);
  const [spec, title] = mockStart.mock.calls[0];
  expect(spec).toMatchObject({ type: 'text', surahs: 'all' }); expect(spec.trans).toContain('en'); expect(title).toBe('Quran text');
});

test('offline: downloading is disabled and the reason is shown', async () => {
  mockOnline = false;
  await render(<Downloads />);
  expect(screen.getByText(/Connect to the internet to download/)).toBeTruthy();
});

test('the status list never claims something is offline when it is not downloaded', async () => {
  await render(<Downloads />);
  await fireEvent.press(screen.getByText('More'));
  expect(screen.getByText(/Quran reader: needs a download/)).toBeTruthy();
  expect(screen.getByText(/Hadith: books not downloaded/)).toBeTruthy();
  expect(screen.getByText(/Recitation audio: not downloaded/)).toBeTruthy();
  expect(screen.getByText(/15-line Mushaf/)).toBeTruthy();
});

test('status reflects real downloads', async () => {
  mockFiles = { 'q/1.json': 1000, 'q/2.json': 1000, 'c/bukhari.json': 500, 'a/Alafasy_128kbps/001001.mp3': 9000 };
  await render(<Downloads />);
  expect(screen.getByText(/2 of 114 surahs downloaded/)).toBeTruthy();
  await fireEvent.press(screen.getByText('More'));
  expect(screen.getByText(/Quran reader: 2 of 114 surahs downloaded/)).toBeTruthy();
  expect(screen.getByText(/Hadith: 1 of/)).toBeTruthy();
});
