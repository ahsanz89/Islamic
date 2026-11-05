'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon } from '@/components/ui';
import { gradeTone, hadithHref } from '@/components/HadithCard';
import { getJSON } from '@/lib/client-data';
import { normalizeText } from '@/lib/arabic.mjs';
import { LANG_NAMES } from '@/lib/i18n';

const PAGE = 30;
const KEEP = 3000; // matches kept for display; counts cover everything
const QURAN_KEYS = { ar: 'simple', ur: 'ur', en: 'en', bn: 'bn', id: 'id', tr: 'tr', fr: 'fr', ru: 'ru', ta: 'ta', hi: 'hi' };
const HADITH_LANGS = ['ar', 'ur', 'en', 'bn', 'id', 'tr', 'fr', 'ru', 'ta'];
const GRADES = [['s', 'sahih'], ['h', 'hasan'], ['d', 'daif'], ['', 'ungraded']];
const GRADE_WORD = { s: 'Sahih', h: 'Hasan', d: "Da'if" };
const hasArabic = (s) => /[؀-ۿ]/.test(s);
const looksUrdu = (s) => /[ٹڈڑںہےۓکگی]/.test(s);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function snippet(text, terms) {
  const hits = terms.map((t) => text.indexOf(t)).filter((i) => i >= 0);
  const first = hits.length ? Math.min(...hits) : 0;
  const start = Math.max(0, first - 90);
  const s = (start > 0 ? '… ' : '') + text.slice(start, start + 280) + (text.length > start + 280 ? ' …' : '');
  if (!terms.length) return s;
  const re = new RegExp(terms.map(esc).join('|'), 'g');
  const parts = [];
  let m, last = 0;
  while ((m = re.exec(s))) {
    if (!m[0].length) break;
    parts.push(s.slice(last, m.index), <mark key={m.index}>{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  parts.push(s.slice(last));
  return parts;
}

function countHits(text, terms) {
  let n = 0;
  for (const t of terms) {
    let i = text.indexOf(t);
    while (i >= 0 && n < 50) { n++; i = text.indexOf(t, i + t.length); }
  }
  return n;
}

export default function Search({ collections }) {
  const { t, settings, recent, addRecent } = useApp();
  const sp = useSearchParams();
  const initialQ = sp.get('q') || '';
  const preCol = sp.get('c');

  const [scope, setScope] = useState(sp.get('scope') === 'quran' ? 'quran' : 'hadith');
  const [q, setQ] = useState(initialQ);
  const [lang, setLang] = useState(() => {
    const l = sp.get('lang');
    if (l) return l;
    if (hasArabic(initialQ)) return looksUrdu(initialQ) || settings.ui === 'ur' ? 'ur' : 'ar';
    return HADITH_LANGS.includes(settings.ui) ? settings.ui : 'en';
  });
  const [mode, setMode] = useState('all');
  const [selected, setSelected] = useState(() =>
    preCol ? [preCol] : collections.filter((c) => c.source === 'hadith-api').map((c) => c.id));
  const [grades, setGrades] = useState(['s', 'h', 'd', '']);
  const [chapter, setChapter] = useState('');
  const [narrator, setNarrator] = useState('');
  const [numFrom, setNumFrom] = useState('');
  const [numTo, setNumTo] = useState('');
  const [sort, setSort] = useState('order');
  // Quran filters
  const [surah, setSurah] = useState('');
  const [place, setPlace] = useState('all');
  const [juzFrom, setJuzFrom] = useState(1);
  const [juzTo, setJuzTo] = useState(30);

  const [state, setState] = useState({ status: 'idle', results: [], counts: {}, total: 0, done: 0, of: 0 });
  const [facet, setFacet] = useState('all');
  const [shown, setShown] = useState(PAGE);
  const [openFilters, setOpenFilters] = useState(false);
  const [sectionTitles, setSectionTitles] = useState({});
  const [surahs, setSurahs] = useState(null);
  const run = useRef(0);

  const colMap = useMemo(() => Object.fromEntries(collections.map((c) => [c.id, c])), [collections]);
  const available = useMemo(() => collections.filter((c) => c.langs.includes(lang)), [collections, lang]);
  const single = selected.length === 1 ? selected[0] : null;

  useEffect(() => { getJSON('q/surahs.json').then((d) => setSurahs(d.surahs)).catch(() => {}); }, []);
  useEffect(() => { setChapter(''); }, [single]);
  useEffect(() => {
    if (!single) return;
    getJSON(`c/${single}.json`).then((c) => setSectionTitles((m) => ({ ...m, [single]: Object.fromEntries(c.sections.map((s) => [s.id, s.title])) })));
  }, [single]);

  const activeFilters =
    (mode !== 'all') + (grades.length !== 4) + !!chapter + !!narrator.trim() + !!(numFrom || numTo) +
    (scope === 'quran' ? !!surah + (place !== 'all') + (juzFrom !== 1 || juzTo !== 30) : 0);

  async function doSearch(e) {
    e?.preventDefault();
    const id = ++run.current;
    const query = q.trim();
    setFacet('all');
    setShown(PAGE);
    if (query.length < 2 && !/^\d+$/.test(query) && !narrator.trim()) { setState({ status: 'short', results: [], counts: {}, total: 0 }); return; }
    addRecent(query);
    const norm = normalizeText(query, lang);
    const terms = mode === 'phrase' ? [norm].filter(Boolean) : norm.split(' ').filter(Boolean);
    const narr = narrator.trim() ? normalizeText(narrator.trim(), lang) : '';
    const test = (text) => {
      if (narr) {
        const head = text.slice(0, Math.max(200, Math.floor(text.length * 0.4)));
        if (!head.includes(narr)) return false;
      }
      if (!terms.length) return true;
      return mode === 'any' ? terms.some((tm) => text.includes(tm)) : terms.every((tm) => text.includes(tm));
    };

    if (scope === 'quran') {
      setState({ status: 'running', results: [], counts: {}, total: 0, done: 0, of: 1 });
      const rows = await getJSON(`s/quran/${QURAN_KEYS[lang] || 'en'}.json`);
      const placeOf = Object.fromEntries((surahs || []).map((s) => [s.n, s.place]));
      const results = [];
      let total = 0;
      for (const [k, text, juz] of rows) {
        const s = Number(k.split(':')[0]);
        if (surah && s !== Number(surah)) continue;
        if (place !== 'all' && placeOf[s] !== place) continue;
        if (juz && (juz < juzFrom || juz > juzTo)) continue;
        if (!test(text)) continue;
        total++;
        if (results.length < KEEP) results.push({ k, text, score: countHits(text, terms) });
      }
      if (sort === 'relevance') results.sort((a, b) => b.score - a.score);
      if (id === run.current) setState({ status: 'done', results, counts: {}, total, terms });
      return;
    }

    // a bare number with no other filters = open that hadith in each selected book
    if (/^\d+(\.\d+)?$/.test(query) && !narr) {
      const res = selected.filter((c) => colMap[c]).map((c) => ({ c, n: query, num: true }));
      setState({ status: 'done', results: res, counts: {}, total: res.length, terms: [] });
      return;
    }

    const ids = selected.filter((c) => available.some((a) => a.id === c));
    const results = [];
    const counts = {};
    let total = 0;
    const gset = new Set(grades);
    const from = numFrom ? Number(numFrom) : -Infinity;
    const to = numTo ? Number(numTo) : Infinity;
    setState({ status: 'running', results: [], counts: {}, total: 0, done: 0, of: ids.length, terms });
    for (let i = 0; i < ids.length; i++) {
      const c = ids[i];
      const rows = await getJSON(`s/${lang}/${c}.json`).catch(() => []);
      if (id !== run.current) return;
      for (const [n, text, g = '', sec] of rows) {
        if (n < from || n > to) continue;
        if (!gset.has(g)) continue;
        if (chapter && String(sec) !== chapter) continue;
        if (!test(text)) continue;
        total++;
        counts[c] = (counts[c] || 0) + 1;
        if (results.length < KEEP) results.push({ c, n, text, g, sec, score: countHits(text, terms) });
      }
      setState({ status: 'running', results: [...results], counts: { ...counts }, total, done: i + 1, of: ids.length, terms });
      await new Promise((r) => setTimeout(r, 0));
    }
    if (sort === 'relevance') results.sort((a, b) => b.score - a.score);
    if (id === run.current) setState({ status: 'done', results, counts, total, done: ids.length, of: ids.length, terms });
  }

  // Run once when arriving with a query
  useEffect(() => { if (initialQ) doSearch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // chapter titles for the books that appear in results
  useEffect(() => {
    const need = [...new Set(state.results.slice(0, shown).map((r) => r.c).filter((c) => c && !sectionTitles[c]))];
    need.forEach((c) => getJSON(`c/${c}.json`).then((col) => setSectionTitles((m) => ({ ...m, [c]: Object.fromEntries(col.sections.map((s) => [s.id, s.title])) }))).catch(() => {}));
  }, [state.results, shown]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleBook = (c) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const toggleGrade = (g) => setGrades((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]));
  const reset = () => {
    setMode('all'); setGrades(['s', 'h', 'd', '']); setChapter(''); setNarrator(''); setNumFrom(''); setNumTo('');
    setSurah(''); setPlace('all'); setJuzFrom(1); setJuzTo(30); setSort('order');
  };
  const langs = scope === 'quran' ? Object.keys(QURAN_KEYS) : HADITH_LANGS;
  const visible = facet === 'all' ? state.results : state.results.filter((r) => r.c === facet);
  const terms = state.terms || [];
  const textClass = lang === 'ar' ? 'ar sm' : lang === 'ur' ? 'tr-ur' : '';

  const filterPanel = (
    <div className="card filters">
      <div className="group">
        <div className="group-title">{t('matching')}</div>
        <div className="segmented">
          {[['all', 'matchAll'], ['any', 'matchAny'], ['phrase', 'matchPhrase']].map(([v, k]) => (
            <button key={v} type="button" aria-pressed={mode === v} onClick={() => setMode(v)}>{t(k)}</button>
          ))}
        </div>
      </div>
      <div className="group">
        <div className="group-title">{t('sortBy')}</div>
        <div className="segmented">
          <button type="button" aria-pressed={sort === 'order'} onClick={() => setSort('order')}>{t('sortOrder')}</button>
          <button type="button" aria-pressed={sort === 'relevance'} onClick={() => setSort('relevance')}>{t('sortRelevance')}</button>
        </div>
      </div>

      {scope === 'hadith' ? (
        <>
          <div className="group">
            <div className="group-title">
              {t('collections')} <span className="badge grey">{selected.filter((c) => available.some((a) => a.id === c)).length}</span>
              <button type="button" onClick={() => setSelected(available.map((c) => c.id))}>{t('allBooks')}</button>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="chip" onClick={() => setSelected(collections.filter((c) => c.group === 'six').map((c) => c.id))}>{t('sixBooks')}</button>
              <button type="button" className="chip" onClick={() => setSelected([])}>{t('clear')}</button>
            </div>
            <div className="book-list">
              {available.map((c) => (
                <label key={c.id} className="check">
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleBook(c.id)} />
                  <span style={{ flex: 1 }}><CName c={c} /></span>
                  <span className="muted small" style={{ fontVariantNumeric: 'tabular-nums' }}>{c.count.toLocaleString()}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="group">
            <div className="group-title">{t('gradeFilter')}</div>
            <div className="row" style={{ gap: 6 }}>
              {GRADES.map(([g, k]) => (
                <button key={k} type="button" className="chip" aria-pressed={grades.includes(g)} onClick={() => toggleGrade(g)}>{t(k)}</button>
              ))}
            </div>
          </div>
          <div className="group">
            <label className="group-title" htmlFor="f-ch">{t('chapter')}</label>
            {single && sectionTitles[single] ? (
              <select id="f-ch" className="input" value={chapter} onChange={(e) => setChapter(e.target.value)}>
                <option value="">{t('allChapters')}</option>
                {Object.entries(sectionTitles[single]).map(([id, title]) => <option key={id} value={id}>{id}. {title}</option>)}
              </select>
            ) : <p className="muted small" style={{ margin: 0 }}>{t('pickOneBook')}</p>}
          </div>
          <div className="group">
            <label className="group-title" htmlFor="f-nar">{t('narratorFilter')}</label>
            <input id="f-nar" className="input" value={narrator} onChange={(e) => setNarrator(e.target.value)} placeholder={t('narratorPlaceholder')} dir="auto" />
          </div>
          <div className="group">
            <div className="group-title">{t('numberRange')}</div>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <label className="sr-only" htmlFor="f-from">{t('from')}</label>
              <input id="f-from" className="input" inputMode="numeric" placeholder={t('from')} value={numFrom} onChange={(e) => setNumFrom(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="muted">–</span>
              <label className="sr-only" htmlFor="f-to">{t('to')}</label>
              <input id="f-to" className="input" inputMode="numeric" placeholder={t('to')} value={numTo} onChange={(e) => setNumTo(e.target.value.replace(/[^\d.]/g, ''))} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="group">
            <label className="group-title" htmlFor="f-surah">{t('surah')}</label>
            <select id="f-surah" className="input" value={surah} onChange={(e) => setSurah(e.target.value)}>
              <option value="">{t('allSurahs')}</option>
              {(surahs || []).map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
          </div>
          <div className="group">
            <div className="group-title">{t('place')}</div>
            <div className="segmented">
              <button type="button" aria-pressed={place === 'all'} onClick={() => setPlace('all')}>{t('allResults')}</button>
              <button type="button" aria-pressed={place === 'Mecca'} onClick={() => setPlace('Mecca')}>{t('meccan')}</button>
              <button type="button" aria-pressed={place === 'Madina'} onClick={() => setPlace('Madina')}>{t('medinan')}</button>
            </div>
          </div>
          <div className="group">
            <div className="group-title">{t('juz')}</div>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <label className="sr-only" htmlFor="j-from">{t('from')}</label>
              <select id="j-from" className="input" value={juzFrom} onChange={(e) => setJuzFrom(Number(e.target.value))}>
                {Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
              <span className="muted">–</span>
              <label className="sr-only" htmlFor="j-to">{t('to')}</label>
              <select id="j-to" className="input" value={juzTo} onChange={(e) => setJuzTo(Number(e.target.value))}>
                {Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
          </div>
        </>
      )}
      <div className="row">
        <button type="button" className="btn small ghost" onClick={reset}>{t('resetFilters')}</button>
        <span className="spacer" />
        <button type="button" className="btn small primary" onClick={() => { setOpenFilters(false); doSearch(); }}>{t('search')}</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="page-head">
        <div className="row" style={{ marginBottom: 14 }}>
          <h1 style={{ margin: 0 }}>{t('search')}</h1>
          <span className="spacer" />
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={scope === 'hadith'} onClick={() => { setScope('hadith'); if (!HADITH_LANGS.includes(lang)) setLang('en'); }}>{t('hadithSearch')}</button>
            <button role="tab" aria-selected={scope === 'quran'} onClick={() => setScope('quran')}>{t('quranSearch')}</button>
          </div>
        </div>
        <form className="searchbar" role="search" onSubmit={doSearch}>
          <span className="lead">{Icon.search}</span>
          <label htmlFor="sq" className="sr-only">{t('search')}</label>
          <input id="sq" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} dir="auto" autoComplete="off" />
          <label className="sr-only" htmlFor="sl">{t('language')}</label>
          <select id="sl" className="btn ghost" value={lang} onChange={(e) => setLang(e.target.value)} style={{ maxWidth: 140 }}>
            {langs.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
          </select>
          <button className="btn primary" type="submit" aria-label={t('search')}><span className="hide-sm">{t('search')}</span><span className="show-sm">{Icon.search}</span></button>
        </form>
        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn small filter-toggle" aria-expanded={openFilters} onClick={() => setOpenFilters(!openFilters)}>
            {Icon.filter}{t('showFilters')}{activeFilters ? <span className="badge">{activeFilters}</span> : null}
          </button>
          {recent.length > 0 && <span className="muted small">{t('recentSearches')}:</span>}
          {recent.slice(0, 6).map((r) => (
            <button key={r} type="button" className="chip" style={{ minHeight: 30, fontSize: 13 }} dir="auto" onClick={() => setQ(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="layout">
        <aside className="side filters-wrap" data-open={openFilters ? 'true' : 'false'}>{filterPanel}</aside>
        <div className="content stack">
          {state.status === 'idle' && <div className="empty">{t('searchPlaceholder')}</div>}
          {state.status === 'short' && <div className="empty">{t('minChars')}</div>}
          {(state.status === 'running' || state.status === 'done') && (
            <>
              {state.status === 'running' && state.of > 0 && <div className="progress" aria-hidden="true"><span style={{ width: `${(state.done / state.of) * 100}%` }} /></div>}
              <div className="row">
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{state.total.toLocaleString()} {t('results')}</strong>
                {state.status === 'running' && <span className="muted small">{t('searching')}</span>}
                {state.total > KEEP && <span className="muted small">· {t('showingFirst', { n: KEEP.toLocaleString() })}</span>}
              </div>
              {scope === 'hadith' && Object.keys(state.counts).length > 1 && (
                <div className="facets" role="group" aria-label={t('collections')}>
                  <button className="chip" aria-pressed={facet === 'all'} onClick={() => { setFacet('all'); setShown(PAGE); }}>{t('allResults')} <span className="count">{state.total.toLocaleString()}</span></button>
                  {Object.entries(state.counts).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
                    <button key={c} className="chip" aria-pressed={facet === c} onClick={() => { setFacet(c); setShown(PAGE); }}><CName c={colMap[c]} /> <span className="count">{n.toLocaleString()}</span></button>
                  ))}
                </div>
              )}
            </>
          )}
          {state.status === 'done' && !state.results.length && <div className="empty">{t('noResults')}</div>}
          {visible.slice(0, shown).map((r, i) =>
            scope === 'quran' ? (
              <Link key={i} href={`/quran/${r.k.split(':')[0]}/#v${r.k.split(':')[1]}`} className="result spot">
                <div className="top">
                  <span className="ref">{t('surah')} {r.k}</span>
                  {surahs && <span className="muted small">{surahs[Number(r.k.split(':')[0]) - 1]?.name}</span>}
                </div>
                <p dir="auto" className={textClass}>{snippet(r.text, terms)}</p>
              </Link>
            ) : r.num ? (
              <Link key={i} href={hadithHref(r.c, r.n)} className="result spot"><span className="ref"><CName c={colMap[r.c]} /> {r.n} →</span></Link>
            ) : (
              <Link key={i} href={hadithHref(r.c, r.n)} className="result spot">
                <div className="top">
                  <span className="ref"><CName c={colMap[r.c]} /> {r.n}</span>
                  {r.g ? <span className={`badge ${gradeTone(GRADE_WORD[r.g])}`}>{t(GRADES.find((x) => x[0] === r.g)[1])}</span> : null}
                  {sectionTitles[r.c]?.[r.sec] && <span className="muted small">· {sectionTitles[r.c][r.sec]}</span>}
                </div>
                <p dir="auto" className={textClass}>{snippet(r.text, terms)}</p>
              </Link>
            )
          )}
          {visible.length > shown && <button className="btn" onClick={() => setShown((s) => s + PAGE)}>{t('loadMore')} ({(visible.length - shown).toLocaleString()})</button>}
        </div>
      </div>
    </div>
  );
}
