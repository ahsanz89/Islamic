import { playLesson } from './learn-audio';
import { localUri } from './offline-store';

/** Real recitation clip of one Quran word (s:v:w) from the same source the Quran reader uses; phone voice if offline. */
export const wordUrl = (ref) => `https://audio.qurancdn.com/wbw/${String(ref[0]).padStart(3, '0')}_${String(ref[1]).padStart(3, '0')}_${String(ref[2]).padStart(3, '0')}.mp3`;
export const playWordRef = (ref, text) => playLesson(ref ? { text, url: localUri(wordUrl(ref)) } : { text });
