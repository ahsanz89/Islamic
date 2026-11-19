# Recitation tutor: what is built, what is not

## Built (stage 1, word recognition) - mobile app only
- Practice screen (Surah screen -> microphone icon). The user taps Start, recites, taps Done.
- Speech capture and recognition: the phone's own Android speech recogniser (expo-speech-recognition, language ar-SA, up to 5 alternatives).
- Quran-specific validation (src/lib/recitation-core.js, fully unit-tested): the heard words are aligned with the verified words of the ayah
  (letters-only comparison, spelling variants unified, recogniser word joins/splits tolerated). Detects complete, stopped-early, skipped and wrong words.
- Low engine confidence, silence, or too little speech -> "try again", never an accusation.
- The next ayah stays locked until the ayah is completed. After 3 real attempts the user may confirm themselves, because recognition can be wrong.
- Progress (completed ayat per surah) is saved in the app settings and restored.
- Recordings are not saved. The Quranic text shown is never changed (normalisation is used for comparing only).

## Honest limits
- Generic Arabic recognition returns modern spelling and may "correct" a wrong pronunciation or mis-hear a right one. It checks WORDS, not tajweed or letters.
  The screen says this. No pronunciation or tajweed corrections are given (they would not be reliable).
- Not yet tested on a real phone with a real voice. The logic is tested only with typed recogniser output. Google's recogniser may need an Arabic voice pack, and
  may send audio to Google unless the phone has an offline Arabic pack.
- Audio examples use the existing reciter audio (Listen), per ayah, not per word.

## Needed for stages 2 and 3 (not started)
- A Quran-specific speech model (for example a Whisper model fine-tuned on Quran recitation, run on the phone through a native library such as whisper.rn)
  plus forced alignment against the verified text for word-level scoring. I have not benchmarked any model: that needs real recitation samples.
- Check each model's licence and the audio privacy terms before use.
- Tajweed rules (makharij, sifaat, madd, ghunnah, qalqalah, ikhfa, idgham, iqlab, noon/meem rules, waqf) need a specialist mispronunciation model and review by qualified
  Quran teachers before any rule is shown as a correction. Research on Quran mispronunciation benchmarks exists (QuranMB), but results are not yet reliable enough to ship as authoritative.
