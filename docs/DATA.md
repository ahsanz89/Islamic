# Data: sources, licences and file formats

## Sources

| Data | Source | Licence | Notes |
| --- | --- | --- | --- |
| 10 hadith books: Arabic, 8 translations, chapter names, gradings | [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) | Unlicense (public domain dedication) | Some translations in the dataset come from printed works. Credit translators and remove any edition on a rights-holder's request. |
| 19 Arabic-only hadith books | [OpenITI corpus](https://github.com/OpenITI) (Romanov & Seydi, doi:10.5281/zenodo.3082463) | CC BY-NC-SA 4.0 | Non-commercial use only, with attribution, and derived data must keep the same licence. Hadith are split automatically, so numbering can differ from printed editions. |
| Quran text and 13 translations | [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) | Unlicense | |
| Quran word-by-word English and transliteration | [@kmaslesa/holy-quran-word-by-word-full-data](https://www.npmjs.com/package/@kmaslesa/holy-quran-word-by-word-full-data) | ISC | |
| Quran roots and lemmas | [Quranic Arabic Corpus](https://corpus.quran.com) via [quran-search-engine](https://github.com/adelpro/quran-search-engine) | GNU GPL | |
| Glossary, dua titles | Written for this project | MIT | |

Books whose automatic splitting found fewer than 60% of the expected hadith are skipped. Right now that is al-Muntaqa (Ibn al-Jarud), Musnad ash-Shihab, Majma' az-Zawa'id and Bulugh al-Maram. Improving `scripts/lib/openiti-parse.mjs` for their formats would bring them in.

## Generated files (`public/data`)

```
collections.json                 { groups, collections: [summary…] }
c/<collection>.json              summary + sections: [{ id, title, sub, from, to, count }]
c/<collection>/<section>.json    [hadith…]
s/<lang>/<collection>.json       search rows [[number, normalised text]]
s/quran/<edition>.json           Quran search rows [["2:255", text]]
q/surahs.json                    { surahs, translators }
q/<surah>.json                   [verse…]
q/roots.json                     { "ر-ح-م": [["1:1", word, meaning], …] }
glossary.json, duas.json
narrators/index.json             empty, ready (schema below)
commentary/index.json            empty, ready (schema below)
```

### Hadith record

```json
{
  "n": 1,                      // number in this collection
  "an": 1,                     // Arabic numbering (hadith-api books)
  "p": 1,                      // printed edition number (OpenITI books)
  "ref": [1, 1],               // [book, hadith in book]
  "ch": "باب …",               // chapter heading (OpenITI books)
  "ar": "حَدَّثَنَا …",          // Arabic text
  "mi": 359,                   // index where the matn starts (0 = not detected)
  "g": [["Al-Albani", "Sahih"]],
  "t": { "ur": "…", "en": "…" },
  "sim": [["muslim", 1907, 64]] // takhrij: collection, number, % similarity
}
```

### Commentary (to add)

Put one file per collection at `public/data/commentary/<collection>.json`:

```json
{
  "source": { "id": "…", "title": "…", "author": "…", "lang": "ur", "licence": "…", "permission": "link or note" },
  "items": { "1": "commentary text for hadith 1", "2": "…" }
}
```

and list it in `commentary/index.json` → `sources`. The hadith page then shows it in the Commentary section. Hooking this up is a small change in `HadithDetails` in `src/components/HadithCard.js`.

### Narrators (to add)

`public/data/narrators/index.json`:

```json
{
  "narrators": [{
    "id": "umar-ibn-al-khattab",
    "name_ar": "عمر بن الخطاب", "name_en": "Umar ibn al-Khattab",
    "kunya": "أبو حفص", "death": 23, "tabaqah": "صحابي",
    "grade_ibnhajar": "صحابي", "grade_dhahabi": "",
    "teachers": ["…"], "students": ["…"],
    "hadith": [["bukhari", 1]]
  }]
}
```

The Narrators page already lists and searches whatever is in this file.
