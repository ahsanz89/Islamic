import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LETTERS } from '@/lib/learn-data';

const play = vi.fn();
vi.mock('next/link', () => ({ default: ({ href, children, ...r }) => <a href={href} {...r}>{children}</a> }));
vi.mock('@/lib/learn-audio', () => ({
  playLesson: (...a) => play(...a), stopLesson: vi.fn(), onLessonState: () => () => {},
  loadVoices: async () => [{ name: 'x', lang: 'ar' }], arabicVoices: (v) => v, savedVoiceName: () => '', saveVoiceName: () => {}
}));
import Lesson from '@/app/learn/Lessons';

describe('Level 1: alphabet', () => {
  it('lists all 29 letters in order, in an RTL container', () => {
    render(<Lesson n={1} roman={false} />);
    const grid = screen.getByRole('group', { name: 'Arabic letters' });
    const btns = grid.querySelectorAll('button');
    expect([...btns].map((b) => b.textContent[0])).toEqual(LETTERS.map((l) => l.ar));
    expect(btns).toHaveLength(29);
  });
  it('shows the selected letter details and plays its name', async () => {
    play.mockResolvedValue('recording');
    render(<Lesson n={1} roman={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ain' }));
    expect(screen.getByRole('heading', { level: 3, name: /Ain/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Hear the letter name/ }));
    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(play.mock.calls.at(-1)[0]).toMatchObject({ text: 'عَيْن', id: 'letter-ain' });
  });
  it('every letter has a working "Hear the letter name" button', async () => {
    play.mockResolvedValue('recording');
    render(<Lesson n={1} roman={false} />);
    for (const l of LETTERS) {
      play.mockClear();
      fireEvent.click(screen.getByRole('button', { name: l.name }));
      fireEvent.click(screen.getByRole('button', { name: /Hear the letter name/ }));
      await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
      expect(play.mock.calls[0][0].text).toBe(l.arName);
    }
  });
  it('shows a friendly message when no sound can be played', async () => {
    play.mockResolvedValue('none');
    render(<Lesson n={1} roman={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Hear the letter name/ }));
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

describe('Other levels render', () => {
  for (let n = 2; n <= 6; n++) it(`level ${n} renders without crashing`, () => { const { container } = render(<Lesson n={n} roman />); expect(container.textContent.length).toBeGreaterThan(50); });
});
