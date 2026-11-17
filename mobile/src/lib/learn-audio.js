import { useSyncExternalStore } from 'react';
import * as Speech from 'expo-speech';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import files from './learn-audio-map';
import { createLessonAudio } from './learn-audio-core';

let voices = null;
export async function hasArabicVoice() {
  try {
    if (!voices) voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => /^ar/i.test(v.language || ''));
  } catch { return true; }
}

const engine = createLessonAudio({
  files,
  makePlayer: (src) => { setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' }).catch(() => {}); return createAudioPlayer(src, { updateInterval: 250 }); },
  speak: (text, done) => Speech.speak(text, { language: 'ar-SA', rate: 0.6, pitch: 1, onDone: done, onStopped: done, onError: done }),
  stopSpeak: () => Speech.stop()
});

export const stopLesson = () => engine.stop();
/** Plays the bundled recording for the text (or the phone's Arabic voice). Returns 'recording' | 'voice' | 'none'. */
export const playLesson = ({ text }) => engine.play({ text });
/** Which text is playing right now ('' when idle), so a button can show Stop. */
export const usePlayingText = () => useSyncExternalStore(engine.subscribe, () => engine.getState().text, () => '');
