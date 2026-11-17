# Lesson recordings

Every sound in Learn Quran has an MP3 here, named `t<hash>.mp3` where the hash comes from the Arabic text
(`soundKey()` in `src/lib/learn-key.js`). `manifest.json` lists them.

They are generated with the free eSpeak-NG Arabic voice so the sound works on every device with no setup:

    node scripts/learn-texts.mjs > texts.json
    python3 scripts/gen-learn-audio.py texts.json public/learn-audio      # needs: pip install espeakng-loader, ffmpeg

To use real teacher recordings instead, replace any file with an MP3 of the same name (only record material you own or have permission to use).
Copy the folder to `mobile/assets/learn-audio/` and regenerate `mobile/src/lib/learn-audio-map.js` (one `require` per file).
