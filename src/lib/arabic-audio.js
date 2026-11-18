'use client';
// Sound for the Learn Arabic academy.
// Single Quran words: the real recitation clip of that word (same clips as the Quran reader), falling back to a voice.
// Whole phrases / verses: the lesson recording (same engine as Learn Quran).
import { playWord } from './audio-engine';
import { playLesson } from './learn-audio';

export function playWordRef(ref, text) {
  if (!ref) return playLesson({ text });
  return playWord(ref[0], ref[1], ref[2], text);
}
export const playPhrase = (text) => playLesson({ text });
