import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import { LETTERS } from '../src/lib/learn-data';

const mockPlay = jest.fn();
jest.mock('../src/lib/settings', () => ({ useApp: () => ({ colors: new Proxy({}, { get: () => '#123456' }), s: {} }) }));
jest.mock('../src/lib/learn-audio', () => ({ playLesson: (...a) => mockPlay(...a), stopLesson: jest.fn(), usePlayingText: () => '' }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('../src/lib/audio', () => ({ useAudio: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }) }));

const { Lesson } = require('../src/components/LearnLessons');
const { PracticeQuestions, QuizRun, Repeat, Match } = require('../src/components/LearnParts');

test('alphabet grid starts at the right (row-reverse) and lists all 29 letters in order', async () => {
  await render(<Lesson n={1} roman />);
  const btns = screen.getAllByRole('button').filter((b) => LETTERS.some((l) => b.props.accessibilityLabel && b.props.accessibilityLabel.startsWith(l.ar + ' ')));
  expect(btns.length).toBeGreaterThanOrEqual(29);
  const parent = btns[0].parent;
  const flat = JSON.stringify(parent.props.style);
  expect(flat).toContain('row-reverse');
  expect(btns.slice(0, 29).map((b) => b.props.accessibilityLabel[0])).toEqual(LETTERS.map((l) => l.ar));
});
test('tapping a letter shows its details and "Hear the letter name" plays it', async () => {
  mockPlay.mockReturnValue('recording');
  await render(<Lesson n={1} roman />);
  await fireEvent.press(screen.getAllByRole('button').find((b) => (b.props.accessibilityLabel || '').startsWith('ع ')));
  expect(screen.getAllByText(/Ain/).length).toBeGreaterThan(0);
  mockPlay.mockClear();
  await fireEvent.press(screen.getByLabelText(/Hear the letter name/));
  expect(mockPlay).toHaveBeenCalledWith({ text: 'عَيْن' });
});
test('every letter can be selected and its name played', async () => {
  mockPlay.mockReturnValue('recording');
  await render(<Lesson n={1} roman />);
  for (const l of LETTERS) {
    await fireEvent.press(screen.getAllByRole('button').find((b) => (b.props.accessibilityLabel || '').startsWith(l.ar + ' ')));
    mockPlay.mockClear();
    await fireEvent.press(screen.getByLabelText(/Hear the letter name/));
    expect(mockPlay).toHaveBeenCalledWith({ text: l.arName });
  }
});
test('shows a friendly message if the sound cannot play', async () => {
  mockPlay.mockReturnValue('none');
  await render(<Lesson n={1} roman />);
  await fireEvent.press(screen.getByLabelText(/Hear the letter name/));
  expect(await screen.findByText(/could not be played/)).toBeTruthy();
});
test.each([2, 3, 4, 5, 6])('level %i lesson renders', async (n) => { await render(<Lesson n={n} roman />); expect(screen.toJSON()).toBeTruthy(); });
test('practice question can be answered and moves on', async () => {
  await render(<PracticeQuestions level={1} />);
  const opts = screen.getByTestId('options').children;
  expect(opts.length).toBeGreaterThanOrEqual(2);
  await fireEvent.press(screen.getByTestId('options').children[0]);
  expect(screen.getByText('Next question')).toBeTruthy();
  await fireEvent.press(screen.getByText('Next question'));
});
test('quiz runs 10 questions to a score and reports it', async () => {
  const done = jest.fn();
  await render(<QuizRun level={1} next={2} onFinish={done} />);
  for (let i = 0; i < 10; i++) {
    await fireEvent.press(screen.getByTestId('options').children[0]);
    await fireEvent.press(screen.getByText(i === 9 ? 'See result' : 'Next'));
  }
  expect(done).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/\d+ \/ 10/)).toBeTruthy();
});
test('flashcards and match game render for every level', async () => {
  for (let n = 1; n <= 6; n++) { await render(<Repeat level={n} />); expect(screen.getByText('I repeated it')).toBeTruthy(); }
  await render(<Match />); expect(screen.getByText(/Tap a letter/)).toBeTruthy();
});
