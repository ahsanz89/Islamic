import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('../src/lib/settings', () => ({ useApp: () => ({ colors: new Proxy({}, { get: () => '#123456' }), settings: { ui: 'en' } }) }));
jest.mock('../src/lib/storage', () => ({ load: jest.fn(() => Promise.resolve([])), save: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }), useLocalSearchParams: () => ({ id: 'yunus' }) }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('../src/lib/audio', () => ({ useAudio: () => null }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native/Libraries/Share/Share', () => ({ share: jest.fn(() => Promise.resolve()) }));

const List = require('../app/special-duas/index').default;
const Detail = require('../app/special-duas/[id]').default;
const { SD } = require('../src/lib/special-duas');

beforeEach(() => mockPush.mockClear());
test('lists all duas and searching narrows the list', async () => {
  await render(<List />);
  expect(screen.getByText(`${SD.duas.length} duas`)).toBeTruthy();
  await fireEvent.changeText(screen.getByTestId('search'), 'forgiveness');
  expect(screen.queryByText(`${SD.duas.length} duas`)).toBeNull();
  await fireEvent.changeText(screen.getByTestId('search'), 'zzzqq');
  expect(screen.getByText('No duas match your search.')).toBeTruthy();
});
test('category and source filters work, and a card opens its detail', async () => {
  await render(<List />);
  await fireEvent.press(screen.getByText('Duas from the Quran'));
  expect(screen.getByText('10 duas')).toBeTruthy();
  await fireEvent.press(screen.getAllByRole('button', { name: /Rabbana atina fid-dunya hasanah/ })[0]);
  expect(mockPush).toHaveBeenCalledWith('/special-duas/q-baqara-201');
});
test('saving a dua updates the saved count', async () => {
  await render(<List />);
  await fireEvent.press(screen.getAllByRole('button', { name: /^Save: / })[0]);
  expect(await screen.findByText('Save (1)')).toBeTruthy();
});
test('detail shows Arabic, transliteration, translation, source, grading and occasion', async () => {
  await render(<Detail />);
  expect(screen.getByText('The dua of Prophet Yunus')).toBeTruthy();
  expect(screen.getByText(/لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ/)).toBeTruthy();
  expect(screen.getByText(/subḥānaka/)).toBeTruthy();
  expect(screen.getByText(/There is none worthy of worship except You/)).toBeTruthy();
  expect(screen.getByText(/Jami' at-Tirmidhi 3505/)).toBeTruthy();
  expect(screen.getAllByText('Sahih (authentic)').length).toBeGreaterThan(0);
  expect(screen.getByText('In distress and when asking for any need.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Open the full hadith'));
  expect(mockPush).toHaveBeenCalled();
});
