'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/Providers';
import { Loader } from '@/components/ui';
import HadithCard, { classTone } from '@/components/HadithCard';
import { getHadith, getJSON } from '@/lib/client-data';
import { GRADE_CLASSES, GRADE_INFO } from '@/lib/grades.mjs';

const KEY = { s: 'sahih', h: 'hasan', d: 'daif', m: 'mawdu' };
const PAGE = 20;
const MEANING = {
  s: 'Its chain is connected through upright, accurate narrators, with no hidden defect.',
  h: 'Like sahih, but a narrator in the chain has slightly less accuracy. It can be used as evidence.',
  d: 'The chain has a break or a narrator with a fault. It is not used for rulings, and some scholars allow it for encouraging good deeds under conditions.',
  m: 'Falsely attributed to the Prophet (peace be upon him). It must not be narrated as a saying of his, except to warn against it.'
};
const nameOf = (b, ui) => (ui === 'ur' ? b.ur : ui === 'ar' ? b.ar : b.en) || b.en;

function List({ book, g, ui }) {
  const { t } = useApp();
  const [nums, setNums] = useState(null);
  const [shown, setShown] = useState([]);
  const [limit, setLimit] = useState(PAGE);
  const [col, setCol] = useState(null);
  useEffect(() => {
    let live = true;
    setNums(null); setShown([]); setLimit(PAGE);
    Promise.all([getJSON(`grades/${book.id}.json`), getJSON(`c/${book.id}.json`)]).then(([idx, c]) => { if (live) { setCol(c); setNums(idx[g] || []); } }).catch(() => live && setNums([]));
    return () => { live = false; };
  }, [book.id, g]);
  useEffect(() => {
    if (!nums) return undefined;
    let live = true;
    const want = nums.slice(0, limit);
    Promise.all(want.map((n) => getHadith(book.id, n).then((r) => r.hadith).catch(() => null))).then((hs) => { if (live) setShown(hs.filter(Boolean)); });
    return () => { live = false; };
  }, [nums, limit, book.id]);
  if (nums === null) return <Loader label={t('loading')} />;
  if (!nums.length) return <p className="muted">No hadith in this category for this book.</p>;
  return (
    <div className="stack" style={{ gap: 16 }}>
      <p className="muted small" style={{ margin: 0 }}>{nums.length.toLocaleString()} {t('hadiths')} · {t(KEY[g])} · {nameOf(book, ui)}</p>
      {col && shown.map((h) => <HadithCard key={h.n} col={col} h={h} />)}
      {nums.length > limit && <button className="btn" onClick={() => setLimit((l) => l + PAGE)}>{t('loadMore')} ({nums.length - limit})</button>}
    </div>
  );
}

export default function GradesBrowser({ books }) {
  const { t, settings } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const c = params.get('c');
  const g = GRADE_CLASSES.includes(params.get('g')) ? params.get('g') : '';
  const book = books.find((b) => b.id === c) || null;
  const totals = useMemo(() => books.reduce((a, b) => (b.g ? { s: a.s + b.g.s, h: a.h + b.g.h, d: a.d + b.g.d, m: a.m + b.g.m, u: a.u + b.g.u } : a), { s: 0, h: 0, d: 0, m: 0, u: 0 }), [books]);
  const go = (id, k) => router.replace(`/grades/?c=${id}&g=${k}`, { scroll: false });
  const graded = books.filter((b) => b.g && b.g.s + b.g.h + b.g.d + b.g.m > 0);
  const none = books.filter((b) => !b.g || b.g.s + b.g.h + b.g.d + b.g.m === 0);

  return (
    <div className="container narrow">
      <header className="page-head">
        <nav className="breadcrumb"><Link href="/collections/">{t('collections')}</Link><span>/</span></nav>
        <h1>Hadith by grade</h1>
        <p className="muted" style={{ margin: 0 }}>Every hadith is shown with one of four grades: Sahih, Hasan, Da'if or Mawdu'. Pick a grade count below to read those hadith from a book.</p>
      </header>

      <div className="pr-grid">
        <section className="grid-4" aria-label="The four grades" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {GRADE_CLASSES.map((k) => (
            <div key={k} className="card pad stack" style={{ gap: 6 }}>
              <span className={`badge ${classTone(k)}`} style={{ width: 'fit-content' }}>{GRADE_INFO[k].en} · <span lang="ar">{GRADE_INFO[k].ar}</span></span>
              <strong style={{ fontSize: 26 }}>{totals[k].toLocaleString()}</strong>
              <strong className="small">{GRADE_INFO[k].meaning}</strong>
              <span className="muted small">{MEANING[k]}</span>
            </div>
          ))}
        </section>

        <section className="card pad stack">
          <h2 style={{ margin: 0 }}>Books with recorded gradings</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="wl-table" style={{ minWidth: 520 }}>
              <thead><tr><th>Book</th>{GRADE_CLASSES.map((k) => <th key={k}>{t(KEY[k])}</th>)}<th>{t('ungraded')}</th></tr></thead>
              <tbody>
                {graded.map((b) => (
                  <tr key={b.id} className={b.id === c ? 'hit' : ''}>
                    <td><Link href={`/c/${b.id}/`}>{nameOf(b, settings.ui)}</Link></td>
                    {GRADE_CLASSES.map((k) => (
                      <td key={k}>{b.g[k] ? <button className="chip" aria-pressed={b.id === c && g === k} onClick={() => go(b.id, k)}>{b.g[k].toLocaleString()}</button> : '–'}</td>
                    ))}
                    <td>{b.g.u ? b.g.u.toLocaleString() : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small" style={{ margin: 0 }}>Sahih al-Bukhari and Sahih Muslim: every hadith is counted Sahih, by the agreement of the scholars on these two books. For the Four Sunan and Muwatta Malik the grade comes from the recorded gradings of scholars (Al-Albani first, then Zubair Ali Zai and others), and the original wording is shown on each hadith. A hadith the scholar calls "Hasan Sahih" is counted Sahih; "Sahih li-ghayrihi" counts as Sahih and "Hasan li-ghayrihi" as Hasan. Munkar, Shadh and Matruk count as Da'if.</p>
        </section>

        {none.length > 0 && (
          <section className="card pad stack">
            <h2 style={{ margin: 0 }}>Books with no recorded gradings yet</h2>
            <p className="muted small" style={{ margin: 0 }}>For these books the sources we use do not carry gradings, so their hadith are marked "Not graded". We do not guess a grade: a ruling on a hadith has to come from a scholar. They will appear here as soon as a trustworthy source for them is added.</p>
            <p className="small" style={{ margin: 0 }}>{none.map((b, i) => <span key={b.id}>{i ? ' · ' : ''}<Link href={`/c/${b.id}/`}>{nameOf(b, settings.ui)}</Link></span>)}</p>
          </section>
        )}

        {book && g && (
          <section aria-live="polite">
            <div className="row" style={{ marginBottom: 10, gap: 6 }}>
              {GRADE_CLASSES.filter((k) => book.g && book.g[k]).map((k) => <button key={k} className="chip" aria-pressed={g === k} onClick={() => go(book.id, k)}>{t(KEY[k])} ({book.g[k].toLocaleString()})</button>)}
            </div>
            <List book={book} g={g} ui={settings.ui} />
          </section>
        )}
      </div>
    </div>
  );
}
