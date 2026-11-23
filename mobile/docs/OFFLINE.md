# Offline architecture (DALIL mobile)

## What already worked offline (before this change)
| Feature | Source of data | Offline? |
| --- | --- | --- |
| 15-line Mushaf | `src/lib/mushaf15.json` bundled in the app | Always |
| Learn Quran, Learn Arabic, Special Duas | JSON and recordings bundled in the app | Always |
| Prayer times, Qibla, reminders | Calculated on the phone | Always |
| Quran list reader (text + translations) | Website JSON, cached only after a surah was opened | Only opened surahs |
| Hadith books | Website JSON, cached per opened chapter | Only opened chapters |
| Duas tab, surah list, book list | Website JSON | Only after first open |
| Quran recitation audio | Streamed from everyayah.com / mp3quran.net | Never |
| Word audio (Learn Arabic home) | Streamed from audio.qurancdn.com | Phone voice fallback |

## Architecture
* **Offline library** (`src/lib/offline-store.js`): one private folder `dalil-offline/` plus an index (`index.json`) of every
  file, its size and, for trimmed files, the languages it keeps. The index is written atomically and rebuilt by scanning
  the folder if damaged. A damaged file is forgotten and downloaded again.
* **Download engine** (`src/lib/downloads.js`): work is a *group* of small files. Each file is saved as `name.part` and renamed
  when complete, so an interrupted download never leaves a broken file. Three files run at once, each is retried 3 times
  with backoff, and groups can be paused, resumed, cancelled and deleted. Unfinished groups are remembered and come back
  paused after a restart; groups that stopped for lack of a connection resume by themselves when the network returns.
* **Catalog and sizes** (`src/lib/offline-catalog.js`, `public/data/offline.json`, built by `scripts/build-offline-manifest.py`):
  exact sizes for Quran text per surah and per translation and for every hadith book per language; audio sizes are
  estimates (bitrate x 5 s per ayah) until files are saved.
* **Storage optimisation**: Quran files keep Arabic, transliteration and only the chosen translations (word-by-word data,
  which the app does not use, is dropped): whole Quran with one translation is about 3 MB instead of 27 MB. Hadith keep the
  Arabic and only the chosen languages: Sahih al-Bukhari is about 14 MB with English instead of 79 MB.
* **Reading order** (`src/lib/api.js`): downloaded library -> on-device cache -> network -> small copies bundled in the app
  (surah list, book list, duas). A downloaded file that lacks a language the user now wants is used only when there is no
  internet, and the reader shows a notice.
* **Audio** (`src/lib/audio.js`): every clip URL is mapped to a local path; a downloaded file plays from the phone, otherwise
  it streams. Offline with no local file shows "not downloaded", not a generic error.
* **Indicators** (`src/components/OfflineBits.js`): offline banner, per-row marks, missing-language notice, honest error box.
  The "What works without internet" list in the Download Manager is computed from what is really on the phone.
* **Backup and merge** (`src/lib/backup.js`): there is no account or server, so user data is local-first. A backup is a text
  with a check code; restoring merges it without duplicates (favourites union, best scores, streak days, newest reading
  position). `mergeSnapshots` is the piece a future sync server would reuse.

## Known limits
* **Tafsir**: DALIL has no tafsir data yet (the `commentary` folder only holds a manifest), so none can be downloaded.
* **16-line Mushaf**: only the 15-line layout exists in the data.
* **Server sync**: not possible without a backend; adding one would break the "no account, no tracking" promise. Backup and
  merge covers moving data between phones.
* **Recitation practice offline**: needs the surah text and the Arabic offline speech model (Android 13+; the Download
  Manager has a button that asks the phone to install it).
* **Spoken Urdu translation audio** is not downloadable yet.
* **Prayer-time reminders** use inexact alarms (no special Play permission), so they can be a few minutes late.
* User data lives in app-private storage; it is not encrypted on the phone (it contains no secrets) and is excluded from nothing
  by Android's own backup unless the user opts out of cloud backup.
