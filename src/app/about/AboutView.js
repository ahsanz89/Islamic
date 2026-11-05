'use client';
// Shared About view (used by the Next.js site and the single-file preview).
export default function AboutView({ collections, translators }) {
  const api = collections.filter((c) => c.source === 'hadith-api');
  const oiti = collections.filter((c) => c.source === 'openiti');
  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>About &amp; sources</h1>
        <p className="muted">Nur-ul-Haq is a free, open-source project with no ads. The code is MIT licensed. Each dataset keeps its own licence, listed below.</p>
      </div>

      <section>
        <h2>Hadith with translations</h2>
        <p>Arabic text, translations, chapter names and gradings for {api.length} collections come from <a href="https://github.com/fawazahmed0/hadith-api">hadith-api</a> by Fawaz Ahmed, released into the public domain (Unlicense). Some translations in that dataset originate from printed works; if you hold rights to a translation and want it credited differently or removed, please open an issue.</p>
        <p className="muted small">{api.map((c) => c.en).join(' · ')}</p>
      </section>

      <section>
        <h2>Arabic-only collections</h2>
        <p>Arabic text for {oiti.length} further collections comes from the <a href="https://github.com/OpenITI">OpenITI corpus</a> (Romanov &amp; Seydi, Zenodo), licensed CC BY-NC-SA 4.0 — free for non-commercial use with attribution and share-alike. Hadith boundaries were detected automatically, so numbering may differ from printed editions.</p>
        <p className="muted small">{oiti.map((c) => `${c.en}${c.partial ? ' (partial)' : ''}`).join(' · ')}</p>
      </section>

      <section>
        <h2>Quran</h2>
        <p>Quran text and translations from <a href="https://github.com/fawazahmed0/quran-api">quran-api</a> (Unlicense). Word-by-word English meanings and transliteration from the <a href="https://www.npmjs.com/package/@kmaslesa/holy-quran-word-by-word-full-data">holy-quran-word-by-word</a> package (ISC). Root words from the <a href="https://corpus.quran.com">Quranic Arabic Corpus</a> (GNU GPL), via <a href="https://github.com/adelpro/quran-search-engine">quran-search-engine</a>.</p>
        <p className="muted small">Translators: {Object.values(translators).join(' · ')}</p>
      </section>

      <section>
        <h2>Takhrij, glossary and duas</h2>
        <p>Similar narrations are found automatically by comparing Arabic wording across every collection (MinHash similarity). They are a research aid, not a scholarly takhrij. The hadith terminology glossary and dua titles were written for this project; each dua links to the hadith it comes from.</p>
      </section>

      <section>
        <h2>Commentary and narrators</h2>
        <p>These sections are built and waiting for data. Commentary (fawa'id) and narrator biographies are usually copyrighted, so they will be added only from sources that give permission.</p>
      </section>

      <section id="errors">
        <h2>Report an error</h2>
        <p>Found a typo, a wrong number or a translation problem? Open an issue on GitHub with the link to the hadith or verse.</p>
      </section>
    </div>
  );
}
