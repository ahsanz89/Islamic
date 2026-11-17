import * as Speech from 'expo-speech';

let voices = null;
export async function hasArabicVoice() {
  try {
    if (!voices) voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => /^ar/i.test(v.language || ''));
  } catch { return true; }
}

export function stopLesson() { try { Speech.stop(); } catch { /* ignore */ } }

/** Speaks Arabic text with the device voice. */
export function playLesson({ text, rate = 0.6 }) {
  stopLesson();
  if (!text) return;
  try { Speech.speak(text, { language: 'ar-SA', rate, pitch: 1 }); } catch { /* ignore */ }
}
