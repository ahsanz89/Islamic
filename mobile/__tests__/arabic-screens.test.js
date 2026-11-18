import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

const mockWord = jest.fn();
jest.mock('../src/lib/settings', () => ({ useApp: () => ({ colors: new Proxy({}, { get: () => '#123456' }), s: {} }) }));
jest.mock('../src/lib/arabic-audio', () => ({ playWordRef: (...a) => mockWord(...a), wordUrl: () => '' }));
jest.mock('../src/lib/learn-audio', () => ({ playLesson: jest.fn(() => 'recording'), stopLesson: jest.fn(), usePlayingText: () => '', useLessonSpeed: () => 'slow', setLessonSpeed: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }), useLocalSearchParams: () => ({ level: '1' }) }));
jest.mock('../src/lib/arabic-progress', () => ({ useArabic: () => ({ s: { lang: 'ur', best: {}, passed: {} }, ready: true, lang: 'ur', isOpen: () => true, record: jest.fn(), setLang: jest.fn(), unlockAll: jest.fn(), reset: jest.fn() }) }));

const Level = require('../app/learn-arabic/[level]').default;
const Hub = require('../app/learn-arabic/index').default;

test('level 1 shows Urdu meanings and tapping a word plays its Quran word clip', async () => {
  await render(<Level />);
  const tile = screen.getAllByRole('button').find((b) => (b.props.accessibilityLabel || '').startsWith('سنیں: '));
  expect(tile).toBeTruthy();
  await fireEvent.press(tile);
  expect(mockWord).toHaveBeenCalled();
  expect(mockWord.mock.calls[0][0]).toHaveLength(3);
});
test('practice tab shows a question with four choices', async () => {
  await render(<Level />);
  await fireEvent.press(screen.getByText('مشق'));
  expect(screen.getByTestId('options').children.length).toBe(4);
});
test('hub lists the three levels in Urdu', async () => {
  await render(<Hub />);
  expect(screen.getByText('قرآن کے روزمرہ الفاظ')).toBeTruthy();
  expect(screen.getByText('نماز کے الفاظ')).toBeTruthy();
});
