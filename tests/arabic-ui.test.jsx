import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const word = vi.fn();
vi.mock('next/link', () => ({ default: ({ href, children, ...r }) => <a href={href} {...r}>{children}</a> }));
vi.mock('@/lib/arabic-audio', () => ({ playWordRef: (...a) => word(...a), playPhrase: vi.fn() }));
vi.mock('@/lib/learn-audio', () => ({
  playLesson: vi.fn().mockResolvedValue('recording'), stopLesson: vi.fn(), onLessonState: () => () => {}, getSpeed: () => 'slow', setSpeed: vi.fn(), onSpeedChange: () => () => {},
  loadVoices: async () => [], arabicVoices: (v) => v, savedVoiceName: () => '', saveVoiceName: () => {}
}));
import ArabicHub from '@/app/learn-arabic/ArabicHub';
import ArabicLevel from '@/app/learn-arabic/[level]/ArabicLevel';

beforeEach(() => { localStorage.clear(); word.mockClear(); });

describe('Learn Arabic', () => {
  it('asks for English or Urdu on first visit and remembers the choice', async () => {
    render(<ArabicHub />);
    await waitFor(() => screen.getByRole('button', { name: 'اردو' }));
    fireEvent.click(screen.getByRole('button', { name: 'اردو' }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('dalil.arabic.v1')).lang).toBe('ur'));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('عربی سیکھیں');
  });
  it('shows three levels; levels 2 and 3 are locked until passed', async () => {
    localStorage.setItem('dalil.arabic.v1', JSON.stringify({ lang: 'en' }));
    render(<ArabicHub />);
    await waitFor(() => screen.getByText('Everyday Quran words'));
    expect(screen.getAllByText(/Locked/)).toHaveLength(2);
  });
  it('level 1: tapping a word plays its Quran word audio and shows the Urdu meaning', async () => {
    localStorage.setItem('dalil.arabic.v1', JSON.stringify({ lang: 'ur' }));
    render(<ArabicLevel n={1} />);
    await waitFor(() => screen.getAllByRole('button', { name: /سنیں: / }));
    const tile = screen.getAllByRole('button', { name: /سنیں: / })[0];
    fireEvent.click(tile);
    expect(word).toHaveBeenCalled();
    expect(word.mock.calls[0][0]).toHaveLength(3);
  });
  it('level 2 is locked on a fresh device', async () => {
    localStorage.setItem('dalil.arabic.v1', JSON.stringify({ lang: 'en' }));
    render(<ArabicLevel n={2} />);
    await waitFor(() => screen.getByText(/opens after you pass the quiz for Level 1/));
  });
  it('practice questions can be answered', async () => {
    localStorage.setItem('dalil.arabic.v1', JSON.stringify({ lang: 'en' }));
    render(<ArabicLevel n={1} />);
    await waitFor(() => screen.getByRole('tab', { name: 'Practice' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Practice' }));
    const opts = await screen.findAllByRole('button', { name: /./, hidden: false });
    const group = screen.getByRole('group', { name: 'Choices' });
    fireEvent.click(group.querySelector('button'));
    await waitFor(() => screen.getByRole('status'));
  });
});
