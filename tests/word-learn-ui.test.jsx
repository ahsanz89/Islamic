import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const lesson = vi.fn().mockResolvedValue('recording');
const playWord = vi.fn();
vi.mock('next/link', () => ({ default: ({ href, children, ...r }) => <a href={href} {...r}>{children}</a> }));
vi.mock('@/lib/learn-audio', () => ({ playLesson: (...a) => lesson(...a), stopLesson: vi.fn(), onLessonState: (f) => { setTimeout(() => f('idle'), 0); return () => {}; } }));
vi.mock('@/lib/audio-engine', () => ({ playWord: (...a) => playWord(...a), useAudioState: () => '', useAudioText: () => ({}), wordKey: (s, v, w) => `${s}:${v}:${w}` }));
vi.mock('@/components/AudioPlayer', () => ({ QuranWord: ({ text }) => <span lang="ar">{text}</span> }));
import { LetterPanel, WordCards } from '@/app/quran/[s]/WordLearn';

const word = { a: 'ٱلۡحَمۡدُ', tl: 'al-ḥamdu', en: 'All praises and thanks' };
beforeEach(() => { lesson.mockClear(); playWord.mockClear(); });

describe('letter-by-letter panel', () => {
  it('shows each letter once, with its name, and the signs on it', () => {
    render(<LetterPanel word={word} surah={1} v={2} pos={1} onClose={() => {}} />);
    expect(screen.getAllByRole('button', { pressed: undefined }).length).toBeGreaterThan(4);
    for (const n of ['Alif Wasla (Hamzatul Wasl)', 'Laam', 'Meem', 'Daal']) expect(screen.getAllByText(n).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Haa/ }));
    expect(screen.getAllByText('Haa (heavy h)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fatha (Zabar)').length).toBeGreaterThan(0);
  });
  it('selecting a letter shows its signs and plays its sound', async () => {
    render(<LetterPanel word={word} surah={1} v={2} pos={1} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Daal/ }));
    await waitFor(() => expect(lesson).toHaveBeenCalled());
    expect(lesson.mock.calls[0][0].text).toBe('دُ');
    expect(screen.getByText('Damma (Pesh)')).toBeTruthy();
  });
  it('the practice table lists all eight signs for the chosen letter', () => {
    render(<LetterPanel word={word} surah={1} v={2} pos={1} onClose={() => {}} />);
    for (const t of ['Zabar (Fatha)', 'Zer (Kasra)', 'Pesh (Damma)', 'Sukoon', 'Two Zabar', 'Two Zer', 'Two Pesh']) expect(screen.getAllByText(t).length).toBeGreaterThan(0);
  });
  it('"Hear the word" uses the real word recitation', () => {
    render(<LetterPanel word={word} surah={1} v={2} pos={1} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hear the word' }));
    expect(playWord).toHaveBeenCalledWith(1, 2, 1, word.a);
  });
});

describe('word cards', () => {
  const verse = { v: 2, w: [word, { a: 'لِلَّهِ', tl: 'lillahi', en: 'for Allah' }] };
  it('word mode opens letters only from the Letters button; letter mode opens on tapping the card', () => {
    const { container, rerender } = render(<WordCards verse={verse} surah={{ n: 1 }} mode="word" show={(t) => t} wordAudio={false} />);
    fireEvent.click(container.querySelectorAll('.word')[0]);
    expect(container.querySelector('.wl-panel')).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: 'Letters' })[0]);
    expect(container.querySelector('.wl-panel')).toBeTruthy();
    rerender(<WordCards verse={verse} surah={{ n: 1 }} mode="letter" show={(t) => t} wordAudio={false} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Hide letters' })[0]);
    expect(container.querySelector('.wl-panel')).toBeNull();
    fireEvent.click(container.querySelectorAll('.word')[1]);
    expect(container.querySelector('.wl-panel')).toBeTruthy();
  });
});
