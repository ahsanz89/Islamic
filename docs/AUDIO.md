# Quran audio

All audio is streamed on demand from public servers; nothing is bundled in this repository and no API key is needed.

| Feature | Source | URL pattern |
| --- | --- | --- |
| Verse recitation (10 reciters) | [EveryAyah](https://everyayah.com) | `https://everyayah.com/data/<folder>/<SSS><AAA>.mp3` |
| Word pronunciation | Quran.com word-by-word recordings | `https://audio.qurancdn.com/wbw/<SSS>_<AAA>_<WWW>.mp3` |

EveryAyah publishes no licence text on its site, and the Quran.com terms restrict content use to personal, non-commercial use. This project is free and non-commercial; if you fork it for another purpose, check both sources first.

## Add or change a reciter

Edit `src/lib/reciters.js` and add one object (`id`, `folder` from <https://everyayah.com/data/recitations.js>, and names in en/ar/ur). The selectors, settings panel and player pick it up automatically.

## How it works

- `src/lib/audio-engine.js`: one shared engine (survives page navigation). One `<audio>` element for verses, a small cache of the last 12 word recordings, and a prefetch of the next verse during whole-surah playback. Word and verse audio never play together.
- `src/components/AudioPlayer.js`: bottom player, reciter select, per-verse play button, `QuranWord` (word control) and the audio section of the settings panel.
- Settings saved in the browser (`hl.settings`): `reciter`, `volume`, `repeat`, `continuous`, `bismillah`, `wordAudio`, `wordHover`.

## Known limits

- Word audio matches words by position. 58 verses whose word count differs from the recordings keep plain text without word controls (`na: true` in `public/data/q/*.json`, set by `scripts/build-data.mjs`).
- If a word recording fails to load, the browser's Arabic voice is used when one is installed; otherwise a short message is shown. That voice is synthetic and only a fallback.


## Badr Al-Turki (full-surah reciter)

Badr Al-Turki is not on EveryAyah, so he is played from MP3Quran as one file per surah
(`https://cdn.mp3quran.net/download/audio/badr-turki/r1/NNN.mp3`). Without per-ayah files the
whole surah plays; the ayah buttons start it from the beginning, next/previous are disabled and a
note says so. Reciters of this kind are declared with `type: 'surah'` and a `slug` in `src/lib/reciters.js`.
The files could not be fetched from the build sandbox, so please play one surah after deploying.

## Urdu translation audio

With "Urdu translation audio" on, the spoken Urdu translation (Shamshad Ali Khan, EveryAyah folder
`translations/urdu_shamshad_ali_khan_46kbps`) plays after each ayah, and the Urdu text is shown and
highlighted while it speaks. A missing clip is skipped so the recitation never stops. The Bismillah
line has no Urdu clip.
