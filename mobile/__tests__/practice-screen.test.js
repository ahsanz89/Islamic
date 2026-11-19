import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';

const mockHandlers = {};
const mockUpdate = jest.fn();
let mockDone = {};
let mockAyah;
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: { requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })), start: jest.fn(), stop: jest.fn(), abort: jest.fn() },
  useSpeechRecognitionEvent: (name, fn) => { mockHandlers[name] = fn; },
}));
jest.mock('../src/lib/settings', () => ({ useApp: () => ({ colors: new Proxy({}, { get: () => '#123456' }), settings: { recitationDone: mockDone }, update: mockUpdate, s: {} }) }));
jest.mock('../src/lib/audio', () => ({ playAyah: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }), useLocalSearchParams: () => ({ surah: '1', ayah: mockAyah }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }) => children }));
jest.mock('../src/lib/api', () => ({
  getSurah: () => Promise.resolve([{ v: 1, ar: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ' }, { v: 2, ar: 'ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِینَ' }]),
  getSurahs: () => Promise.resolve({ surahs: [{ name: 'Al-Faatiha' }] }),
}));
import Practice from '../app/practice/[surah]';

const speak = async (ui, text, confidence = 0.9) => {
  await fireEvent.press(ui.getByTestId('rec-start'));
  await waitFor(() => ui.getByTestId('rec-stop'));
  await act(async () => mockHandlers.result({ results: [{ transcript: text, confidence }] }));
  await act(async () => mockHandlers.end());
};

test('next ayah is locked until the ayah is recited completely', async () => {
  mockDone = {};
  await render(<Practice />); const ui = screen;
  await waitFor(() => ui.getByTestId('rec-start'));
  expect(ui.getByTestId('rec-next')).toBeDisabled();
  await speak(ui, 'بسم الله');
  expect(mockUpdate).not.toHaveBeenCalled();
  await waitFor(() => ui.getByText(/not finished/));
  await speak(ui, 'بسم الله الرحمن الرحيم');
  await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ recitationDone: { 1: [1] } }));
});
test('low confidence asks to repeat and does not count as an attempt', async () => {
  mockDone = {};
  mockUpdate.mockClear();
  await render(<Practice />); const ui = screen;
  await waitFor(() => ui.getByTestId('rec-start'));
  await speak(ui, 'بسم', 0.1);
  await waitFor(() => ui.getByText(/could not hear that clearly/));
  expect(mockUpdate).not.toHaveBeenCalled();
});
test('a completed ayah unlocks the next one', async () => {
  mockDone = { 1: [1] }; mockAyah = '1';
  await render(<Practice />); const ui = screen;
  await waitFor(() => ui.getByTestId('rec-next'));
  expect(ui.getByTestId('rec-next')).not.toBeDisabled();
});
