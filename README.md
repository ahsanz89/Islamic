# Hadith Library

A free, open-source, ad-free hadith and Quran library. Arabic text with translations in many languages, a multi-language interface (English, اردو, العربية, বাংলা, हिन्दी, Indonesia, Türkçe, Français, Русский, தமிழ்), light and dark themes, and right-to-left layout for Urdu and Arabic.

The site is a static Next.js export, so it can be hosted for free on GitHub Pages, Cloudflare Pages or Netlify. There is no server and no database.

## What's inside

| Area | What you get |
| --- | --- |
| Collections | 29 books, about 179,000 hadith. 10 books with translations (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta, and three Forty Hadith books) and 19 Arabic-only books (Musnad Ahmad, Musannaf Ibn Abi Shaybah, Bayhaqi, Tabarani, Mustadrak, Darimi, Ibn Khuzaymah, Daraqutni, Mishkat and more) |
| Hadith page | Arabic with the chain of narrators (isnad) shown lighter than the text (matn), harakat on/off, any mix of 8 translations, gradings (Albani, Zubair Ali Zai, Arna'ut and others where available), book and in-book references, previous/next |
| Takhrij | Similar narrations across all 29 books, found automatically by comparing the Arabic wording (82,000+ hadith linked) |
| Quran | 114 surahs, Uthmani text, 13 translations in 10 languages, transliteration, word-by-word meanings, roots for each word and a root-word index |
| Search | Hadith search in 9 languages and Quran search in 10. Filters: all words / any word / exact phrase, books (with a Six Books shortcut), grade (sahih, hasan, da'if, not graded), chapter, narrator, hadith number range, sort by book order or best match, per-book result counts, recent searches. Quran filters: surah, Meccan/Medinan, juz range |
| Duas | 19 everyday duas, each taken directly from the hadith that contains it |
| Glossary | 43 hadith terms (sahih, hasan, mursal, musnad…) in Arabic, English and Urdu |
| Narrators, commentary | Pages and data slots are built and show a clear empty state until a licensed source is added (see below) |
| Saved | Bookmarks for hadith, verses and duas, stored in the browser |

## Run it locally

Requires Node.js 20+ and about 2 GB of free disk.

```bash
npm install
npm run fetch   # downloads the open datasets into raw/  (~450 MB, once)
npm run data    # builds public/data/ (~660 MB of JSON, about 1 minute)
npm run dev     # http://localhost:3000
```

Build the static site with `npm run build`; the result is in `out/`.

## Single-page preview

`npm run preview` builds `spa/dist/`: one HTML page plus about 100 MB of packed data, covering 16 collections and the full Quran. It's the version shared as a Claude artifact, and it can be hosted anywhere that serves static files.

## Publish on GitHub Pages

1. Create a repository and push this folder to the `main` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` downloads the data, builds the site and publishes it to `https://<user>.github.io/<repo>/`.

`raw/` and `public/data/` are not committed (they are rebuilt by the workflow), which keeps the repository small. For a custom domain, remove the `BASE_PATH` line in the workflow.

The built site is about 720 MB, under GitHub Pages' 1 GB limit. Cloudflare Pages also works (largest file is 18 MB, about 2,000 files).

## Project layout

```
scripts/
  collections.config.mjs   which books are built and where each comes from
  fetch-sources.mjs        downloads the open datasets
  build-data.mjs           normalises everything into public/data
  lib/openiti-parse.mjs    splits OpenITI Arabic texts into numbered hadith
  lib/takhrij.mjs          finds similar narrations (MinHash)
content/
  glossary.json            hadith terminology
  duas.json                duas, each pointing at its hadith
src/
  app/                     pages (Next.js app router)
  components/              hadith card, header, settings, buttons
  lib/i18n.js              interface translations
  lib/arabic.mjs           Arabic normalisation and isnad/matn detection
```

## Adding commentary or narrator data

Both are ready and waiting for data you have permission to publish. The file formats are in [docs/DATA.md](docs/DATA.md). Most Urdu commentaries and narrator databases are copyrighted, so please add them only with the publisher's written permission.

## Helping translate the interface

Edit the language block in `src/lib/i18n.js`. Any key that is missing falls back to English. Bengali, Hindi, Indonesian, Turkish, French, Russian and Tamil only cover the main strings so far, and native speakers are very welcome to complete and correct them.

## Data sources and licences

See [docs/DATA.md](docs/DATA.md). In short: hadith-api and quran-api (public domain), OpenITI (CC BY-NC-SA 4.0, non-commercial), Quranic Arabic Corpus roots (GPL), word-by-word package (ISC). The code is MIT.
