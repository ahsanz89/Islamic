'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/Providers';
import { CName, Icon, Loader, ReadingBar } from '@/components/ui';
import HadithCard from '@/components/HadithCard';
import { getJSON } from '@/lib/client-data';
import { GRADE_CLASSES, gradeClass } from '@/lib/grades.mjs';

const KEY = { s: 'sahih', h: 'hasan', d: 'daif', m: 'mawdu' };

export default function SectionReader({ col, sec, prev, next }) {
  const { t, setLastRead } = useApp();
  const [items, setItems] = useState(null);
  const [limit, setLimit] = useState(20);
  const [gf, setGf] = useState('all'); // all | s | h | d | m | u
  useEffect(() => {
    setItems(null);
    setLimit(20);
    setGf('all');
    getJSON(`c/${col.id}/${sec.id}.json`).then(setItems).catch(() => setItems([]));
    setLastRead({ path: `/c/${col.id}/${sec.id}/`, title: `${col.en} · ${sec.title}`, sub: `${sec.from}–${sec.to}` });
  }, [col.id, sec.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = { all: 0, s: 0, h: 0, d: 0, m: 0, u: 0 };
    for (const h of items || []) { c.all += 1; c[gradeClass(h.g, col.id) || 'u'] += 1; }
    return c;
  }, [items, col.id]);
  const shown = useMemo(() => (items || []).filter((h) => gf === 'all' || (gradeClass(h.g, col.id) || 'u') === gf), [items, gf, col.id]);

  return (
    <div className="container narrow">
      <div className="page-head">
        <nav className="breadcrumb">
          <Link href="/collections/">{t('collections')}</Link><span>/</span>
          <Link href={`/c/${col.id}/`}><CName c={col} /></Link><span>/</span>
        </nav>
        <p className="eyebrow">{col.source === 'hadith-api' ? `${t('book')} ${sec.id}` : <CName c={col} />}</p>
        <h1 style={{ fontSize: 30 }}>{sec.title}</h1>
        {sec.sub ? <p className="ar sm" style={{ margin: 0 }}>{sec.sub}</p> : null}
        <p className="muted small" style={{ margin: '6px 0 0' }}>{sec.count} {t('hadiths')} · {sec.from}–{sec.to}</p>
      </div>
      {col.langs.length > 1 && <ReadingBar choices={col.langs.filter((l) => l !== 'ar')} />}
      {items !== null && counts.all > 0 && (
        <div className="row" role="group" aria-label={t('gradeFilter')} style={{ gap: 6, margin: '0 0 14px' }}>
          <button type="button" className="chip" aria-pressed={gf === 'all'} onClick={() => { setGf('all'); setLimit(20); }}>{t('allResults')} ({counts.all})</button>
          {GRADE_CLASSES.map((k) => counts[k] > 0 && (
            <button key={k} type="button" className="chip" aria-pressed={gf === k} onClick={() => { setGf(k); setLimit(20); }}>{t(KEY[k])} ({counts[k]})</button>
          ))}
          {counts.u > 0 && <button type="button" className="chip" aria-pressed={gf === 'u'} onClick={() => { setGf('u'); setLimit(20); }}>{t('ungraded')} ({counts.u})</button>}
          <Link className="chip" href="/grades/">{t('gradesBrowse')}</Link>
        </div>
      )}
      {items === null ? <Loader label={t('loading')} /> : (
        <div className="stack" style={{ gap: 16 }}>
          {shown.slice(0, limit).map((h) => <HadithCard key={h.n} col={col} h={h} />)}
          {shown.length > limit && <button className="btn" onClick={() => setLimit((l) => l + 20)}>{t('loadMore')} ({shown.length - limit})</button>}
        </div>
      )}
      <div className="row" style={{ margin: '20px 0' }}>
        {prev ? <Link className="btn" href={`/c/${col.id}/${prev.id}/`}>{Icon.back}<span>{prev.title.length > 28 ? t('prev') : prev.title}</span></Link> : null}
        <span className="spacer" />
        {next ? <Link className="btn primary" href={`/c/${col.id}/${next.id}/`}><span>{next.title.length > 28 ? t('next') : next.title}</span>{Icon.next}</Link> : null}
      </div>
    </div>
  );
}
