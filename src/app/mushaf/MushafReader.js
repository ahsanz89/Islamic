'use client';
// Page-by-page Mushaf reader (15 lines per page, 604 pages), the web version of the mobile Mushaf.
// The layout file is the same as the app's. Every line of a page stays on ONE row (never re-wrapped); the font is sized so
// the widest line of the page just fits, and full lines are justified the way the printed page is.
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/Providers';
import { Icon, Loader } from '@/components/ui';
import { getJSON } from '@/lib/client-data';
import { recordRead } from '@/lib/reading-log';
import {
  PAGES, clampPage, firstVerseOfPage, lineSpeech, pageLines, pageOfSurah, parseToken, setMushaf, surahsOnPage, toArabicDigits
} from '@/lib/mushaf-core';

const REF = 24;
const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

function Word({ tok }) {
  const { text, n } = parseToken(tok);
  return (
    <span className="mp-word">{text}{n ? <span className="mp-end">{`﴿${toArabicDigits(n)}﴾`}</span> : null}</span>
  );
}

function PageView({ page, width, height }) {
  const lines = useMemo(() => pageLines(page), [page]);
  const probe = useRef(null);
  const [fs, setFs] = useState(REF);
  const lineH = Math.min(height / 15, 64);
  const inner = width * 0.94;
  const [nat, setNat] = useState([]);
  // measure every text line at the reference size, then scale so the widest one fits
  useLayoutEffect(() => {
    const el = probe.current;
    if (!el) return;
    const widths = [...el.children].map((c) => c.getBoundingClientRect().width);
    setNat(widths);
    const maxNat = Math.max(1, ...widths);
    setFs(Math.max(12, Math.min(REF * (inner / maxNat) * 0.99, lineH / 1.75)));
  }, [page, inner, lineH]);
  const full = lines.length >= 15;
  return (
    <div className="mp-page" style={{ width, height, justifyContent: full ? 'flex-start' : 'center', fontSize: fs }} lang="ar" dir="rtl">
      <div className="mp-probe" ref={probe} aria-hidden="true" style={{ fontSize: REF }}>
        {lines.map((l, i) => (l[0] === 2 ? <div key={i} className="mp-line natural">{l[1].map((t, k) => <Word key={k} tok={t} />)}</div> : <div key={i} />))}
      </div>
      {lines.map((l, i) => {
        if (l[0] === 0) {
          return <div key={i} className="mp-row" style={{ height: lineH }}><h2 className="mp-header" style={{ height: lineH * 0.82, fontSize: Math.min(fs * 1.05, lineH * 0.5) }}>{l[2]}</h2></div>;
        }
        if (l[0] === 1) return <div key={i} className="mp-row" style={{ height: lineH, justifyContent: 'center' }} aria-label={lineSpeech(l)}><span className="mp-bism">{BASMALA}</span></div>;
        const natural = (nat[i] || 0) * (fs / REF);
        const stretch = natural >= inner * 0.8;
        return (
          <div key={i} className="mp-row" style={{ height: lineH }} aria-label={lineSpeech(l)}>
            <div className="mp-line" style={{ width: inner, justifyContent: stretch ? 'space-between' : 'center', gap: stretch ? 0 : `${0.2}em` }}>
              {l[1].map((t, k) => <Word key={k} tok={t} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MushafReader({ surahs }) {
  const { t, setLastRead } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(() => clampPage(params.get('p')));
  const [num, setNum] = useState('');
  const [box, setBox] = useState({ w: 600, h: 800 });
  const wrap = useRef(null);
  const touch = useRef(null);

  useEffect(() => { getJSON('mushaf15.json').then((d) => { setMushaf(d); setReady(true); }).catch(() => setError('The page layout could not be loaded. Check your connection and reload.')); }, []);
  // a link such as /mushaf/?p=12 (or ?s=18 for a surah) jumps there, once the layout is ready
  useEffect(() => {
    if (!ready) return;
    const s = Number(params.get('s'));
    if (s >= 1 && s <= 114) setPage(pageOfSurah(s));
    else if (params.get('p')) setPage(clampPage(params.get('p')));
  }, [ready, params]);

  useLayoutEffect(() => {
    const measure = () => {
      const w = Math.min(wrap.current ? wrap.current.clientWidth : 600, 640);
      setBox({ w, h: Math.max(420, Math.min(window.innerHeight - 190, w * 1.62)) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [ready]);

  const nameOf = useCallback((s) => (surahs[s - 1] ? surahs[s - 1].name : `Surah ${s}`), [surahs]);
  const goTo = useCallback((p) => { const n = clampPage(p); setPage(n); router.replace(`/mushaf/?p=${n}`, { scroll: false }); }, [router]);
  const on = ready ? surahsOnPage(page) : [];
  const title = on.map(nameOf).join(' · ');

  // remember where the reader stopped (so "Continue reading" on the home page can come back to this page)
  useEffect(() => {
    if (!ready) return undefined;
    const id = setTimeout(() => setLastRead({ path: `/mushaf/?p=${page}`, title: `Mushaf · page ${page}`, sub: title }), 700);
    return () => clearTimeout(id);
  }, [ready, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!ready) return undefined; const id = setTimeout(() => recordRead(`m:${page}`), 3000); return () => clearTimeout(id); }, [ready, page]);

  // keyboard: in a right-to-left book the next page is to the LEFT
  useEffect(() => {
    const k = (e) => {
      if (/INPUT|SELECT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return;
      if (e.key === 'ArrowLeft') goTo(page + 1);
      if (e.key === 'ArrowRight') goTo(page - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [page, goTo]);

  const jump = (e) => { e.preventDefault(); const n = Number(num); if (n >= 1 && n <= PAGES) { goTo(n); setNum(''); } };
  const start = ready ? firstVerseOfPage(page) : null;

  return (
    <div className="container narrow">
      <header className="page-head">
        <nav className="breadcrumb"><Link href="/quran/">{t('quran')}</Link><span>/</span></nav>
        <h1>Mushaf pages</h1>
        <p className="muted" style={{ margin: 0 }}>The Quran page by page, 15 lines to a page, 604 pages. Use the arrows, swipe, or the left and right arrow keys.</p>
      </header>
      {error && <p role="alert" className="muted">{error}</p>}
      {!ready && !error && <Loader label={t('loading')} />}
      {ready && (
        <div ref={wrap}>
          <div className="mp-bar">
            <form className="mp-jump" onSubmit={jump}>
              <label htmlFor="mp-num" className="sr-only">Page number, 1 to {PAGES}</label>
              <input id="mp-num" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder={`Page 1–${PAGES}`} />
              <button className="btn small" type="submit">{t('go') || 'Go'}</button>
            </form>
            <label className="mp-surah">
              <span className="sr-only">Go to surah</span>
              <select value="" onChange={(e) => { if (e.target.value) goTo(pageOfSurah(Number(e.target.value))); }}>
                <option value="">Go to surah…</option>
                {surahs.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name} · p. {pageOfSurah(s.n)}</option>)}
              </select>
            </label>
            {start && <Link className="btn small ghost" href={`/quran/${start.surah}/#v${start.ayah}`}>Standard view</Link>}
          </div>
          <p className="mp-title" aria-live="polite"><b>{title}</b><span className="muted"> · Page {page} / {PAGES}</span></p>
          <div
            className="mp-stage"
            onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touch.current == null) return;
              const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
              if (Math.abs(dx) > 60) goTo(dx > 0 ? page + 1 : page - 1); // swipe right = next page, like turning a printed Mushaf
            }}
          >
            <button className="btn icon mp-nav mp-side" onClick={() => goTo(page + 1)} disabled={page >= PAGES} aria-label={`Next page, ${Math.min(PAGES, page + 1)}`}>{Icon.back}</button>
            <PageView key={page} page={page} width={box.w} height={box.h} />
            <button className="btn icon mp-nav mp-side" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label={`Previous page, ${Math.max(1, page - 1)}`}>{Icon.next}</button>
          </div>
          <div className="mp-foot">
            <button className="btn small" onClick={() => goTo(page + 1)} disabled={page >= PAGES}>{Icon.back} Next page</button>
            <span className="muted small">{page} / {PAGES}</span>
            <button className="btn small" onClick={() => goTo(page - 1)} disabled={page <= 1}>Previous page {Icon.next}</button>
          </div>
        </div>
      )}
    </div>
  );
}
